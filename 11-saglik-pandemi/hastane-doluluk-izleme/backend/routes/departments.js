const router = require('express').Router();
const { Department } = require('../models');
const { authenticate, authorize } = require('../middleware/auth');

// Get all departments
router.get('/', authenticate, async (req, res, next) => {
  try {
    const departments = await Department.findAll({
      where: { isActive: true },
      order: [['category', 'ASC'], ['name', 'ASC']]
    });
    res.json(departments);
  } catch (error) {
    next(error);
  }
});

// Create department
router.post('/', authenticate, authorize('super_admin', 'admin'), async (req, res, next) => {
  try {
    const department = await Department.create(req.body);
    res.status(201).json(department);
  } catch (error) {
    next(error);
  }
});

module.exports = router;