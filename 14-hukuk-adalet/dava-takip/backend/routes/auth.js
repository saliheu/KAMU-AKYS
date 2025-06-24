const router = require('express').Router();
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { User } = require('../models');
const { authenticate } = require('../middleware/auth');
const logger = require('../utils/logger');
const emailService = require('../services/emailService');
const { cache } = require('../config/redis');

// Validation middleware
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Register
router.post('/register',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('name').notEmpty().trim(),
    body('surname').notEmpty().trim(),
    body('phone').optional().isMobilePhone('tr-TR'),
    body('role').optional().isIn(['admin', 'lawyer', 'secretary', 'clerk', 'client'])
  ],
  validate,
  async (req, res) => {
    try {
      const { email, password, name, surname, phone, role } = req.body;

      // Check if user exists
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ error: 'Email already registered' });
      }

      // Create user
      const user = await User.create({
        email,
        password,
        name,
        surname,
        phone,
        role: role || 'clerk'
      });

      // Generate tokens
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE || '7d' }
      );

      const refreshToken = jwt.sign(
        { id: user.id },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: process.env.JWT_REFRESH_EXPIRE || '30d' }
      );

      // Save refresh token
      user.refreshToken = refreshToken;
      await user.save();

      // Send welcome email
      await emailService.sendWelcomeEmail(user);

      logger.info(`New user registered: ${user.email}`);

      res.status(201).json({
        user: user.toJSON(),
        token,
        refreshToken
      });
    } catch (error) {
      logger.error('Registration error:', error);
      res.status(500).json({ error: 'Failed to register user' });
    }
  }
);

// Login
router.post('/login',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty()
  ],
  validate,
  async (req, res) => {
    try {
      const { email, password } = req.body;

      // Find user
      const user = await User.findOne({ where: { email } });
      if (!user || !await user.validatePassword(password)) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      if (!user.isActive) {
        return res.status(403).json({ error: 'Account is deactivated' });
      }

      // Generate tokens
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE || '7d' }
      );

      const refreshToken = jwt.sign(
        { id: user.id },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: process.env.JWT_REFRESH_EXPIRE || '30d' }
      );

      // Update user
      user.refreshToken = refreshToken;
      user.lastLoginAt = new Date();
      await user.save();

      logger.info(`User logged in: ${user.email}`);

      res.json({
        user: user.toJSON(),
        token,
        refreshToken
      });
    } catch (error) {
      logger.error('Login error:', error);
      res.status(500).json({ error: 'Failed to login' });
    }
  }
);

// Refresh token
router.post('/refresh',
  [body('refreshToken').notEmpty()],
  validate,
  async (req, res) => {
    try {
      const { refreshToken } = req.body;

      // Verify refresh token
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
      
      // Find user
      const user = await User.findOne({
        where: { 
          id: decoded.id,
          refreshToken,
          isActive: true
        }
      });

      if (!user) {
        return res.status(401).json({ error: 'Invalid refresh token' });
      }

      // Generate new tokens
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE || '7d' }
      );

      const newRefreshToken = jwt.sign(
        { id: user.id },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: process.env.JWT_REFRESH_EXPIRE || '30d' }
      );

      // Update refresh token
      user.refreshToken = newRefreshToken;
      await user.save();

      res.json({
        token,
        refreshToken: newRefreshToken
      });
    } catch (error) {
      logger.error('Token refresh error:', error);
      res.status(401).json({ error: 'Failed to refresh token' });
    }
  }
);

// Logout
router.post('/logout', authenticate, async (req, res) => {
  try {
    req.user.refreshToken = null;
    await req.user.save();

    logger.info(`User logged out: ${req.user.email}`);
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    logger.error('Logout error:', error);
    res.status(500).json({ error: 'Failed to logout' });
  }
});

// Get profile
router.get('/profile', authenticate, async (req, res) => {
  res.json({ user: req.user.toJSON() });
});

// Update profile
router.put('/profile',
  authenticate,
  [
    body('name').optional().trim(),
    body('surname').optional().trim(),
    body('phone').optional().isMobilePhone('tr-TR'),
    body('settings').optional().isObject()
  ],
  validate,
  async (req, res) => {
    try {
      const updates = ['name', 'surname', 'phone', 'settings'];
      updates.forEach(field => {
        if (req.body[field] !== undefined) {
          req.user[field] = req.body[field];
        }
      });

      await req.user.save();

      res.json({ user: req.user.toJSON() });
    } catch (error) {
      logger.error('Profile update error:', error);
      res.status(500).json({ error: 'Failed to update profile' });
    }
  }
);

// Change password
router.put('/change-password',
  authenticate,
  [
    body('currentPassword').notEmpty(),
    body('newPassword').isLength({ min: 6 })
  ],
  validate,
  async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;

      if (!await req.user.validatePassword(currentPassword)) {
        return res.status(400).json({ error: 'Current password is incorrect' });
      }

      req.user.password = newPassword;
      await req.user.save();

      logger.info(`Password changed for user: ${req.user.email}`);
      res.json({ message: 'Password changed successfully' });
    } catch (error) {
      logger.error('Password change error:', error);
      res.status(500).json({ error: 'Failed to change password' });
    }
  }
);

// Forgot password
router.post('/forgot-password',
  [body('email').isEmail().normalizeEmail()],
  validate,
  async (req, res) => {
    try {
      const { email } = req.body;

      const user = await User.findOne({ where: { email } });
      if (!user) {
        // Don't reveal if email exists
        return res.json({ message: 'If the email exists, a reset link has been sent' });
      }

      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');

      user.resetPasswordToken = resetTokenHash;
      user.resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hour
      await user.save();

      // Send reset email
      await emailService.sendPasswordResetEmail(user, resetToken);

      logger.info(`Password reset requested for: ${email}`);
      res.json({ message: 'If the email exists, a reset link has been sent' });
    } catch (error) {
      logger.error('Forgot password error:', error);
      res.status(500).json({ error: 'Failed to process password reset' });
    }
  }
);

// Reset password
router.post('/reset-password',
  [
    body('token').notEmpty(),
    body('password').isLength({ min: 6 })
  ],
  validate,
  async (req, res) => {
    try {
      const { token, password } = req.body;

      const resetTokenHash = crypto.createHash('sha256').update(token).digest('hex');

      const user = await User.findOne({
        where: {
          resetPasswordToken: resetTokenHash,
          resetPasswordExpires: { [Op.gt]: new Date() }
        }
      });

      if (!user) {
        return res.status(400).json({ error: 'Invalid or expired reset token' });
      }

      user.password = password;
      user.resetPasswordToken = null;
      user.resetPasswordExpires = null;
      await user.save();

      logger.info(`Password reset completed for: ${user.email}`);
      res.json({ message: 'Password reset successfully' });
    } catch (error) {
      logger.error('Password reset error:', error);
      res.status(500).json({ error: 'Failed to reset password' });
    }
  }
);

module.exports = router;