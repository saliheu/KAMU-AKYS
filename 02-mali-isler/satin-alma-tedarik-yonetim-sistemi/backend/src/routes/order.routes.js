const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const orderController = require('../controllers/order.controller');

router.use(authenticate);

router.get('/', orderController.getAllOrders);
router.get('/:id', orderController.getOrder);
router.post('/', authorize('admin', 'satinalma_muduru', 'satinalma_uzmani'), orderController.createOrder);
router.put('/:id', authorize('admin', 'satinalma_muduru', 'satinalma_uzmani'), orderController.updateOrder);
router.post('/:id/approve', authorize('admin', 'satinalma_muduru'), orderController.approveOrder);
router.post('/:id/deliver', authorize('admin', 'satinalma_muduru', 'satinalma_uzmani'), orderController.deliverOrder);
router.delete('/:id', authorize('admin'), orderController.deleteOrder);

module.exports = router;