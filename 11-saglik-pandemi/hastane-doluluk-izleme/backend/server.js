const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const WebSocket = require('ws');
const http = require('http');
require('dotenv').config();

const { sequelize } = require('./models');
const { logger } = require('./utils/logger');
const errorHandler = require('./middleware/errorHandler');
const { initializeWebSocket } = require('./websocket');
const { startMonitoring } = require('./services/monitoringService');

// Routes
const authRoutes = require('./routes/auth');
const hospitalsRoutes = require('./routes/hospitals');
const departmentsRoutes = require('./routes/departments');
const occupancyRoutes = require('./routes/occupancy');
const alertsRoutes = require('./routes/alerts');
const reportsRoutes = require('./routes/reports');
const dashboardRoutes = require('./routes/dashboard');

const app = express();
const server = http.createServer(app);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: 'Too many requests from this IP'
});

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3001',
  credentials: true
}));
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));
app.use('/api', limiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/hospitals', hospitalsRoutes);
app.use('/api/departments', departmentsRoutes);
app.use('/api/occupancy', occupancyRoutes);
app.use('/api/alerts', alertsRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date(),
    uptime: process.uptime()
  });
});

// Error handling
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

const PORT = process.env.PORT || 5001;
const WS_PORT = process.env.WEBSOCKET_PORT || 5002;

// Initialize WebSocket server
const wss = new WebSocket.Server({ port: WS_PORT });
initializeWebSocket(wss);

// Database connection and server start
const startServer = async () => {
  try {
    await sequelize.authenticate();
    logger.info('Database connected successfully');
    
    // Sync database in development
    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync({ alter: true });
      logger.info('Database synced');
    }
    
    // Start monitoring service
    startMonitoring();
    
    server.listen(PORT, () => {
      logger.info(`HTTP Server running on port ${PORT}`);
      logger.info(`WebSocket Server running on port ${WS_PORT}`);
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
  server.close();
  wss.close();
  await sequelize.close();
  process.exit(0);
});

module.exports = { app, wss };