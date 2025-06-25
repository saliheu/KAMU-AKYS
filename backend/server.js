require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const path = require('path');

// Import configurations
const { initializeDatabase } = require('./config/database');
const { connectRedis } = require('./config/redis');
const { passport } = require('./config/passport');
const { swaggerUi, swaggerSpec } = require('./config/swagger');

// Import middleware
const { errorHandler, notFound, gracefulShutdown } = require('./middleware/errorHandler');
const { apiLimiter, monitorRateLimits, ipBlocker } = require('./middleware/rateLimiter');

// Import routes
const authRoutes = require('./routes/auth');
const appointmentRoutes = require('./routes/appointments');
const courtRoutes = require('./routes/courts');
const userRoutes = require('./routes/users');
const calendarRoutes = require('./routes/calendar');

// Import jobs
const { appointmentReminderJob, dailySummaryJob, noShowJob } = require('./jobs/appointmentReminders');
const { dataCleanupJob, archiveJob, vacuumJob } = require('./jobs/dataCleanup');

// Import utilities
const logger = require('./utils/logger');

// Create Express app
const app = express();

// Trust proxy (for correct IP addresses behind reverse proxy)
app.set('trust proxy', 1);

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'];
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('CORS policy violation'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['X-Total-Count', 'X-Page-Count'],
  maxAge: 86400 // 24 hours
};

app.use(cors(corsOptions));

// Compression middleware
app.use(compression());

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
app.use(morgan('combined', { stream: logger.stream }));

// Request ID middleware
app.use((req, res, next) => {
  req.id = require('crypto').randomBytes(16).toString('hex');
  req.logger = logger.addRequestId(req.id);
  next();
});

// Passport middleware
app.use(passport.initialize());

// Rate limiting
app.use(monitorRateLimits);
app.use(ipBlocker);
app.use('/api/', apiLimiter);

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    // Check database connection
    const { pool } = require('./config/database');
    await pool.query('SELECT 1');

    // Check Redis connection
    const { client } = require('./config/redis');
    await client.ping();

    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV,
      services: {
        database: 'connected',
        redis: 'connected'
      }
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

// API documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/courts', courtRoutes);
app.use('/api/users', userRoutes);
app.use('/api/calendar', calendarRoutes);

// 404 handler
app.use(notFound);

// Error handler
app.use(errorHandler);

// Initialize application
async function initializeApp() {
  try {
    // Initialize database
    logger.info('Veritabanı başlatılıyor...');
    await initializeDatabase();

    // Create tables
    const User = require('./models/User');
    const Court = require('./models/Court');
    const Appointment = require('./models/Appointment');
    const Judge = require('./models/Judge');
    const Lawyer = require('./models/Lawyer');

    await User.createTable();
    await Court.createTable();
    await Appointment.createTable();
    await Judge.createTable();
    await Lawyer.createTable();
    await Lawyer.createJunctionTable();

    // Initialize Redis
    logger.info('Redis bağlantısı kuruluyor...');
    await connectRedis();

    // Initialize jobs
    logger.info('Zamanlanmış görevler başlatılıyor...');
    appointmentReminderJob.init();
    dataCleanupJob.init();

    // Start jobs based on environment
    if (process.env.NODE_ENV === 'production') {
      appointmentReminderJob.start();
      dataCleanupJob.start();
      dailySummaryJob.start();
      noShowJob.start();
      archiveJob.start();
      vacuumJob.start();
    }

    logger.info('Uygulama başarıyla başlatıldı');
  } catch (error) {
    logger.error('Uygulama başlatma hatası:', error);
    process.exit(1);
  }
}

// Start server
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, async () => {
  logger.info(`Server ${PORT} portunda çalışıyor`);
  logger.info(`API dokümantasyonu: http://localhost:${PORT}/api-docs`);
  
  // Initialize application
  await initializeApp();
});

// Graceful shutdown
gracefulShutdown(server);

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

module.exports = app;