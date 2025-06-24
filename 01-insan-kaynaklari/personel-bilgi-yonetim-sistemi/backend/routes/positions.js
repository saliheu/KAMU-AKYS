const router = require('express').Router();
const { Position, Personnel } = require('../models');
const { authenticate, authorize } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Get all positions
router.get('/', authenticate, async (req, res, next) => {
  try {
    const { category, level, isActive = true } = req.query;
    const where = {};

    if (category) where.category = category;
    if (level) where.level = level;
    if (isActive !== undefined) where.isActive = isActive === 'true';

    const positions = await Position.findAll({
      where,
      order: [['level', 'DESC'], ['title', 'ASC']]
    });

    res.json(positions);
  } catch (error) {
    next(error);
  }
});

// Get single position
router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const position = await Position.findByPk(req.params.id, {
      include: [
        {
          model: Personnel,
          as: 'personnel',
          attributes: ['id', 'firstName', 'lastName', 'employeeId'],
          include: [{ model: Department, as: 'department', attributes: ['name'] }]
        }
      ]
    });

    if (!position) {
      return res.status(404).json({ error: 'Position not found' });
    }

    res.json(position);
  } catch (error) {
    next(error);
  }
});

// Create position
router.post('/', [
  body('title').notEmpty().trim(),
  body('code').notEmpty().trim(),
  body('level').isInt({ min: 1, max: 10 }),
  body('category').isIn(['management', 'professional', 'technical', 'administrative', 'support'])
], authenticate, authorize('admin', 'hr_manager'), validate, async (req, res, next) => {
  try {
    const position = await Position.create(req.body);
    res.status(201).json(position);
  } catch (error) {
    next(error);
  }
});

// Update position
router.put('/:id', authenticate, authorize('admin', 'hr_manager'), async (req, res, next) => {
  try {
    const position = await Position.findByPk(req.params.id);
    
    if (!position) {
      return res.status(404).json({ error: 'Position not found' });
    }

    await position.update(req.body);
    res.json(position);
  } catch (error) {
    next(error);
  }
});

// Delete position
router.delete('/:id', authenticate, authorize('admin'), async (req, res, next) => {
  try {
    const position = await Position.findByPk(req.params.id);
    
    if (!position) {
      return res.status(404).json({ error: 'Position not found' });
    }

    // Check if position has personnel
    const personnelCount = await Personnel.count({ where: { positionId: req.params.id } });
    if (personnelCount > 0) {
      return res.status(400).json({ error: 'Cannot delete position assigned to personnel' });
    }

    await position.destroy();
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

module.exports = router;