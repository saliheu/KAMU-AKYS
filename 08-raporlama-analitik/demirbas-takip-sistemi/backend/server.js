const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const { createServer } = require('http');
const { Server } = require('socket.io');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
const path = require('path');
const cron = require('node-cron');

// Load environment variables
dotenv.config();

// Import routes
const authRoutes = require('./routes/auth');
const assetRoutes = require('./routes/assets');
const categoryRoutes = require('./routes/categories');
const locationRoutes = require('./routes/locations');
const assignmentRoutes = require('./routes/assignments');
const maintenanceRoutes = require('./routes/maintenance');
const inventoryRoutes = require('./routes/inventory');
const reportRoutes = require('./routes/reports');
const barcodeRoutes = require('./routes/barcodes');
const depreciationRoutes = require('./routes/depreciation');
const disposalRoutes = require('./routes/disposal');
const auditRoutes = require('./routes/audit');
const notificationRoutes = require('./routes/notifications');

// Import middleware
const errorHandler = require('./middleware/errorHandler');
const { authenticate } = require('./middleware/auth');
const auditLogger = require('./middleware/auditLogger');

// Import services
const { initializeDatabase } = require('./config/database');
const { initializeRedis } = require('./config/redis');
const logger = require('./utils/logger');
const { assetTrackingService } = require('./services/assetTracking');
const { maintenanceService } = require('./services/maintenance');
const { depreciationService } = require('./services/depreciation');
const { notificationService } = require('./services/notification');

// Create Express app
const app = express();
const httpServer = createServer(app);

// Socket.io configuration for real-time tracking
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Middleware
app.use(helmet());
app.use(compression());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));

// Audit logging for asset operations
app.use('/api/assets', auditLogger);
app.use('/api/assignments', auditLogger);
app.use('/api/disposal', auditLogger);

// Rate limiting
const limiter = rateLimit({
  windowMs: (process.env.RATE_LIMIT_WINDOW || 15) * 60 * 1000,
  max: process.env.RATE_LIMIT_MAX || 100,
  message: 'Too many requests from this IP, please try again later.'
});

app.use('/api/', limiter);

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    services: {
      database: 'connected',
      redis: 'connected',
      tracking: 'active',
      maintenance: 'scheduled'
    }
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/assets', authenticate, assetRoutes);
app.use('/api/categories', authenticate, categoryRoutes);
app.use('/api/locations', authenticate, locationRoutes);
app.use('/api/assignments', authenticate, assignmentRoutes);
app.use('/api/maintenance', authenticate, maintenanceRoutes);
app.use('/api/inventory', authenticate, inventoryRoutes);
app.use('/api/reports', authenticate, reportRoutes);
app.use('/api/barcodes', authenticate, barcodeRoutes);
app.use('/api/depreciation', authenticate, depreciationRoutes);
app.use('/api/disposal', authenticate, disposalRoutes);
app.use('/api/audit', authenticate, auditRoutes);
app.use('/api/notifications', authenticate, notificationRoutes);

// Socket.io for real-time updates
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    const user = await authenticate(token);
    socket.userId = user.id;
    socket.userRole = user.role;
    socket.departmentId = user.departmentId;
    next();
  } catch (err) {
    next(new Error('Authentication failed'));
  }
});

io.on('connection', (socket) => {
  logger.info(`User ${socket.userId} connected`);

  // Join department room
  socket.join(`dept-${socket.departmentId}`);

  // Real-time asset tracking
  socket.on('track-asset', async (assetId) => {
    socket.join(`asset-${assetId}`);
    
    // Send current location and status
    const assetInfo = await assetTrackingService.getAssetInfo(assetId);
    socket.emit('asset-update', assetInfo);
  });

  // Asset location update
  socket.on('update-location', async (data) => {
    const { assetId, location, userId } = data;
    
    // Update asset location
    await assetTrackingService.updateLocation(assetId, location, userId);
    
    // Notify all tracking this asset
    io.to(`asset-${assetId}`).emit('location-changed', {
      assetId,
      location,
      updatedBy: userId,
      timestamp: new Date()
    });
    
    // Check geofence violations
    const violation = await assetTrackingService.checkGeofence(assetId, location);
    if (violation) {
      io.to(`dept-${socket.departmentId}`).emit('geofence-alert', {
        assetId,
        violation,
        timestamp: new Date()
      });
    }
  });

  // Barcode/QR scan
  socket.on('scan-asset', async (data) => {
    const { code, scannedBy, location } = data;
    
    // Process scan
    const asset = await assetTrackingService.processScan(code, scannedBy, location);
    
    if (asset) {
      socket.emit('scan-result', {
        success: true,
        asset,
        timestamp: new Date()
      });
      
      // Update last seen
      io.to(`asset-${asset.id}`).emit('asset-scanned', {
        assetId: asset.id,
        scannedBy,
        location,
        timestamp: new Date()
      });
    } else {
      socket.emit('scan-result', {
        success: false,
        message: 'Asset not found',
        timestamp: new Date()
      });
    }
  });

  // Maintenance alerts
  socket.on('maintenance-alert', async (data) => {
    const { assetId, type, priority, description } = data;
    
    // Create maintenance request
    const request = await maintenanceService.createRequest({
      assetId,
      type,
      priority,
      description,
      reportedBy: socket.userId
    });
    
    // Notify maintenance team
    io.emit('new-maintenance-request', request);
  });

  // Inventory count update
  socket.on('inventory-count', async (data) => {
    const { locationId, counts } = data;
    
    // Update inventory counts
    await inventoryService.updateCounts(locationId, counts, socket.userId);
    
    // Notify inventory managers
    io.to(`dept-${socket.departmentId}`).emit('inventory-updated', {
      locationId,
      updatedBy: socket.userId,
      timestamp: new Date()
    });
  });

  // Asset assignment
  socket.on('assign-asset', async (data) => {
    const { assetId, assignedTo, department } = data;
    
    // Process assignment
    const assignment = await assetTrackingService.assignAsset(
      assetId,
      assignedTo,
      department,
      socket.userId
    );
    
    // Notify relevant parties
    io.emit('asset-assigned', {
      assignment,
      timestamp: new Date()
    });
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    logger.info(`User ${socket.userId} disconnected`);
  });
});

// Scheduled tasks
if (process.env.NODE_ENV === 'production') {
  // Daily depreciation calculation
  cron.schedule('0 1 * * *', async () => {
    logger.info('Calculating asset depreciation...');
    await depreciationService.calculateDailyDepreciation();
  });

  // Maintenance reminders
  cron.schedule('0 9 * * *', async () => {
    logger.info('Checking maintenance schedules...');
    await maintenanceService.checkMaintenanceSchedules();
    await notificationService.sendMaintenanceReminders();
  });

  // Warranty expiry checks
  cron.schedule('0 10 * * 1', async () => {
    logger.info('Checking warranty expiries...');
    await assetTrackingService.checkWarrantyExpiries();
  });

  // Inventory reconciliation
  cron.schedule('0 0 * * 0', async () => {
    logger.info('Running inventory reconciliation...');
    await inventoryService.runReconciliation();
  });

  // Generate monthly reports
  cron.schedule('0 2 1 * *', async () => {
    logger.info('Generating monthly reports...');
    await reportService.generateMonthlyReports();
  });

  // Clean up old audit logs
  cron.schedule('0 3 * * *', async () => {
    logger.info('Cleaning up old audit logs...');
    await auditService.cleanupOldLogs();
  });

  // Check low stock levels
  cron.schedule('0 */4 * * *', async () => {
    logger.info('Checking stock levels...');
    await inventoryService.checkStockLevels();
  });

  // Update asset conditions
  cron.schedule('0 0 * * *', async () => {
    logger.info('Updating asset conditions...');
    await assetTrackingService.updateAssetConditions();
  });

  // Backup database
  if (process.env.BACKUP_ENABLED === 'true') {
    cron.schedule(process.env.BACKUP_SCHEDULE || '0 3 * * *', async () => {
      logger.info('Starting scheduled backup...');
      await backupService.performBackup();
    });
  }
}

// Error handling middleware
app.use(errorHandler);

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

// Initialize and start server
const startServer = async () => {
  try {
    // Initialize database
    await initializeDatabase();
    logger.info('Database initialized successfully');

    // Initialize Redis
    await initializeRedis();
    logger.info('Redis initialized successfully');

    // Initialize services
    await assetTrackingService.initialize();
    await maintenanceService.initialize();
    logger.info('Services initialized successfully');

    // Start server
    const PORT = process.env.PORT || 3008;
    httpServer.listen(PORT, () => {
      logger.info(`Demirbaş Takip Sistemi server running on port ${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV}`);
      logger.info(`Real-time tracking enabled on WebSocket`);
      logger.info(`Depreciation: ${process.env.DEPRECIATION_ENABLED === 'true' ? 'enabled' : 'disabled'}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Export for testing
module.exports = { app, io };

// Start server if not in test environment
if (process.env.NODE_ENV !== 'test') {
  startServer();
}