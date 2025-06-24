const router = require('express').Router();
const { body, validationResult } = require('express-validator');
const { User, Personnel } = require('../models');
const { generateToken } = require('../utils/auth');
const { authenticate } = require('../middleware/auth');

// Validation middleware
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Login
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty()
], validate, async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ 
      where: { email },
      include: [{
        model: Personnel,
        as: 'personnel',
        attributes: ['id', 'firstName', 'lastName', 'employeeId', 'photo']
      }]
    });

    if (!user || !await user.comparePassword(password)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (!user.isActive) {
      return res.status(401).json({ error: 'Account is inactive' });
    }

    // Update last login
    await user.update({ lastLogin: new Date() });

    const token = generateToken({ 
      id: user.id, 
      email: user.email, 
      role: user.role 
    });

    res.json({
      token,
      user: user.toJSON()
    });
  } catch (error) {
    next(error);
  }
});

// Get current user
router.get('/me', authenticate, async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id, {
      include: [{
        model: Personnel,
        as: 'personnel',
        include: ['department', 'position']
      }]
    });

    res.json(user);
  } catch (error) {
    next(error);
  }
});

// Change password
router.post('/change-password', [
  body('currentPassword').notEmpty(),
  body('newPassword').isLength({ min: 6 })
], authenticate, validate, async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findByPk(req.user.id);
    
    if (!await user.comparePassword(currentPassword)) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    await user.update({ password: newPassword });

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    next(error);
  }
});

// Request password reset
router.post('/forgot-password', [
  body('email').isEmail().normalizeEmail()
], validate, async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ where: { email } });
    
    if (!user) {
      // Don't reveal if email exists
      return res.json({ message: 'If the email exists, a reset link has been sent' });
    }

    // TODO: Implement email sending
    // For now, just generate a token
    const resetToken = require('crypto').randomBytes(32).toString('hex');
    const resetExpires = new Date(Date.now() + 3600000); // 1 hour

    await user.update({
      passwordResetToken: resetToken,
      passwordResetExpires: resetExpires
    });

    // In production, send email with reset link
    // For development, return token
    if (process.env.NODE_ENV === 'development') {
      return res.json({ 
        message: 'Reset token generated',
        resetToken // Remove in production
      });
    }

    res.json({ message: 'If the email exists, a reset link has been sent' });
  } catch (error) {
    next(error);
  }
});

// Reset password
router.post('/reset-password', [
  body('token').notEmpty(),
  body('password').isLength({ min: 6 })
], validate, async (req, res, next) => {
  try {
    const { token, password } = req.body;

    const user = await User.findOne({
      where: {
        passwordResetToken: token,
        passwordResetExpires: { $gt: new Date() }
      }
    });

    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }

    await user.update({
      password,
      passwordResetToken: null,
      passwordResetExpires: null
    });

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;