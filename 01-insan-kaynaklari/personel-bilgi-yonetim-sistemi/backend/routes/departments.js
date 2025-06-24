const router = require('express').Router();
const { Department, Personnel } = require('../models');
const { authenticate, authorize } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Get all departments
router.get('/', authenticate, async (req, res, next) => {
  try {
    const departments = await Department.findAll({
      include: [
        { model: Department, as: 'parent', attributes: ['id', 'name'] },
        { model: Personnel, as: 'manager', attributes: ['firstName', 'lastName'] }
      ],
      order: [['name', 'ASC']]
    });

    res.json(departments);
  } catch (error) {
    next(error);
  }
});

// Get department hierarchy
router.get('/hierarchy', authenticate, async (req, res, next) => {
  try {
    const departments = await Department.findAll({
      where: { parentId: null },
      include: [
        {
          model: Department,
          as: 'children',
          include: [
            { model: Department, as: 'children' }
          ]
        }
      ]
    });

    res.json(departments);
  } catch (error) {
    next(error);
  }
});

// Get single department
router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const department = await Department.findByPk(req.params.id, {
      include: [
        { model: Department, as: 'parent' },
        { model: Department, as: 'children' },
        { model: Personnel, as: 'manager', attributes: ['firstName', 'lastName'] },
        { 
          model: Personnel, 
          as: 'personnel',
          attributes: ['id', 'firstName', 'lastName', 'employeeId'],
          include: [{ model: Position, as: 'position' }]
        }
      ]
    });

    if (!department) {
      return res.status(404).json({ error: 'Department not found' });
    }

    res.json(department);
  } catch (error) {
    next(error);
  }
});

// Create department
router.post('/', [
  body('name').notEmpty().trim(),
  body('code').notEmpty().trim()
], authenticate, authorize('admin', 'hr_manager'), validate, async (req, res, next) => {
  try {
    const department = await Department.create(req.body);
    res.status(201).json(department);
  } catch (error) {
    next(error);
  }
});

// Update department
router.put('/:id', authenticate, authorize('admin', 'hr_manager'), async (req, res, next) => {
  try {
    const department = await Department.findByPk(req.params.id);
    
    if (!department) {
      return res.status(404).json({ error: 'Department not found' });
    }

    await department.update(req.body);
    res.json(department);
  } catch (error) {
    next(error);
  }
});

// Delete department
router.delete('/:id', authenticate, authorize('admin'), async (req, res, next) => {
  try {
    const department = await Department.findByPk(req.params.id);
    
    if (!department) {
      return res.status(404).json({ error: 'Department not found' });
    }

    // Check if department has personnel
    const personnelCount = await Personnel.count({ where: { departmentId: req.params.id } });
    if (personnelCount > 0) {
      return res.status(400).json({ error: 'Cannot delete department with personnel' });
    }

    // Check if department has children
    const childrenCount = await Department.count({ where: { parentId: req.params.id } });
    if (childrenCount > 0) {
      return res.status(400).json({ error: 'Cannot delete department with sub-departments' });
    }

    await department.destroy();
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

module.exports = router;