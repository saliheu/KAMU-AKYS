const Appointment = require('../models/Appointment');
const Court = require('../models/Court');
const User = require('../models/User');
const emailService = require('../services/emailService');
const smsService = require('../services/smsService');
const { cache } = require('../config/redis');
const logger = require('../utils/logger');
const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');

// Get appointments
exports.getAppointments = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.rol;
    
    // Build filters
    const filters = {
      durum: req.query.durum,
      islemTuru: req.query.islemTuru,
      tarihBaslangic: req.query.tarihBaslangic,
      tarihBitis: req.query.tarihBitis,
      limit: parseInt(req.query.limit) || 20,
      offset: parseInt(req.query.offset) || 0
    };

    // Add user-specific filters based on role
    if (userRole === 'vatandas' || userRole === 'avukat') {
      filters.kullaniciId = userId;
    } else if (userRole === 'hakim') {
      const Judge = require('../models/Judge');
      const judge = await Judge.findByUserId(userId);
      if (judge) {
        filters.hakimId = judge.id;
      }
    } else if (userRole === 'personel' && req.query.mahkemeId) {
      filters.mahkemeId = req.query.mahkemeId;
    }

    // Get appointments
    const appointments = await Appointment.find(filters);

    res.json({
      appointments,
      total: appointments.length,
      limit: filters.limit,
      offset: filters.offset
    });
  } catch (error) {
    logger.error('Get appointments hatası:', error);
    next(error);
  }
};

// Get appointment by ID
exports.getAppointmentById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.rol;

    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return res.status(404).json({ error: 'Randevu bulunamadı' });
    }

    // Check authorization
    if (userRole === 'vatandas' || userRole === 'avukat') {
      if (appointment.kullaniciId !== userId) {
        return res.status(403).json({ error: 'Bu randevuyu görüntüleme yetkiniz yok' });
      }
    }

    res.json({ appointment });
  } catch (error) {
    logger.error('Get appointment by ID hatası:', error);
    next(error);
  }
};

// Get appointment by code
exports.getAppointmentByCode = async (req, res, next) => {
  try {
    const { code } = req.params;

    const appointment = await Appointment.findByCode(code);
    if (!appointment) {
      return res.status(404).json({ error: 'Randevu bulunamadı' });
    }

    // Public endpoint - return limited info
    res.json({
      appointment: {
        randevuKodu: appointment.randevuKodu,
        randevuTarihi: appointment.randevuTarihi,
        randevuSaati: appointment.randevuSaati,
        durum: appointment.durum,
        mahkemeAd: appointment.mahkeme_ad,
        islemTuru: appointment.islemTuru
      }
    });
  } catch (error) {
    logger.error('Get appointment by code hatası:', error);
    next(error);
  }
};

// Create appointment
exports.createAppointment = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { mahkemeId, hakimId, randevuTarihi, randevuSaati, islemTuru, notlar } = req.body;

    // Check if user can create appointment
    const canCreate = await Appointment.canUserCreateAppointment(userId, randevuTarihi);
    if (!canCreate) {
      return res.status(400).json({ 
        error: 'Aynı gün için en fazla 2 randevu alabilirsiniz' 
      });
    }

    // Check if date is not in the past
    const appointmentDate = new Date(randevuTarihi);
    if (appointmentDate < new Date().setHours(0, 0, 0, 0)) {
      return res.status(400).json({ 
        error: 'Geçmiş tarih için randevu alınamaz' 
      });
    }

    // Check court availability
    const court = await Court.findById(mahkemeId);
    if (!court) {
      return res.status(404).json({ error: 'Mahkeme bulunamadı' });
    }

    const availableSlots = await court.getAvailableSlots(randevuTarihi, hakimId);
    if (!availableSlots.includes(randevuSaati)) {
      return res.status(400).json({ 
        error: 'Seçilen tarih ve saat müsait değil' 
      });
    }

    // Create appointment
    const appointment = await Appointment.create({
      kullaniciId: userId,
      mahkemeId,
      hakimId,
      randevuTarihi,
      randevuSaati,
      islemTuru,
      notlar
    });

    // Send confirmation email and SMS
    const user = await User.findById(userId);
    if (user.email) {
      await emailService.sendAppointmentConfirmation(
        user.email,
        {
          ad: user.ad,
          randevuKodu: appointment.randevuKodu,
          mahkemeAd: court.ad,
          tarih: randevuTarihi,
          saat: randevuSaati
        }
      );
    }

    if (user.telefon) {
      await smsService.sendAppointmentSMS(
        user.telefon,
        `Randevunuz oluşturuldu. Kod: ${appointment.randevuKodu}, Tarih: ${randevuTarihi} ${randevuSaati}`
      );
    }

    res.status(201).json({
      message: 'Randevu başarıyla oluşturuldu',
      appointment
    });
  } catch (error) {
    logger.error('Create appointment hatası:', error);
    next(error);
  }
};

// Update appointment
exports.updateAppointment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.rol;
    const updateData = req.body;

    // Get appointment
    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return res.status(404).json({ error: 'Randevu bulunamadı' });
    }

    // Check authorization
    if (userRole === 'vatandas' || userRole === 'avukat') {
      if (appointment.kullaniciId !== userId) {
        return res.status(403).json({ error: 'Bu randevuyu güncelleme yetkiniz yok' });
      }
    }

    // Check if appointment can be updated
    if (appointment.durum === 'tamamlandi' || appointment.durum === 'iptal') {
      return res.status(400).json({ 
        error: 'Tamamlanmış veya iptal edilmiş randevular güncellenemez' 
      });
    }

    // Update appointment
    await appointment.update(updateData);

    // Send notification if date/time changed
    if (updateData.randevuTarihi || updateData.randevuSaati) {
      const user = await User.findById(appointment.kullaniciId);
      if (user.email) {
        await emailService.sendAppointmentUpdate(
          user.email,
          {
            ad: user.ad,
            randevuKodu: appointment.randevuKodu,
            yeniTarih: appointment.randevuTarihi,
            yeniSaat: appointment.randevuSaati
          }
        );
      }
    }

    res.json({
      message: 'Randevu güncellendi',
      appointment
    });
  } catch (error) {
    logger.error('Update appointment hatası:', error);
    next(error);
  }
};

// Cancel appointment
exports.cancelAppointment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { iptalNedeni } = req.body;
    const userId = req.user.id;
    const userRole = req.user.rol;

    // Get appointment
    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return res.status(404).json({ error: 'Randevu bulunamadı' });
    }

    // Check authorization
    if (userRole === 'vatandas' || userRole === 'avukat') {
      if (appointment.kullaniciId !== userId) {
        return res.status(403).json({ error: 'Bu randevuyu iptal etme yetkiniz yok' });
      }
    }

    // Cancel appointment
    await appointment.cancel(iptalNedeni);

    // Send cancellation notification
    const user = await User.findById(appointment.kullaniciId);
    if (user.email) {
      await emailService.sendAppointmentCancellation(
        user.email,
        {
          ad: user.ad,
          randevuKodu: appointment.randevuKodu,
          iptalNedeni
        }
      );
    }

    res.json({
      message: 'Randevu iptal edildi',
      appointment
    });
  } catch (error) {
    logger.error('Cancel appointment hatası:', error);
    next(error);
  }
};

// Confirm appointment (Staff only)
exports.confirmAppointment = async (req, res, next) => {
  try {
    const { id } = req.params;

    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return res.status(404).json({ error: 'Randevu bulunamadı' });
    }

    if (appointment.durum !== 'beklemede') {
      return res.status(400).json({ 
        error: 'Sadece beklemedeki randevular onaylanabilir' 
      });
    }

    // Update status
    await appointment.update({ durum: 'onaylandi' });

    // Send confirmation
    const user = await User.findById(appointment.kullaniciId);
    if (user.telefon) {
      await smsService.sendAppointmentSMS(
        user.telefon,
        `Randevunuz onaylandı. Kod: ${appointment.randevuKodu}`
      );
    }

    res.json({
      message: 'Randevu onaylandı',
      appointment
    });
  } catch (error) {
    logger.error('Confirm appointment hatası:', error);
    next(error);
  }
};

// Complete appointment
exports.completeAppointment = async (req, res, next) => {
  try {
    const { id } = req.params;

    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return res.status(404).json({ error: 'Randevu bulunamadı' });
    }

    await appointment.complete();

    res.json({
      message: 'Randevu tamamlandı',
      appointment
    });
  } catch (error) {
    logger.error('Complete appointment hatası:', error);
    next(error);
  }
};

// Get statistics
exports.getStatistics = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const userId = req.user.id;
    const userRole = req.user.rol;

    let filters = {
      tarihBaslangic: startDate,
      tarihBitis: endDate
    };

    // Add role-based filters
    if (userRole === 'hakim') {
      const Judge = require('../models/Judge');
      const judge = await Judge.findByUserId(userId);
      if (judge) {
        filters.hakimId = judge.id;
      }
    } else if (userRole === 'personel' && req.query.mahkemeId) {
      filters.mahkemeId = req.query.mahkemeId;
    }

    // Get appointments
    const appointments = await Appointment.find(filters);

    // Calculate statistics
    const statistics = {
      toplamRandevu: appointments.length,
      tamamlanan: appointments.filter(a => a.durum === 'tamamlandi').length,
      iptalEdilen: appointments.filter(a => a.durum === 'iptal').length,
      bekleyen: appointments.filter(a => a.durum === 'beklemede').length,
      onaylanan: appointments.filter(a => a.durum === 'onaylandi').length,
      islemTuruDagilimi: {},
      gunlukDagilim: {}
    };

    // Process distribution data
    appointments.forEach(appointment => {
      // İşlem türü dağılımı
      if (!statistics.islemTuruDagilimi[appointment.islemTuru]) {
        statistics.islemTuruDagilimi[appointment.islemTuru] = 0;
      }
      statistics.islemTuruDagilimi[appointment.islemTuru]++;

      // Günlük dağılım
      const date = appointment.randevuTarihi;
      if (!statistics.gunlukDagilim[date]) {
        statistics.gunlukDagilim[date] = 0;
      }
      statistics.gunlukDagilim[date]++;
    });

    res.json({ statistics });
  } catch (error) {
    logger.error('Get statistics hatası:', error);
    next(error);
  }
};

// Export appointments
exports.exportAppointments = async (req, res, next) => {
  try {
    const { format = 'pdf', startDate, endDate } = req.query;
    const userId = req.user.id;
    const userRole = req.user.rol;

    // Build filters
    const filters = {
      tarihBaslangic: startDate,
      tarihBitis: endDate
    };

    if (userRole === 'vatandas' || userRole === 'avukat') {
      filters.kullaniciId = userId;
    }

    // Get appointments
    const appointments = await Appointment.find(filters);

    if (format === 'pdf') {
      // Create PDF
      const doc = new PDFDocument();
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=randevular.pdf');
      
      doc.pipe(res);
      
      // Add content
      doc.fontSize(16).text('Randevu Listesi', { align: 'center' });
      doc.moveDown();
      
      appointments.forEach(appointment => {
        doc.fontSize(12)
          .text(`Randevu Kodu: ${appointment.randevuKodu}`)
          .text(`Tarih: ${appointment.randevuTarihi} ${appointment.randevuSaati}`)
          .text(`Mahkeme: ${appointment.mahkeme_ad}`)
          .text(`Durum: ${appointment.durum}`)
          .moveDown();
      });
      
      doc.end();
    } else if (format === 'excel') {
      // Create Excel
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Randevular');
      
      // Add headers
      worksheet.columns = [
        { header: 'Randevu Kodu', key: 'randevuKodu', width: 15 },
        { header: 'Tarih', key: 'randevuTarihi', width: 12 },
        { header: 'Saat', key: 'randevuSaati', width: 10 },
        { header: 'Mahkeme', key: 'mahkemeAd', width: 30 },
        { header: 'İşlem Türü', key: 'islemTuru', width: 20 },
        { header: 'Durum', key: 'durum', width: 15 }
      ];
      
      // Add rows
      appointments.forEach(appointment => {
        worksheet.addRow({
          randevuKodu: appointment.randevuKodu,
          randevuTarihi: appointment.randevuTarihi,
          randevuSaati: appointment.randevuSaati,
          mahkemeAd: appointment.mahkeme_ad,
          islemTuru: appointment.islemTuru,
          durum: appointment.durum
        });
      });
      
      // Style the header row
      worksheet.getRow(1).font = { bold: true };
      
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename=randevular.xlsx');
      
      await workbook.xlsx.write(res);
      res.end();
    } else {
      res.status(400).json({ error: 'Geçersiz format' });
    }
  } catch (error) {
    logger.error('Export appointments hatası:', error);
    next(error);
  }
};