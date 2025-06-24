const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const supplierRoutes = require('./supplier.routes');
const purchaseRequestRoutes = require('./purchaseRequest.routes');
const tenderRoutes = require('./tender.routes');
const bidRoutes = require('./bid.routes');
const contractRoutes = require('./contract.routes');
const orderRoutes = require('./order.routes');

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/suppliers', supplierRoutes);
router.use('/purchase-requests', purchaseRequestRoutes);
router.use('/tenders', tenderRoutes);
router.use('/bids', bidRoutes);
router.use('/contracts', contractRoutes);
router.use('/orders', orderRoutes);

module.exports = router;