const { logger } = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
  logger.error({
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip
  });

  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation Error',
      details: err.errors
    });
  }

  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(409).json({
      error: 'Bu kayıt zaten mevcut',
      field: err.errors[0].path
    });
  }

  if (err.name === 'SequelizeForeignKeyConstraintError') {
    return res.status(409).json({
      error: 'İlişkili kayıt bulunamadı'
    });
  }

  res.status(err.status || 500).json({
    error: err.message || 'Sunucu hatası'
  });
};

module.exports = errorHandler;