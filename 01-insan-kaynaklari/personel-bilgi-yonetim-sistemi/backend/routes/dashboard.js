const router = require('express').Router();
const { authenticate } = require('../middleware/auth');
const { Personnel, Department, Leave } = require('../models');
const { Op } = require('sequelize');

// Get dashboard statistics
router.get('/stats', authenticate, async (req, res, next) => {
  try {
    const totalPersonnel = await Personnel.count({ where: { status: 'active' } });
    const totalDepartments = await Department.count({ where: { isActive: true } });
    
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const newHires = await Personnel.count({
      where: {
        createdAt: {
          [Op.gte]: new Date(currentYear, currentMonth, 1)
        }
      }
    });

    const onLeave = await Personnel.count({ where: { status: 'on_leave' } });

    res.json({
      totalPersonnel,
      totalDepartments,
      newHires,
      onLeave
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;