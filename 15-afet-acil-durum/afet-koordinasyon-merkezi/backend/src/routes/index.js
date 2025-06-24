const router = require('express').Router();
const authRoutes = require('./auth.routes');
const disasterRoutes = require('./disaster.routes');
const resourceRoutes = require('./resource.routes');
const helpRequestRoutes = require('./helpRequest.routes');
const teamRoutes = require('./team.routes');
const personnelRoutes = require('./personnel.routes');
const volunteerRoutes = require('./volunteer.routes');
const reportRoutes = require('./report.routes');
const locationRoutes = require('./location.routes');
const safeZoneRoutes = require('./safeZone.routes');
const notificationRoutes = require('./notification.routes');
const dashboardRoutes = require('./dashboard.routes');

// Public routes
router.use('/auth', authRoutes);

// Protected routes (will add auth middleware in individual route files)
router.use('/disasters', disasterRoutes);
router.use('/resources', resourceRoutes);
router.use('/help-requests', helpRequestRoutes);
router.use('/teams', teamRoutes);
router.use('/personnel', personnelRoutes);
router.use('/volunteers', volunteerRoutes);
router.use('/reports', reportRoutes);
router.use('/locations', locationRoutes);
router.use('/safe-zones', safeZoneRoutes);
router.use('/notifications', notificationRoutes);
router.use('/dashboard', dashboardRoutes);

// API info
router.get('/', (req, res) => {
  res.json({
    message: 'Afet Koordinasyon Merkezi API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      disasters: '/api/disasters',
      resources: '/api/resources',
      helpRequests: '/api/help-requests',
      teams: '/api/teams',
      personnel: '/api/personnel',
      volunteers: '/api/volunteers',
      reports: '/api/reports',
      locations: '/api/locations',
      safeZones: '/api/safe-zones',
      notifications: '/api/notifications',
      dashboard: '/api/dashboard'
    }
  });
});

module.exports = router;