const router = require('express').Router();
const { body, validationResult } = require('express-validator');
const { User } = require('../models');
const { auth } = require('../middleware/auth');
const { cache } = require('../config/redis');
const { 
  generateToken, 
  generateRefreshToken,
  generateVerificationToken,
  generatePasswordResetToken,
  verifyRefreshToken,
  generateMembershipNumber
} = require('../utils/auth');
const emailService = require('../services/emailService');

// Validation middleware
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Register
router.post('/register', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('name').trim().notEmpty(),
  body('surname').trim().notEmpty(),
  body('phone').optional().isMobilePhone('tr-TR'),
  body('tcNo').optional().isLength({ min: 11, max: 11 })
], validate, async (req, res) => {
  try {
    const { email, password, name, surname, phone, tcNo, address } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Bu e-posta adresi zaten kullanımda' });
    }

    // Create user
    const user = await User.create({
      email,
      password,
      name,
      surname,
      phone,
      tcNo,
      address,
      membershipNumber: generateMembershipNumber(),
      emailVerificationToken: generateVerificationToken(),
      membershipExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year
    });

    // Send verification email
    await emailService.sendVerificationEmail(user);

    // Generate tokens
    const token = generateToken(user);
    const refreshToken = generateRefreshToken(user);

    res.status(201).json({
      user: user.toJSON(),
      token,
      refreshToken
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Kayıt işlemi başarısız' });
  }
});

// Login
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty()
], validate, async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: 'Geçersiz e-posta veya şifre' });
    }

    if (user.status === 'inactive') {
      return res.status(403).json({ error: 'Hesabınız aktif değil' });
    }

    if (user.status === 'suspended') {
      return res.status(403).json({ error: 'Hesabınız askıya alınmış' });
    }

    // Update last login
    await user.update({ lastLoginAt: new Date() });

    // Generate tokens
    const token = generateToken(user);
    const refreshToken = generateRefreshToken(user);

    res.json({
      user: user.toJSON(),
      token,
      refreshToken
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Giriş işlemi başarısız' });
  }
});

// Refresh token
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh token gerekli' });
    }

    const decoded = verifyRefreshToken(refreshToken);
    if (!decoded) {
      return res.status(401).json({ error: 'Geçersiz refresh token' });
    }

    const user = await User.findByPk(decoded.id);
    if (!user || user.status !== 'active') {
      return res.status(401).json({ error: 'Kullanıcı bulunamadı veya aktif değil' });
    }

    const token = generateToken(user);
    const newRefreshToken = generateRefreshToken(user);

    res.json({
      token,
      refreshToken: newRefreshToken
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(500).json({ error: 'Token yenileme başarısız' });
  }
});

// Logout
router.post('/logout', auth, async (req, res) => {
  try {
    // Remove token from cache
    await cache.del(`auth_token:${req.token}`);
    
    res.json({ message: 'Çıkış yapıldı' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Çıkış işlemi başarısız' });
  }
});

// Get profile
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      include: [
        {
          association: 'borrowings',
          where: { status: 'active' },
          required: false,
          include: ['book']
        },
        {
          association: 'reservations',
          where: { status: 'pending' },
          required: false,
          include: ['book']
        }
      ]
    });

    res.json({ user });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Profil bilgileri alınamadı' });
  }
});

// Update profile
router.put('/profile', auth, [
  body('name').optional().trim().notEmpty(),
  body('surname').optional().trim().notEmpty(),
  body('phone').optional().isMobilePhone('tr-TR'),
  body('address').optional().trim()
], validate, async (req, res) => {
  try {
    const updates = {};
    const allowedUpdates = ['name', 'surname', 'phone', 'address', 'birthDate'];

    for (const key of allowedUpdates) {
      if (req.body[key] !== undefined) {
        updates[key] = req.body[key];
      }
    }

    await req.user.update(updates);

    res.json({ user: req.user });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Profil güncelleme başarısız' });
  }
});

// Change password
router.put('/change-password', auth, [
  body('currentPassword').notEmpty(),
  body('newPassword').isLength({ min: 6 })
], validate, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findByPk(req.user.id);
    
    if (!(await user.comparePassword(currentPassword))) {
      return res.status(400).json({ error: 'Mevcut şifre yanlış' });
    }

    await user.update({ password: newPassword });

    res.json({ message: 'Şifre başarıyla değiştirildi' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Şifre değiştirme başarısız' });
  }
});

// Forgot password
router.post('/forgot-password', [
  body('email').isEmail().normalizeEmail()
], validate, async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      // Don't reveal if user exists
      return res.json({ message: 'Şifre sıfırlama e-postası gönderildi' });
    }

    const { token, hashedToken } = generatePasswordResetToken();
    
    await user.update({
      passwordResetToken: hashedToken,
      passwordResetExpires: new Date(Date.now() + 3600000) // 1 hour
    });

    await emailService.sendPasswordResetEmail(user, token);

    res.json({ message: 'Şifre sıfırlama e-postası gönderildi' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Şifre sıfırlama işlemi başarısız' });
  }
});

// Reset password
router.post('/reset-password', [
  body('token').notEmpty(),
  body('password').isLength({ min: 6 })
], validate, async (req, res) => {
  try {
    const { token, password } = req.body;

    const hashedToken = require('crypto')
      .createHash('sha256')
      .update(token)
      .digest('hex');

    const user = await User.findOne({
      where: {
        passwordResetToken: hashedToken,
        passwordResetExpires: { [require('sequelize').Op.gt]: new Date() }
      }
    });

    if (!user) {
      return res.status(400).json({ error: 'Geçersiz veya süresi dolmuş token' });
    }

    await user.update({
      password,
      passwordResetToken: null,
      passwordResetExpires: null
    });

    res.json({ message: 'Şifre başarıyla sıfırlandı' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Şifre sıfırlama başarısız' });
  }
});

// Verify email
router.get('/verify-email/:token', async (req, res) => {
  try {
    const { token } = req.params;

    const user = await User.findOne({
      where: { emailVerificationToken: token }
    });

    if (!user) {
      return res.status(400).json({ error: 'Geçersiz doğrulama token\'ı' });
    }

    await user.update({
      emailVerified: true,
      emailVerificationToken: null
    });

    res.json({ message: 'E-posta adresi doğrulandı' });
  } catch (error) {
    console.error('Verify email error:', error);
    res.status(500).json({ error: 'E-posta doğrulama başarısız' });
  }
});

module.exports = router;