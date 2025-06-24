require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const { sequelize } = require('./models');
const { redisClient } = require('./config/redis');
const { setupWorkers } = require('./workers');
const routes = require('./routes');
const errorHandler = require('./middleware/errorHandler');
const socketHandlers = require('./websocket');
const logger = require('./utils/logger');
const scheduler = require('./services/scheduler');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3001'],
    credentials: true
  },
  path: process.env.SOCKET_IO_PATH || '/socket.io'
});

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Afet Koordinasyon Merkezi API',
      version: '1.0.0',
      description: 'Afet yönetimi ve koordinasyon sistemi API dokümantasyonu'
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
  apis: ['./src/routes/*.js']
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Middleware
app.use(helmet({
  crossOriginEmbedderPolicy: false,
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
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3001'],
  credentials: true
}));
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));

// Static files
app.use('/uploads', express.static('uploads'));

// API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Health check
app.get('/health', async (req, res) => {
  try {
    await sequelize.authenticate();
    await redisClient.ping();
    res.json({ 
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        database: 'connected',
        redis: 'connected',
        socket: io.engine.clientsCount
      }
    });
  } catch (error) {
    res.status(503).json({ 
      status: 'unhealthy', 
      error: error.message 
    });
  }
});

// Routes
app.use('/api', routes);

// Error handling
app.use(errorHandler);

// Socket.io setup
socketHandlers(io);

// Make io accessible to routes
app.set('io', io);

// Database connection and server start
const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    // Test database connection
    await sequelize.authenticate();
    logger.info('PostgreSQL bağlantısı başarılı');

    // Sync database models
    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync({ alter: true });
      logger.info('Veritabanı modelleri senkronize edildi');
    }

    // Connect to Redis
    await redisClient.connect();
    logger.info('Redis bağlantısı başarılı');

    // Setup background workers
    await setupWorkers();
    logger.info('Background workers başlatıldı');

    // Start scheduler
    scheduler.start();
    logger.info('Zamanlanmış görevler başlatıldı');

    // Start server
    server.listen(PORT, () => {
      logger.info(`Server ${PORT} portunda çalışıyor`);
      logger.info(`API Dokümantasyonu: http://localhost:${PORT}/api-docs`);
    });
  } catch (error) {
    logger.error('Server başlatılamadı:', error);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM sinyali alındı, server kapatılıyor...');
  
  server.close(() => {
    logger.info('HTTP server kapatıldı');
  });

  try {
    await sequelize.close();
    logger.info('Veritabanı bağlantısı kapatıldı');
    
    await redisClient.quit();
    logger.info('Redis bağlantısı kapatıldı');
    
    scheduler.stop();
    logger.info('Zamanlanmış görevler durduruldu');
    
    process.exit(0);
  } catch (error) {
    logger.error('Graceful shutdown hatası:', error);
    process.exit(1);
  }
});

startServer();