const router = require('express').Router();
const { Station, Measurement, Alert, Sensor } = require('../models');
const { Op, fn, col, literal } = require('sequelize');
const { getRedis } = require('../config/redis');
const { optionalAuth } = require('../middleware/auth');

// Get dashboard data
router.get('/', optionalAuth, async (req, res, next) => {
  try {
    const redis = getRedis();
    const cacheKey = 'dashboard:overview';
    
    // Try cache first
    const cached = await redis.get(cacheKey);
    if (cached) {
      return res.json(JSON.parse(cached));
    }

    // Get current date range
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Get summary statistics
    const [
      stationCount,
      activeStationCount,
      sensorCount,
      activeSensorCount,
      todayMeasurementCount,
      activeAlertCount
    ] = await Promise.all([
      Station.count({ where: { isActive: true } }),
      Station.count({ where: { isActive: true, status: 'online' } }),
      Sensor.count({ where: { isActive: true } }),
      Sensor.count({ where: { isActive: true, status: 'active' } }),
      Measurement.count({ where: { timestamp: { [Op.gte]: today } } }),
      Alert.count({ where: { status: ['active', 'acknowledged'] } })
    ]);

    // Get latest measurements for each station
    const latestMeasurements = await Station.findAll({
      where: { isActive: true },
      attributes: ['id', 'name', 'city', 'region', 'status'],
      include: [{
        model: Measurement,
        as: 'measurements',
        limit: 1,
        order: [['timestamp', 'DESC']],
        attributes: ['aqi', 'aqiCategory', 'timestamp', 'pm25', 'pm10']
      }]
    });

    // Get AQI distribution
    const aqiDistribution = await Measurement.findAll({
      where: {
        timestamp: { [Op.gte]: yesterday },
        aqi: { [Op.ne]: null }
      },
      attributes: [
        'aqiCategory',
        [fn('COUNT', col('id')), 'count']
      ],
      group: ['aqiCategory']
    });

    // Get recent alerts
    const recentAlerts = await Alert.findAll({
      where: {
        status: ['active', 'acknowledged']
      },
      include: [{
        model: Station,
        as: 'station',
        attributes: ['name', 'city']
      }],
      order: [['triggeredAt', 'DESC']],
      limit: 10
    });

    // Get regional summary
    const regionalSummary = await Measurement.findAll({
      where: {
        timestamp: { [Op.gte]: yesterday }
      },
      attributes: [
        [col('station.region'), 'region'],
        [fn('AVG', col('aqi')), 'avgAqi'],
        [fn('MAX', col('aqi')), 'maxAqi'],
        [fn('COUNT', col('measurement.id')), 'measurementCount']
      ],
      include: [{
        model: Station,
        as: 'station',
        attributes: []
      }],
      group: ['station.region'],
      raw: true
    });

    const dashboard = {
      summary: {
        stations: {
          total: stationCount,
          active: activeStationCount,
          offline: stationCount - activeStationCount
        },
        sensors: {
          total: sensorCount,
          active: activeSensorCount,
          inactive: sensorCount - activeSensorCount
        },
        measurements: {
          today: todayMeasurementCount
        },
        alerts: {
          active: activeAlertCount
        }
      },
      currentStatus: latestMeasurements.map(station => ({
        stationId: station.id,
        stationName: station.name,
        city: station.city,
        region: station.region,
        status: station.status,
        latestMeasurement: station.measurements[0] || null
      })),
      aqiDistribution: aqiDistribution.reduce((acc, item) => {
        acc[item.aqiCategory] = parseInt(item.dataValues.count);
        return acc;
      }, {}),
      recentAlerts: recentAlerts.map(alert => ({
        id: alert.id,
        type: alert.type,
        severity: alert.severity,
        message: alert.message,
        stationName: alert.station?.name,
        city: alert.station?.city,
        triggeredAt: alert.triggeredAt
      })),
      regionalSummary: regionalSummary.map(region => ({
        region: region.region,
        avgAqi: Math.round(parseFloat(region.avgAqi)),
        maxAqi: parseInt(region.maxAqi),
        measurementCount: parseInt(region.measurementCount)
      })),
      lastUpdated: new Date()
    };

    // Cache for 5 minutes
    await redis.setex(cacheKey, 300, JSON.stringify(dashboard));

    res.json(dashboard);
  } catch (error) {
    next(error);
  }
});

// Get real-time map data
router.get('/map', optionalAuth, async (req, res, next) => {
  try {
    const stations = await Station.findAll({
      where: { isActive: true },
      attributes: ['id', 'name', 'latitude', 'longitude', 'type', 'status'],
      include: [{
        model: Measurement,
        as: 'measurements',
        limit: 1,
        order: [['timestamp', 'DESC']],
        attributes: ['aqi', 'aqiCategory', 'pm25', 'pm10', 'timestamp']
      }]
    });

    const mapData = stations.map(station => ({
      id: station.id,
      name: station.name,
      position: {
        lat: station.latitude,
        lng: station.longitude
      },
      type: station.type,
      status: station.status,
      measurement: station.measurements[0] || null
    }));

    res.json(mapData);
  } catch (error) {
    next(error);
  }
});

// Get chart data
router.get('/charts/:type', optionalAuth, async (req, res, next) => {
  try {
    const { type } = req.params;
    const { period = '24h', stationId } = req.query;

    const periodMap = {
      '24h': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000
    };

    const since = new Date(Date.now() - periodMap[period]);
    const where = {
      timestamp: { [Op.gte]: since }
    };

    if (stationId) {
      where.stationId = stationId;
    }

    let chartData;

    switch (type) {
      case 'aqi-trend':
        chartData = await getAQITrendData(where, period);
        break;
      
      case 'pollutant-comparison':
        chartData = await getPollutantComparisonData(where);
        break;
      
      case 'station-comparison':
        chartData = await getStationComparisonData(where);
        break;
      
      default:
        return res.status(400).json({ error: 'Invalid chart type' });
    }

    res.json(chartData);
  } catch (error) {
    next(error);
  }
});

// Helper functions
async function getAQITrendData(where, period) {
  const interval = period === '24h' ? 'hour' : period === '7d' ? 'day' : 'day';
  
  const measurements = await Measurement.findAll({
    where: {
      ...where,
      aqi: { [Op.ne]: null }
    },
    attributes: ['timestamp', 'aqi', 'stationId'],
    include: [{
      model: Station,
      as: 'station',
      attributes: ['name']
    }],
    order: [['timestamp', 'ASC']]
  });

  // Group by time interval
  const grouped = {};
  measurements.forEach(m => {
    const date = new Date(m.timestamp);
    let key;
    
    if (interval === 'hour') {
      key = `${date.toISOString().substring(0, 13)}:00`;
    } else {
      key = date.toISOString().substring(0, 10);
    }

    if (!grouped[key]) {
      grouped[key] = [];
    }
    grouped[key].push(m.aqi);
  });

  const data = Object.entries(grouped).map(([timestamp, values]) => ({
    timestamp,
    avgAqi: Math.round(values.reduce((a, b) => a + b, 0) / values.length),
    minAqi: Math.min(...values),
    maxAqi: Math.max(...values)
  }));

  return { interval, data };
}

async function getPollutantComparisonData(where) {
  const measurements = await Measurement.findAll({
    where,
    attributes: [
      [fn('AVG', col('pm25')), 'avgPm25'],
      [fn('AVG', col('pm10')), 'avgPm10'],
      [fn('AVG', col('co')), 'avgCo'],
      [fn('AVG', col('no2')), 'avgNo2'],
      [fn('AVG', col('so2')), 'avgSo2'],
      [fn('AVG', col('o3')), 'avgO3']
    ],
    raw: true
  });

  const data = measurements[0];
  return {
    pollutants: [
      { name: 'PM2.5', value: parseFloat(data.avgPm25) || 0 },
      { name: 'PM10', value: parseFloat(data.avgPm10) || 0 },
      { name: 'CO', value: parseFloat(data.avgCo) || 0 },
      { name: 'NO2', value: parseFloat(data.avgNo2) || 0 },
      { name: 'SO2', value: parseFloat(data.avgSo2) || 0 },
      { name: 'O3', value: parseFloat(data.avgO3) || 0 }
    ]
  };
}

async function getStationComparisonData(where) {
  const measurements = await Measurement.findAll({
    where: {
      ...where,
      aqi: { [Op.ne]: null }
    },
    attributes: [
      [col('station.name'), 'stationName'],
      [fn('AVG', col('aqi')), 'avgAqi'],
      [fn('COUNT', col('measurement.id')), 'count']
    ],
    include: [{
      model: Station,
      as: 'station',
      attributes: []
    }],
    group: ['station.id', 'station.name'],
    raw: true,
    order: [[fn('AVG', col('aqi')), 'DESC']],
    limit: 10
  });

  return measurements.map(m => ({
    stationName: m.stationName,
    avgAqi: Math.round(parseFloat(m.avgAqi)),
    measurementCount: parseInt(m.count)
  }));
}

module.exports = router;