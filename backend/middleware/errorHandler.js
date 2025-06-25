const logger = require('../utils/logger');

// Custom error class
class AppError extends Error {
  constructor(message, statusCode, code = null) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

// Async error handler wrapper
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Global error handler middleware
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error
  logger.error('Error occurred', {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    user: req.user?.id
  });

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Geçersiz ID formatı';
    error = new AppError(message, 400, 'INVALID_ID');
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const message = `Bu ${field} zaten kullanımda`;
    error = new AppError(message, 400, 'DUPLICATE_FIELD');
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => e.message);
    const message = 'Doğrulama hatası';
    error = new AppError(message, 400, 'VALIDATION_ERROR');
    error.details = errors;
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'Geçersiz token';
    error = new AppError(message, 401, 'INVALID_TOKEN');
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Token süresi dolmuş';
    error = new AppError(message, 401, 'TOKEN_EXPIRED');
  }

  // PostgreSQL errors
  if (err.code === '23505') {
    // Unique violation
    const message = 'Bu kayıt zaten mevcut';
    error = new AppError(message, 400, 'DUPLICATE_ENTRY');
  }

  if (err.code === '23503') {
    // Foreign key violation
    const message = 'İlişkili kayıt bulunamadı';
    error = new AppError(message, 400, 'FOREIGN_KEY_ERROR');
  }

  if (err.code === '23502') {
    // Not null violation
    const message = 'Zorunlu alan eksik';
    error = new AppError(message, 400, 'REQUIRED_FIELD_MISSING');
  }

  // Send error response
  res.status(error.statusCode || 500).json({
    error: error.message || 'Sunucu hatası',
    code: error.code || 'SERVER_ERROR',
    details: error.details || undefined,
    ...(process.env.NODE_ENV === 'development' && {
      stack: err.stack
    })
  });
};

// 404 handler
const notFound = (req, res, next) => {
  const message = `Kaynak bulunamadı - ${req.originalUrl}`;
  const error = new AppError(message, 404, 'NOT_FOUND');
  next(error);
};

// Validation error formatter
const formatValidationErrors = (errors) => {
  const formattedErrors = {};
  
  errors.forEach(error => {
    if (!formattedErrors[error.param]) {
      formattedErrors[error.param] = [];
    }
    formattedErrors[error.param].push(error.msg);
  });
  
  return formattedErrors;
};

// Database error handler
const handleDatabaseError = (error) => {
  if (error.code === 'ECONNREFUSED') {
    return new AppError('Veritabanı bağlantısı kurulamadı', 503, 'DB_CONNECTION_ERROR');
  }
  
  if (error.code === 'ETIMEDOUT') {
    return new AppError('Veritabanı işlemi zaman aşımına uğradı', 504, 'DB_TIMEOUT');
  }
  
  if (error.code === 'ER_CON_COUNT_ERROR') {
    return new AppError('Çok fazla veritabanı bağlantısı', 503, 'DB_TOO_MANY_CONNECTIONS');
  }
  
  return error;
};

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('UNCAUGHT EXCEPTION! Shutting down...', {
    error: error.message,
    stack: error.stack
  });
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('UNHANDLED REJECTION! Shutting down...', {
    reason: reason,
    promise: promise
  });
  process.exit(1);
});

// Graceful shutdown handler
const gracefulShutdown = (server) => {
  process.on('SIGTERM', () => {
    logger.info('SIGTERM signal received: closing HTTP server');
    server.close(() => {
      logger.info('HTTP server closed');
      
      // Close database connections
      const { pool } = require('../config/database');
      pool.end(() => {
        logger.info('Database pool closed');
        process.exit(0);
      });
    });
  });
};

module.exports = {
  AppError,
  asyncHandler,
  errorHandler,
  notFound,
  formatValidationErrors,
  handleDatabaseError,
  gracefulShutdown
};