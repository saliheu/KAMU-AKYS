const express = require('express');
const Staff = require('../models/Staff');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// Get all staff
router.get('/', [auth, authorize('admin', 'staff')], async (req, res) => {
  try {
    const { departmentId } = req.query;
    const query = { isActive: true };
    
    if (departmentId) {
      query.department = departmentId;
    }
    
    const staff = await Staff.find(query)
      .populate('user', 'firstName lastName email')
      .populate('department', 'name')
      .populate('specializations', 'name');
    
    res.json(staff);
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Create staff member (Admin only)
router.post('/', [auth, authorize('admin')], async (req, res) => {
  try {
    const staff = new Staff(req.body);
    await staff.save();
    
    res.status(201).json({
      message: 'Personel başarıyla oluşturuldu',
      staff
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Bu personel ID ile kayıt zaten mevcut' });
    }
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

module.exports = router;