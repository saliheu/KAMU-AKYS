const express = require('express');
const Department = require('../models/Department');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// Get all active departments
router.get('/', async (req, res) => {
  try {
    const departments = await Department.find({ isActive: true })
      .select('name description code location contactInfo')
      .populate('services', 'name description code');
    
    res.json(departments);
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Get department details
router.get('/:id', async (req, res) => {
  try {
    const department = await Department.findById(req.params.id)
      .populate('services')
      .populate('staff', 'employeeId position');
    
    if (!department) {
      return res.status(404).json({ message: 'Departman bulunamadı' });
    }
    
    res.json(department);
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Create department (Admin only)
router.post('/', [auth, authorize('admin')], async (req, res) => {
  try {
    const department = new Department(req.body);
    await department.save();
    
    res.status(201).json({
      message: 'Departman başarıyla oluşturuldu',
      department
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Bu kod ile departman zaten mevcut' });
    }
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Update department (Admin only)
router.put('/:id', [auth, authorize('admin')], async (req, res) => {
  try {
    const department = await Department.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!department) {
      return res.status(404).json({ message: 'Departman bulunamadı' });
    }
    
    res.json({
      message: 'Departman başarıyla güncellendi',
      department
    });
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

module.exports = router;