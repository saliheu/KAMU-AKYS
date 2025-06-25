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
const examRoutes = require('./routes/exams');
const questionRoutes = require('./routes/questions');
const studentRoutes = require('./routes/students');
const resultRoutes = require('./routes/results');
const sessionRoutes = require('./routes/sessions');
const reportRoutes = require('./routes/reports');
const categoryRoutes = require('./routes/categories');
const notificationRoutes = require('./routes/notifications');
const settingsRoutes = require('./routes/settings');

// Import middleware
const errorHandler = require('./middleware/errorHandler');
const { authenticate } = require('./middleware/auth');

// Import services
const { initializeDatabase } = require('./config/database');
const { initializeRedis } = require('./config/redis');
const logger = require('./utils/logger');
const { examMonitoringService } = require('./services/examMonitoring');
const { backupService } = require('./services/backup');
const { notificationService } = require('./services/notification');

// Create Express app
const app = express();
const httpServer = createServer(app);

// Socket.io configuration for real-time exam monitoring
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

// Exam-specific rate limiting (stricter)
const examLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Max 10 exam attempts per hour
  message: 'Too many exam attempts, please try again later.'
});

// Static files for uploaded content
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/exams', authenticate, examRoutes);
app.use('/api/questions', authenticate, questionRoutes);
app.use('/api/students', authenticate, studentRoutes);
app.use('/api/results', authenticate, resultRoutes);
app.use('/api/sessions', authenticate, examLimiter, sessionRoutes);
app.use('/api/reports', authenticate, reportRoutes);
app.use('/api/categories', authenticate, categoryRoutes);
app.use('/api/notifications', authenticate, notificationRoutes);
app.use('/api/settings', authenticate, settingsRoutes);

// Socket.io for real-time exam monitoring
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    const user = await authenticate(token);
    socket.userId = user.id;
    socket.userRole = user.role;
    next();
  } catch (err) {
    next(new Error('Authentication failed'));
  }
});

io.on('connection', (socket) => {
  logger.info(`User ${socket.userId} connected for exam monitoring`);

  // Join exam room
  socket.on('join-exam', async (examId) => {
    socket.join(`exam-${examId}`);
    logger.info(`User ${socket.userId} joined exam ${examId}`);
  });

  // Monitor student activity
  socket.on('student-activity', async (data) => {
    const { examId, activityType, details } = data;
    await examMonitoringService.logActivity(socket.userId, examId, activityType, details);
    
    // Notify proctors
    io.to(`exam-${examId}-proctors`).emit('student-activity-update', {
      studentId: socket.userId,
      activityType,
      details,
      timestamp: new Date()
    });
  });

  // Handle suspicious behavior detection
  socket.on('suspicious-behavior', async (data) => {
    const { examId, behaviorType, severity } = data;
    await examMonitoringService.reportSuspiciousBehavior(socket.userId, examId, behaviorType, severity);
    
    // Alert proctors
    io.to(`exam-${examId}-proctors`).emit('suspicious-behavior-alert', {
      studentId: socket.userId,
      behaviorType,
      severity,
      timestamp: new Date()
    });
  });

  // Real-time answer submission
  socket.on('submit-answer', async (data) => {
    const { examId, questionId, answer } = data;
    await examMonitoringService.saveAnswer(socket.userId, examId, questionId, answer);
    
    // Acknowledge receipt
    socket.emit('answer-saved', { questionId, timestamp: new Date() });
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    logger.info(`User ${socket.userId} disconnected`);
  });
});

// Scheduled tasks
if (process.env.NODE_ENV === 'production') {
  // Backup database daily at 2 AM
  if (process.env.BACKUP_ENABLED === 'true') {
    cron.schedule(process.env.BACKUP_SCHEDULE || '0 2 * * *', async () => {
      logger.info('Starting scheduled backup...');
      await backupService.performBackup();
    });
  }

  // Clean up expired exam sessions every hour
  cron.schedule('0 * * * *', async () => {
    logger.info('Cleaning up expired exam sessions...');
    await examMonitoringService.cleanupExpiredSessions();
  });

  // Send exam reminders 24 hours before
  cron.schedule('0 9 * * *', async () => {
    logger.info('Sending exam reminders...');
    await notificationService.sendExamReminders();
  });

  // Generate daily reports
  cron.schedule('0 23 * * *', async () => {
    logger.info('Generating daily reports...');
    await reportService.generateDailyReports();
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

    // Start server
    const PORT = process.env.PORT || 3001;
    httpServer.listen(PORT, () => {
      logger.info(`Sınav Yönetim Sistemi server running on port ${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV}`);
      logger.info(`Real-time monitoring enabled on WebSocket`);
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