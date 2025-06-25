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
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
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
const requestRoutes = require('./routes/requests');
const categoryRoutes = require('./routes/categories');
const institutionRoutes = require('./routes/institutions');
const documentRoutes = require('./routes/documents');
const trackingRoutes = require('./routes/tracking');
const statisticsRoutes = require('./routes/statistics');
const adminRoutes = require('./routes/admin');
const publicRoutes = require('./routes/public');

app.use('/api/auth', authRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/institutions', institutionRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/tracking', trackingRoutes);
app.use('/api/statistics', statisticsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/public', publicRoutes);

io.on('connection', (socket) => {
  logger.info('New client connected:', socket.id);

  socket.on('join-request', (requestId) => {
    socket.join(`request-${requestId}`);
    logger.info(`Socket ${socket.id} joined request-${requestId}`);
  });

  socket.on('leave-request', (requestId) => {
    socket.leave(`request-${requestId}`);
    logger.info(`Socket ${socket.id} left request-${requestId}`);
  });

  socket.on('disconnect', () => {
    logger.info('Client disconnected:', socket.id);
  });
});

// Scheduled jobs
cron.schedule('0 9 * * *', async () => {
  logger.info('Running daily deadline check...');
  const { checkDeadlines } = require('./jobs/deadlineJobs');
  await checkDeadlines();
});

cron.schedule('*/30 * * * *', async () => {
  logger.info('Running auto-assignment check...');
  const { autoAssignRequests } = require('./jobs/assignmentJobs');
  await autoAssignRequests();
});

cron.schedule('0 0 * * *', async () => {
  logger.info('Generating daily statistics...');
  const { generateDailyStats } = require('./jobs/statisticsJobs');
  await generateDailyStats();
});

app.use((err, req, res, next) => {
  logger.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

const PORT = process.env.PORT || 5000;

sequelize.sync({ alter: true }).then(() => {
  server.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
  });
}).catch(err => {
  logger.error('Database connection failed:', err);
  process.exit(1);
});