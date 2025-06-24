const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const tenderController = require('../controllers/tender.controller');

router.use(authenticate);

router.get('/', tenderController.getAllTenders);
router.get('/:id', tenderController.getTender);
router.post('/', authorize('admin', 'satinalma_muduru', 'satinalma_uzmani'), tenderController.createTender);
router.put('/:id', authorize('admin', 'satinalma_muduru', 'satinalma_uzmani'), tenderController.updateTender);
router.post('/:id/publish', authorize('admin', 'satinalma_muduru'), tenderController.publishTender);
router.post('/:id/cancel', authorize('admin', 'satinalma_muduru'), tenderController.cancelTender);
router.delete('/:id', authorize('admin'), tenderController.deleteTender);

module.exports = router;