require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const http = require('http');
const socketIo = require('socket.io');
const mqtt = require('mqtt');
const cron = require('node-cron');
const winston = require('winston');
const { sequelize } = require('./config/database');
const { connectInfluxDB } = require('./config/influxdb');
const { connectRedis } = require('./config/redis');

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

app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.set('io', io);
app.set('logger', logger);

const authRoutes = require('./routes/auth');
const infrastructureRoutes = require('./routes/infrastructure');
const sensorRoutes = require('./routes/sensors');
const alertRoutes = require('./routes/alerts');
const metricsRoutes = require('./routes/metrics');
const maintenanceRoutes = require('./routes/maintenance');
const reportRoutes = require('./routes/reports');
const adminRoutes = require('./routes/admin');

app.use('/api/auth', authRoutes);
app.use('/api/infrastructure', infrastructureRoutes);
app.use('/api/sensors', sensorRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/metrics', metricsRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/admin', adminRoutes);

// MQTT Client for IoT sensors
const mqttClient = mqtt.connect(process.env.MQTT_BROKER_URL || 'mqtt://localhost:1883');
app.set('mqttClient', mqttClient);

mqttClient.on('connect', () => {
  logger.info('Connected to MQTT broker');
  mqttClient.subscribe('sensors/+/data');
  mqttClient.subscribe('sensors/+/status');
  mqttClient.subscribe('alerts/+');
});

mqttClient.on('message', async (topic, message) => {
  try {
    const data = JSON.parse(message.toString());
    const topicParts = topic.split('/');
    
    if (topicParts[0] === 'sensors') {
      const sensorId = topicParts[1];
      const messageType = topicParts[2];
      
      const { processSensorData } = require('./services/sensorService');
      await processSensorData(sensorId, messageType, data);
      
      io.emit('sensor-update', {
        sensorId,
        type: messageType,
        data
      });
    } else if (topicParts[0] === 'alerts') {
      const { processAlert } = require('./services/alertService');
      await processAlert(data);
      
      io.emit('new-alert', data);
    }
  } catch (error) {
    logger.error('Error processing MQTT message:', error);
  }
});

// Socket.IO connections
io.on('connection', (socket) => {
  logger.info('New client connected:', socket.id);

  socket.on('subscribe-infrastructure', (infrastructureId) => {
    socket.join(`infrastructure-${infrastructureId}`);
  });

  socket.on('unsubscribe-infrastructure', (infrastructureId) => {
    socket.leave(`infrastructure-${infrastructureId}`);
  });

  socket.on('disconnect', () => {
    logger.info('Client disconnected:', socket.id);
  });
});

// Scheduled jobs
cron.schedule('*/5 * * * *', async () => {
  logger.info('Running infrastructure health check...');
  const { performHealthCheck } = require('./jobs/healthCheck');
  await performHealthCheck();
});

cron.schedule('*/15 * * * *', async () => {
  logger.info('Collecting infrastructure metrics...');
  const { collectMetrics } = require('./jobs/metricsCollector');
  await collectMetrics();
});

cron.schedule('0 */1 * * *', async () => {
  logger.info('Checking maintenance schedules...');
  const { checkMaintenanceSchedules } = require('./jobs/maintenanceJobs');
  await checkMaintenanceSchedules();
});

cron.schedule('0 2 * * *', async () => {
  logger.info('Running daily reports...');
  const { generateDailyReports } = require('./jobs/reportJobs');
  await generateDailyReports();
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
    await connectInfluxDB();
    await connectRedis();
    
    server.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();