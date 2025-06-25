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

// Database connection
const { sequelize } = require('./config/database');

// MQTT client for IoT devices
const mqttClient = require('./config/mqtt');

// InfluxDB client for sensor data
const influxClient = require('./config/influxdb');

// Middleware imports
const errorHandler = require('./middleware/errorHandler');
const rateLimiter = require('./middleware/rateLimiter');
const authMiddleware = require('./middleware/auth');

// Route imports
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const parkingRoutes = require('./routes/parking');
const vehicleRoutes = require('./routes/vehicles');
const reservationRoutes = require('./routes/reservations');
const paymentRoutes = require('./routes/payments');
const sensorRoutes = require('./routes/sensors');
const reportRoutes = require('./routes/reports');
const subscriptionRoutes = require('./routes/subscriptions');
const violationRoutes = require('./routes/violations');
const zoneRoutes = require('./routes/zones');
const barrierRoutes = require('./routes/barriers');

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
      title: 'Otopark Yönetim API',
      version: '1.0.0',
      description: 'Akıllı otopark yönetim sistemi API dokümantasyonu'
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
  secret: process.env.SESSION_SECRET || 'otopark-secret',
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
app.use('/camera-feeds', express.static('camera-feeds'));

// API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Rate limiting
app.use('/api/', rateLimiter);

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', authMiddleware, userRoutes);
app.use('/api/v1/parking', parkingRoutes);
app.use('/api/v1/vehicles', authMiddleware, vehicleRoutes);
app.use('/api/v1/reservations', authMiddleware, reservationRoutes);
app.use('/api/v1/payments', authMiddleware, paymentRoutes);
app.use('/api/v1/sensors', sensorRoutes);
app.use('/api/v1/reports', authMiddleware, reportRoutes);
app.use('/api/v1/subscriptions', authMiddleware, subscriptionRoutes);
app.use('/api/v1/violations', authMiddleware, violationRoutes);
app.use('/api/v1/zones', zoneRoutes);
app.use('/api/v1/barriers', authMiddleware, barrierRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'Otopark Yönetim API',
    version: '1.0.0'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Otopark Yönetim Sistemi API',
    version: '1.0.0',
    documentation: '/api-docs'
  });
});

// Socket.io for real-time updates
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  // Join parking zone room
  socket.on('join-zone', (zoneId) => {
    socket.join(`zone-${zoneId}`);
    console.log(`Client joined zone: ${zoneId}`);
  });

  // Real-time parking spot updates
  socket.on('spot-update', (data) => {
    io.to(`zone-${data.zoneId}`).emit('spot-status-changed', {
      spotId: data.spotId,
      status: data.status,
      timestamp: new Date()
    });
  });

  // Barrier control notifications
  socket.on('barrier-action', (data) => {
    io.emit('barrier-status', {
      barrierId: data.barrierId,
      action: data.action,
      status: data.status
    });
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// MQTT message handling for IoT sensors
mqttClient.on('message', (topic, message) => {
  const data = JSON.parse(message.toString());
  
  if (topic.includes('sensor/parking')) {
    // Handle parking sensor data
    io.emit('sensor-update', {
      type: 'parking',
      data: data
    });
    
    // Store in InfluxDB
    storeSensorData('parking', data);
  } else if (topic.includes('camera/plate')) {
    // Handle plate recognition data
    io.emit('plate-detected', {
      plate: data.plate,
      confidence: data.confidence,
      timestamp: data.timestamp
    });
  }
});

// Store sensor data in InfluxDB
async function storeSensorData(type, data) {
  try {
    await influxClient.writePoint({
      measurement: type,
      tags: data.tags,
      fields: data.fields,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Error storing sensor data:', error);
  }
}

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

    // Subscribe to MQTT topics
    mqttClient.subscribe('sensor/parking/+/status');
    mqttClient.subscribe('camera/plate/+/detection');
    mqttClient.subscribe('barrier/+/status');
    console.log('MQTT subscriptions active.');

    // Start background jobs
    require('./jobs/parkingMonitor');
    require('./jobs/paymentProcessor');
    require('./jobs/reportGenerator');
    require('./jobs/plateRecognition');

    // Start server
    server.listen(PORT, () => {
      console.log(`Otopark Yönetim API server is running on port ${PORT}`);
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
      
      mqttClient.end();
      console.log('MQTT connection closed');
      
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