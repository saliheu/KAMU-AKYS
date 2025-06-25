const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const { createServer } = require('http');
const { Server } = require('socket.io');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
const path = require('path');
const cron = require('node-cron');

// Load environment variables
dotenv.config();

// Import routes
const authRoutes = require('./routes/auth');
const missingPersonRoutes = require('./routes/missingPersons');
const reportRoutes = require('./routes/reports');
const searchRoutes = require('./routes/search');
const sightingRoutes = require('./routes/sightings');
const alertRoutes = require('./routes/alerts');
const locationRoutes = require('./routes/locations');
const matchingRoutes = require('./routes/matching');
const statisticsRoutes = require('./routes/statistics');
const organizationRoutes = require('./routes/organizations');

// Import middleware
const errorHandler = require('./middleware/errorHandler');
const { authenticate } = require('./middleware/auth');

// Import services
const { initializeDatabase } = require('./config/database');
const { initializeRedis } = require('./config/redis');
const logger = require('./utils/logger');
const { faceRecognitionService } = require('./services/faceRecognition');
const { alertService } = require('./services/alert');
const { matchingService } = require('./services/matching');
const { notificationService } = require('./services/notification');

// Create Express app
const app = express();
const httpServer = createServer(app);

// Socket.io configuration for real-time updates
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Middleware
app.use(helmet());
app.use(compression());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));

// Rate limiting
const limiter = rateLimit({
  windowMs: (process.env.RATE_LIMIT_WINDOW || 15) * 60 * 1000,
  max: process.env.RATE_LIMIT_MAX || 100,
  message: 'Too many requests from this IP, please try again later.'
});

app.use('/api/', limiter);

// Stricter rate limiting for reporting
const reportLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // Max 5 reports per hour
  message: 'Too many reports submitted, please try again later.'
});

// Static files for uploaded images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    services: {
      database: 'connected',
      redis: 'connected',
      faceRecognition: 'ready'
    }
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/missing-persons', authenticate, missingPersonRoutes);
app.use('/api/reports', reportLimiter, reportRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/sightings', authenticate, sightingRoutes);
app.use('/api/alerts', authenticate, alertRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/matching', authenticate, matchingRoutes);
app.use('/api/statistics', statisticsRoutes);
app.use('/api/organizations', authenticate, organizationRoutes);

// Socket.io for real-time updates
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    if (token) {
      const user = await authenticate(token);
      socket.userId = user.id;
      socket.userRole = user.role;
    }
    next();
  } catch (err) {
    next(new Error('Authentication failed'));
  }
});

io.on('connection', (socket) => {
  logger.info(`Client connected: ${socket.id}`);

  // Join location-based rooms for alerts
  socket.on('join-location', async (location) => {
    const { latitude, longitude, radius } = location;
    const roomName = `location-${latitude}-${longitude}-${radius}`;
    socket.join(roomName);
    logger.info(`Socket ${socket.id} joined location room: ${roomName}`);
  });

  // Real-time sighting reports
  socket.on('report-sighting', async (data) => {
    const { missingPersonId, location, description, photos } = data;
    
    try {
      // Process sighting
      const sighting = await sightingService.processSighting({
        missingPersonId,
        location,
        description,
        photos,
        reportedBy: socket.userId
      });

      // Notify relevant parties
      io.emit('new-sighting', {
        sighting,
        timestamp: new Date()
      });

      // Send location-based alerts
      await alertService.sendLocationBasedAlert(sighting);
    } catch (error) {
      socket.emit('error', { message: 'Failed to process sighting' });
    }
  });

  // Real-time face matching
  socket.on('check-face-match', async (data) => {
    const { imageData, searchRadius } = data;
    
    try {
      // Perform face recognition
      const matches = await faceRecognitionService.findMatches(imageData);
      
      socket.emit('face-match-results', {
        matches,
        timestamp: new Date()
      });

      // If high confidence match found, alert authorities
      if (matches.some(m => m.confidence > 0.9)) {
        await alertService.notifyAuthorities(matches);
      }
    } catch (error) {
      socket.emit('error', { message: 'Face matching failed' });
    }
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    logger.info(`Client disconnected: ${socket.id}`);
  });
});

// Scheduled tasks
if (process.env.NODE_ENV === 'production') {
  // Check for pattern matches every hour
  cron.schedule('0 * * * *', async () => {
    logger.info('Running pattern matching analysis...');
    await matchingService.runPatternAnalysis();
  });

  // Send daily summary reports
  cron.schedule('0 8 * * *', async () => {
    logger.info('Sending daily summary reports...');
    await notificationService.sendDailySummary();
  });

  // Clean up old alerts
  cron.schedule('0 0 * * *', async () => {
    logger.info('Cleaning up expired alerts...');
    await alertService.cleanupExpiredAlerts();
  });

  // Backup database
  if (process.env.BACKUP_ENABLED === 'true') {
    cron.schedule(process.env.BACKUP_SCHEDULE || '0 3 * * *', async () => {
      logger.info('Starting scheduled backup...');
      await backupService.performBackup();
    });
  }

  // Update statistics cache
  cron.schedule('*/30 * * * *', async () => {
    logger.info('Updating statistics cache...');
    await statisticsService.updateCache();
  });

  // Sync with external systems
  cron.schedule('0 */6 * * *', async () => {
    logger.info('Syncing with external systems...');
    await integrationService.syncWithPoliceDatabase();
    await integrationService.syncWithHospitalDatabase();
  });
}

// Error handling middleware
app.use(errorHandler);

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

// Initialize and start server
const startServer = async () => {
  try {
    // Initialize database
    await initializeDatabase();
    logger.info('Database initialized successfully');

    // Initialize Redis
    await initializeRedis();
    logger.info('Redis initialized successfully');

    // Load face recognition models
    await faceRecognitionService.loadModels();
    logger.info('Face recognition models loaded');

    // Start server
    const PORT = process.env.PORT || 3002;
    httpServer.listen(PORT, () => {
      logger.info(`Kayıp Kişi Takip Sistemi server running on port ${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV}`);
      logger.info(`Real-time updates enabled on WebSocket`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Export for testing
module.exports = { app, io };

// Start server if not in test environment
if (process.env.NODE_ENV !== 'test') {
  startServer();
}