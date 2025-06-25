const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const { createServer } = require('http');
const { Server } = require('socket.io');
const session = require('express-session');
const RedisStore = require('connect-redis').default;
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
require('dotenv').config();

// Redis client
const redis = require('./config/redis');

// Database connections
const { sequelize } = require('./config/database');
const { connectMongoDB } = require('./config/mongodb');

// Middleware imports
const errorHandler = require('./middleware/errorHandler');
const rateLimiter = require('./middleware/rateLimiter');
const authMiddleware = require('./middleware/auth');

// Route imports
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const contactRoutes = require('./routes/contacts');
const locationRoutes = require('./routes/locations');
const notificationRoutes = require('./routes/notifications');
const healthRoutes = require('./routes/health');
const qrRoutes = require('./routes/qr');
const reportRoutes = require('./routes/reports');
const exposureRoutes = require('./routes/exposures');
const testRoutes = require('./routes/tests');
const vaccinationRoutes = require('./routes/vaccinations');
const statisticsRoutes = require('./routes/statistics');

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
      title: 'Temaslı Takip API',
      version: '1.0.0',
      description: 'Pandemi döneminde temaslı takibi için API dokümantasyonu'
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
  secret: process.env.SESSION_SECRET || 'temasli-takip-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: parseInt(process.env.SESSION_TIMEOUT) || 1800000 // 30 minutes
  }
}));

// Static files
app.use('/uploads', express.static('uploads'));

// API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Rate limiting
app.use('/api/', rateLimiter);

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', authMiddleware, userRoutes);
app.use('/api/v1/contacts', authMiddleware, contactRoutes);
app.use('/api/v1/locations', authMiddleware, locationRoutes);
app.use('/api/v1/notifications', authMiddleware, notificationRoutes);
app.use('/api/v1/health', healthRoutes);
app.use('/api/v1/qr', qrRoutes);
app.use('/api/v1/reports', authMiddleware, reportRoutes);
app.use('/api/v1/exposures', authMiddleware, exposureRoutes);
app.use('/api/v1/tests', authMiddleware, testRoutes);
app.use('/api/v1/vaccinations', authMiddleware, vaccinationRoutes);
app.use('/api/v1/statistics', statisticsRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'Temaslı Takip API',
    version: '1.0.0'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Temaslı Takip Sistemi API',
    version: '1.0.0',
    documentation: '/api-docs'
  });
});

// Socket.io for real-time notifications
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  socket.on('join-user-room', (userId) => {
    socket.join(`user-${userId}`);
    console.log(`User ${userId} joined their room`);
  });

  socket.on('join-location-room', (locationId) => {
    socket.join(`location-${locationId}`);
    console.log(`Joined location room: ${locationId}`);
  });

  socket.on('exposure-alert', (data) => {
    // Notify potentially exposed users
    io.to(`user-${data.userId}`).emit('exposure-notification', {
      message: 'Potansiyel temas tespit edildi',
      exposureDate: data.date,
      location: data.location,
      riskLevel: data.riskLevel
    });
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
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

    // Connect to MongoDB
    await connectMongoDB();
    console.log('MongoDB connection established successfully.');

    // Connect to Redis
    await redis.connect();
    console.log('Redis connection established successfully.');

    // Start background jobs
    require('./jobs/contactTracing');
    require('./jobs/dataCleanup');
    require('./jobs/notifications');
    require('./jobs/statistics');

    // Start server
    server.listen(PORT, () => {
      console.log(`Temaslı Takip API server is running on port ${PORT}`);
      console.log(`API Documentation: http://localhost:${PORT}/api-docs`);
      console.log(`Environment: ${process.env.NODE_ENV}`);
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