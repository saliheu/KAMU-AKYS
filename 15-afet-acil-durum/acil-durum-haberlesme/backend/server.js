require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const http = require('http');
const socketIo = require('socket.io');
const cron = require('node-cron');
const winston = require('winston');
const { sequelize } = require('./config/database');
const { createClient } = require('redis');
const { connectRabbitMQ } = require('./config/rabbitmq');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
  }
});

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'emergency.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});

const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

redisClient.on('error', err => logger.error('Redis Client Error', err));
redisClient.connect();

app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.set('io', io);
app.set('redisClient', redisClient);
app.set('logger', logger);

const authRoutes = require('./routes/auth');
const alertRoutes = require('./routes/alerts');
const communicationRoutes = require('./routes/communications');
const teamRoutes = require('./routes/teams');
const channelRoutes = require('./routes/channels');
const broadcastRoutes = require('./routes/broadcasts');
const locationRoutes = require('./routes/locations');
const resourceRoutes = require('./routes/resources');
const reportRoutes = require('./routes/reports');
const adminRoutes = require('./routes/admin');

app.use('/api/auth', authRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/communications', communicationRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/channels', channelRoutes);
app.use('/api/broadcasts', broadcastRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/admin', adminRoutes);

// Socket.IO for real-time communication
io.on('connection', (socket) => {
  logger.info('New client connected:', socket.id);

  socket.on('join-emergency', (emergencyId) => {
    socket.join(`emergency-${emergencyId}`);
    logger.info(`Socket ${socket.id} joined emergency-${emergencyId}`);
  });

  socket.on('join-channel', (channelId) => {
    socket.join(`channel-${channelId}`);
    logger.info(`Socket ${socket.id} joined channel-${channelId}`);
  });

  socket.on('emergency-message', async (data) => {
    const { emergencyId, message, userId, priority } = data;
    
    // Broadcast to all users in the emergency room
    io.to(`emergency-${emergencyId}`).emit('new-message', {
      message,
      userId,
      priority,
      timestamp: new Date()
    });

    // Log critical messages
    if (priority === 'critical') {
      logger.warn('Critical emergency message:', data);
    }
  });

  socket.on('location-update', (data) => {
    const { userId, location, emergencyId } = data;
    
    // Update user location in Redis
    redisClient.setex(
      `location:${userId}`,
      300, // 5 minutes TTL
      JSON.stringify({ ...location, timestamp: new Date() })
    );

    // Broadcast location update to emergency room
    io.to(`emergency-${emergencyId}`).emit('team-location-update', {
      userId,
      location
    });
  });

  socket.on('disconnect', () => {
    logger.info('Client disconnected:', socket.id);
  });
});

// Scheduled jobs
cron.schedule('*/5 * * * *', async () => {
  logger.info('Running system health check...');
  const { performHealthCheck } = require('./jobs/healthCheck');
  await performHealthCheck();
});

cron.schedule('*/15 * * * *', async () => {
  logger.info('Checking alert escalations...');
  const { checkAlertEscalations } = require('./jobs/alertJobs');
  await checkAlertEscalations();
});

cron.schedule('0 * * * *', async () => {
  logger.info('Generating hourly reports...');
  const { generateHourlyReports } = require('./jobs/reportJobs');
  await generateHourlyReports();
});

// Error handling
app.use((err, req, res, next) => {
  logger.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await sequelize.sync({ alter: true });
    await connectRabbitMQ();
    
    server.listen(PORT, () => {
      logger.info(`Emergency Communication System running on port ${PORT}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();