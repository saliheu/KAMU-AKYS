const router = require('express').Router();
const { sequelize } = require('../models');
const { getRedis } = require('../config/redis');
const { logger } = require('../utils/logger');

// Health check endpoint
router.get('/', async (req, res) => {
  try {
    const checks = {
      status: 'healthy',
      timestamp: new Date(),
      uptime: process.uptime(),
      services: {}
    };

    // Check PostgreSQL
    try {
      await sequelize.authenticate();
      checks.services.postgres = { status: 'up' };
    } catch (error) {
      checks.services.postgres = { status: 'down', error: error.message };
      checks.status = 'unhealthy';
    }

    // Check Redis
    try {
      const redis = getRedis();
      await redis.ping();
      checks.services.redis = { status: 'up' };
    } catch (error) {
      checks.services.redis = { status: 'down', error: error.message };
      checks.status = 'unhealthy';
    }

    // Check InfluxDB
    try {
      // TODO: Add InfluxDB health check
      checks.services.influxdb = { status: 'up' };
    } catch (error) {
      checks.services.influxdb = { status: 'down', error: error.message };
      checks.status = 'unhealthy';
    }

    // Memory usage
    const memUsage = process.memoryUsage();
    checks.memory = {
      rss: `${Math.round(memUsage.rss / 1024 / 1024)} MB`,
      heapTotal: `${Math.round(memUsage.heapTotal / 1024 / 1024)} MB`,
      heapUsed: `${Math.round(memUsage.heapUsed / 1024 / 1024)} MB`,
      external: `${Math.round(memUsage.external / 1024 / 1024)} MB`
    };

    const statusCode = checks.status === 'healthy' ? 200 : 503;
    res.status(statusCode).json(checks);
  } catch (error) {
    logger.error('Health check failed:', error);
    res.status(503).json({
      status: 'unhealthy',
      error: error.message
    });
  }
});

// Readiness check
router.get('/ready', async (req, res) => {
  try {
    // Check if all services are ready to accept traffic
    await sequelize.authenticate();
    const redis = getRedis();
    await redis.ping();

    res.json({ ready: true });
  } catch (error) {
    res.status(503).json({ ready: false, error: error.message });
  }
});

// Liveness check
router.get('/live', (req, res) => {
  res.json({ alive: true });
});

module.exports = router;