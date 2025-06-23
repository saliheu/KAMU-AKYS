const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { auth, adminAuth } = require('../middleware/auth');

// Tüm personeli listele
router.get('/', [auth, adminAuth], async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Personel durumunu güncelle
router.patch('/:id/durum', [auth, adminAuth], async (req, res) => {
  try {
    const { isActive } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive },
      { new: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'Kullanıcı bulunamadı' 
      });
    }
    
    res.json({ 
      success: true, 
      data: user,
      message: 'Kullanıcı durumu güncellendi' 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Personel rolünü güncelle
router.patch('/:id/rol', [auth, adminAuth], async (req, res) => {
  try {
    const { role } = req.body;
    
    if (!['admin', 'personel'].includes(role)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Geçersiz rol' 
      });
    }
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'Kullanıcı bulunamadı' 
      });
    }
    
    res.json({ 
      success: true, 
      data: user,
      message: 'Kullanıcı rolü güncellendi' 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;