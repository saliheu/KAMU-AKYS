const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const institutionRoutes = require('./institution.routes');
const wastePointRoutes = require('./wastePoint.routes');
const wasteEntryRoutes = require('./wasteEntry.routes');
const collectionRoutes = require('./collection.routes');
const companyRoutes = require('./company.routes');
const reportRoutes = require('./report.routes');
const dashboardRoutes = require('./dashboard.routes');

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/institutions', institutionRoutes);
router.use('/waste-points', wastePointRoutes);
router.use('/waste-entries', wasteEntryRoutes);
router.use('/collections', collectionRoutes);
router.use('/companies', companyRoutes);
router.use('/reports', reportRoutes);
router.use('/dashboard', dashboardRoutes);

module.exports = router;