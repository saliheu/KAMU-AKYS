const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
  // Log error
  logger.error({
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    user: req.user?.id
  });

  // Sequelize validation errors
  if (err.name === 'SequelizeValidationError') {
    return res.status(400).json({
      error: 'Validation hatası',
      details: err.errors.map(e => ({
        field: e.path,
        message: e.message
      }))
    });
  }

  // Sequelize unique constraint errors
  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(400).json({
      error: 'Bu kayıt zaten mevcut',
      details: err.errors.map(e => ({
        field: e.path,
        message: e.message
      }))
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: 'Geçersiz token'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      error: 'Token süresi dolmuş'
    });
  }

  // Joi validation errors
  if (err.isJoi) {
    return res.status(400).json({
      error: 'Validation hatası',
      details: err.details.map(d => ({
        field: d.path.join('.'),
        message: d.message
      }))
    });
  }

  // Custom application errors
  if (err.statusCode) {
    return res.status(err.statusCode).json({
      error: err.message
    });
  }

  // Default error
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Sunucu hatası';

  res.status(statusCode).json({
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = errorHandler;