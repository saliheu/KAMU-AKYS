const redis = require('redis');
const logger = require('../utils/logger');

// Redis configuration
const redisConfig = {
  socket: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    reconnectStrategy: (retries) => {
      if (retries > 20) {
        logger.error('Redis bağlantı limiti aşıldı');
        return new Error('Redis bağlantı limiti aşıldı');
      }
      const delay = Math.min(retries * 50, 2000);
      logger.info(`Redis yeniden bağlanma denemesi ${retries}, ${delay}ms sonra`);
      return delay;
    }
  },
  password: process.env.REDIS_PASSWORD,
  database: process.env.REDIS_DB || 0,
  legacyMode: false
};

// Create Redis client
const client = redis.createClient(redisConfig);

// Redis event handlers
client.on('error', (err) => {
  logger.error('Redis Client Hatası:', err);
});

client.on('connect', () => {
  logger.info('Redis sunucusuna bağlanılıyor...');
});

client.on('ready', () => {
  logger.info('Redis bağlantısı hazır');
});

client.on('end', () => {
  logger.info('Redis bağlantısı kapatıldı');
});

client.on('reconnecting', () => {
  logger.info('Redis yeniden bağlanıyor...');
});

// Connect to Redis
const connectRedis = async () => {
  try {
    await client.connect();
    return client;
  } catch (error) {
    logger.error('Redis bağlantı hatası:', error);
    throw error;
  }
};

// Cache helper functions
const cache = {
  // Get value from cache
  get: async (key) => {
    try {
      const value = await client.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      logger.error('Cache get hatası:', { key, error: error.message });
      return null;
    }
  },

  // Set value in cache with TTL
  set: async (key, value, ttl = 3600) => {
    try {
      await client.setEx(key, ttl, JSON.stringify(value));
      return true;
    } catch (error) {
      logger.error('Cache set hatası:', { key, error: error.message });
      return false;
    }
  },

  // Delete value from cache
  del: async (key) => {
    try {
      await client.del(key);
      return true;
    } catch (error) {
      logger.error('Cache delete hatası:', { key, error: error.message });
      return false;
    }
  },

  // Delete keys matching pattern
  delPattern: async (pattern) => {
    try {
      const keys = await client.keys(pattern);
      if (keys.length > 0) {
        await client.del(keys);
      }
      return true;
    } catch (error) {
      logger.error('Cache pattern delete hatası:', { pattern, error: error.message });
      return false;
    }
  },

  // Check if key exists
  exists: async (key) => {
    try {
      return await client.exists(key);
    } catch (error) {
      logger.error('Cache exists hatası:', { key, error: error.message });
      return false;
    }
  },

  // Set expiration time
  expire: async (key, seconds) => {
    try {
      return await client.expire(key, seconds);
    } catch (error) {
      logger.error('Cache expire hatası:', { key, error: error.message });
      return false;
    }
  },

  // Rate limiting helper
  rateLimit: async (key, limit, window) => {
    try {
      const current = await client.incr(key);
      if (current === 1) {
        await client.expire(key, window);
      }
      return current <= limit;
    } catch (error) {
      logger.error('Rate limit hatası:', { key, error: error.message });
      return true; // Fail open in case of error
    }
  },

  // Session management
  session: {
    set: async (sessionId, data, ttl = 86400) => {
      return cache.set(`session:${sessionId}`, data, ttl);
    },
    get: async (sessionId) => {
      return cache.get(`session:${sessionId}`);
    },
    destroy: async (sessionId) => {
      return cache.del(`session:${sessionId}`);
    },
    refresh: async (sessionId, ttl = 86400) => {
      return cache.expire(`session:${sessionId}`, ttl);
    }
  },

  // Lock mechanism for distributed systems
  lock: {
    acquire: async (resource, ttl = 5) => {
      const identifier = Date.now().toString();
      const key = `lock:${resource}`;
      const result = await client.set(key, identifier, {
        NX: true,
        EX: ttl
      });
      return result ? identifier : null;
    },
    release: async (resource, identifier) => {
      const key = `lock:${resource}`;
      const value = await client.get(key);
      if (value === identifier) {
        await client.del(key);
        return true;
      }
      return false;
    }
  }
};

module.exports = {
  client,
  connectRedis,
  cache
};