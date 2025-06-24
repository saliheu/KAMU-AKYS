const router = require('express').Router();
const { query, validationResult } = require('express-validator');
const { Measurement, Station, Sensor } = require('../models');
const { Op } = require('sequelize');
const { queryMeasurements } = require('../config/influxdb');
const { getRedis } = require('../config/redis');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Get measurements
router.get('/', [
  query('stationId').optional().isUUID(),
  query('sensorId').optional().isUUID(),
  query('startDate').optional().isISO8601().toDate(),
  query('endDate').optional().isISO8601().toDate(),
  query('pollutant').optional().isIn(['pm25', 'pm10', 'co', 'no2', 'so2', 'o3', 'aqi']),
  query('limit').optional().isInt({ min: 1, max: 1000 }).toInt(),
  query('offset').optional().isInt({ min: 0 }).toInt(),
  query('source').optional().isIn(['postgres', 'influx'])
], validate, async (req, res, next) => {
  try {
    const {
      stationId,
      sensorId,
      startDate,
      endDate,
      pollutant,
      limit = 100,
      offset = 0,
      source = 'postgres'
    } = req.query;

    if (source === 'influx' && stationId) {
      // Query from InfluxDB for time-series data
      const timeRange = startDate ? 
        `${Math.floor((Date.now() - new Date(startDate)) / (60 * 60 * 1000))}h` : 
        '24h';
      
      const data = await queryMeasurements(stationId, timeRange);
      return res.json(data);
    }

    // Query from PostgreSQL
    const where = {};
    if (stationId) where.stationId = stationId;
    if (sensorId) where.sensorId = sensorId;
    
    if (startDate || endDate) {
      where.timestamp = {};
      if (startDate) where.timestamp[Op.gte] = startDate;
      if (endDate) where.timestamp[Op.lte] = endDate;
    }

    const measurements = await Measurement.findAll({
      where,
      include: [
        {
          model: Station,
          as: 'station',
          attributes: ['id', 'name', 'code']
        },
        {
          model: Sensor,
          as: 'sensor',
          attributes: ['id', 'type', 'serialNumber']
        }
      ],
      limit,
      offset,
      order: [['timestamp', 'DESC']]
    });

    // Filter by pollutant if specified
    let filteredMeasurements = measurements;
    if (pollutant && pollutant !== 'aqi') {
      filteredMeasurements = measurements.filter(m => m[pollutant] !== null);
    }

    res.json({
      total: filteredMeasurements.length,
      limit,
      offset,
      measurements: filteredMeasurements
    });
  } catch (error) {
    next(error);
  }
});

// Get latest measurements
router.get('/latest', async (req, res, next) => {
  try {
    const redis = getRedis();
    const { stationId } = req.query;

    if (stationId) {
      // Try to get from cache first
      const cached = await redis.get(`measurement:latest:${stationId}`);
      if (cached) {
        return res.json(JSON.parse(cached));
      }

      // Get from database
      const measurement = await Measurement.findOne({
        where: { stationId },
        include: ['station', 'sensor'],
        order: [['timestamp', 'DESC']]
      });

      if (measurement) {
        // Cache for 5 minutes
        await redis.setex(
          `measurement:latest:${stationId}`,
          300,
          JSON.stringify(measurement.toJSON())
        );
      }

      return res.json(measurement);
    }

    // Get latest measurements for all stations
    const stations = await Station.findAll({
      where: { isActive: true },
      attributes: ['id', 'name', 'code']
    });

    const latestMeasurements = [];
    for (const station of stations) {
      const measurement = await Measurement.findOne({
        where: { stationId: station.id },
        order: [['timestamp', 'DESC']]
      });

      if (measurement) {
        latestMeasurements.push({
          station: station.toJSON(),
          measurement: measurement.toJSON()
        });
      }
    }

    res.json(latestMeasurements);
  } catch (error) {
    next(error);
  }
});

// Get aggregated data
router.get('/aggregate', [
  query('stationId').isUUID(),
  query('interval').isIn(['hour', 'day', 'week', 'month']),
  query('startDate').optional().isISO8601().toDate(),
  query('endDate').optional().isISO8601().toDate()
], validate, async (req, res, next) => {
  try {
    const { stationId, interval, startDate, endDate } = req.query;
    const redis = getRedis();

    // Try cache first for hourly/daily aggregates
    if (interval === 'hour' || interval === 'day') {
      const cacheKey = `${interval}:${stationId}:${new Date().toISOString().split('T')[0]}`;
      const cached = await redis.get(cacheKey);
      if (cached) {
        return res.json(JSON.parse(cached));
      }
    }

    // Calculate date range
    const dateRange = {};
    if (startDate) dateRange[Op.gte] = startDate;
    if (endDate) dateRange[Op.lte] = endDate;
    else {
      // Default ranges
      const now = new Date();
      switch (interval) {
        case 'hour':
          dateRange[Op.gte] = new Date(now - 24 * 60 * 60 * 1000);
          break;
        case 'day':
          dateRange[Op.gte] = new Date(now - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'week':
          dateRange[Op.gte] = new Date(now - 30 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          dateRange[Op.gte] = new Date(now - 365 * 24 * 60 * 60 * 1000);
          break;
      }
    }

    // Get raw measurements
    const measurements = await Measurement.findAll({
      where: {
        stationId,
        timestamp: dateRange
      },
      order: [['timestamp', 'ASC']]
    });

    // Aggregate data based on interval
    const aggregated = aggregateByInterval(measurements, interval);

    res.json({
      stationId,
      interval,
      startDate: dateRange[Op.gte],
      endDate: dateRange[Op.lte] || new Date(),
      data: aggregated
    });
  } catch (error) {
    next(error);
  }
});

// Get AQI history
router.get('/aqi-history', [
  query('stationId').optional().isUUID(),
  query('days').optional().isInt({ min: 1, max: 365 }).toInt()
], validate, async (req, res, next) => {
  try {
    const { stationId, days = 7 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const where = {
      timestamp: { [Op.gte]: startDate },
      aqi: { [Op.ne]: null }
    };
    if (stationId) where.stationId = stationId;

    const measurements = await Measurement.findAll({
      where,
      attributes: ['stationId', 'timestamp', 'aqi', 'aqiCategory', 'dominantPollutant'],
      include: [{
        model: Station,
        as: 'station',
        attributes: ['name', 'code']
      }],
      order: [['timestamp', 'DESC']]
    });

    // Group by date and calculate daily stats
    const dailyStats = {};
    measurements.forEach(m => {
      const date = m.timestamp.toISOString().split('T')[0];
      const stationKey = m.stationId;

      if (!dailyStats[date]) dailyStats[date] = {};
      if (!dailyStats[date][stationKey]) {
        dailyStats[date][stationKey] = {
          station: m.station,
          aqiValues: [],
          categories: {}
        };
      }

      dailyStats[date][stationKey].aqiValues.push(m.aqi);
      dailyStats[date][stationKey].categories[m.aqiCategory] = 
        (dailyStats[date][stationKey].categories[m.aqiCategory] || 0) + 1;
    });

    // Calculate averages
    const result = [];
    Object.entries(dailyStats).forEach(([date, stations]) => {
      Object.entries(stations).forEach(([stationId, data]) => {
        const aqiValues = data.aqiValues;
        result.push({
          date,
          stationId,
          station: data.station,
          avgAqi: Math.round(aqiValues.reduce((a, b) => a + b, 0) / aqiValues.length),
          maxAqi: Math.max(...aqiValues),
          minAqi: Math.min(...aqiValues),
          dominantCategory: Object.entries(data.categories)
            .sort((a, b) => b[1] - a[1])[0][0]
        });
      });
    });

    res.json(result.sort((a, b) => new Date(b.date) - new Date(a.date)));
  } catch (error) {
    next(error);
  }
});

// Helper function to aggregate measurements by interval
function aggregateByInterval(measurements, interval) {
  const grouped = {};
  
  measurements.forEach(m => {
    let key;
    const date = new Date(m.timestamp);
    
    switch (interval) {
      case 'hour':
        key = `${date.toISOString().split('T')[0]}T${date.getHours().toString().padStart(2, '0')}:00`;
        break;
      case 'day':
        key = date.toISOString().split('T')[0];
        break;
      case 'week':
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        key = weekStart.toISOString().split('T')[0];
        break;
      case 'month':
        key = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
        break;
    }

    if (!grouped[key]) {
      grouped[key] = {
        timestamp: key,
        measurements: []
      };
    }
    grouped[key].measurements.push(m);
  });

  // Calculate averages for each group
  return Object.values(grouped).map(group => {
    const pollutants = ['pm25', 'pm10', 'co', 'no2', 'so2', 'o3'];
    const result = {
      timestamp: group.timestamp,
      count: group.measurements.length
    };

    pollutants.forEach(pollutant => {
      const values = group.measurements
        .map(m => m[pollutant])
        .filter(v => v !== null);
      
      if (values.length > 0) {
        result[pollutant] = {
          avg: values.reduce((a, b) => a + b, 0) / values.length,
          max: Math.max(...values),
          min: Math.min(...values)
        };
      }
    });

    // AQI
    const aqiValues = group.measurements
      .map(m => m.aqi)
      .filter(v => v !== null);
    
    if (aqiValues.length > 0) {
      result.aqi = {
        avg: Math.round(aqiValues.reduce((a, b) => a + b, 0) / aqiValues.length),
        max: Math.max(...aqiValues),
        min: Math.min(...aqiValues)
      };
    }

    return result;
  });
}

module.exports = router;