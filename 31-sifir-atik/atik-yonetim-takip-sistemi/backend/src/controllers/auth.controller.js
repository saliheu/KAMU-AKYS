const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { User, Institution } = require('../models');
const { logger } = require('../utils/logger');
const redisClient = require('../config/redis');

const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user.id, 
      email: user.email, 
      role: user.role,
      institutionId: user.institutionId 
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRY || '7d' }
  );
};

const generateRefreshToken = () => {
  return crypto.randomBytes(40).toString('hex');
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ 
      where: { email },
      include: ['institution']
    });
    
    if (!user || !(await user.validatePassword(password))) {
      return res.status(401).json({ error: 'Geçersiz email veya şifre' });
    }

    if (!user.isActive) {
      return res.status(401).json({ error: 'Hesabınız aktif değil' });
    }

    user.lastLogin = new Date();
    await user.save();

    const token = generateToken(user);
    const refreshToken = generateRefreshToken();
    
    // Store refresh token in Redis
    await redisClient.setEx(
      `refresh_token:${refreshToken}`,
      604800, // 7 days
      JSON.stringify({ userId: user.id })
    );

    res.json({
      token,
      refreshToken,
      user: user.toJSON()
    });
  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json({ error: 'Giriş yapılamadı' });
  }
};

exports.register = async (req, res) => {
  try {
    const userData = req.body;
    
    // Check if institution exists
    const institution = await Institution.findByPk(userData.institutionId);
    if (!institution || !institution.isActive) {
      return res.status(400).json({ error: 'Geçersiz kurum' });
    }
    
    const existingUser = await User.findOne({
      where: { 
        [require('sequelize').Op.or]: [
          { email: userData.email },
          { sicilNo: userData.sicilNo }
        ]
      }
    });

    if (existingUser) {
      return res.status(409).json({ error: 'Email veya sicil no zaten kayıtlı' });
    }

    const user = await User.create(userData);
    const token = generateToken(user);
    const refreshToken = generateRefreshToken();
    
    await redisClient.setEx(
      `refresh_token:${refreshToken}`,
      604800,
      JSON.stringify({ userId: user.id })
    );

    res.status(201).json({
      token,
      refreshToken,
      user: user.toJSON()
    });
  } catch (error) {
    logger.error('Register error:', error);
    res.status(500).json({ error: 'Kayıt oluşturulamadı' });
  }
};

exports.logout = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (token) {
      // Add token to blacklist
      await redisClient.setEx(
        `blacklist:${token}`,
        86400, // 24 hours
        'true'
      );
    }
    
    res.json({ message: 'Çıkış başarılı' });
  } catch (error) {
    logger.error('Logout error:', error);
    res.status(500).json({ error: 'Çıkış yapılamadı' });
  }
};

exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh token gerekli' });
    }

    const tokenData = await redisClient.get(`refresh_token:${refreshToken}`);
    if (!tokenData) {
      return res.status(401).json({ error: 'Geçersiz refresh token' });
    }

    const { userId } = JSON.parse(tokenData);
    const user = await User.findByPk(userId);

    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'Geçersiz kullanıcı' });
    }

    const token = generateToken(user);
    const newRefreshToken = generateRefreshToken();
    
    // Delete old refresh token
    await redisClient.del(`refresh_token:${refreshToken}`);
    
    // Store new refresh token
    await redisClient.setEx(
      `refresh_token:${newRefreshToken}`,
      604800,
      JSON.stringify({ userId: user.id })
    );
    
    res.json({ 
      token,
      refreshToken: newRefreshToken
    });
  } catch (error) {
    logger.error('Refresh token error:', error);
    res.status(401).json({ error: 'Geçersiz refresh token' });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    
    const user = await User.findOne({ where: { email } });
    if (!user) {
      // Don't reveal if user exists
      return res.json({ message: 'Şifre sıfırlama linki email adresinize gönderildi' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    
    // Store reset token in Redis
    await redisClient.setEx(
      `reset_token:${resetToken}`,
      3600, // 1 hour
      user.id
    );

    // TODO: Send email with reset link
    logger.info(`Password reset token for ${email}: ${resetToken}`);

    res.json({ message: 'Şifre sıfırlama linki email adresinize gönderildi' });
  } catch (error) {
    logger.error('Forgot password error:', error);
    res.status(500).json({ error: 'İşlem gerçekleştirilemedi' });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    
    const userId = await redisClient.get(`reset_token:${token}`);
    if (!userId) {
      return res.status(400).json({ error: 'Geçersiz veya süresi dolmuş token' });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(400).json({ error: 'Kullanıcı bulunamadı' });
    }

    user.password = password;
    await user.save();
    
    // Delete reset token
    await redisClient.del(`reset_token:${token}`);

    res.json({ message: 'Şifreniz başarıyla güncellendi' });
  } catch (error) {
    logger.error('Reset password error:', error);
    res.status(500).json({ error: 'Şifre güncellenemedi' });
  }
};