const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const { createServer } = require('http');
const { Server } = require('socket.io');
const session = require('express-session');
const RedisStore = require('connect-redis').default;
const passport = require('passport');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
require('dotenv').config();

// Redis client
const redis = require('./config/redis');

// Database connection
const { sequelize } = require('./config/database');

// Passport configuration
require('./config/passport');

// Middleware imports
const errorHandler = require('./middleware/errorHandler');
const rateLimiter = require('./middleware/rateLimiter');
const authMiddleware = require('./middleware/auth');
const roleMiddleware = require('./middleware/roles');

// Route imports
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const appointmentRoutes = require('./routes/appointments');
const courtRoutes = require('./routes/courts');
const judgeRoutes = require('./routes/judges');
const lawyerRoutes = require('./routes/lawyers');
const caseRoutes = require('./routes/cases');
const calendarRoutes = require('./routes/calendar');
const notificationRoutes = require('./routes/notifications');
const documentRoutes = require('./routes/documents');
const reportRoutes = require('./routes/reports');
const settingsRoutes = require('./routes/settings');
const integrationRoutes = require('./routes/integrations');
const videoConferenceRoutes = require('./routes/videoConference');

// Initialize Express app
const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3001',
    credentials: true
  }
});

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Mahkeme Randevu API',
      version: '1.0.0',
      description: 'Mahkeme randevu sistemi API dokümantasyonu'
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 3000}`,
        description: 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    }
  },
  apis: ['./routes/*.js']
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Trust proxy
app.set('trust proxy', 1);

// Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://uyap.adalet.gov.tr"],
    },
  },
}));
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3001',
  credentials: true
}));
app.use(compression());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Session configuration
app.use(session({
  store: new RedisStore({ client: redis }),
  secret: process.env.SESSION_SECRET || 'mahkeme-randevu-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: parseInt(process.env.SESSION_TIMEOUT) || 1800000 // 30 minutes
  }
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Static files
app.use('/uploads', express.static('uploads'));
app.use('/documents', authMiddleware, express.static('documents'));

// API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Rate limiting
app.use('/api/', rateLimiter);

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', authMiddleware, userRoutes);
app.use('/api/v1/appointments', authMiddleware, appointmentRoutes);
app.use('/api/v1/courts', authMiddleware, courtRoutes);
app.use('/api/v1/judges', authMiddleware, roleMiddleware(['admin', 'court_clerk']), judgeRoutes);
app.use('/api/v1/lawyers', authMiddleware, lawyerRoutes);
app.use('/api/v1/cases', authMiddleware, caseRoutes);
app.use('/api/v1/calendar', authMiddleware, calendarRoutes);
app.use('/api/v1/notifications', authMiddleware, notificationRoutes);
app.use('/api/v1/documents', authMiddleware, documentRoutes);
app.use('/api/v1/reports', authMiddleware, roleMiddleware(['admin', 'court_manager']), reportRoutes);
app.use('/api/v1/settings', authMiddleware, roleMiddleware(['admin']), settingsRoutes);
app.use('/api/v1/integrations', authMiddleware, roleMiddleware(['admin']), integrationRoutes);
app.use('/api/v1/video-conference', authMiddleware, videoConferenceRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'Mahkeme Randevu API',
    version: '1.0.0',
    uptime: process.uptime()
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Mahkeme Randevu Sistemi API',
    version: '1.0.0',
    documentation: '/api-docs',
    status: 'Active'
  });
});

// Socket.io for real-time updates
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  // Join court room for real-time updates
  socket.on('join-court', (courtId) => {
    socket.join(`court-${courtId}`);
    console.log(`Client joined court room: ${courtId}`);
  });

  // Join judge room for real-time notifications
  socket.on('join-judge', (judgeId) => {
    socket.join(`judge-${judgeId}`);
    console.log(`Judge joined room: ${judgeId}`);
  });

  // Real-time appointment updates
  socket.on('appointment-update', (data) => {
    io.to(`court-${data.courtId}`).emit('appointment-changed', {
      appointmentId: data.appointmentId,
      status: data.status,
      timestamp: new Date()
    });
  });

  // Real-time calendar updates
  socket.on('calendar-update', (data) => {
    io.to(`court-${data.courtId}`).emit('calendar-changed', {
      date: data.date,
      availableSlots: data.availableSlots,
      timestamp: new Date()
    });
  });

  // Emergency notifications
  socket.on('emergency-notification', (data) => {
    io.emit('emergency-alert', {
      message: data.message,
      severity: data.severity,
      courtId: data.courtId,
      timestamp: new Date()
    });
  });

  // Video conference room events
  socket.on('join-hearing', (hearingId) => {
    socket.join(`hearing-${hearingId}`);
    io.to(`hearing-${hearingId}`).emit('participant-joined', {
      userId: socket.userId,
      timestamp: new Date()
    });
  });

  socket.on('leave-hearing', (hearingId) => {
    socket.leave(`hearing-${hearingId}`);
    io.to(`hearing-${hearingId}`).emit('participant-left', {
      userId: socket.userId,
      timestamp: new Date()
    });
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Background jobs
const cron = require('node-cron');

// Send appointment reminders daily at 8 AM
cron.schedule('0 8 * * *', () => {
  console.log('Running appointment reminder job...');
  require('./jobs/appointmentReminders')();
});

// Generate daily court calendars at midnight
cron.schedule('0 0 * * *', () => {
  console.log('Generating court calendars...');
  require('./jobs/calendarGenerator')();
});

// Sync with UYAP every hour
cron.schedule('0 * * * *', () => {
  console.log('Syncing with UYAP...');
  require('./jobs/uyapSync')();
});

// Clean expired appointments weekly
cron.schedule('0 2 * * 0', () => {
  console.log('Cleaning expired appointments...');
  require('./jobs/dataCleanup')();
});

// Backup system data daily at 2 AM
cron.schedule('0 2 * * *', () => {
  console.log('Creating system backup...');
  require('./jobs/systemBackup')();
});

// Generate weekly reports on Mondays at 6 AM
cron.schedule('0 6 * * 1', () => {
  console.log('Generating weekly reports...');
  require('./jobs/reportGenerator')();
});

// Make io accessible to routes
app.set('io', io);

// Error handling middleware (must be last)
app.use(errorHandler);

// Handle 404
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: 'The requested resource was not found'
  });
});

// Start server
const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    // Connect to PostgreSQL
    await sequelize.authenticate();
    console.log('PostgreSQL connection established successfully.');
    
    // Sync database models
    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync({ alter: true });
      console.log('Database models synchronized.');
    }

    // Connect to Redis
    await redis.connect();
    console.log('Redis connection established successfully.');

    // Test UYAP connection
    try {
      const uyapService = require('./services/uyapService');
      await uyapService.testConnection();
      console.log('UYAP connection test successful.');
    } catch (error) {
      console.warn('UYAP connection test failed:', error.message);
    }

    // Initialize holiday calendar
    const holidayService = require('./services/holidayService');
    await holidayService.loadHolidays();
    console.log('Holiday calendar loaded.');

    // Start background jobs
    console.log('Background jobs initialized.');

    // Start server
    server.listen(PORT, () => {
      console.log(`Mahkeme Randevu API server is running on port ${PORT}`);
      console.log(`API Documentation: http://localhost:${PORT}/api-docs`);
      console.log(`Environment: ${process.env.NODE_ENV}`);
      console.log(`Court working hours: ${process.env.COURT_OPEN_TIME} - ${process.env.COURT_CLOSE_TIME}`);
    });
  } catch (error) {
    console.error('Unable to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(async () => {
    console.log('HTTP server closed');
    
    try {
      await sequelize.close();
      console.log('PostgreSQL connection closed');
      
      await redis.quit();
      console.log('Redis connection closed');
      
      process.exit(0);
    } catch (error) {
      console.error('Error during shutdown:', error);
      process.exit(1);
    }
  });
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

// Start the server
startServer();