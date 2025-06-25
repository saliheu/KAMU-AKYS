const jwt = require('jsonwebtoken');
const { cache } = require('../config/redis');
const logger = require('../utils/logger');

// JWT authentication middleware
const authenticate = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Yetkilendirme token\'ı bulunamadı' });
    }

    const token = authHeader.substring(7);

    // Check if token is blacklisted
    const isBlacklisted = await cache.exists(`blacklist:${token}`);
    if (isBlacklisted) {
      return res.status(401).json({ error: 'Token geçersiz' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');

    // Check if user session exists
    const session = await cache.session.get(decoded.sessionId);
    if (!session) {
      return res.status(401).json({ error: 'Oturum süresi dolmuş' });
    }

    // Add user to request
    req.user = decoded;
    req.token = token;

    // Refresh session TTL
    await cache.session.refresh(decoded.sessionId);

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token süresi dolmuş' });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Geçersiz token' });
    }
    
    logger.error('Authentication error:', error);
    return res.status(500).json({ error: 'Kimlik doğrulama hatası' });
  }
};

// Role-based authorization middleware
const authorize = (roles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Yetkilendirme gerekli' });
    }

    if (roles.length && !roles.includes(req.user.rol)) {
      logger.warn('Unauthorized access attempt', {
        userId: req.user.id,
        userRole: req.user.rol,
        requiredRoles: roles,
        path: req.path
      });
      return res.status(403).json({ error: 'Bu işlem için yetkiniz yok' });
    }

    next();
  };
};

// Optional authentication (for public endpoints that may have authenticated users)
const optionalAuthenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.substring(7);

    // Check if token is blacklisted
    const isBlacklisted = await cache.exists(`blacklist:${token}`);
    if (isBlacklisted) {
      return next();
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');

    // Check if user session exists
    const session = await cache.session.get(decoded.sessionId);
    if (session) {
      req.user = decoded;
      req.token = token;
    }

    next();
  } catch (error) {
    // Continue without authentication
    next();
  }
};

// Check specific permissions
const checkPermission = (permission) => {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Yetkilendirme gerekli' });
    }

    // Get user permissions from cache or database
    const cacheKey = `permissions:${req.user.id}`;
    let permissions = await cache.get(cacheKey);

    if (!permissions) {
      // Load permissions from database
      const { query } = require('../config/database');
      const result = await query(
        `SELECT p.kod 
         FROM yetkiler p
         JOIN rol_yetkileri rp ON p.id = rp.yetki_id
         JOIN kullanicilar u ON u.rol = rp.rol
         WHERE u.id = $1`,
        [req.user.id]
      );
      
      permissions = result.rows.map(row => row.kod);
      await cache.set(cacheKey, permissions, 3600); // Cache for 1 hour
    }

    if (!permissions.includes(permission)) {
      logger.warn('Permission denied', {
        userId: req.user.id,
        permission: permission,
        userPermissions: permissions
      });
      return res.status(403).json({ error: 'Bu işlem için yetkiniz yok' });
    }

    next();
  };
};

// API key authentication for external services
const apiKeyAuth = async (req, res, next) => {
  try {
    const apiKey = req.headers['x-api-key'];
    
    if (!apiKey) {
      return res.status(401).json({ error: 'API anahtarı gerekli' });
    }

    // Validate API key
    const { query } = require('../config/database');
    const result = await query(
      'SELECT * FROM api_anahtarlari WHERE anahtar = $1 AND aktif = true',
      [apiKey]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Geçersiz API anahtarı' });
    }

    const apiClient = result.rows[0];

    // Check rate limits for API key
    const rateLimitKey = `api_rate_limit:${apiKey}`;
    const limited = await cache.rateLimit(rateLimitKey, apiClient.istek_limiti || 1000, 3600);
    
    if (!limited) {
      return res.status(429).json({ error: 'API istek limiti aşıldı' });
    }

    // Log API usage
    await query(
      'INSERT INTO api_kullanim_log (api_anahtar_id, endpoint, ip_adresi) VALUES ($1, $2, $3)',
      [apiClient.id, req.path, req.ip]
    );

    req.apiClient = apiClient;
    next();
  } catch (error) {
    logger.error('API key authentication error:', error);
    return res.status(500).json({ error: 'API kimlik doğrulama hatası' });
  }
};

// UYAP integration authentication
const uyapAuth = async (req, res, next) => {
  try {
    const uyapToken = req.headers['x-uyap-token'];
    const uyapSignature = req.headers['x-uyap-signature'];

    if (!uyapToken || !uyapSignature) {
      return res.status(401).json({ error: 'UYAP kimlik bilgileri eksik' });
    }

    // Verify UYAP signature
    const crypto = require('crypto');
    const expectedSignature = crypto
      .createHmac('sha256', process.env.UYAP_SECRET || 'uyap-secret')
      .update(uyapToken + req.body)
      .digest('hex');

    if (uyapSignature !== expectedSignature) {
      return res.status(401).json({ error: 'UYAP imza doğrulaması başarısız' });
    }

    // Decode UYAP token
    const uyapData = JSON.parse(Buffer.from(uyapToken, 'base64').toString());

    // Validate token expiration
    if (new Date(uyapData.exp) < new Date()) {
      return res.status(401).json({ error: 'UYAP token süresi dolmuş' });
    }

    req.uyap = uyapData;
    next();
  } catch (error) {
    logger.error('UYAP authentication error:', error);
    return res.status(500).json({ error: 'UYAP kimlik doğrulama hatası' });
  }
};

module.exports = {
  authenticate,
  authorize,
  optionalAuthenticate,
  checkPermission,
  apiKeyAuth,
  uyapAuth
};