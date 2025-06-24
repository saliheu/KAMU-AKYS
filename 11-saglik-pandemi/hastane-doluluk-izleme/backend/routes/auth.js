const router = require('express').Router();
const { body, validationResult } = require('express-validator');
const { User } = require('../models');
const { generateToken } = require('../utils/auth');
const { authenticate } = require('../middleware/auth');

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
      include: ['hospitals']
    });

    if (!user || !await user.comparePassword(password)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (!user.isActive) {
      return res.status(401).json({ error: 'Account is inactive' });
    }

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
    res.json(req.user);
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

module.exports = router;