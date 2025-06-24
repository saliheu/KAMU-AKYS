const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const contractController = require('../controllers/contract.controller');

router.use(authenticate);

router.get('/', contractController.getAllContracts);
router.get('/:id', contractController.getContract);
router.post('/', authorize('admin', 'satinalma_muduru'), contractController.createContract);
router.put('/:id', authorize('admin', 'satinalma_muduru'), contractController.updateContract);
router.post('/:id/sign', authorize('admin', 'satinalma_muduru'), contractController.signContract);
router.delete('/:id', authorize('admin'), contractController.deleteContract);

module.exports = router;