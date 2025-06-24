const Redis = require('ioredis');
const { logger } = require('../utils/logger');

let redis;

const connectRedis = async () => {
  try {
    redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || 6379,
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      }
    });

    redis.on('error', (err) => {
      logger.error('Redis error:', err);
    });

    redis.on('connect', () => {
      logger.info('Redis connected');
    });

    return redis;
  } catch (error) {
    logger.error('Redis connection error:', error);
    throw error;
  }
};

const getRedis = () => {
  if (!redis) {
    throw new Error('Redis not initialized');
  }
  return redis;
};

module.exports = { connectRedis, getRedis };