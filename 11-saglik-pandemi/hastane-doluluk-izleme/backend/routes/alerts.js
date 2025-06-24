const router = require('express').Router();
const { Alert, AlertRule, Hospital, Department } = require('../models');
const { authenticate } = require('../middleware/auth');
const { Op } = require('sequelize');

// Get alerts
router.get('/', authenticate, async (req, res, next) => {
  try {
    const { status, type, hospitalId, limit = 50 } = req.query;
    const where = {};

    if (status) where.status = status;
    if (type) where.type = type;
    if (hospitalId) where.hospitalId = hospitalId;

    const alerts = await Alert.findAll({
      where,
      include: [
        { model: Hospital, as: 'hospital' },
        { model: Department, as: 'department' },
        { model: AlertRule, as: 'alertRule' }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit)
    });

    res.json(alerts);
  } catch (error) {
    next(error);
  }
});

// Acknowledge alert
router.post('/:id/acknowledge', authenticate, async (req, res, next) => {
  try {
    const alert = await Alert.findByPk(req.params.id);
    
    if (!alert) {
      return res.status(404).json({ error: 'Alert not found' });
    }

    await alert.update({
      status: 'acknowledged',
      acknowledgedBy: req.user.id,
      acknowledgedAt: new Date()
    });

    res.json(alert);
  } catch (error) {
    next(error);
  }
});

// Resolve alert
router.post('/:id/resolve', authenticate, async (req, res, next) => {
  try {
    const alert = await Alert.findByPk(req.params.id);
    
    if (!alert) {
      return res.status(404).json({ error: 'Alert not found' });
    }

    await alert.update({
      status: 'resolved',
      resolvedBy: req.user.id,
      resolvedAt: new Date()
    });

    res.json(alert);
  } catch (error) {
    next(error);
  }
});

module.exports = router;