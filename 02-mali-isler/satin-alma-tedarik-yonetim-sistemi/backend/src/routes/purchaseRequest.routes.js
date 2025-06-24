const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const purchaseRequestController = require('../controllers/purchaseRequest.controller');

router.use(authenticate);

router.get('/', purchaseRequestController.getAllRequests);
router.get('/:id', purchaseRequestController.getRequest);
router.post('/', purchaseRequestController.createRequest);
router.put('/:id', purchaseRequestController.updateRequest);
router.post('/:id/approve', authorize('admin', 'satinalma_muduru'), purchaseRequestController.approveRequest);
router.post('/:id/reject', authorize('admin', 'satinalma_muduru'), purchaseRequestController.rejectRequest);
router.delete('/:id', purchaseRequestController.deleteRequest);

module.exports = router;