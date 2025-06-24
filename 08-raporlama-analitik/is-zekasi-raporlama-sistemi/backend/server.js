require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const { createServer } = require('http');
const { Server } = require('socket.io');
const connectDB = require('./config/database');
const connectRedis = require('./config/redis');
const connectClickHouse = require('./config/clickhouse');
const { connectKafka } = require('./config/kafka');
const setupCronJobs = require('./jobs');

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
  }
});

// Middleware
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/dashboards', require('./routes/dashboards'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/datasets', require('./routes/datasets'));
app.use('/api/visualizations', require('./routes/visualizations'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/alerts', require('./routes/alerts'));
app.use('/api/exports', require('./routes/exports'));

// Socket.io for real-time updates
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  socket.on('join:dashboard', (dashboardId) => {
    socket.join(`dashboard:${dashboardId}`);
  });
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Make io accessible
app.set('io', io);

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await connectDB();
    await connectRedis();
    await connectClickHouse();
    await connectKafka();
    setupCronJobs();
    
    httpServer.listen(PORT, () => {
      console.log(`BI Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();