const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error
  logger.error({
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    user: req.user?.id
  });

  // Sequelize validation errors
  if (err.name === 'SequelizeValidationError') {
    const message = 'Geçersiz veri';
    const errors = err.errors.map(e => ({
      field: e.path,
      message: e.message
    }));
    error = { message, errors };
    error.statusCode = 400;
  }

  // Sequelize unique constraint error
  if (err.name === 'SequelizeUniqueConstraintError') {
    const message = 'Bu kayıt zaten mevcut';
    const errors = err.errors.map(e => ({
      field: e.path,
      message: `${e.path} zaten kullanımda`
    }));
    error = { message, errors };
    error.statusCode = 400;
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error.message = 'Geçersiz token';
    error.statusCode = 401;
  }

  if (err.name === 'TokenExpiredError') {
    error.message = 'Token süresi dolmuş';
    error.statusCode = 401;
  }

  // Multer errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    error.message = 'Dosya boyutu çok büyük';
    error.statusCode = 400;
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    error.message = 'Beklenmeyen dosya alanı';
    error.statusCode = 400;
  }

  res.status(error.statusCode || 500).json({
    success: false,
    error: {
      message: error.message || 'Sunucu hatası',
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
      ...(error.errors && { errors: error.errors })
    }
  });
};

module.exports = errorHandler;