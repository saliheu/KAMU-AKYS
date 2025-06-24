const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const bidController = require('../controllers/bid.controller');

router.use(authenticate);

router.get('/tender/:tenderId', bidController.getBidsByTender);
router.get('/:id', bidController.getBid);
router.post('/', bidController.createBid);
router.put('/:id', bidController.updateBid);
router.post('/:id/evaluate', authorize('admin', 'satinalma_muduru'), bidController.evaluateBid);
router.delete('/:id', bidController.deleteBid);

module.exports = router;