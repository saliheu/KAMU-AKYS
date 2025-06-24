const router = require('express').Router();
const { body, query, validationResult } = require('express-validator');
const { Station, Sensor, Measurement } = require('../models');
const { authenticate, authorize } = require('../middleware/auth');
const { Op } = require('sequelize');
const { publishCommand } = require('../services/mqttService');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Get all stations
router.get('/', [
  query('city').optional().trim(),
  query('region').optional().trim(),
  query('type').optional().isIn(['traffic', 'industrial', 'background', 'rural']),
  query('status').optional().isIn(['online', 'offline', 'maintenance', 'error']),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  query('offset').optional().isInt({ min: 0 }).toInt()
], validate, async (req, res, next) => {
  try {
    const {
      city,
      region,
      type,
      status,
      limit = 50,
      offset = 0
    } = req.query;

    const where = { isActive: true };
    if (city) where.city = city;
    if (region) where.region = region;
    if (type) where.type = type;
    if (status) where.status = status;

    const { count, rows: stations } = await Station.findAndCountAll({
      where,
      include: [{
        model: Sensor,
        as: 'sensors',
        where: { isActive: true },
        required: false
      }],
      limit,
      offset,
      order: [['name', 'ASC']]
    });

    res.json({
      total: count,
      limit,
      offset,
      stations
    });
  } catch (error) {
    next(error);
  }
});

// Get station by ID
router.get('/:id', async (req, res, next) => {
  try {
    const station = await Station.findByPk(req.params.id, {
      include: [{
        model: Sensor,
        as: 'sensors',
        where: { isActive: true },
        required: false
      }]
    });

    if (!station) {
      return res.status(404).json({ error: 'Station not found' });
    }

    res.json(station);
  } catch (error) {
    next(error);
  }
});

// Create station
router.post('/', authenticate, authorize('super_admin', 'admin'), [
  body('code').notEmpty().trim(),
  body('name').notEmpty().trim(),
  body('type').isIn(['traffic', 'industrial', 'background', 'rural']),
  body('latitude').isFloat({ min: -90, max: 90 }).toFloat(),
  body('longitude').isFloat({ min: -180, max: 180 }).toFloat(),
  body('altitude').optional().isFloat().toFloat(),
  body('address').notEmpty().trim(),
  body('city').notEmpty().trim(),
  body('region').notEmpty().trim()
], validate, async (req, res, next) => {
  try {
    // Check if station code exists
    const existing = await Station.findOne({ where: { code: req.body.code } });
    if (existing) {
      return res.status(400).json({ error: 'Station code already exists' });
    }

    const station = await Station.create(req.body);
    res.status(201).json(station);
  } catch (error) {
    next(error);
  }
});

// Update station
router.put('/:id', authenticate, authorize('super_admin', 'admin'), [
  body('name').optional().notEmpty().trim(),
  body('type').optional().isIn(['traffic', 'industrial', 'background', 'rural']),
  body('latitude').optional().isFloat({ min: -90, max: 90 }).toFloat(),
  body('longitude').optional().isFloat({ min: -180, max: 180 }).toFloat(),
  body('address').optional().trim(),
  body('city').optional().trim(),
  body('region').optional().trim(),
  body('isActive').optional().isBoolean()
], validate, async (req, res, next) => {
  try {
    const station = await Station.findByPk(req.params.id);
    if (!station) {
      return res.status(404).json({ error: 'Station not found' });
    }

    await station.update(req.body);
    res.json(station);
  } catch (error) {
    next(error);
  }
});

// Delete station
router.delete('/:id', authenticate, authorize('super_admin'), async (req, res, next) => {
  try {
    const station = await Station.findByPk(req.params.id);
    if (!station) {
      return res.status(404).json({ error: 'Station not found' });
    }

    // Soft delete
    await station.update({ isActive: false });
    res.json({ message: 'Station deactivated successfully' });
  } catch (error) {
    next(error);
  }
});

// Get station statistics
router.get('/:id/statistics', async (req, res, next) => {
  try {
    const { period = '24h' } = req.query;
    
    const station = await Station.findByPk(req.params.id);
    if (!station) {
      return res.status(404).json({ error: 'Station not found' });
    }

    // Calculate time range
    const periodMap = {
      '1h': 60 * 60 * 1000,
      '24h': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000
    };
    
    const since = new Date(Date.now() - (periodMap[period] || periodMap['24h']));

    // Get measurements
    const measurements = await Measurement.findAll({
      where: {
        stationId: req.params.id,
        timestamp: { [Op.gte]: since }
      },
      order: [['timestamp', 'ASC']]
    });

    // Calculate statistics
    const stats = {
      period,
      measurementCount: measurements.length,
      lastMeasurement: measurements[measurements.length - 1]?.timestamp,
      pollutants: {}
    };

    const pollutants = ['pm25', 'pm10', 'co', 'no2', 'so2', 'o3'];
    pollutants.forEach(pollutant => {
      const values = measurements
        .map(m => m[pollutant])
        .filter(v => v !== null);

      if (values.length > 0) {
        stats.pollutants[pollutant] = {
          avg: values.reduce((a, b) => a + b, 0) / values.length,
          max: Math.max(...values),
          min: Math.min(...values),
          current: values[values.length - 1]
        };
      }
    });

    // AQI statistics
    const aqiValues = measurements.map(m => m.aqi).filter(v => v !== null);
    if (aqiValues.length > 0) {
      stats.aqi = {
        avg: Math.round(aqiValues.reduce((a, b) => a + b, 0) / aqiValues.length),
        max: Math.max(...aqiValues),
        min: Math.min(...aqiValues),
        current: aqiValues[aqiValues.length - 1]
      };
    }

    res.json(stats);
  } catch (error) {
    next(error);
  }
});

// Send command to station
router.post('/:id/command', authenticate, authorize('admin', 'operator'), [
  body('command').notEmpty().isIn(['restart', 'calibrate', 'status', 'test']),
  body('parameters').optional().isObject()
], validate, async (req, res, next) => {
  try {
    const station = await Station.findByPk(req.params.id);
    if (!station) {
      return res.status(404).json({ error: 'Station not found' });
    }

    const { command, parameters = {} } = req.body;
    
    // Publish command via MQTT
    publishCommand(`stations/${station.code}/command`, {
      command,
      parameters,
      timestamp: new Date(),
      user: req.user.email
    });

    res.json({ 
      message: 'Command sent successfully',
      command,
      stationCode: station.code 
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;