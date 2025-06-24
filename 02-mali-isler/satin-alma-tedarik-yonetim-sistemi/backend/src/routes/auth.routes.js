const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const authController = require('../controllers/auth.controller');

const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 })
], validateRequest, authController.login);

router.post('/register', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('sicilNo').notEmpty(),
  body('firstName').notEmpty(),
  body('lastName').notEmpty(),
  body('department').notEmpty()
], validateRequest, authController.register);

router.post('/logout', authController.logout);
router.post('/refresh-token', authController.refreshToken);

module.exports = router;