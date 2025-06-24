const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const supplierController = require('../controllers/supplier.controller');

router.use(authenticate);

router.get('/', supplierController.getAllSuppliers);
router.get('/:id', supplierController.getSupplier);
router.post('/', authorize('admin', 'satinalma_muduru'), supplierController.createSupplier);
router.put('/:id', authorize('admin', 'satinalma_muduru'), supplierController.updateSupplier);
router.delete('/:id', authorize('admin'), supplierController.deleteSupplier);

module.exports = router;