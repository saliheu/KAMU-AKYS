const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Register
router.post('/register', [
  body('tcNo').isLength({ min: 11, max: 11 }).withMessage('TC No 11 haneli olmalıdır'),
  body('firstName').trim().notEmpty().withMessage('Ad zorunludur'),
  body('lastName').trim().notEmpty().withMessage('Soyad zorunludur'),
  body('email').isEmail().withMessage('Geçerli bir email adresi giriniz'),
  body('phone').isLength({ min: 10, max: 10 }).withMessage('Telefon numarası 10 haneli olmalıdır'),
  body('password').isLength({ min: 6 }).withMessage('Şifre en az 6 karakter olmalıdır')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { tcNo, email } = req.body;
    
    // Check if user exists
    const existingUser = await User.findOne({ $or: [{ tcNo }, { email }] });
    if (existingUser) {
      return res.status(400).json({ message: 'Bu TC No veya email ile kayıtlı kullanıcı bulunmaktadır' });
    }

    const user = new User(req.body);
    await user.save();
    
    const token = user.generateAuthToken();
    
    res.status(201).json({
      message: 'Kayıt başarılı',
      user: {
        id: user._id,
        tcNo: user.tcNo,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role
      },
      token
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Login
router.post('/login', [
  body('tcNo').notEmpty().withMessage('TC No zorunludur'),
  body('password').notEmpty().withMessage('Şifre zorunludur')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { tcNo, password } = req.body;
    
    const user = await User.findOne({ tcNo });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'TC No veya şifre hatalı' });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: 'Hesabınız aktif değil' });
    }

    const token = user.generateAuthToken();
    
    res.json({
      message: 'Giriş başarılı',
      user: {
        id: user._id,
        tcNo: user.tcNo,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role
      },
      token
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Get current user
router.get('/me', auth, async (req, res) => {
  res.json({
    user: {
      id: req.user._id,
      tcNo: req.user.tcNo,
      firstName: req.user.firstName,
      lastName: req.user.lastName,
      email: req.user.email,
      phone: req.user.phone,
      role: req.user.role,
      emailVerified: req.user.emailVerified,
      phoneVerified: req.user.phoneVerified
    }
  });
});

// Logout
router.post('/logout', auth, async (req, res) => {
  res.json({ message: 'Çıkış başarılı' });
});

module.exports = router;