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
const mqtt = require('mqtt');

// Load environment variables
dotenv.config();

// Import routes
const authRoutes = require('./routes/auth');
const vehicleRoutes = require('./routes/vehicles');
const routeRoutes = require('./routes/routes');
const stopRoutes = require('./routes/stops');
const scheduleRoutes = require('./routes/schedules');
const ticketRoutes = require('./routes/tickets');
const passengerRoutes = require('./routes/passengers');
const driverRoutes = require('./routes/drivers');
const trackingRoutes = require('./routes/tracking');
const reportRoutes = require('./routes/reports');
const maintenanceRoutes = require('./routes/maintenance');
const emergencyRoutes = require('./routes/emergency');
const paymentRoutes = require('./routes/payments');

// Import middleware
const errorHandler = require('./middleware/errorHandler');
const { authenticate } = require('./middleware/auth');

// Import services
const { initializeDatabase } = require('./config/database');
const { initializeRedis } = require('./config/redis');
const logger = require('./utils/logger');
const { trackingService } = require('./services/tracking');
const { gtfsService } = require('./services/gtfs');
const { analyticsService } = require('./services/analytics');
const { emergencyService } = require('./services/emergency');

// Create Express app
const app = express();
const httpServer = createServer(app);

// Socket.io configuration for real-time tracking
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// MQTT client for IoT sensors
const mqttClient = mqtt.connect(process.env.MQTT_BROKER_URL, {
  username: process.env.MQTT_USERNAME,
  password: process.env.MQTT_PASSWORD
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

// Static files
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
      mqtt: mqttClient.connected ? 'connected' : 'disconnected',
      tracking: 'active'
    }
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/vehicles', authenticate, vehicleRoutes);
app.use('/api/routes', routeRoutes);
app.use('/api/stops', stopRoutes);
app.use('/api/schedules', scheduleRoutes);
app.use('/api/tickets', authenticate, ticketRoutes);
app.use('/api/passengers', authenticate, passengerRoutes);
app.use('/api/drivers', authenticate, driverRoutes);
app.use('/api/tracking', trackingRoutes);
app.use('/api/reports', authenticate, reportRoutes);
app.use('/api/maintenance', authenticate, maintenanceRoutes);
app.use('/api/emergency', emergencyRoutes);
app.use('/api/payments', authenticate, paymentRoutes);

// Socket.io for real-time vehicle tracking
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
    // Allow anonymous connections for public tracking
    next();
  }
});

io.on('connection', (socket) => {
  logger.info(`Client connected: ${socket.id}`);

  // Subscribe to vehicle tracking
  socket.on('track-vehicle', async (vehicleId) => {
    socket.join(`vehicle-${vehicleId}`);
    
    // Send current location
    const location = await trackingService.getVehicleLocation(vehicleId);
    socket.emit('vehicle-location', location);
  });

  // Subscribe to route tracking
  socket.on('track-route', async (routeId) => {
    socket.join(`route-${routeId}`);
    
    // Send all vehicles on this route
    const vehicles = await trackingService.getRouteVehicles(routeId);
    socket.emit('route-vehicles', vehicles);
  });

  // Driver location updates
  socket.on('driver-location', async (data) => {
    const { vehicleId, location, speed, heading } = data;
    
    // Update vehicle location
    await trackingService.updateVehicleLocation(vehicleId, location, speed, heading);
    
    // Broadcast to subscribers
    io.to(`vehicle-${vehicleId}`).emit('vehicle-location', {
      vehicleId,
      location,
      speed,
      heading,
      timestamp: new Date()
    });
    
    // Update route subscribers
    const routeId = await trackingService.getVehicleRoute(vehicleId);
    if (routeId) {
      io.to(`route-${routeId}`).emit('vehicle-update', {
        vehicleId,
        location,
        speed,
        heading
      });
    }
  });

  // Emergency alerts
  socket.on('emergency-alert', async (data) => {
    const { vehicleId, type, location, description } = data;
    
    // Process emergency
    const alert = await emergencyService.createAlert({
      vehicleId,
      type,
      location,
      description,
      reportedBy: socket.userId
    });
    
    // Broadcast to emergency services and nearby vehicles
    io.emit('emergency-broadcast', alert);
    
    // Notify authorities
    await emergencyService.notifyAuthorities(alert);
  });

  // Passenger counting updates
  socket.on('passenger-count', async (data) => {
    const { vehicleId, count, stopId } = data;
    
    await analyticsService.updatePassengerCount(vehicleId, count, stopId);
    
    io.to(`vehicle-${vehicleId}`).emit('passenger-count-update', {
      vehicleId,
      count,
      stopId,
      timestamp: new Date()
    });
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    logger.info(`Client disconnected: ${socket.id}`);
  });
});

// MQTT sensor data handling
mqttClient.on('connect', () => {
  logger.info('Connected to MQTT broker');
  
  // Subscribe to sensor topics
  mqttClient.subscribe(`${process.env.SENSOR_TOPIC_PREFIX}/+/+`);
});

mqttClient.on('message', async (topic, message) => {
  try {
    const data = JSON.parse(message.toString());
    const [prefix, vehicleId, sensorType] = topic.split('/');
    
    // Process sensor data
    switch (sensorType) {
      case 'fuel':
        await maintenanceService.updateFuelLevel(vehicleId, data.level);
        break;
      case 'engine':
        await maintenanceService.updateEngineData(vehicleId, data);
        break;
      case 'passenger':
        await analyticsService.updatePassengerSensorData(vehicleId, data);
        break;
      case 'environment':
        await analyticsService.updateEnvironmentData(vehicleId, data);
        break;
    }
    
    // Broadcast updates via WebSocket
    io.to(`vehicle-${vehicleId}`).emit('sensor-update', {
      vehicleId,
      sensorType,
      data,
      timestamp: new Date()
    });
  } catch (error) {
    logger.error('Error processing MQTT message:', error);
  }
});

// Scheduled tasks
if (process.env.NODE_ENV === 'production') {
  // Update GTFS data
  cron.schedule(process.env.GTFS_UPDATE_SCHEDULE || '0 3 * * *', async () => {
    logger.info('Updating GTFS data...');
    await gtfsService.updateGTFSData();
  });

  // Generate daily reports
  cron.schedule('0 1 * * *', async () => {
    logger.info('Generating daily reports...');
    await analyticsService.generateDailyReports();
  });

  // Maintenance checks
  cron.schedule('0 6 * * *', async () => {
    logger.info('Running maintenance checks...');
    await maintenanceService.runDailyChecks();
  });

  // Clean up old tracking data
  cron.schedule('0 0 * * *', async () => {
    logger.info('Cleaning up old tracking data...');
    await trackingService.cleanupOldData();
  });

  // Update traffic conditions
  cron.schedule('*/15 * * * *', async () => {
    logger.info('Updating traffic conditions...');
    await trackingService.updateTrafficConditions();
  });

  // Passenger flow analysis
  cron.schedule('0 */2 * * *', async () => {
    logger.info('Analyzing passenger flow...');
    await analyticsService.analyzePassengerFlow();
  });

  // Backup database
  if (process.env.BACKUP_ENABLED === 'true') {
    cron.schedule(process.env.BACKUP_SCHEDULE || '0 2 * * *', async () => {
      logger.info('Starting scheduled backup...');
      await backupService.performBackup();
    });
  }
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

    // Initialize services
    await trackingService.initialize();
    await gtfsService.initialize();
    logger.info('Services initialized successfully');

    // Start server
    const PORT = process.env.PORT || 3004;
    httpServer.listen(PORT, () => {
      logger.info(`Toplu Taşıma Yönetim Sistemi server running on port ${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV}`);
      logger.info(`Real-time tracking enabled on WebSocket`);
      logger.info(`MQTT sensor integration active`);
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