require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const { Server } = require('socket.io');
const { sequelize } = require('./models');
const { logger } = require('./utils/logger');
const { connectRedis } = require('./config/redis');
const { connectInflux } = require('./config/influxdb');
const { initMQTT } = require('./services/mqttService');
const { startCronJobs } = require('./jobs');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
  }
});

// Middleware
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));

// Store io instance for use in other modules
app.set('io', io);

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/stations', require('./routes/stations'));
app.use('/api/sensors', require('./routes/sensors'));
app.use('/api/measurements', require('./routes/measurements'));
app.use('/api/alerts', require('./routes/alerts'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/users', require('./routes/users'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/health', require('./routes/health'));

// WebSocket connection
io.on('connection', (socket) => {
  logger.info(`Client connected: ${socket.id}`);

  socket.on('subscribe', (stationId) => {
    socket.join(`station-${stationId}`);
    logger.info(`Client ${socket.id} subscribed to station ${stationId}`);
  });

  socket.on('unsubscribe', (stationId) => {
    socket.leave(`station-${stationId}`);
    logger.info(`Client ${socket.id} unsubscribed from station ${stationId}`);
  });

  socket.on('disconnect', () => {
    logger.info(`Client disconnected: ${socket.id}`);
  });
});

// Error handling
app.use(errorHandler);

// Initialize services and start server
const startServer = async () => {
  try {
    // Connect to databases
    await sequelize.authenticate();
    logger.info('PostgreSQL connected successfully');
    
    await sequelize.sync({ alter: true });
    logger.info('Database synced');

    await connectRedis();
    logger.info('Redis connected successfully');

    await connectInflux();
    logger.info('InfluxDB connected successfully');

    // Initialize MQTT client
    await initMQTT(io);
    logger.info('MQTT client initialized');

    // Start cron jobs
    startCronJobs();
    logger.info('Cron jobs started');

    // Start server
    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(() => {
    logger.info('HTTP server closed');
  });
  await sequelize.close();
  process.exit(0);
});