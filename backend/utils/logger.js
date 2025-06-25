const winston = require('winston');
const path = require('path');
const DailyRotateFile = require('winston-daily-rotate-file');

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Define log colors
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

// Tell winston about the colors
winston.addColors(colors);

// Define log format
const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// Define custom format for console
const consoleFormat = winston.format.combine(
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`
  )
);

// Define which transports to use
const transports = [];

// Console transport
if (process.env.NODE_ENV !== 'production') {
  transports.push(
    new winston.transports.Console({
      format: consoleFormat,
    })
  );
}

// File transports with rotation
const fileRotateTransport = new DailyRotateFile({
  filename: path.join('logs', 'application-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '14d',
  format,
});

const errorFileRotateTransport = new DailyRotateFile({
  filename: path.join('logs', 'error-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '30d',
  level: 'error',
  format,
});

transports.push(fileRotateTransport);
transports.push(errorFileRotateTransport);

// Create the logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  levels,
  format,
  transports,
  exitOnError: false,
});

// Create a stream object for Morgan HTTP logger
logger.stream = {
  write: (message) => logger.http(message.trim()),
};

// Add request ID to all logs
logger.addRequestId = (requestId) => {
  return logger.child({ requestId });
};

// Log unhandled rejections and exceptions
logger.exceptions.handle(
  new DailyRotateFile({
    filename: path.join('logs', 'exceptions-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '30d',
  })
);

logger.rejections.handle(
  new DailyRotateFile({
    filename: path.join('logs', 'rejections-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '30d',
  })
);

// Structured logging helpers
logger.logError = (message, error, meta = {}) => {
  logger.error(message, {
    error: {
      message: error.message,
      stack: error.stack,
      code: error.code,
      name: error.name,
    },
    ...meta,
  });
};

logger.logRequest = (req, res, responseTime) => {
  logger.http('HTTP Request', {
    method: req.method,
    url: req.url,
    status: res.statusCode,
    responseTime: `${responseTime}ms`,
    ip: req.ip,
    userAgent: req.get('user-agent'),
    userId: req.user?.id,
  });
};

logger.logDatabaseQuery = (query, duration, error = null) => {
  const level = error ? 'error' : 'debug';
  logger[level]('Database Query', {
    query: query.text || query,
    duration: `${duration}ms`,
    error: error?.message,
  });
};

logger.logExternalAPI = (service, endpoint, duration, error = null) => {
  const level = error ? 'error' : 'info';
  logger[level]('External API Call', {
    service,
    endpoint,
    duration: `${duration}ms`,
    error: error?.message,
  });
};

logger.logAuthentication = (event, userId, success, details = {}) => {
  const level = success ? 'info' : 'warn';
  logger[level](`Authentication: ${event}`, {
    userId,
    success,
    ...details,
  });
};

logger.logSecurity = (event, severity, details = {}) => {
  const level = severity === 'high' ? 'error' : 'warn';
  logger[level](`Security Event: ${event}`, {
    severity,
    timestamp: new Date().toISOString(),
    ...details,
  });
};

// Performance logging
logger.logPerformance = (operation, duration, metadata = {}) => {
  const level = duration > 1000 ? 'warn' : 'debug';
  logger[level]('Performance Metric', {
    operation,
    duration: `${duration}ms`,
    slow: duration > 1000,
    ...metadata,
  });
};

// Audit logging
logger.logAudit = (action, userId, resource, details = {}) => {
  logger.info('Audit Log', {
    action,
    userId,
    resource,
    timestamp: new Date().toISOString(),
    ...details,
  });
};

// Business event logging
logger.logBusinessEvent = (event, data = {}) => {
  logger.info(`Business Event: ${event}`, {
    event,
    timestamp: new Date().toISOString(),
    ...data,
  });
};

// Create child logger for specific modules
logger.createModuleLogger = (moduleName) => {
  return logger.child({ module: moduleName });
};

// Mask sensitive data
const maskSensitiveData = (data) => {
  const sensitiveFields = ['password', 'sifre', 'token', 'apiKey', 'tcKimlikNo'];
  const masked = { ...data };
  
  for (const field of sensitiveFields) {
    if (masked[field]) {
      masked[field] = '***MASKED***';
    }
  }
  
  return masked;
};

// Log with masked sensitive data
logger.logSafe = (level, message, data = {}) => {
  logger[level](message, maskSensitiveData(data));
};

// Export the logger
module.exports = logger;