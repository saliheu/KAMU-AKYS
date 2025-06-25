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
const farmerRoutes = require('./routes/farmers');
const landRoutes = require('./routes/lands');
const cropRoutes = require('./routes/crops');
const livestockRoutes = require('./routes/livestock');
const subsidyRoutes = require('./routes/subsidies');
const marketRoutes = require('./routes/market');
const weatherRoutes = require('./routes/weather');
const analysisRoutes = require('./routes/analysis');
const documentRoutes = require('./routes/documents');
const cooperativeRoutes = require('./routes/cooperatives');
const trainingRoutes = require('./routes/training');

// Import middleware
const errorHandler = require('./middleware/errorHandler');
const { authenticate } = require('./middleware/auth');

// Import services
const { initializeDatabase } = require('./config/database');
const { initializeRedis } = require('./config/redis');
const logger = require('./utils/logger');
const { weatherService } = require('./services/weather');
const { analysisService } = require('./services/analysis');
const { notificationService } = require('./services/notification');
const { subsidyService } = require('./services/subsidy');

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
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));

// Rate limiting
const limiter = rateLimit({
  windowMs: (process.env.RATE_LIMIT_WINDOW || 15) * 60 * 1000,
  max: process.env.RATE_LIMIT_MAX || 100,
  message: 'Too many requests from this IP, please try again later.'
});

app.use('/api/', limiter);

// Static files for uploaded content
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
      weather: 'active',
      analysis: 'ready'
    }
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/farmers', authenticate, farmerRoutes);
app.use('/api/lands', authenticate, landRoutes);
app.use('/api/crops', authenticate, cropRoutes);
app.use('/api/livestock', authenticate, livestockRoutes);
app.use('/api/subsidies', authenticate, subsidyRoutes);
app.use('/api/market', marketRoutes);
app.use('/api/weather', weatherRoutes);
app.use('/api/analysis', authenticate, analysisRoutes);
app.use('/api/documents', authenticate, documentRoutes);
app.use('/api/cooperatives', authenticate, cooperativeRoutes);
app.use('/api/training', authenticate, trainingRoutes);

// Socket.io for real-time updates
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    const user = await authenticate(token);
    socket.userId = user.id;
    socket.userRole = user.role;
    socket.farmerId = user.farmerId;
    next();
  } catch (err) {
    next(new Error('Authentication failed'));
  }
});

io.on('connection', (socket) => {
  logger.info(`Farmer ${socket.farmerId} connected`);

  // Join farmer's personal room
  socket.join(`farmer-${socket.farmerId}`);

  // Real-time weather updates
  socket.on('subscribe-weather', async (location) => {
    socket.join(`weather-${location.province}`);
    
    // Send current weather
    const weather = await weatherService.getCurrentWeather(location);
    socket.emit('weather-update', weather);
  });

  // Real-time market price updates
  socket.on('subscribe-market', async (products) => {
    products.forEach(product => {
      socket.join(`market-${product}`);
    });
    
    // Send current prices
    const prices = await marketService.getCurrentPrices(products);
    socket.emit('market-update', prices);
  });

  // IoT sensor data streaming
  socket.on('sensor-data', async (data) => {
    const { sensorId, type, value, location } = data;
    
    // Store sensor data
    await sensorService.storeSensorData({
      farmerId: socket.farmerId,
      sensorId,
      type,
      value,
      location,
      timestamp: new Date()
    });

    // Analyze for alerts
    const alerts = await analysisService.checkSensorAlerts(data);
    if (alerts.length > 0) {
      socket.emit('sensor-alerts', alerts);
    }
  });

  // Field monitoring updates
  socket.on('field-update', async (data) => {
    const { fieldId, updateType, details } = data;
    
    // Process field update
    await fieldService.processUpdate(fieldId, updateType, details);
    
    // Notify relevant parties
    io.to(`field-${fieldId}`).emit('field-status-update', {
      fieldId,
      updateType,
      details,
      timestamp: new Date()
    });
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    logger.info(`Farmer ${socket.farmerId} disconnected`);
  });
});

// Scheduled tasks
if (process.env.NODE_ENV === 'production') {
  // Daily weather forecast update
  cron.schedule('0 6 * * *', async () => {
    logger.info('Updating weather forecasts...');
    await weatherService.updateForecasts();
    await notificationService.sendWeatherAlerts();
  });

  // Market price updates every 4 hours
  cron.schedule('0 */4 * * *', async () => {
    logger.info('Updating market prices...');
    await marketService.updatePrices();
    io.emit('market-prices-updated', { timestamp: new Date() });
  });

  // Subsidy calculation checks
  cron.schedule('0 0 * * *', async () => {
    logger.info('Running subsidy calculations...');
    await subsidyService.calculateEligibleSubsidies();
  });

  // Crop yield predictions
  cron.schedule('0 2 * * 1', async () => {
    logger.info('Running yield predictions...');
    await analysisService.runYieldPredictions();
  });

  // Disease detection from satellite imagery
  cron.schedule('0 3 * * *', async () => {
    logger.info('Analyzing satellite imagery for disease detection...');
    await analysisService.runDiseaseDetection();
  });

  // Backup database
  if (process.env.BACKUP_ENABLED === 'true') {
    cron.schedule(process.env.BACKUP_SCHEDULE || '0 2 * * *', async () => {
      logger.info('Starting scheduled backup...');
      await backupService.performBackup();
    });
  }

  // Send training reminders
  cron.schedule('0 9 * * *', async () => {
    logger.info('Sending training reminders...');
    await trainingService.sendReminders();
  });

  // Update cooperative statistics
  cron.schedule('0 1 * * *', async () => {
    logger.info('Updating cooperative statistics...');
    await cooperativeService.updateStatistics();
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

    // Initialize external services
    await weatherService.initialize();
    await marketService.initialize();
    logger.info('External services initialized');

    // Start server
    const PORT = process.env.PORT || 3003;
    httpServer.listen(PORT, () => {
      logger.info(`Çiftçi Kayıt Sistemi server running on port ${PORT}`);
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