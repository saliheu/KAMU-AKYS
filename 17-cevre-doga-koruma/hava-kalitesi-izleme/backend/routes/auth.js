const router = require('express').Router();
const { body, validationResult } = require('express-validator');
const { User } = require('../models');
const { generateToken, generateRefreshToken } = require('../utils/auth');
const { authenticate } = require('../middleware/auth');
const { logger } = require('../utils/logger');

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
  body('name').notEmpty().trim(),
  body('phone').optional().isMobilePhone('tr-TR')
], validate, async (req, res, next) => {
  try {
    const { email, password, name, phone, department } = req.body;

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
      phone,
      department,
      role: 'viewer' // Default role
    });

    const token = generateToken({ id: user.id, email: user.email, role: user.role });
    const refreshToken = generateRefreshToken({ id: user.id });

    logger.info(`New user registered: ${email}`);

    res.status(201).json({
      token,
      refreshToken,
      user: user.toJSON()
    });
  } catch (error) {
    next(error);
  }
});

// Login
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty()
], validate, async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user || !await user.comparePassword(password)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (!user.isActive) {
      return res.status(401).json({ error: 'Account is deactivated' });
    }

    await user.update({ lastLogin: new Date() });

    const token = generateToken({ id: user.id, email: user.email, role: user.role });
    const refreshToken = generateRefreshToken({ id: user.id });

    logger.info(`User logged in: ${email}`);

    res.json({
      token,
      refreshToken,
      user: user.toJSON()
    });
  } catch (error) {
    next(error);
  }
});

// Get current user
router.get('/me', authenticate, async (req, res, next) => {
  try {
    res.json(req.user.toJSON());
  } catch (error) {
    next(error);
  }
});

// Update profile
router.put('/profile', authenticate, [
  body('name').optional().notEmpty().trim(),
  body('phone').optional().isMobilePhone('tr-TR'),
  body('department').optional().trim()
], validate, async (req, res, next) => {
  try {
    const { name, phone, department } = req.body;

    await req.user.update({
      ...(name && { name }),
      ...(phone && { phone }),
      ...(department && { department })
    });

    res.json(req.user.toJSON());
  } catch (error) {
    next(error);
  }
});

// Change password
router.post('/change-password', authenticate, [
  body('currentPassword').notEmpty(),
  body('newPassword').isLength({ min: 6 })
], validate, async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!await req.user.comparePassword(currentPassword)) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    await req.user.update({ password: newPassword });

    logger.info(`Password changed for user: ${req.user.email}`);

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    next(error);
  }
});

// Forgot password
router.post('/forgot-password', [
  body('email').isEmail().normalizeEmail()
], validate, async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      // Don't reveal if user exists
      return res.json({ message: 'If the email exists, a reset link has been sent' });
    }

    // TODO: Implement password reset logic
    // - Generate reset token
    // - Send email with reset link
    
    logger.info(`Password reset requested for: ${email}`);

    res.json({ message: 'If the email exists, a reset link has been sent' });
  } catch (error) {
    next(error);
  }
});

// Logout (optional - for token blacklisting if needed)
router.post('/logout', authenticate, async (req, res, next) => {
  try {
    // TODO: Implement token blacklisting if needed
    
    logger.info(`User logged out: ${req.user.email}`);

    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;