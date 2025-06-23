const express = require('express');
const User = require('../models/User');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// Update user profile
router.put('/profile', auth, async (req, res) => {
  try {
    const updates = ['firstName', 'lastName', 'email', 'phone'];
    const allowedUpdates = {};
    
    updates.forEach(update => {
      if (req.body[update]) {
        allowedUpdates[update] = req.body[update];
      }
    });
    
    const user = await User.findByIdAndUpdate(
      req.user._id,
      allowedUpdates,
      { new: true, runValidators: true }
    ).select('-password');
    
    res.json({
      message: 'Profil başarıyla güncellendi',
      user
    });
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Change password
router.put('/change-password', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Mevcut ve yeni şifre gereklidir' });
    }
    
    const user = await User.findById(req.user._id);
    const isMatch = await user.comparePassword(currentPassword);
    
    if (!isMatch) {
      return res.status(400).json({ message: 'Mevcut şifre hatalı' });
    }
    
    user.password = newPassword;
    await user.save();
    
    res.json({ message: 'Şifre başarıyla değiştirildi' });
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Admin routes
router.get('/all', [auth, authorize('admin')], async (req, res) => {
  try {
    const users = await User.find()
      .select('-password')
      .sort('-createdAt');
    
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

module.exports = router;