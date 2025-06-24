const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { cache } = require('../config/redis');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      throw new Error();
    }

    // Check token in cache first
    const cachedUser = await cache.get(`auth_token:${token}`);
    if (cachedUser) {
      req.user = cachedUser;
      req.token = token;
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({
      where: {
        id: decoded.id,
        status: 'active'
      }
    });

    if (!user) {
      throw new Error();
    }

    // Cache user data
    await cache.set(`auth_token:${token}`, user.toJSON(), 3600);

    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Lütfen giriş yapın' });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Kimlik doğrulama gerekli' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Bu işlem için yetkiniz yok' });
    }

    next();
  };
};

const checkMembership = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Kimlik doğrulama gerekli' });
    }

    // Check if membership is expired
    if (req.user.membershipExpiry && new Date(req.user.membershipExpiry) < new Date()) {
      return res.status(403).json({ 
        error: 'Üyeliğiniz sona ermiş. Lütfen yenileyin.',
        expired: true
      });
    }

    // Check if user is suspended
    if (req.user.status === 'suspended') {
      return res.status(403).json({ 
        error: 'Hesabınız askıya alınmış. Lütfen yöneticiyle iletişime geçin.'
      });
    }

    next();
  } catch (error) {
    res.status(500).json({ error: 'Üyelik kontrolü başarısız' });
  }
};

const optionalAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({
      where: {
        id: decoded.id,
        status: 'active'
      }
    });

    if (user) {
      req.user = user;
      req.token = token;
    }

    next();
  } catch (error) {
    // Invalid token, continue without authentication
    next();
  }
};

module.exports = {
  auth,
  authorize,
  checkMembership,
  optionalAuth
};