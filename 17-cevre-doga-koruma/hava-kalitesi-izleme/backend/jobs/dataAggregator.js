const { Measurement } = require('../models');
const { Op, fn, col, literal } = require('sequelize');
const { logger } = require('../utils/logger');
const { getRedis } = require('../config/redis');

const aggregateHourlyData = async () => {
  try {
    const redis = getRedis();
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const now = new Date();

    // Get hourly averages for each station
    const hourlyAverages = await Measurement.findAll({
      attributes: [
        'stationId',
        [fn('AVG', col('pm25')), 'avgPm25'],
        [fn('AVG', col('pm10')), 'avgPm10'],
        [fn('AVG', col('co')), 'avgCo'],
        [fn('AVG', col('no2')), 'avgNo2'],
        [fn('AVG', col('so2')), 'avgSo2'],
        [fn('AVG', col('o3')), 'avgO3'],
        [fn('AVG', col('temperature')), 'avgTemperature'],
        [fn('AVG', col('humidity')), 'avgHumidity'],
        [fn('AVG', col('pressure')), 'avgPressure'],
        [fn('AVG', col('aqi')), 'avgAqi'],
        [fn('COUNT', col('id')), 'measurementCount']
      ],
      where: {
        timestamp: {
          [Op.between]: [oneHourAgo, now]
        },
        isValidated: true
      },
      group: ['stationId'],
      raw: true
    });

    // Cache hourly averages
    for (const avg of hourlyAverages) {
      const key = `hourly:${avg.stationId}:${now.getHours()}`;
      await redis.setex(key, 24 * 60 * 60, JSON.stringify(avg)); // 24 hour TTL
    }

    logger.info(`Aggregated hourly data for ${hourlyAverages.length} stations`);
  } catch (error) {
    logger.error('Error aggregating hourly data:', error);
  }
};

const aggregateDailyData = async () => {
  try {
    const redis = getRedis();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dailyStats = await Measurement.findAll({
      attributes: [
        'stationId',
        [fn('AVG', col('pm25')), 'avgPm25'],
        [fn('MAX', col('pm25')), 'maxPm25'],
        [fn('MIN', col('pm25')), 'minPm25'],
        [fn('AVG', col('pm10')), 'avgPm10'],
        [fn('MAX', col('pm10')), 'maxPm10'],
        [fn('MIN', col('pm10')), 'minPm10'],
        [fn('AVG', col('aqi')), 'avgAqi'],
        [fn('MAX', col('aqi')), 'maxAqi'],
        [fn('COUNT', col('id')), 'measurementCount']
      ],
      where: {
        timestamp: {
          [Op.between]: [yesterday, today]
        },
        isValidated: true
      },
      group: ['stationId'],
      raw: true
    });

    // Store daily stats
    for (const stat of dailyStats) {
      const key = `daily:${stat.stationId}:${yesterday.toISOString().split('T')[0]}`;
      await redis.setex(key, 30 * 24 * 60 * 60, JSON.stringify(stat)); // 30 day TTL
    }

    logger.info(`Aggregated daily data for ${dailyStats.length} stations`);
  } catch (error) {
    logger.error('Error aggregating daily data:', error);
  }
};

module.exports = {
  aggregateHourlyData,
  aggregateDailyData
};