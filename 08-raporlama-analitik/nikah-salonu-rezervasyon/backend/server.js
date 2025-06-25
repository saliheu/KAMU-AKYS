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
const reservationRoutes = require('./routes/reservations');
const venueRoutes = require('./routes/venues');
const ceremonyRoutes = require('./routes/ceremonies');
const documentRoutes = require('./routes/documents');
const paymentRoutes = require('./routes/payments');
const availabilityRoutes = require('./routes/availability');
const notificationRoutes = require('./routes/notifications');
const reportRoutes = require('./routes/reports');
const calendarRoutes = require('./routes/calendar');
const guestRoutes = require('./routes/guests');
const settingsRoutes = require('./routes/settings');

// Import middleware
const errorHandler = require('./middleware/errorHandler');
const { authenticate } = require('./middleware/auth');

// Import services
const { initializeDatabase } = require('./config/database');
const { initializeRedis } = require('./config/redis');
const logger = require('./utils/logger');
const { reservationService } = require('./services/reservation');
const { notificationService } = require('./services/notification');
const { documentService } = require('./services/document');
const { calendarService } = require('./services/calendar');

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

// Stricter rate limiting for reservations
const reservationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // Max 5 reservation attempts per hour
  message: 'Too many reservation attempts, please try again later.'
});

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
      notifications: 'active',
      calendar: 'synced'
    }
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/reservations', reservationLimiter, reservationRoutes);
app.use('/api/venues', venueRoutes);
app.use('/api/ceremonies', authenticate, ceremonyRoutes);
app.use('/api/documents', authenticate, documentRoutes);
app.use('/api/payments', authenticate, paymentRoutes);
app.use('/api/availability', availabilityRoutes);
app.use('/api/notifications', authenticate, notificationRoutes);
app.use('/api/reports', authenticate, reportRoutes);
app.use('/api/calendar', calendarRoutes);
app.use('/api/guests', authenticate, guestRoutes);
app.use('/api/settings', authenticate, settingsRoutes);

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
    // Allow anonymous connections for availability checking
    next();
  }
});

io.on('connection', (socket) => {
  logger.info(`Client connected: ${socket.id}`);

  // Real-time availability updates
  socket.on('check-availability', async (data) => {
    const { venueId, date } = data;
    socket.join(`venue-${venueId}-${date}`);
    
    // Send current availability
    const availability = await reservationService.getAvailability(venueId, date);
    socket.emit('availability-update', availability);
  });

  // Reservation status tracking
  socket.on('track-reservation', async (reservationId) => {
    socket.join(`reservation-${reservationId}`);
    
    // Send current status
    const status = await reservationService.getStatus(reservationId);
    socket.emit('reservation-status', status);
  });

  // Live reservation updates
  socket.on('reservation-made', async (data) => {
    const { venueId, date, timeSlot } = data;
    
    // Notify all users watching this venue/date
    io.to(`venue-${venueId}-${date}`).emit('slot-reserved', {
      timeSlot,
      timestamp: new Date()
    });
    
    // Update availability
    const availability = await reservationService.getAvailability(venueId, date);
    io.to(`venue-${venueId}-${date}`).emit('availability-update', availability);
  });

  // Admin notifications
  socket.on('admin-notification', async (data) => {
    if (socket.userRole === 'admin' || socket.userRole === 'staff') {
      const { type, message, priority } = data;
      
      // Broadcast to all admin/staff users
      io.emit('admin-alert', {
        type,
        message,
        priority,
        timestamp: new Date()
      });
    }
  });

  // Document upload progress
  socket.on('document-upload-progress', (data) => {
    const { reservationId, progress } = data;
    
    // Notify reservation owner
    io.to(`reservation-${reservationId}`).emit('upload-progress', {
      progress,
      timestamp: new Date()
    });
  });

  // Guest list updates
  socket.on('guest-list-update', async (data) => {
    const { reservationId, guests } = data;
    
    // Update guest list
    await reservationService.updateGuestList(reservationId, guests);
    
    // Notify all parties
    io.to(`reservation-${reservationId}`).emit('guests-updated', {
      guestCount: guests.length,
      timestamp: new Date()
    });
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    logger.info(`Client disconnected: ${socket.id}`);
  });
});

// Scheduled tasks
if (process.env.NODE_ENV === 'production') {
  // Send reservation reminders
  cron.schedule('0 9 * * *', async () => {
    logger.info('Sending reservation reminders...');
    await notificationService.sendReminders();
  });

  // Check document expiry
  cron.schedule('0 10 * * *', async () => {
    logger.info('Checking document expiry...');
    await documentService.checkExpiredDocuments();
  });

  // Clean up old reservations
  cron.schedule('0 2 * * *', async () => {
    logger.info('Cleaning up old reservations...');
    await reservationService.cleanupOldReservations();
  });

  // Generate daily reports
  cron.schedule('0 23 * * *', async () => {
    logger.info('Generating daily reports...');
    await reportService.generateDailyReports();
  });

  // Sync with external calendars
  cron.schedule('*/30 * * * *', async () => {
    logger.info('Syncing with external calendars...');
    await calendarService.syncExternalCalendars();
  });

  // Process pending payments
  cron.schedule('*/15 * * * *', async () => {
    logger.info('Processing pending payments...');
    await paymentService.processPendingPayments();
  });

  // Update venue availability
  cron.schedule('0 0 * * *', async () => {
    logger.info('Updating venue availability...');
    await venueService.updateAvailability();
  });

  // Send post-ceremony surveys
  cron.schedule('0 11 * * *', async () => {
    logger.info('Sending post-ceremony surveys...');
    await notificationService.sendSurveys();
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
    await notificationService.initialize();
    await calendarService.initialize();
    logger.info('Services initialized successfully');

    // Start server
    const PORT = process.env.PORT || 3007;
    httpServer.listen(PORT, () => {
      logger.info(`Nikah Salonu Rezervasyon Sistemi server running on port ${PORT}`);
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