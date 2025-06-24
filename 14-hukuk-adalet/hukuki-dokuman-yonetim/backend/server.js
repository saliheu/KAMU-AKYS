require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const cron = require('node-cron');
const winston = require('winston');
const { sequelize } = require('./config/database');
const { createClient } = require('redis');
const { Client: ElasticsearchClient } = require('elasticsearch');

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

const esClient = new ElasticsearchClient({
  host: process.env.ELASTICSEARCH_URL || 'localhost:9200',
  log: 'error'
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
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.set('io', io);
app.set('redisClient', redisClient);
app.set('esClient', esClient);
app.set('logger', logger);

const authRoutes = require('./routes/auth');
const documentRoutes = require('./routes/documents');
const templateRoutes = require('./routes/templates');
const workflowRoutes = require('./routes/workflows');
const versionRoutes = require('./routes/versions');
const shareRoutes = require('./routes/shares');
const signatureRoutes = require('./routes/signatures');
const searchRoutes = require('./routes/search');
const reportRoutes = require('./routes/reports');
const adminRoutes = require('./routes/admin');

app.use('/api/auth', authRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/templates', templateRoutes);
app.use('/api/workflows', workflowRoutes);
app.use('/api/versions', versionRoutes);
app.use('/api/shares', shareRoutes);
app.use('/api/signatures', signatureRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/admin', adminRoutes);

io.on('connection', (socket) => {
  logger.info('New client connected:', socket.id);

  socket.on('join-document', (documentId) => {
    socket.join(`document-${documentId}`);
    logger.info(`Socket ${socket.id} joined document-${documentId}`);
  });

  socket.on('leave-document', (documentId) => {
    socket.leave(`document-${documentId}`);
    logger.info(`Socket ${socket.id} left document-${documentId}`);
  });

  socket.on('disconnect', () => {
    logger.info('Client disconnected:', socket.id);
  });
});

cron.schedule('0 9 * * *', async () => {
  logger.info('Running daily document expiry check...');
  const { checkExpiringDocuments } = require('./jobs/documentJobs');
  await checkExpiringDocuments();
});

cron.schedule('*/30 * * * *', async () => {
  logger.info('Running workflow deadline check...');
  const { checkWorkflowDeadlines } = require('./jobs/workflowJobs');
  await checkWorkflowDeadlines();
});

cron.schedule('0 2 * * *', async () => {
  logger.info('Running daily cleanup...');
  const { cleanupOldVersions } = require('./jobs/cleanupJobs');
  await cleanupOldVersions();
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