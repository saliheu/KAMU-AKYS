const router = require('express').Router();
const { body, query, validationResult } = require('express-validator');
const { Alert, AlertRule, Station, User } = require('../models');
const { authenticate, authorize } = require('../middleware/auth');
const { Op } = require('sequelize');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Get alerts
router.get('/', authenticate, [
  query('status').optional().isIn(['active', 'acknowledged', 'resolved', 'expired']),
  query('severity').optional().isIn(['low', 'medium', 'high', 'critical']),
  query('type').optional(),
  query('stationId').optional().isUUID(),
  query('startDate').optional().isISO8601().toDate(),
  query('endDate').optional().isISO8601().toDate(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  query('offset').optional().isInt({ min: 0 }).toInt()
], validate, async (req, res, next) => {
  try {
    const {
      status,
      severity,
      type,
      stationId,
      startDate,
      endDate,
      limit = 50,
      offset = 0
    } = req.query;

    const where = {};
    if (status) where.status = status;
    if (severity) where.severity = severity;
    if (type) where.type = type;
    if (stationId) where.stationId = stationId;

    if (startDate || endDate) {
      where.triggeredAt = {};
      if (startDate) where.triggeredAt[Op.gte] = startDate;
      if (endDate) where.triggeredAt[Op.lte] = endDate;
    }

    const { count, rows: alerts } = await Alert.findAndCountAll({
      where,
      include: [
        {
          model: Station,
          as: 'station',
          attributes: ['id', 'name', 'code']
        },
        {
          model: AlertRule,
          as: 'alertRule',
          attributes: ['id', 'name', 'type']
        },
        {
          model: User,
          as: 'acknowledger',
          attributes: ['id', 'name', 'email']
        },
        {
          model: User,
          as: 'resolver',
          attributes: ['id', 'name', 'email']
        }
      ],
      limit,
      offset,
      order: [['triggeredAt', 'DESC']]
    });

    res.json({
      total: count,
      limit,
      offset,
      alerts
    });
  } catch (error) {
    next(error);
  }
});

// Get alert by ID
router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const alert = await Alert.findByPk(req.params.id, {
      include: [
        { model: Station, as: 'station' },
        { model: AlertRule, as: 'alertRule' },
        { model: User, as: 'acknowledger' },
        { model: User, as: 'resolver' }
      ]
    });

    if (!alert) {
      return res.status(404).json({ error: 'Alert not found' });
    }

    res.json(alert);
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

    if (alert.status !== 'active') {
      return res.status(400).json({ error: 'Alert is not active' });
    }

    await alert.update({
      status: 'acknowledged',
      acknowledgedAt: new Date(),
      acknowledgedBy: req.user.id
    });

    // Emit update via WebSocket
    const io = req.app.get('io');
    io.emit('alert-update', alert.toJSON());

    res.json(alert);
  } catch (error) {
    next(error);
  }
});

// Resolve alert
router.post('/:id/resolve', authenticate, [
  body('notes').optional().trim()
], validate, async (req, res, next) => {
  try {
    const alert = await Alert.findByPk(req.params.id);
    
    if (!alert) {
      return res.status(404).json({ error: 'Alert not found' });
    }

    if (alert.status === 'resolved') {
      return res.status(400).json({ error: 'Alert is already resolved' });
    }

    const { notes } = req.body;

    await alert.update({
      status: 'resolved',
      resolvedAt: new Date(),
      resolvedBy: req.user.id,
      details: {
        ...alert.details,
        resolutionNotes: notes
      }
    });

    // Emit update via WebSocket
    const io = req.app.get('io');
    io.emit('alert-update', alert.toJSON());

    res.json(alert);
  } catch (error) {
    next(error);
  }
});

// Get alert statistics
router.get('/stats/summary', authenticate, async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    const where = {};
    if (startDate || endDate) {
      where.triggeredAt = {};
      if (startDate) where.triggeredAt[Op.gte] = new Date(startDate);
      if (endDate) where.triggeredAt[Op.lte] = new Date(endDate);
    }

    // Get counts by status
    const statusCounts = await Alert.findAll({
      where,
      attributes: [
        'status',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['status']
    });

    // Get counts by severity
    const severityCounts = await Alert.findAll({
      where,
      attributes: [
        'severity',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['severity']
    });

    // Get counts by type
    const typeCounts = await Alert.findAll({
      where,
      attributes: [
        'type',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['type']
    });

    // Get average resolution time
    const resolvedAlerts = await Alert.findAll({
      where: {
        ...where,
        status: 'resolved',
        resolvedAt: { [Op.ne]: null }
      },
      attributes: ['triggeredAt', 'resolvedAt']
    });

    let avgResolutionTime = null;
    if (resolvedAlerts.length > 0) {
      const totalTime = resolvedAlerts.reduce((sum, alert) => {
        return sum + (alert.resolvedAt - alert.triggeredAt);
      }, 0);
      avgResolutionTime = Math.round(totalTime / resolvedAlerts.length / (60 * 1000)); // minutes
    }

    res.json({
      byStatus: statusCounts.reduce((acc, item) => {
        acc[item.status] = parseInt(item.dataValues.count);
        return acc;
      }, {}),
      bySeverity: severityCounts.reduce((acc, item) => {
        acc[item.severity] = parseInt(item.dataValues.count);
        return acc;
      }, {}),
      byType: typeCounts.reduce((acc, item) => {
        acc[item.type] = parseInt(item.dataValues.count);
        return acc;
      }, {}),
      avgResolutionTimeMinutes: avgResolutionTime
    });
  } catch (error) {
    next(error);
  }
});

// Alert rules management
router.get('/rules', authenticate, async (req, res, next) => {
  try {
    const rules = await AlertRule.findAll({
      order: [['severity', 'DESC'], ['name', 'ASC']]
    });
    res.json(rules);
  } catch (error) {
    next(error);
  }
});

router.post('/rules', authenticate, authorize('super_admin', 'admin'), [
  body('name').notEmpty().trim(),
  body('type').isIn(['threshold', 'rate_of_change', 'consecutive_readings', 'station_status', 'sensor_status']),
  body('pollutant').optional().isIn(['pm25', 'pm10', 'co', 'no2', 'so2', 'o3', 'aqi']),
  body('condition').isIn(['greater_than', 'less_than', 'equals', 'not_equals']),
  body('threshold').isFloat().toFloat(),
  body('severity').isIn(['low', 'medium', 'high', 'critical']),
  body('scope').optional().isIn(['global', 'station', 'region'])
], validate, async (req, res, next) => {
  try {
    const rule = await AlertRule.create(req.body);
    res.status(201).json(rule);
  } catch (error) {
    next(error);
  }
});

router.put('/rules/:id', authenticate, authorize('super_admin', 'admin'), [
  body('isActive').optional().isBoolean(),
  body('threshold').optional().isFloat().toFloat(),
  body('severity').optional().isIn(['low', 'medium', 'high', 'critical'])
], validate, async (req, res, next) => {
  try {
    const rule = await AlertRule.findByPk(req.params.id);
    if (!rule) {
      return res.status(404).json({ error: 'Alert rule not found' });
    }

    await rule.update(req.body);
    res.json(rule);
  } catch (error) {
    next(error);
  }
});

router.delete('/rules/:id', authenticate, authorize('super_admin'), async (req, res, next) => {
  try {
    const rule = await AlertRule.findByPk(req.params.id);
    if (!rule) {
      return res.status(404).json({ error: 'Alert rule not found' });
    }

    await rule.destroy();
    res.json({ message: 'Alert rule deleted successfully' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;