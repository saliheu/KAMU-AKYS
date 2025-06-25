const User = require('../models/User');
const { generateToken, generateRefreshToken, verifyRefreshToken } = require('../utils/jwt');
const { cache } = require('../config/redis');
const emailService = require('../services/emailService');
const smsService = require('../services/smsService');
const logger = require('../utils/logger');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');

// Login with TC Kimlik No and password
exports.login = async (req, res, next) => {
  try {
    const { tcKimlikNo, password } = req.body;

    // Find user
    const user = await User.findByTcKimlikNo(tcKimlikNo);
    if (!user) {
      return res.status(401).json({ error: 'Kullanıcı bulunamadı veya şifre hatalı' });
    }

    // Check password
    const isValidPassword = await User.verifyPassword(password, user.sifre_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Kullanıcı bulunamadı veya şifre hatalı' });
    }

    // Check if user is active
    if (!user.aktif) {
      return res.status(401).json({ error: 'Hesabınız aktif değil' });
    }

    // Update last login
    await user.updateLastLogin();

    // Generate tokens
    const token = generateToken(user);
    const refreshToken = generateRefreshToken(user);

    // Store refresh token in Redis
    await cache.set(`refresh_token:${user.id}`, refreshToken, 604800); // 7 days

    // Return user data and tokens
    res.json({
      token,
      refreshToken,
      user: user.toJSON()
    });
  } catch (error) {
    logger.error('Login hatası:', error);
    next(error);
  }
};

// Register new user
exports.register = async (req, res, next) => {
  try {
    const { tcKimlikNo, ad, soyad, email, telefon, password, rol } = req.body;

    // Check if user exists
    const existingUser = await User.findByTcKimlikNo(tcKimlikNo);
    if (existingUser) {
      return res.status(400).json({ error: 'Bu TC Kimlik Numarası ile kayıtlı kullanıcı mevcut' });
    }

    // Check email uniqueness
    if (email) {
      const emailUser = await User.findByEmail(email);
      if (emailUser) {
        return res.status(400).json({ error: 'Bu e-posta adresi kullanımda' });
      }
    }

    // Create user
    const user = await User.create({
      tcKimlikNo,
      ad,
      soyad,
      email,
      telefon,
      password,
      rol: rol || 'vatandas'
    });

    // Send welcome email
    if (email) {
      await emailService.sendWelcomeEmail(email, ad);
    }

    // Send verification SMS
    if (telefon) {
      const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
      await cache.set(`sms_verification:${user.id}`, verificationCode, 300); // 5 minutes
      await smsService.sendVerificationSMS(telefon, verificationCode);
    }

    res.status(201).json({
      message: 'Kayıt başarılı',
      user: user.toJSON()
    });
  } catch (error) {
    logger.error('Register hatası:', error);
    next(error);
  }
};

// Logout
exports.logout = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Remove refresh token from Redis
    await cache.del(`refresh_token:${userId}`);

    // Clear session if exists
    await cache.session.destroy(req.headers.authorization?.split(' ')[1]);

    res.json({ message: 'Çıkış başarılı' });
  } catch (error) {
    logger.error('Logout hatası:', error);
    next(error);
  }
};

// Refresh token
exports.refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({ error: 'Refresh token gerekli' });
    }

    // Verify refresh token
    const decoded = verifyRefreshToken(refreshToken);
    if (!decoded) {
      return res.status(401).json({ error: 'Geçersiz refresh token' });
    }

    // Check if refresh token exists in Redis
    const storedToken = await cache.get(`refresh_token:${decoded.sub}`);
    if (storedToken !== refreshToken) {
      return res.status(401).json({ error: 'Geçersiz refresh token' });
    }

    // Get user
    const user = await User.findById(decoded.sub);
    if (!user || !user.aktif) {
      return res.status(401).json({ error: 'Kullanıcı bulunamadı veya aktif değil' });
    }

    // Generate new tokens
    const newToken = generateToken(user);
    const newRefreshToken = generateRefreshToken(user);

    // Update refresh token in Redis
    await cache.set(`refresh_token:${user.id}`, newRefreshToken, 604800); // 7 days

    res.json({
      token: newToken,
      refreshToken: newRefreshToken
    });
  } catch (error) {
    logger.error('Refresh token hatası:', error);
    next(error);
  }
};

// Get current user
exports.getCurrentUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
    }

    res.json({ user: user.toJSON() });
  } catch (error) {
    logger.error('Get current user hatası:', error);
    next(error);
  }
};

// Request password reset
exports.requestPasswordReset = async (req, res, next) => {
  try {
    const { tcKimlikNo, email } = req.body;

    // Find user
    const user = await User.findByTcKimlikNo(tcKimlikNo);
    if (!user || user.email !== email) {
      return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    // Store token in Redis
    await cache.set(`password_reset:${hashedToken}`, user.id, 3600); // 1 hour

    // Send reset email
    await emailService.sendPasswordResetEmail(user.email, resetToken);

    res.json({ message: 'Şifre sıfırlama e-postası gönderildi' });
  } catch (error) {
    logger.error('Password reset request hatası:', error);
    next(error);
  }
};

// Reset password
exports.resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;

    // Hash token
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // Get user ID from Redis
    const userId = await cache.get(`password_reset:${hashedToken}`);
    if (!userId) {
      return res.status(400).json({ error: 'Geçersiz veya süresi dolmuş token' });
    }

    // Get user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
    }

    // Update password
    await user.update({ password });

    // Delete reset token
    await cache.del(`password_reset:${hashedToken}`);

    res.json({ message: 'Şifre başarıyla sıfırlandı' });
  } catch (error) {
    logger.error('Password reset hatası:', error);
    next(error);
  }
};

// E-Devlet login
exports.eDevletLogin = (req, res) => {
  // Redirect to E-Devlet authentication
  const redirectUrl = process.env.EDEVLET_AUTH_URL || 'https://giris.turkiye.gov.tr/oauth/authorize';
  const clientId = process.env.EDEVLET_CLIENT_ID;
  const callbackUrl = `${process.env.API_URL}/api/auth/e-devlet/callback`;

  res.redirect(
    `${redirectUrl}?client_id=${clientId}&redirect_uri=${callbackUrl}&response_type=code&scope=kimlik+iletisim`
  );
};

// E-Devlet callback
exports.eDevletCallback = async (req, res, next) => {
  try {
    const user = req.user;

    // Generate tokens
    const token = generateToken(user);
    const refreshToken = generateRefreshToken(user);

    // Store refresh token in Redis
    await cache.set(`refresh_token:${user.id}`, refreshToken, 604800); // 7 days

    // Redirect to frontend with tokens
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    res.redirect(`${frontendUrl}/auth/callback?token=${token}&refreshToken=${refreshToken}`);
  } catch (error) {
    logger.error('E-Devlet callback hatası:', error);
    res.redirect(`${process.env.FRONTEND_URL}/auth/error?message=E-Devlet%20giriş%20hatası`);
  }
};

// Verify email
exports.verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.body;

    // Get user ID from token
    const userId = await cache.get(`email_verification:${token}`);
    if (!userId) {
      return res.status(400).json({ error: 'Geçersiz veya süresi dolmuş token' });
    }

    // Update user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
    }

    await user.update({ emailDogrulama: true });

    // Delete verification token
    await cache.del(`email_verification:${token}`);

    res.json({ message: 'E-posta doğrulandı' });
  } catch (error) {
    logger.error('Email verification hatası:', error);
    next(error);
  }
};

// Verify phone
exports.verifyPhone = async (req, res, next) => {
  try {
    const { code } = req.body;
    const userId = req.user.id;

    // Get stored code
    const storedCode = await cache.get(`sms_verification:${userId}`);
    if (!storedCode || storedCode !== code) {
      return res.status(400).json({ error: 'Geçersiz doğrulama kodu' });
    }

    // Update user
    const user = await User.findById(userId);
    await user.update({ telefonDogrulama: true });

    // Delete verification code
    await cache.del(`sms_verification:${userId}`);

    res.json({ message: 'Telefon doğrulandı' });
  } catch (error) {
    logger.error('Phone verification hatası:', error);
    next(error);
  }
};

// Send verification SMS
exports.sendVerificationSMS = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    if (!user.telefon) {
      return res.status(400).json({ error: 'Telefon numarası bulunamadı' });
    }

    // Check rate limit
    const rateLimitKey = `sms_rate_limit:${userId}`;
    const attempts = await cache.get(rateLimitKey) || 0;
    if (attempts >= 3) {
      return res.status(429).json({ error: 'Çok fazla deneme. Lütfen daha sonra tekrar deneyin.' });
    }

    // Generate verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store code in Redis
    await cache.set(`sms_verification:${userId}`, verificationCode, 300); // 5 minutes
    
    // Update rate limit
    await cache.set(rateLimitKey, attempts + 1, 3600); // 1 hour

    // Send SMS
    await smsService.sendVerificationSMS(user.telefon, verificationCode);

    res.json({ message: 'Doğrulama kodu gönderildi' });
  } catch (error) {
    logger.error('Send verification SMS hatası:', error);
    next(error);
  }
};