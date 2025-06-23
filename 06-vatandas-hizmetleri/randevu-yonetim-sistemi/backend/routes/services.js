const express = require('express');
const Service = require('../models/Service');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// Get all services
router.get('/', async (req, res) => {
  try {
    const { departmentId } = req.query;
    const query = { isActive: true };
    
    if (departmentId) {
      query.department = departmentId;
    }
    
    const services = await Service.find(query)
      .populate('department', 'name code')
      .sort('priority name');
    
    res.json(services);
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Get service details
router.get('/:id', async (req, res) => {
  try {
    const service = await Service.findById(req.params.id)
      .populate('department');
    
    if (!service) {
      return res.status(404).json({ message: 'Hizmet bulunamadı' });
    }
    
    res.json(service);
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Create service (Admin only)
router.post('/', [auth, authorize('admin')], async (req, res) => {
  try {
    const service = new Service(req.body);
    await service.save();
    
    res.status(201).json({
      message: 'Hizmet başarıyla oluşturuldu',
      service
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Bu kod ile hizmet zaten mevcut' });
    }
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Update service (Admin only)
router.put('/:id', [auth, authorize('admin')], async (req, res) => {
  try {
    const service = await Service.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!service) {
      return res.status(404).json({ message: 'Hizmet bulunamadı' });
    }
    
    res.json({
      message: 'Hizmet başarıyla güncellendi',
      service
    });
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

module.exports = router;