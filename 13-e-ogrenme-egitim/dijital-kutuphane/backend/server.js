const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const { createServer } = require('http');
const { Server } = require('socket.io');
const path = require('path');
require('dotenv').config();

const { sequelize } = require('./models');
const { connectRedis } = require('./config/redis');
const { connectElasticsearch } = require('./config/elasticsearch');
const errorHandler = require('./middleware/errorHandler');
const logger = require('./utils/logger');
const initializeQueues = require('./queues');
const startScheduledJobs = require('./jobs');

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const bookRoutes = require('./routes/books');
const categoryRoutes = require('./routes/categories');
const authorRoutes = require('./routes/authors');
const publisherRoutes = require('./routes/publishers');
const borrowingRoutes = require('./routes/borrowings');
const reservationRoutes = require('./routes/reservations');
const searchRoutes = require('./routes/search');
const collectionRoutes = require('./routes/collections');
const reviewRoutes = require('./routes/reviews');
const statsRoutes = require('./routes/stats');
const notificationRoutes = require('./routes/notifications');

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true
  }
});

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Socket.io middleware
app.use((req, res, next) => {
  req.io = io;
  next();
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/authors', authorRoutes);
app.use('/api/publishers', publisherRoutes);
app.use('/api/borrowings', borrowingRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/collections', collectionRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/notifications', notificationRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    services: {
      database: sequelize.authenticate() ? 'connected' : 'disconnected',
      redis: 'connected',
      elasticsearch: 'connected'
    }
  });
});

// Error handling
app.use(errorHandler);

// Socket.io connection handling
io.on('connection', (socket) => {
  logger.info(`Client connected: ${socket.id}`);

  socket.on('join-user-room', (userId) => {
    socket.join(`user-${userId}`);
    logger.info(`User ${userId} joined their room`);
  });

  socket.on('disconnect', () => {
    logger.info(`Client disconnected: ${socket.id}`);
  });
});

// Start server
const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    // Connect to databases
    await sequelize.authenticate();
    logger.info('PostgreSQL connected successfully');

    await connectRedis();
    logger.info('Redis connected successfully');

    await connectElasticsearch();
    logger.info('Elasticsearch connected successfully');

    // Sync database models
    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync({ alter: true });
      logger.info('Database synced');
    }

    // Initialize queues
    await initializeQueues();
    logger.info('Queues initialized');

    // Start scheduled jobs
    startScheduledJobs();
    logger.info('Scheduled jobs started');

    // Start HTTP server
    httpServer.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');
  
  httpServer.close(() => {
    logger.info('HTTP server closed');
  });

  await sequelize.close();
  logger.info('Database connection closed');
  
  process.exit(0);
});

module.exports = { app, io };