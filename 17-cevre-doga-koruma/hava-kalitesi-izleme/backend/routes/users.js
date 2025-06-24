const router = require('express').Router();
const { body, query, validationResult } = require('express-validator');
const { User } = require('../models');
const { authenticate, authorize } = require('../middleware/auth');
const { Op } = require('sequelize');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Get users (admin only)
router.get('/', authenticate, authorize('super_admin', 'admin'), [
  query('role').optional().isIn(['super_admin', 'admin', 'operator', 'viewer']),
  query('isActive').optional().isBoolean().toBoolean(),
  query('search').optional().trim(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  query('offset').optional().isInt({ min: 0 }).toInt()
], validate, async (req, res, next) => {
  try {
    const {
      role,
      isActive,
      search,
      limit = 50,
      offset = 0
    } = req.query;

    const where = {};
    if (role) where.role = role;
    if (isActive !== undefined) where.isActive = isActive;
    
    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const { count, rows: users } = await User.findAndCountAll({
      where,
      attributes: { exclude: ['password'] },
      limit,
      offset,
      order: [['name', 'ASC']]
    });

    res.json({
      total: count,
      limit,
      offset,
      users
    });
  } catch (error) {
    next(error);
  }
});

// Get user by ID
router.get('/:id', authenticate, authorize('super_admin', 'admin'), async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    next(error);
  }
});

// Create user (admin only)
router.post('/', authenticate, authorize('super_admin', 'admin'), [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('name').notEmpty().trim(),
  body('role').isIn(['admin', 'operator', 'viewer']),
  body('phone').optional().isMobilePhone('tr-TR'),
  body('department').optional().trim()
], validate, async (req, res, next) => {
  try {
    // Only super_admin can create admin users
    if (req.body.role === 'admin' && req.user.role !== 'super_admin') {
      return res.status(403).json({ error: 'Only super admin can create admin users' });
    }

    // Check if email exists
    const existing = await User.findOne({ where: { email: req.body.email } });
    if (existing) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    const user = await User.create(req.body);
    
    res.status(201).json(user.toJSON());
  } catch (error) {
    next(error);
  }
});

// Update user
router.put('/:id', authenticate, authorize('super_admin', 'admin'), [
  body('name').optional().notEmpty().trim(),
  body('role').optional().isIn(['admin', 'operator', 'viewer']),
  body('phone').optional().isMobilePhone('tr-TR'),
  body('department').optional().trim(),
  body('isActive').optional().isBoolean(),
  body('notificationPreferences').optional().isObject()
], validate, async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Only super_admin can change roles to/from admin
    if (req.body.role && req.user.role !== 'super_admin') {
      if (user.role === 'admin' || req.body.role === 'admin') {
        return res.status(403).json({ error: 'Only super admin can change admin roles' });
      }
    }

    // Prevent self-deactivation
    if (req.body.isActive === false && req.user.id === user.id) {
      return res.status(400).json({ error: 'Cannot deactivate your own account' });
    }

    await user.update(req.body);
    res.json(user.toJSON());
  } catch (error) {
    next(error);
  }
});

// Reset user password (admin only)
router.post('/:id/reset-password', authenticate, authorize('super_admin', 'admin'), [
  body('password').isLength({ min: 6 })
], validate, async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    await user.update({ password: req.body.password });
    
    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    next(error);
  }
});

// Update notification preferences
router.put('/:id/notification-preferences', authenticate, [
  body('email').optional().isBoolean(),
  body('sms').optional().isBoolean(),
  body('push').optional().isBoolean(),
  body('alertTypes').optional().isArray(),
  body('alertTypes.*').optional().isIn(['critical', 'high', 'medium', 'low'])
], validate, async (req, res, next) => {
  try {
    // Users can only update their own preferences
    if (req.params.id !== req.user.id && req.user.role !== 'super_admin' && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const user = await User.findByPk(req.params.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const updatedPreferences = {
      ...user.notificationPreferences,
      ...req.body
    };

    await user.update({ notificationPreferences: updatedPreferences });
    
    res.json({
      message: 'Notification preferences updated',
      preferences: updatedPreferences
    });
  } catch (error) {
    next(error);
  }
});

// Delete user (soft delete)
router.delete('/:id', authenticate, authorize('super_admin'), async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Prevent self-deletion
    if (req.user.id === user.id) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }

    // Soft delete
    await user.update({ isActive: false });
    
    res.json({ message: 'User deactivated successfully' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;