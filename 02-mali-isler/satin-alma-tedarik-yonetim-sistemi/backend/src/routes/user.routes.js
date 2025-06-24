const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const userController = require('../controllers/user.controller');

router.use(authenticate);

router.get('/', authorize('admin'), userController.getAllUsers);
router.get('/profile', userController.getProfile);
router.get('/:id', authorize('admin'), userController.getUser);
router.put('/profile', userController.updateProfile);
router.put('/:id', authorize('admin'), userController.updateUser);
router.delete('/:id', authorize('admin'), userController.deleteUser);

module.exports = router;