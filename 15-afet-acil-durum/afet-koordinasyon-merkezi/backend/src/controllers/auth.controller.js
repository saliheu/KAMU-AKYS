const jwt = require('jsonwebtoken');
const { User, Institution } = require('../models');
const { cache } = require('../config/redis');
const logger = require('../utils/logger');

const generateTokens = (userId) => {
  const accessToken = jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRY || '7d' }
  );
  
  const refreshToken = jwt.sign(
    { userId, type: 'refresh' },
    process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRY || '30d' }
  );
  
  return { accessToken, refreshToken };
};

const authController = {
  async register(req, res, next) {
    try {
      const { 
        email, 
        password, 
        firstName, 
        lastName, 
        phoneNumber,
        institutionId,
        role = 'citizen'
      } = req.body;

      // Check if user exists
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ 
          error: 'Bu e-posta adresi zaten kayıtlı' 
        });
      }

      // Validate institution if provided
      if (institutionId) {
        const institution = await Institution.findByPk(institutionId);
        if (!institution) {
          return res.status(400).json({ 
            error: 'Geçersiz kurum ID' 
          });
        }
      }

      // Create user
      const user = await User.create({
        email,
        password,
        firstName,
        lastName,
        phoneNumber,
        institutionId,
        role
      });

      const { accessToken, refreshToken } = generateTokens(user.id);
      
      // Save refresh token
      user.refreshToken = refreshToken;
      await user.save();

      logger.info(`New user registered: ${user.email}`);

      res.status(201).json({
        message: 'Kayıt başarılı',
        user: user.toJSON(),
        accessToken,
        refreshToken
      });
    } catch (error) {
      next(error);
    }
  },

  async login(req, res, next) {
    try {
      const { email, password } = req.body;

      // Find user with institution
      const user = await User.findOne({
        where: { email },
        include: [{
          model: Institution,
          attributes: ['id', 'name', 'type']
        }]
      });

      if (!user) {
        return res.status(401).json({ 
          error: 'Geçersiz e-posta veya şifre' 
        });
      }

      // Check password
      const isValidPassword = await user.validatePassword(password);
      if (!isValidPassword) {
        return res.status(401).json({ 
          error: 'Geçersiz e-posta veya şifre' 
        });
      }

      // Check if user is active
      if (!user.isActive) {
        return res.status(403).json({ 
          error: 'Hesabınız deaktif edilmiş' 
        });
      }

      // Generate tokens
      const { accessToken, refreshToken } = generateTokens(user.id);
      
      // Update user
      user.refreshToken = refreshToken;
      user.lastLoginAt = new Date();
      await user.save();

      // Cache user data
      await cache.set(`user:${user.id}`, user.toJSON(), 3600);

      logger.info(`User logged in: ${user.email}`);

      res.json({
        message: 'Giriş başarılı',
        user: user.toJSON(),
        accessToken,
        refreshToken
      });
    } catch (error) {
      next(error);
    }
  },

  async refreshToken(req, res, next) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(400).json({ 
          error: 'Refresh token gerekli' 
        });
      }

      // Verify refresh token
      let decoded;
      try {
        decoded = jwt.verify(
          refreshToken, 
          process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET
        );
      } catch (error) {
        return res.status(401).json({ 
          error: 'Geçersiz refresh token' 
        });
      }

      // Find user
      const user = await User.findOne({
        where: { 
          id: decoded.userId,
          refreshToken
        }
      });

      if (!user) {
        return res.status(401).json({ 
          error: 'Geçersiz refresh token' 
        });
      }

      // Generate new tokens
      const tokens = generateTokens(user.id);
      
      // Update refresh token
      user.refreshToken = tokens.refreshToken;
      await user.save();

      res.json({
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken
      });
    } catch (error) {
      next(error);
    }
  },

  async logout(req, res, next) {
    try {
      const userId = req.user.id;

      // Clear refresh token
      await User.update(
        { refreshToken: null },
        { where: { id: userId } }
      );

      // Clear cache
      await cache.del(`user:${userId}`);

      logger.info(`User logged out: ${req.user.email}`);

      res.json({ 
        message: 'Çıkış başarılı' 
      });
    } catch (error) {
      next(error);
    }
  },

  async getProfile(req, res, next) {
    try {
      const user = await User.findByPk(req.user.id, {
        include: [{
          model: Institution,
          attributes: ['id', 'name', 'type', 'code']
        }]
      });

      res.json({
        user: user.toJSON()
      });
    } catch (error) {
      next(error);
    }
  },

  async updateProfile(req, res, next) {
    try {
      const userId = req.user.id;
      const updates = req.body;

      // Don't allow certain fields to be updated
      delete updates.id;
      delete updates.email;
      delete updates.password;
      delete updates.role;
      delete updates.institutionId;
      delete updates.refreshToken;

      const user = await User.findByPk(userId);
      await user.update(updates);

      // Clear cache
      await cache.del(`user:${userId}`);

      res.json({
        message: 'Profil güncellendi',
        user: user.toJSON()
      });
    } catch (error) {
      next(error);
    }
  },

  async changePassword(req, res, next) {
    try {
      const { currentPassword, newPassword } = req.body;
      const userId = req.user.id;

      const user = await User.findByPk(userId);

      // Validate current password
      const isValid = await user.validatePassword(currentPassword);
      if (!isValid) {
        return res.status(400).json({ 
          error: 'Mevcut şifre yanlış' 
        });
      }

      // Update password
      user.password = newPassword;
      await user.save();

      res.json({ 
        message: 'Şifre başarıyla değiştirildi' 
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = authController;