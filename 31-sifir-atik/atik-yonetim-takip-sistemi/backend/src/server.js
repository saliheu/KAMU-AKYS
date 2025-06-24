const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const { createServer } = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const { sequelize } = require('./config/database');
const { logger } = require('./utils/logger');
const routes = require('./routes');
const errorHandler = require('./middleware/errorHandler');
const { startWorkers } = require('./workers');
const { scheduleJobs } = require('./services/scheduler');

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost',
    credentials: true
  }
});

const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Logging
app.use(morgan('combined', { stream: { write: msg => logger.info(msg.trim()) } }));

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(compression());

// Socket.io middleware
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: 'waste-management-backend'
  });
});

// API routes
app.use('/api', routes);

// Error handling
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint bulunamadı' });
});

// Socket.io connection handling
io.on('connection', (socket) => {
  logger.info(`New client connected: ${socket.id}`);
  
  socket.on('join-institution', (institutionId) => {
    socket.join(`institution-${institutionId}`);
    logger.info(`Client ${socket.id} joined institution ${institutionId}`);
  });
  
  socket.on('disconnect', () => {
    logger.info(`Client disconnected: ${socket.id}`);
  });
});

// Database connection and server start
const startServer = async () => {
  try {
    await sequelize.authenticate();
    logger.info('Veritabanı bağlantısı başarılı');
    
    // Sync database in development
    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync({ alter: true });
      logger.info('Veritabanı tabloları senkronize edildi');
    }
    
    // Start background workers
    await startWorkers();
    logger.info('Background workers başlatıldı');
    
    // Schedule cron jobs
    scheduleJobs();
    logger.info('Zamanlanmış işler başlatıldı');
    
    httpServer.listen(PORT, () => {
      logger.info(`Server ${PORT} portunda çalışıyor`);
    });
  } catch (error) {
    logger.error('Server başlatılamadı:', error);
    process.exit(1);
  }
};

startServer();

module.exports = { app, io };