const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis');
const { client } = require('../config/redis');
const logger = require('../utils/logger');

// Default rate limit options
const defaultOptions = {
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn('Rate limit exceeded', {
      ip: req.ip,
      path: req.path,
      user: req.user?.id
    });
    res.status(429).json({
      error: 'Çok fazla istek gönderdiniz. Lütfen daha sonra tekrar deneyin.',
      retryAfter: res.getHeader('Retry-After')
    });
  },
  skip: (req) => {
    // Skip rate limiting for certain IPs (e.g., internal services)
    const whitelist = process.env.RATE_LIMIT_WHITELIST?.split(',') || [];
    return whitelist.includes(req.ip);
  }
};

// General API rate limiter
const apiLimiter = rateLimit({
  ...defaultOptions,
  store: new RedisStore({
    client: client,
    prefix: 'rate_limit:api:'
  }),
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'API istek limiti aşıldı'
});

// Strict rate limiter for authentication endpoints
const authLimiter = rateLimit({
  ...defaultOptions,
  store: new RedisStore({
    client: client,
    prefix: 'rate_limit:auth:'
  }),
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  skipSuccessfulRequests: true, // Don't count successful requests
  message: 'Çok fazla giriş denemesi. 15 dakika sonra tekrar deneyin.'
});

// Rate limiter for appointment creation
const appointmentLimiter = rateLimit({
  ...defaultOptions,
  store: new RedisStore({
    client: client,
    prefix: 'rate_limit:appointment:',
    // Use user ID instead of IP for authenticated users
    keyGenerator: (req) => req.user?.id || req.ip
  }),
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Limit to 10 appointment creations per hour
  message: 'Saatlik randevu oluşturma limitine ulaştınız'
});

// Rate limiter for password reset
const passwordResetLimiter = rateLimit({
  ...defaultOptions,
  store: new RedisStore({
    client: client,
    prefix: 'rate_limit:password_reset:'
  }),
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // Limit to 3 password reset requests per hour
  message: 'Çok fazla şifre sıfırlama talebi. 1 saat sonra tekrar deneyin.'
});

// Rate limiter for SMS sending
const smsLimiter = rateLimit({
  ...defaultOptions,
  store: new RedisStore({
    client: client,
    prefix: 'rate_limit:sms:',
    keyGenerator: (req) => req.user?.id || req.ip
  }),
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // Limit to 5 SMS per hour
  message: 'SMS gönderme limitine ulaştınız'
});

// Rate limiter for file uploads
const uploadLimiter = rateLimit({
  ...defaultOptions,
  store: new RedisStore({
    client: client,
    prefix: 'rate_limit:upload:',
    keyGenerator: (req) => req.user?.id || req.ip
  }),
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // Limit to 20 uploads per hour
  message: 'Dosya yükleme limitine ulaştınız'
});

// Dynamic rate limiter based on user role
const dynamicLimiter = (options = {}) => {
  return (req, res, next) => {
    const userRole = req.user?.rol || 'anonymous';
    
    // Different limits for different roles
    const roleLimits = {
      admin: 1000,
      personel: 500,
      hakim: 500,
      avukat: 200,
      vatandas: 100,
      anonymous: 50
    };

    const limit = roleLimits[userRole] || 50;

    const limiter = rateLimit({
      ...defaultOptions,
      store: new RedisStore({
        client: client,
        prefix: `rate_limit:dynamic:${userRole}:`
      }),
      windowMs: options.windowMs || 15 * 60 * 1000,
      max: options.max || limit,
      ...options
    });

    limiter(req, res, next);
  };
};

// Brute force protection for login attempts
const bruteForceLimiter = async (req, res, next) => {
  const { tcKimlikNo } = req.body;
  
  if (!tcKimlikNo) {
    return next();
  }

  const key = `brute_force:${tcKimlikNo}`;
  const attempts = await client.get(key);
  
  if (attempts && parseInt(attempts) >= 5) {
    const ttl = await client.ttl(key);
    logger.warn('Brute force attack detected', { tcKimlikNo, ip: req.ip });
    
    return res.status(429).json({
      error: 'Hesap geçici olarak kilitlendi. Lütfen daha sonra tekrar deneyin.',
      retryAfter: ttl
    });
  }

  // Increment attempts on failed login (handled in auth controller)
  req.bruteForceLimiter = {
    increment: async () => {
      const current = await client.incr(key);
      if (current === 1) {
        await client.expire(key, 900); // 15 minutes
      }
    },
    reset: async () => {
      await client.del(key);
    }
  };

  next();
};

// IP-based blocking for suspicious activity
const ipBlocker = async (req, res, next) => {
  const blockedIPs = await client.sMembers('blocked_ips');
  
  if (blockedIPs.includes(req.ip)) {
    logger.warn('Blocked IP attempted access', { ip: req.ip, path: req.path });
    return res.status(403).json({
      error: 'Erişim engellendi'
    });
  }

  next();
};

// Request throttling middleware
const throttle = (maxRequests = 10, windowSeconds = 1) => {
  return async (req, res, next) => {
    const key = `throttle:${req.ip}:${req.path}`;
    const current = await client.incr(key);
    
    if (current === 1) {
      await client.expire(key, windowSeconds);
    }
    
    if (current > maxRequests) {
      return res.status(429).json({
        error: 'İstek hızı çok yüksek. Lütfen yavaşlayın.'
      });
    }
    
    next();
  };
};

// Monitor and log rate limit violations
const monitorRateLimits = async (req, res, next) => {
  const violations = await client.get(`rate_violations:${req.ip}`);
  
  if (violations && parseInt(violations) > 10) {
    // Auto-block IP after too many violations
    await client.sAdd('blocked_ips', req.ip);
    await client.expire('blocked_ips', 86400); // 24 hours
    
    logger.error('IP auto-blocked due to rate limit violations', {
      ip: req.ip,
      violations: violations
    });
  }
  
  next();
};

module.exports = {
  apiLimiter,
  authLimiter,
  appointmentLimiter,
  passwordResetLimiter,
  smsLimiter,
  uploadLimiter,
  dynamicLimiter,
  bruteForceLimiter,
  ipBlocker,
  throttle,
  monitorRateLimits
};