const express = require('express');
const { body, validationResult } = require('express-validator');
const Appointment = require('../models/Appointment');
const Department = require('../models/Department');
const Service = require('../models/Service');
const { auth, authorize } = require('../middleware/auth');
const { getAvailableSlots, checkSlotAvailability } = require('../utils/appointmentHelper');

const router = express.Router();

// Get all appointments for current user
router.get('/my-appointments', auth, async (req, res) => {
  try {
    const appointments = await Appointment.find({ user: req.user._id })
      .populate('department', 'name code')
      .populate('service', 'name code')
      .populate('staff', 'employeeId position')
      .sort({ date: -1 });
    
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Get available time slots
router.get('/available-slots', auth, async (req, res) => {
  try {
    const { departmentId, serviceId, date } = req.query;
    
    if (!departmentId || !serviceId || !date) {
      return res.status(400).json({ message: 'Eksik parametreler' });
    }
    
    const department = await Department.findById(departmentId);
    const service = await Service.findById(serviceId);
    
    if (!department || !service) {
      return res.status(404).json({ message: 'Departman veya hizmet bulunamadı' });
    }
    
    const slots = await getAvailableSlots(department, service, new Date(date));
    res.json(slots);
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Create appointment
router.post('/', [
  auth,
  body('departmentId').notEmpty().withMessage('Departman seçimi zorunludur'),
  body('serviceId').notEmpty().withMessage('Hizmet seçimi zorunludur'),
  body('date').isISO8601().withMessage('Geçerli bir tarih giriniz'),
  body('timeSlot').notEmpty().withMessage('Zaman dilimi seçimi zorunludur')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { departmentId, serviceId, date, timeSlot, notes } = req.body;
    
    // Check if slot is available
    const isAvailable = await checkSlotAvailability(departmentId, date, timeSlot);
    if (!isAvailable) {
      return res.status(400).json({ message: 'Seçilen zaman dilimi dolu' });
    }
    
    // Check if user has another appointment on the same day
    const existingAppointment = await Appointment.findOne({
      user: req.user._id,
      date: { 
        $gte: new Date(date).setHours(0, 0, 0, 0),
        $lt: new Date(date).setHours(23, 59, 59, 999)
      },
      status: { $nin: ['cancelled', 'completed'] }
    });
    
    if (existingAppointment) {
      return res.status(400).json({ message: 'Aynı gün içinde başka bir randevunuz bulunmaktadır' });
    }
    
    const appointment = new Appointment({
      user: req.user._id,
      department: departmentId,
      service: serviceId,
      date: new Date(date),
      timeSlot,
      userNotes: notes
    });
    
    await appointment.save();
    await appointment.populate(['department', 'service']);
    
    // Emit socket event for real-time updates
    const io = req.app.get('io');
    io.to(`department-${departmentId}`).emit('new-appointment', appointment);
    
    res.status(201).json({
      message: 'Randevu başarıyla oluşturuldu',
      appointment
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Cancel appointment
router.put('/:id/cancel', auth, async (req, res) => {
  try {
    const appointment = await Appointment.findOne({
      _id: req.params.id,
      user: req.user._id,
      status: { $in: ['scheduled', 'confirmed'] }
    });
    
    if (!appointment) {
      return res.status(404).json({ message: 'Randevu bulunamadı' });
    }
    
    // Check if appointment is cancellable (at least 24 hours before)
    const hoursBefore = (appointment.date - new Date()) / (1000 * 60 * 60);
    if (hoursBefore < 24) {
      return res.status(400).json({ message: 'Randevular en az 24 saat öncesinden iptal edilebilir' });
    }
    
    appointment.status = 'cancelled';
    appointment.cancellation = {
      reason: req.body.reason || 'Kullanıcı tarafından iptal edildi',
      cancelledBy: req.user._id,
      cancelledAt: new Date()
    };
    
    await appointment.save();
    
    // Emit socket event
    const io = req.app.get('io');
    io.to(`department-${appointment.department}`).emit('appointment-cancelled', appointment);
    
    res.json({
      message: 'Randevu başarıyla iptal edildi',
      appointment
    });
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Get appointment details
router.get('/:id', auth, async (req, res) => {
  try {
    const appointment = await Appointment.findOne({
      _id: req.params.id,
      user: req.user._id
    })
      .populate('department')
      .populate('service')
      .populate('staff');
    
    if (!appointment) {
      return res.status(404).json({ message: 'Randevu bulunamadı' });
    }
    
    res.json(appointment);
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Admin routes
router.get('/admin/all', [auth, authorize('admin', 'staff')], async (req, res) => {
  try {
    const { departmentId, date, status } = req.query;
    const query = {};
    
    if (departmentId) query.department = departmentId;
    if (status) query.status = status;
    if (date) {
      query.date = {
        $gte: new Date(date).setHours(0, 0, 0, 0),
        $lt: new Date(date).setHours(23, 59, 59, 999)
      };
    }
    
    const appointments = await Appointment.find(query)
      .populate('user', 'firstName lastName tcNo phone')
      .populate('department', 'name')
      .populate('service', 'name')
      .populate('staff', 'employeeId')
      .sort({ date: 1, 'timeSlot.start': 1 });
    
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

module.exports = router;