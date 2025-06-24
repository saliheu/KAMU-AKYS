const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { cache } = require('../config/redis');
const logger = require('../utils/logger');

const authenticate = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        error: 'Token bulunamadı' 
      });
    }

    const token = authHeader.substring(7);

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ 
          error: 'Token süresi dolmuş' 
        });
      }
      return res.status(401).json({ 
        error: 'Geçersiz token' 
      });
    }

    // Try to get user from cache first
    let user = await cache.get(`user:${decoded.userId}`);
    
    if (!user) {
      // Get from database
      user = await User.findByPk(decoded.userId, {
        attributes: { exclude: ['password', 'refreshToken'] }
      });

      if (!user) {
        return res.status(401).json({ 
          error: 'Kullanıcı bulunamadı' 
        });
      }

      // Cache user data
      await cache.set(`user:${user.id}`, user.toJSON(), 3600);
      user = user.toJSON();
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(403).json({ 
        error: 'Hesap deaktif' 
      });
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    logger.error('Authentication error:', error);
    res.status(500).json({ 
      error: 'Kimlik doğrulama hatası' 
    });
  }
};

const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        error: 'Kimlik doğrulaması gerekli' 
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      logger.warn(`Unauthorized access attempt by user ${req.user.email} with role ${req.user.role}`);
      return res.status(403).json({ 
        error: 'Bu işlem için yetkiniz yok' 
      });
    }

    next();
  };
};

const checkPermission = (resource, action) => {
  return async (req, res, next) => {
    // Define role permissions
    const permissions = {
      super_admin: ['all'],
      coordinator: [
        'disaster:*',
        'resource:*',
        'team:*',
        'report:*',
        'user:read',
        'help_request:*'
      ],
      city_manager: [
        'disaster:read',
        'resource:*',
        'team:*',
        'report:*',
        'help_request:*'
      ],
      institution_officer: [
        'disaster:read',
        'resource:create',
        'resource:read',
        'resource:update',
        'team:read',
        'report:read',
        'help_request:read'
      ],
      ngo_representative: [
        'disaster:read',
        'resource:read',
        'team:read',
        'volunteer:*',
        'help_request:read'
      ],
      field_officer: [
        'disaster:read',
        'help_request:*',
        'team:read',
        'report:create'
      ],
      volunteer: [
        'disaster:read',
        'help_request:read',
        'team:read'
      ],
      citizen: [
        'help_request:create',
        'help_request:read:own'
      ]
    };

    const userPermissions = permissions[req.user.role] || [];
    const requiredPermission = `${resource}:${action}`;

    // Check if user has permission
    const hasPermission = userPermissions.includes('all') ||
      userPermissions.includes(`${resource}:*`) ||
      userPermissions.includes(requiredPermission);

    if (!hasPermission) {
      return res.status(403).json({ 
        error: 'Bu işlem için yetkiniz yok' 
      });
    }

    next();
  };
};

module.exports = {
  authenticate,
  authorize,
  checkPermission
};