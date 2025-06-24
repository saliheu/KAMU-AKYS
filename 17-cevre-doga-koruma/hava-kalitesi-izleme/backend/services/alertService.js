const { Alert, AlertRule, Station, User } = require('../models');
const { Op } = require('sequelize');
const { logger } = require('../utils/logger');
const notificationService = require('./notificationService');
const { getRedis } = require('../config/redis');

const checkMeasurementAlerts = async (measurement) => {
  try {
    // Get active alert rules
    const rules = await AlertRule.findAll({
      where: {
        isActive: true,
        [Op.or]: [
          { scope: 'global' },
          { 
            scope: 'station',
            stationIds: { [Op.contains]: [measurement.stationId] }
          }
        ]
      }
    });

    for (const rule of rules) {
      await checkRule(rule, measurement);
    }
  } catch (error) {
    logger.error('Error checking measurement alerts:', error);
  }
};

const checkRule = async (rule, measurement) => {
  const redis = getRedis();
  const cooldownKey = `alert:cooldown:${rule.id}:${measurement.stationId}`;
  
  // Check cooldown
  const inCooldown = await redis.get(cooldownKey);
  if (inCooldown) {
    return;
  }

  let triggered = false;
  let value = null;
  let message = '';

  switch (rule.type) {
    case 'threshold':
      value = measurement[rule.pollutant];
      if (value !== null && value !== undefined) {
        triggered = checkThreshold(value, rule.condition, rule.threshold);
        if (triggered) {
          message = `${rule.pollutant.toUpperCase()} seviyesi ${value} μg/m³ değerine ulaştı (Eşik: ${rule.threshold} μg/m³)`;
        }
      }
      break;

    case 'consecutive_readings':
      // Check if multiple consecutive readings exceed threshold
      triggered = await checkConsecutiveReadings(
        measurement.stationId,
        rule.pollutant,
        rule.condition,
        rule.threshold,
        rule.duration
      );
      if (triggered) {
        message = `${rule.pollutant.toUpperCase()} seviyesi ${rule.duration} dakika boyunca eşik değeri aştı`;
      }
      break;
  }

  if (triggered) {
    // Create alert
    const alert = await Alert.create({
      stationId: measurement.stationId,
      alertRuleId: rule.id,
      type: getAlertType(rule.pollutant, value),
      severity: rule.severity,
      pollutant: rule.pollutant,
      value: value,
      threshold: rule.threshold,
      message: message,
      details: {
        measurement: measurement.toJSON(),
        rule: rule.toJSON()
      }
    });

    // Set cooldown
    await redis.setex(cooldownKey, rule.cooldownPeriod * 60, '1');

    // Send notifications
    await notificationService.sendAlertNotifications(alert, rule);

    // Emit to WebSocket
    const io = require('../server').app.get('io');
    io.emit('new-alert', alert.toJSON());

    logger.info(`Alert created: ${alert.id} - ${message}`);
  }

  // Check for auto-resolve
  if (rule.autoResolve && rule.autoResolveThreshold) {
    await checkAutoResolve(rule, measurement);
  }
};

const checkThreshold = (value, condition, threshold) => {
  switch (condition) {
    case 'greater_than':
      return value > threshold;
    case 'less_than':
      return value < threshold;
    case 'equals':
      return value === threshold;
    case 'not_equals':
      return value !== threshold;
    default:
      return false;
  }
};

const checkConsecutiveReadings = async (stationId, pollutant, condition, threshold, duration) => {
  const since = new Date(Date.now() - duration * 60 * 1000);
  
  const measurements = await Measurement.findAll({
    where: {
      stationId,
      timestamp: { [Op.gte]: since }
    },
    order: [['timestamp', 'DESC']]
  });

  if (measurements.length === 0) {
    return false;
  }

  // Check if all measurements in the period meet the condition
  return measurements.every(m => {
    const value = m[pollutant];
    return value !== null && checkThreshold(value, condition, threshold);
  });
};

const checkAutoResolve = async (rule, measurement) => {
  const activeAlerts = await Alert.findAll({
    where: {
      stationId: measurement.stationId,
      alertRuleId: rule.id,
      status: ['active', 'acknowledged']
    }
  });

  for (const alert of activeAlerts) {
    const value = measurement[rule.pollutant];
    if (value !== null && value <= rule.autoResolveThreshold) {
      await alert.update({
        status: 'resolved',
        resolvedAt: new Date(),
        autoResolved: true
      });

      logger.info(`Alert auto-resolved: ${alert.id}`);
    }
  }
};

const getAlertType = (pollutant, value) => {
  if (!pollutant || !value) return 'threshold_exceeded';

  const thresholds = {
    pm25: { high: 55, veryHigh: 150, hazardous: 250 },
    pm10: { high: 154, veryHigh: 254, hazardous: 354 },
    aqi: { high: 150, veryHigh: 200, hazardous: 300 }
  };

  const levels = thresholds[pollutant];
  if (!levels) return 'threshold_exceeded';

  if (value >= levels.hazardous) return 'hazardous';
  if (value >= levels.veryHigh) return 'very_high_pollution';
  if (value >= levels.high) return 'high_pollution';
  
  return 'threshold_exceeded';
};

const createStationOfflineAlert = async (station) => {
  const alert = await Alert.create({
    stationId: station.id,
    type: 'station_offline',
    severity: 'high',
    message: `${station.name} istasyonu çevrimdışı`,
    details: {
      station: station.toJSON(),
      lastDataReceived: station.lastDataReceived
    }
  });

  await notificationService.sendStationOfflineNotifications(alert, station);
  
  logger.warn(`Station offline alert created: ${station.name}`);
};

module.exports = {
  checkMeasurementAlerts,
  createStationOfflineAlert
};