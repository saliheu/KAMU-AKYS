const router = require('express').Router();
const { body, query, validationResult } = require('express-validator');
const { Sensor, Station } = require('../models');
const { authenticate, authorize } = require('../middleware/auth');
const { publishCommand } = require('../services/mqttService');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Get all sensors
router.get('/', [
  query('stationId').optional().isUUID(),
  query('type').optional().isIn(['pm25', 'pm10', 'co', 'no2', 'so2', 'o3', 'temperature', 'humidity', 'pressure']),
  query('status').optional().isIn(['active', 'inactive', 'maintenance', 'faulty']),
  query('needsCalibration').optional().isBoolean().toBoolean()
], validate, async (req, res, next) => {
  try {
    const { stationId, type, status, needsCalibration } = req.query;

    const where = { isActive: true };
    if (stationId) where.stationId = stationId;
    if (type) where.type = type;
    if (status) where.status = status;

    if (needsCalibration) {
      where.nextCalibrationDate = {
        [Op.lte]: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // Next 30 days
      };
    }

    const sensors = await Sensor.findAll({
      where,
      include: [{
        model: Station,
        as: 'station',
        attributes: ['id', 'name', 'code']
      }],
      order: [['station', 'name'], ['type', 'ASC']]
    });

    res.json(sensors);
  } catch (error) {
    next(error);
  }
});

// Get sensor by ID
router.get('/:id', async (req, res, next) => {
  try {
    const sensor = await Sensor.findByPk(req.params.id, {
      include: [{
        model: Station,
        as: 'station'
      }]
    });

    if (!sensor) {
      return res.status(404).json({ error: 'Sensor not found' });
    }

    res.json(sensor);
  } catch (error) {
    next(error);
  }
});

// Create sensor
router.post('/', authenticate, authorize('super_admin', 'admin'), [
  body('stationId').isUUID(),
  body('serialNumber').notEmpty().trim(),
  body('type').isIn(['pm25', 'pm10', 'co', 'no2', 'so2', 'o3', 'temperature', 'humidity', 'pressure']),
  body('manufacturer').optional().trim(),
  body('model').optional().trim(),
  body('unit').notEmpty().trim(),
  body('minValue').optional().isFloat().toFloat(),
  body('maxValue').optional().isFloat().toFloat(),
  body('accuracy').optional().isFloat().toFloat()
], validate, async (req, res, next) => {
  try {
    // Check if station exists
    const station = await Station.findByPk(req.body.stationId);
    if (!station) {
      return res.status(400).json({ error: 'Station not found' });
    }

    // Check if serial number exists
    const existing = await Sensor.findOne({ 
      where: { serialNumber: req.body.serialNumber } 
    });
    if (existing) {
      return res.status(400).json({ error: 'Serial number already exists' });
    }

    const sensor = await Sensor.create(req.body);
    res.status(201).json(sensor);
  } catch (error) {
    next(error);
  }
});

// Update sensor
router.put('/:id', authenticate, authorize('super_admin', 'admin', 'operator'), [
  body('status').optional().isIn(['active', 'inactive', 'maintenance', 'faulty']),
  body('calibrationDate').optional().isISO8601().toDate(),
  body('nextCalibrationDate').optional().isISO8601().toDate(),
  body('isActive').optional().isBoolean()
], validate, async (req, res, next) => {
  try {
    const sensor = await Sensor.findByPk(req.params.id);
    if (!sensor) {
      return res.status(404).json({ error: 'Sensor not found' });
    }

    await sensor.update(req.body);
    res.json(sensor);
  } catch (error) {
    next(error);
  }
});

// Delete sensor
router.delete('/:id', authenticate, authorize('super_admin'), async (req, res, next) => {
  try {
    const sensor = await Sensor.findByPk(req.params.id);
    if (!sensor) {
      return res.status(404).json({ error: 'Sensor not found' });
    }

    // Soft delete
    await sensor.update({ isActive: false });
    res.json({ message: 'Sensor deactivated successfully' });
  } catch (error) {
    next(error);
  }
});

// Calibrate sensor
router.post('/:id/calibrate', authenticate, authorize('admin', 'operator'), [
  body('calibrationValue').isFloat().toFloat(),
  body('notes').optional().trim()
], validate, async (req, res, next) => {
  try {
    const sensor = await Sensor.findByPk(req.params.id, {
      include: ['station']
    });
    
    if (!sensor) {
      return res.status(404).json({ error: 'Sensor not found' });
    }

    const { calibrationValue, notes } = req.body;

    // Send calibration command via MQTT
    publishCommand(`sensors/${sensor.serialNumber}/calibrate`, {
      calibrationValue,
      notes,
      timestamp: new Date(),
      user: req.user.email
    });

    // Update sensor record
    const nextCalibrationDate = new Date();
    nextCalibrationDate.setMonth(nextCalibrationDate.getMonth() + 6); // 6 months

    await sensor.update({
      calibrationDate: new Date(),
      nextCalibrationDate,
      metadata: {
        ...sensor.metadata,
        lastCalibration: {
          date: new Date(),
          value: calibrationValue,
          user: req.user.email,
          notes
        }
      }
    });

    res.json({
      message: 'Calibration initiated',
      sensor: sensor.toJSON()
    });
  } catch (error) {
    next(error);
  }
});

// Get sensor health report
router.get('/:id/health', authenticate, async (req, res, next) => {
  try {
    const sensor = await Sensor.findByPk(req.params.id);
    if (!sensor) {
      return res.status(404).json({ error: 'Sensor not found' });
    }

    const health = {
      sensorId: sensor.id,
      serialNumber: sensor.serialNumber,
      type: sensor.type,
      status: sensor.status,
      lastReading: sensor.lastReading,
      lastReadingTime: sensor.lastReadingTime,
      calibration: {
        lastCalibration: sensor.calibrationDate,
        nextCalibration: sensor.nextCalibrationDate,
        daysUntilCalibration: sensor.nextCalibrationDate ? 
          Math.ceil((sensor.nextCalibrationDate - Date.now()) / (24 * 60 * 60 * 1000)) : null,
        needsCalibration: sensor.nextCalibrationDate ? 
          sensor.nextCalibrationDate <= new Date() : false
      },
      readingRange: {
        min: sensor.minValue,
        max: sensor.maxValue,
        withinRange: sensor.lastReading !== null ? 
          (sensor.lastReading >= sensor.minValue && sensor.lastReading <= sensor.maxValue) : null
      }
    };

    res.json(health);
  } catch (error) {
    next(error);
  }
});

module.exports = router;