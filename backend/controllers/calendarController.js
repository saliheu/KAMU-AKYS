const Appointment = require('../models/Appointment');
const Court = require('../models/Court');
const Judge = require('../models/Judge');
const { query } = require('../config/database');
const { cache } = require('../config/redis');
const logger = require('../utils/logger');
const ical = require('ical-generator');
const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');

// Get calendar appointments
exports.getCalendarAppointments = async (req, res, next) => {
  try {
    const { startDate, endDate, mahkemeId, hakimId } = req.query;
    const userId = req.user.id;
    const userRole = req.user.rol;

    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'Başlangıç ve bitiş tarihleri gerekli' });
    }

    // Build filters based on user role
    const filters = {
      tarihBaslangic: startDate,
      tarihBitis: endDate
    };

    if (userRole === 'vatandas' || userRole === 'avukat') {
      filters.kullaniciId = userId;
    } else if (userRole === 'hakim') {
      const judge = await Judge.findByUserId(userId);
      filters.hakimId = judge?.id || hakimId;
    } else if (mahkemeId) {
      filters.mahkemeId = mahkemeId;
    }

    // Get appointments
    const appointments = await Appointment.find(filters);

    // Format for calendar view
    const calendarEvents = appointments.map(appointment => ({
      id: appointment.id,
      title: `${appointment.islemTuru} - ${appointment.kullanici_ad} ${appointment.kullanici_soyad}`,
      start: `${appointment.randevuTarihi}T${appointment.randevuSaati}`,
      end: `${appointment.randevuTarihi}T${addMinutes(appointment.randevuSaati, 30)}`,
      color: getStatusColor(appointment.durum),
      status: appointment.durum,
      courtName: appointment.mahkeme_ad,
      judgeName: appointment.hakim_ad ? `${appointment.hakim_ad} ${appointment.hakim_soyad}` : null,
      details: {
        randevuKodu: appointment.randevuKodu,
        islemTuru: appointment.islemTuru,
        notlar: appointment.notlar
      }
    }));

    res.json({ events: calendarEvents });
  } catch (error) {
    logger.error('Get calendar appointments hatası:', error);
    next(error);
  }
};

// Check availability
exports.checkAvailability = async (req, res, next) => {
  try {
    const { date, mahkemeId, hakimId } = req.query;

    if (!date || !mahkemeId) {
      return res.status(400).json({ error: 'Tarih ve mahkeme ID gerekli' });
    }

    const court = await Court.findById(mahkemeId);
    if (!court) {
      return res.status(404).json({ error: 'Mahkeme bulunamadı' });
    }

    // Get available slots
    const availableSlots = await court.getAvailableSlots(date, hakimId);

    // Get booked slots
    let queryText = `
      SELECT randevu_saati 
      FROM randevular 
      WHERE mahkeme_id = $1 
      AND randevu_tarihi = $2 
      AND durum IN ('beklemede', 'onaylandi')
    `;
    const values = [mahkemeId, date];

    if (hakimId) {
      queryText += ' AND hakim_id = $3';
      values.push(hakimId);
    }

    const result = await query(queryText, values);
    const bookedSlots = result.rows.map(row => row.randevu_saati.slice(0, 5));

    // Get working hours
    const dayOfWeek = new Date(date).getDay();
    let workingHours = null;

    if (court.calismaSaatleri) {
      if (dayOfWeek === 6 && court.calismaSaatleri.cumartesi) {
        workingHours = court.calismaSaatleri.cumartesi;
      } else if (dayOfWeek !== 0 && court.calismaSaatleri.hafta_ici) {
        workingHours = court.calismaSaatleri.hafta_ici;
      }
    }

    res.json({
      date,
      availableSlots,
      bookedSlots,
      workingHours,
      totalSlots: availableSlots.length + bookedSlots.length,
      availabilityRate: availableSlots.length / (availableSlots.length + bookedSlots.length)
    });
  } catch (error) {
    logger.error('Check availability hatası:', error);
    next(error);
  }
};

// Get holidays
exports.getHolidays = async (req, res, next) => {
  try {
    const year = parseInt(req.query.year) || new Date().getFullYear();

    // Check cache
    const cacheKey = `holidays:${year}`;
    const cachedData = await cache.get(cacheKey);
    if (cachedData) {
      return res.json({ holidays: cachedData });
    }

    // Turkish public holidays
    const holidays = [
      { date: `${year}-01-01`, name: 'Yılbaşı', type: 'resmi' },
      { date: `${year}-04-23`, name: 'Ulusal Egemenlik ve Çocuk Bayramı', type: 'milli' },
      { date: `${year}-05-01`, name: 'Emek ve Dayanışma Günü', type: 'resmi' },
      { date: `${year}-05-19`, name: 'Atatürk\'ü Anma, Gençlik ve Spor Bayramı', type: 'milli' },
      { date: `${year}-07-15`, name: 'Demokrasi ve Milli Birlik Günü', type: 'milli' },
      { date: `${year}-08-30`, name: 'Zafer Bayramı', type: 'milli' },
      { date: `${year}-10-29`, name: 'Cumhuriyet Bayramı', type: 'milli' }
    ];

    // Cache for 1 month
    await cache.set(cacheKey, holidays, 2592000);

    res.json({ holidays });
  } catch (error) {
    logger.error('Get holidays hatası:', error);
    next(error);
  }
};

// Get working days
exports.getWorkingDays = async (req, res, next) => {
  try {
    const { mahkemeId, month, year } = req.query;

    if (!mahkemeId || !month || !year) {
      return res.status(400).json({ error: 'Mahkeme ID, ay ve yıl gerekli' });
    }

    const court = await Court.findById(mahkemeId);
    if (!court) {
      return res.status(404).json({ error: 'Mahkeme bulunamadı' });
    }

    // Get holidays for the year
    const holidaysResult = await query(
      'SELECT tarih FROM resmi_tatiller WHERE EXTRACT(YEAR FROM tarih) = $1',
      [year]
    );
    const holidays = holidaysResult.rows.map(row => row.tarih.toISOString().split('T')[0]);

    // Generate working days for the month
    const workingDays = [];
    const daysInMonth = new Date(year, month, 0).getDate();

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month - 1, day);
      const dateStr = date.toISOString().split('T')[0];
      const dayOfWeek = date.getDay();

      let isWorkingDay = false;
      let workingHours = null;

      if (!holidays.includes(dateStr)) {
        if (dayOfWeek === 6 && court.calismaSaatleri?.cumartesi) {
          isWorkingDay = true;
          workingHours = court.calismaSaatleri.cumartesi;
        } else if (dayOfWeek !== 0 && dayOfWeek !== 6 && court.calismaSaatleri?.hafta_ici) {
          isWorkingDay = true;
          workingHours = court.calismaSaatleri.hafta_ici;
        }
      }

      // Get booked count for the day
      const bookedResult = await query(
        `SELECT COUNT(*) as count 
         FROM randevular 
         WHERE mahkeme_id = $1 
         AND randevu_tarihi = $2 
         AND durum IN ('beklemede', 'onaylandi')`,
        [mahkemeId, dateStr]
      );

      workingDays.push({
        date: dateStr,
        isWorkingDay,
        workingHours,
        capacity: court.kapasite || 100,
        bookedCount: parseInt(bookedResult.rows[0].count)
      });
    }

    res.json({ workingDays });
  } catch (error) {
    logger.error('Get working days hatası:', error);
    next(error);
  }
};

// Judge specific routes

// Get judge schedule
exports.getJudgeSchedule = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { date, week } = req.query;

    const judge = await Judge.findByUserId(userId);
    if (!judge) {
      return res.status(404).json({ error: 'Hakim bilgisi bulunamadı' });
    }

    let startDate, endDate;
    if (week) {
      const d = new Date(date || new Date());
      const day = d.getDay();
      const diff = d.getDate() - day + (day === 0 ? -6 : 1);
      startDate = new Date(d.setDate(diff)).toISOString().split('T')[0];
      endDate = new Date(d.setDate(diff + 6)).toISOString().split('T')[0];
    } else {
      startDate = endDate = date || new Date().toISOString().split('T')[0];
    }

    const appointments = await judge.getAppointments({
      tarihBaslangic: startDate,
      tarihBitis: endDate
    });

    // Generate time slots
    const schedule = [];
    const currentDate = new Date(startDate);

    while (currentDate <= new Date(endDate)) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const daySchedule = await judge.getSchedule(dateStr);
      
      schedule.push({
        date: dateStr,
        appointments: daySchedule
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    res.json({ schedule });
  } catch (error) {
    logger.error('Get judge schedule hatası:', error);
    next(error);
  }
};

// Block judge time
exports.blockJudgeTime = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { date, startTime, endTime, reason, notes } = req.body;

    const judge = await Judge.findByUserId(userId);
    if (!judge) {
      return res.status(404).json({ error: 'Hakim bilgisi bulunamadı' });
    }

    // Check for conflicts
    const conflictCheck = await query(
      `SELECT COUNT(*) as count 
       FROM randevular 
       WHERE hakim_id = $1 
       AND randevu_tarihi = $2 
       AND randevu_saati >= $3 
       AND randevu_saati < $4 
       AND durum IN ('beklemede', 'onaylandi')`,
      [judge.id, date, startTime, endTime]
    );

    if (parseInt(conflictCheck.rows[0].count) > 0) {
      return res.status(400).json({ error: 'Bu zaman aralığında randevu mevcut' });
    }

    // Create time block
    await query(
      `INSERT INTO hakim_zaman_bloklari 
       (hakim_id, tarih, baslangic_saati, bitis_saati, neden, notlar)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [judge.id, date, startTime, endTime, reason, notes]
    );

    res.status(201).json({ message: 'Zaman bloğu oluşturuldu' });
  } catch (error) {
    logger.error('Block judge time hatası:', error);
    next(error);
  }
};

// Court staff routes

// Get court overview
exports.getCourtOverview = async (req, res, next) => {
  try {
    const { mahkemeId, date } = req.query;

    if (!mahkemeId || !date) {
      return res.status(400).json({ error: 'Mahkeme ID ve tarih gerekli' });
    }

    const court = await Court.findById(mahkemeId);
    if (!court) {
      return res.status(404).json({ error: 'Mahkeme bulunamadı' });
    }

    // Get all appointments for the date
    const appointments = await Appointment.find({
      mahkemeId,
      tarihBaslangic: date,
      tarihBitis: date
    });

    // Get judges
    const judges = await court.getJudges();

    // Calculate statistics
    const totalCapacity = court.kapasite || 100;
    const totalAppointments = appointments.length;
    const utilizationRate = totalAppointments / totalCapacity;

    // Judge schedules
    const judgeSchedules = await Promise.all(
      judges.map(async (judge) => {
        const judgeAppointments = appointments.filter(a => a.hakimId === judge.id);
        return {
          judge: `${judge.ad} ${judge.soyad}`,
          appointments: judgeAppointments.length,
          schedule: judgeAppointments.map(a => ({
            time: a.randevuSaati,
            status: a.durum
          }))
        };
      })
    );

    // Time slot summary
    const timeSlotSummary = {};
    appointments.forEach(appointment => {
      const time = appointment.randevuSaati;
      if (!timeSlotSummary[time]) {
        timeSlotSummary[time] = { total: 0, beklemede: 0, onaylandi: 0 };
      }
      timeSlotSummary[time].total++;
      timeSlotSummary[time][appointment.durum]++;
    });

    res.json({
      totalAppointments,
      totalCapacity,
      utilizationRate,
      judgeSchedules,
      timeSlotSummary: Object.entries(timeSlotSummary).map(([time, data]) => ({
        time,
        ...data
      }))
    });
  } catch (error) {
    logger.error('Get court overview hatası:', error);
    next(error);
  }
};

// Update court capacity
exports.updateCourtCapacity = async (req, res, next) => {
  try {
    const { mahkemeId, date, capacity, timeSlotCapacities } = req.body;

    // Update daily capacity
    await query(
      `INSERT INTO mahkeme_kapasite_ayarlari (mahkeme_id, tarih, gunluk_kapasite)
       VALUES ($1, $2, $3)
       ON CONFLICT (mahkeme_id, tarih) 
       DO UPDATE SET gunluk_kapasite = $3`,
      [mahkemeId, date, capacity]
    );

    // Update time slot capacities if provided
    if (timeSlotCapacities) {
      for (const [time, slotCapacity] of Object.entries(timeSlotCapacities)) {
        await query(
          `INSERT INTO mahkeme_saat_kapasiteleri (mahkeme_id, tarih, saat, kapasite)
           VALUES ($1, $2, $3, $4)
           ON CONFLICT (mahkeme_id, tarih, saat) 
           DO UPDATE SET kapasite = $4`,
          [mahkemeId, date, time, slotCapacity]
        );
      }
    }

    res.json({ message: 'Kapasite ayarları güncellendi' });
  } catch (error) {
    logger.error('Update court capacity hatası:', error);
    next(error);
  }
};

// Export calendar
exports.exportCalendar = async (req, res, next) => {
  try {
    const { format, startDate, endDate, mahkemeId, hakimId } = req.query;

    if (!format || !startDate || !endDate) {
      return res.status(400).json({ error: 'Format, başlangıç ve bitiş tarihleri gerekli' });
    }

    // Get appointments
    const filters = {
      tarihBaslangic: startDate,
      tarihBitis: endDate
    };

    if (mahkemeId) filters.mahkemeId = mahkemeId;
    if (hakimId) filters.hakimId = hakimId;

    const appointments = await Appointment.find(filters);

    if (format === 'ics') {
      // Generate iCal
      const calendar = ical({ name: 'Mahkeme Randevuları' });

      appointments.forEach(appointment => {
        calendar.createEvent({
          start: new Date(`${appointment.randevuTarihi}T${appointment.randevuSaati}`),
          end: new Date(`${appointment.randevuTarihi}T${addMinutes(appointment.randevuSaati, 30)}`),
          summary: `${appointment.islemTuru} - ${appointment.mahkeme_ad}`,
          description: `Randevu Kodu: ${appointment.randevuKodu}\nDurum: ${appointment.durum}`,
          location: appointment.mahkeme_ad
        });
      });

      res.setHeader('Content-Type', 'text/calendar');
      res.setHeader('Content-Disposition', 'attachment; filename=randevular.ics');
      res.send(calendar.toString());
    } else if (format === 'pdf') {
      // Generate PDF calendar
      const doc = new PDFDocument();
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=takvim.pdf');
      
      doc.pipe(res);
      
      doc.fontSize(16).text('Randevu Takvimi', { align: 'center' });
      doc.fontSize(12).text(`${startDate} - ${endDate}`, { align: 'center' });
      doc.moveDown();

      // Group by date
      const appointmentsByDate = {};
      appointments.forEach(appointment => {
        if (!appointmentsByDate[appointment.randevuTarihi]) {
          appointmentsByDate[appointment.randevuTarihi] = [];
        }
        appointmentsByDate[appointment.randevuTarihi].push(appointment);
      });

      Object.entries(appointmentsByDate).forEach(([date, dayAppointments]) => {
        doc.fontSize(14).text(date, { underline: true });
        dayAppointments.forEach(appointment => {
          doc.fontSize(10)
            .text(`${appointment.randevuSaati} - ${appointment.islemTuru}`)
            .text(`Mahkeme: ${appointment.mahkeme_ad}`)
            .text(`Durum: ${appointment.durum}`)
            .moveDown(0.5);
        });
        doc.moveDown();
      });

      doc.end();
    } else {
      res.status(400).json({ error: 'Geçersiz format' });
    }
  } catch (error) {
    logger.error('Export calendar hatası:', error);
    next(error);
  }
};

// Helper functions
function getStatusColor(status) {
  const colors = {
    'beklemede': '#FFA500',
    'onaylandi': '#008000',
    'iptal': '#FF0000',
    'tamamlandi': '#808080'
  };
  return colors[status] || '#000000';
}

function addMinutes(time, minutes) {
  const [hours, mins] = time.split(':').map(Number);
  const totalMinutes = hours * 60 + mins + minutes;
  const newHours = Math.floor(totalMinutes / 60);
  const newMins = totalMinutes % 60;
  return `${String(newHours).padStart(2, '0')}:${String(newMins).padStart(2, '0')}`;
}