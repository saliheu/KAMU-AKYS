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
const applicantRoutes = require('./routes/applicants');
const applicationRoutes = require('./routes/applications');
const aidRoutes = require('./routes/aids');
const householdRoutes = require('./routes/households');
const paymentRoutes = require('./routes/payments');
const verificationRoutes = require('./routes/verification');
const reportRoutes = require('./routes/reports');
const notificationRoutes = require('./routes/notifications');
const auditRoutes = require('./routes/audit');
const statisticsRoutes = require('./routes/statistics');
const campaignRoutes = require('./routes/campaigns');

// Import middleware
const errorHandler = require('./middleware/errorHandler');
const { authenticate } = require('./middleware/auth');
const auditLogger = require('./middleware/auditLogger');

// Import services
const { initializeDatabase } = require('./config/database');
const { initializeRedis } = require('./config/redis');
const logger = require('./utils/logger');
const { verificationService } = require('./services/verification');
const { calculationService } = require('./services/calculation');
const { paymentService } = require('./services/payment');
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
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));

// Audit logging for sensitive operations
app.use('/api/applicants', auditLogger);
app.use('/api/applications', auditLogger);
app.use('/api/payments', auditLogger);

// Rate limiting
const limiter = rateLimit({
  windowMs: (process.env.RATE_LIMIT_WINDOW || 15) * 60 * 1000,
  max: process.env.RATE_LIMIT_MAX || 100,
  message: 'Too many requests from this IP, please try again later.'
});

app.use('/api/', limiter);

// Stricter rate limiting for applications
const applicationLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: 3, // Max 3 applications per day
  message: 'Application limit exceeded, please try again tomorrow.'
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
      verification: 'active',
      payment: 'ready'
    }
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/applicants', authenticate, applicantRoutes);
app.use('/api/applications', applicationLimiter, applicationRoutes);
app.use('/api/aids', authenticate, aidRoutes);
app.use('/api/households', authenticate, householdRoutes);
app.use('/api/payments', authenticate, paymentRoutes);
app.use('/api/verification', authenticate, verificationRoutes);
app.use('/api/reports', authenticate, reportRoutes);
app.use('/api/notifications', authenticate, notificationRoutes);
app.use('/api/audit', authenticate, auditRoutes);
app.use('/api/statistics', statisticsRoutes);
app.use('/api/campaigns', authenticate, campaignRoutes);

// Socket.io for real-time updates
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    const user = await authenticate(token);
    socket.userId = user.id;
    socket.userRole = user.role;
    socket.organizationId = user.organizationId;
    next();
  } catch (err) {
    next(new Error('Authentication failed'));
  }
});

io.on('connection', (socket) => {
  logger.info(`User ${socket.userId} connected`);

  // Join organization room
  socket.join(`org-${socket.organizationId}`);

  // Real-time application status updates
  socket.on('track-application', async (applicationId) => {
    socket.join(`application-${applicationId}`);
    
    // Send current status
    const status = await applicationService.getStatus(applicationId);
    socket.emit('application-status', status);
  });

  // Real-time payment notifications
  socket.on('payment-processed', async (data) => {
    const { applicationId, amount, status } = data;
    
    // Notify applicant
    io.to(`application-${applicationId}`).emit('payment-update', {
      applicationId,
      amount,
      status,
      timestamp: new Date()
    });
  });

  // Field verification updates
  socket.on('field-verification', async (data) => {
    const { applicationId, verificationType, result } = data;
    
    // Update verification status
    await verificationService.updateFieldVerification(applicationId, verificationType, result);
    
    // Notify relevant parties
    io.to(`application-${applicationId}`).emit('verification-update', {
      applicationId,
      verificationType,
      result,
      timestamp: new Date()
    });
  });

  // Emergency aid requests
  socket.on('emergency-aid', async (data) => {
    const { applicantId, type, urgency, details } = data;
    
    // Process emergency request
    const request = await aidService.processEmergencyRequest({
      applicantId,
      type,
      urgency,
      details,
      requestedBy: socket.userId
    });
    
    // Notify supervisors
    io.to(`org-${socket.organizationId}`).emit('emergency-aid-request', request);
  });

  // Campaign updates
  socket.on('campaign-donation', async (data) => {
    const { campaignId, amount, donorInfo } = data;
    
    // Process donation
    await campaignService.processDonation(campaignId, amount, donorInfo);
    
    // Update campaign progress
    const progress = await campaignService.getProgress(campaignId);
    io.emit('campaign-progress', {
      campaignId,
      progress,
      timestamp: new Date()
    });
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    logger.info(`User ${socket.userId} disconnected`);
  });
});

// Scheduled tasks
if (process.env.NODE_ENV === 'production') {
  // Daily eligibility checks
  cron.schedule('0 2 * * *', async () => {
    logger.info('Running daily eligibility checks...');
    await verificationService.runDailyEligibilityChecks();
  });

  // Monthly payment processing
  cron.schedule('0 0 1 * *', async () => {
    logger.info('Processing monthly payments...');
    await paymentService.processMonthlyPayments();
  });

  // Income verification updates
  cron.schedule('0 3 * * 1', async () => {
    logger.info('Updating income verifications...');
    await verificationService.updateIncomeVerifications();
  });

  // Generate monthly reports
  cron.schedule('0 4 1 * *', async () => {
    logger.info('Generating monthly reports...');
    await reportService.generateMonthlyReports();
  });

  // Fraud detection analysis
  cron.schedule('0 5 * * *', async () => {
    logger.info('Running fraud detection analysis...');
    await verificationService.runFraudDetection();
  });

  // Update household compositions
  cron.schedule('0 6 * * *', async () => {
    logger.info('Updating household compositions...');
    await householdService.updateCompositions();
  });

  // Send payment reminders
  cron.schedule('0 9 25 * *', async () => {
    logger.info('Sending payment reminders...');
    await notificationService.sendPaymentReminders();
  });

  // Archive old applications
  cron.schedule('0 1 * * 0', async () => {
    logger.info('Archiving old applications...');
    await applicationService.archiveOldApplications();
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

    // Initialize external services
    await verificationService.initialize();
    await paymentService.initialize();
    logger.info('External services initialized');

    // Start server
    const PORT = process.env.PORT || 3005;
    httpServer.listen(PORT, () => {
      logger.info(`Sosyal Yardım Takip Sistemi server running on port ${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV}`);
      logger.info(`Real-time updates enabled on WebSocket`);
      logger.info(`Audit logging: ${process.env.AUDIT_ENABLED === 'true' ? 'enabled' : 'disabled'}`);
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