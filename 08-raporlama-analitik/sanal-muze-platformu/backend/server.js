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
const exhibitRoutes = require('./routes/exhibits');
const collectionRoutes = require('./routes/collections');
const galleryRoutes = require('./routes/galleries');
const tourRoutes = require('./routes/tours');
const modelRoutes = require('./routes/models');
const mediaRoutes = require('./routes/media');
const visitorRoutes = require('./routes/visitors');
const eventRoutes = require('./routes/events');
const educationRoutes = require('./routes/education');
const analyticsRoutes = require('./routes/analytics');
const arvrRoutes = require('./routes/arvr');
const socialRoutes = require('./routes/social');

// Import middleware
const errorHandler = require('./middleware/errorHandler');
const { authenticate } = require('./middleware/auth');

// Import services
const { initializeDatabase } = require('./config/database');
const { initializeRedis } = require('./config/redis');
const logger = require('./utils/logger');
const { modelProcessingService } = require('./services/modelProcessing');
const { tourService } = require('./services/tour');
const { analyticsService } = require('./services/analytics');
const { notificationService } = require('./services/notification');

// Create Express app
const app = express();
const httpServer = createServer(app);

// Socket.io configuration for real-time features
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginEmbedderPolicy: false
}));
app.use(compression());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));

// Rate limiting
const limiter = rateLimit({
  windowMs: (process.env.RATE_LIMIT_WINDOW || 15) * 60 * 1000,
  max: process.env.RATE_LIMIT_MAX || 100,
  message: 'Too many requests from this IP, please try again later.'
});

app.use('/api/', limiter);

// Static files for uploads
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
      cdn: process.env.CDN_ENABLED === 'true' ? 'active' : 'disabled',
      '3d': 'ready',
      analytics: 'tracking'
    }
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/exhibits', exhibitRoutes);
app.use('/api/collections', collectionRoutes);
app.use('/api/galleries', galleryRoutes);
app.use('/api/tours', tourRoutes);
app.use('/api/models', authenticate, modelRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/visitors', visitorRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/education', educationRoutes);
app.use('/api/analytics', authenticate, analyticsRoutes);
app.use('/api/arvr', arvrRoutes);
app.use('/api/social', socialRoutes);

// Socket.io for real-time features
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    if (token) {
      const user = await authenticate(token);
      socket.userId = user.id;
      socket.userRole = user.role;
    }
    socket.visitorId = socket.handshake.auth.visitorId || `visitor-${Date.now()}`;
    next();
  } catch (err) {
    // Allow anonymous visitors
    socket.visitorId = `visitor-${Date.now()}`;
    next();
  }
});

io.on('connection', (socket) => {
  logger.info(`Visitor ${socket.visitorId} connected`);

  // Join virtual tour room
  socket.on('join-tour', async (tourId) => {
    socket.join(`tour-${tourId}`);
    
    // Track visitor
    await analyticsService.trackTourJoin(socket.visitorId, tourId);
    
    // Get current tour state
    const tourState = await tourService.getTourState(tourId);
    socket.emit('tour-state', tourState);
    
    // Notify other visitors
    socket.to(`tour-${tourId}`).emit('visitor-joined', {
      visitorId: socket.visitorId,
      timestamp: new Date()
    });
  });

  // Guided tour synchronization
  socket.on('guide-update', async (data) => {
    const { tourId, position, rotation, currentExhibit } = data;
    
    if (socket.userRole === 'guide' || socket.userRole === 'admin') {
      // Broadcast guide position to all tour participants
      io.to(`tour-${tourId}`).emit('guide-position', {
        position,
        rotation,
        currentExhibit,
        timestamp: new Date()
      });
    }
  });

  // Multi-user interaction
  socket.on('user-interaction', async (data) => {
    const { exhibitId, interactionType, details } = data;
    
    // Track interaction
    await analyticsService.trackInteraction(socket.visitorId, exhibitId, interactionType);
    
    // Broadcast to nearby users
    socket.to(`exhibit-${exhibitId}`).emit('user-interacted', {
      visitorId: socket.visitorId,
      interactionType,
      details,
      timestamp: new Date()
    });
  });

  // Real-time comments
  socket.on('post-comment', async (data) => {
    const { exhibitId, comment, parentId } = data;
    
    // Save comment
    const newComment = await socialService.postComment({
      exhibitId,
      userId: socket.userId,
      visitorId: socket.visitorId,
      comment,
      parentId
    });
    
    // Broadcast to exhibit viewers
    io.to(`exhibit-${exhibitId}`).emit('new-comment', newComment);
  });

  // AR marker detection
  socket.on('ar-marker-detected', async (data) => {
    const { markerId, position, rotation } = data;
    
    // Get associated exhibit
    const exhibit = await exhibitService.getByMarkerId(markerId);
    
    if (exhibit) {
      socket.emit('ar-content', {
        exhibit,
        position,
        rotation,
        modelUrl: exhibit.arModel
      });
      
      // Track AR usage
      await analyticsService.trackARUsage(socket.visitorId, exhibit.id);
    }
  });

  // VR movement tracking
  socket.on('vr-movement', async (data) => {
    const { position, rotation, currentRoom } = data;
    
    // Update visitor position for analytics
    await analyticsService.updateVisitorPosition(socket.visitorId, position, currentRoom);
    
    // Check for nearby exhibits
    const nearbyExhibits = await exhibitService.getNearbyExhibits(position, 5);
    socket.emit('nearby-exhibits', nearbyExhibits);
  });

  // Audio guide synchronization
  socket.on('audio-guide-progress', async (data) => {
    const { exhibitId, timestamp, language } = data;
    
    // Save progress
    await tourService.saveAudioProgress(socket.visitorId, exhibitId, timestamp);
    
    // Get next audio segment
    const nextSegment = await tourService.getNextAudioSegment(exhibitId, timestamp, language);
    if (nextSegment) {
      socket.emit('audio-guide-next', nextSegment);
    }
  });

  // Educational quiz participation
  socket.on('quiz-answer', async (data) => {
    const { quizId, questionId, answer } = data;
    
    // Process answer
    const result = await educationService.processQuizAnswer(
      socket.visitorId,
      quizId,
      questionId,
      answer
    );
    
    socket.emit('quiz-result', result);
    
    // Update leaderboard
    if (result.completed) {
      const leaderboard = await educationService.getLeaderboard(quizId);
      io.emit('leaderboard-update', { quizId, leaderboard });
    }
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    logger.info(`Visitor ${socket.visitorId} disconnected`);
    
    // Notify tour participants
    const rooms = Array.from(socket.rooms);
    rooms.forEach(room => {
      if (room.startsWith('tour-')) {
        socket.to(room).emit('visitor-left', {
          visitorId: socket.visitorId,
          timestamp: new Date()
        });
      }
    });
  });
});

// Scheduled tasks
if (process.env.NODE_ENV === 'production') {
  // Process 3D models in queue
  cron.schedule('*/5 * * * *', async () => {
    logger.info('Processing 3D model queue...');
    await modelProcessingService.processQueue();
  });

  // Generate analytics reports
  cron.schedule('0 1 * * *', async () => {
    logger.info('Generating daily analytics reports...');
    await analyticsService.generateDailyReports();
  });

  // Clean up temporary files
  cron.schedule('0 3 * * *', async () => {
    logger.info('Cleaning up temporary files...');
    await fileService.cleanupTempFiles();
  });

  // Update trending exhibits
  cron.schedule('0 * * * *', async () => {
    logger.info('Updating trending exhibits...');
    await exhibitService.updateTrending();
  });

  // Send event reminders
  cron.schedule('0 9 * * *', async () => {
    logger.info('Sending event reminders...');
    await notificationService.sendEventReminders();
  });

  // Backup media files
  if (process.env.BACKUP_ENABLED === 'true') {
    cron.schedule(process.env.BACKUP_SCHEDULE || '0 3 * * *', async () => {
      logger.info('Starting scheduled backup...');
      await backupService.performBackup();
    });
  }

  // Update AI descriptions
  cron.schedule('0 2 * * 0', async () => {
    logger.info('Updating AI-generated descriptions...');
    await aiService.updateDescriptions();
  });

  // Cache popular content
  cron.schedule('*/30 * * * *', async () => {
    logger.info('Updating content cache...');
    await cacheService.updatePopularContent();
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

    // Initialize services
    await modelProcessingService.initialize();
    await analyticsService.initialize();
    logger.info('Services initialized successfully');

    // Start server
    const PORT = process.env.PORT || 3006;
    httpServer.listen(PORT, () => {
      logger.info(`Sanal Müze Platformu server running on port ${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV}`);
      logger.info(`Real-time features enabled on WebSocket`);
      logger.info(`AR/VR support: ${process.env.AR_ENABLED === 'true' ? 'enabled' : 'disabled'}`);
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