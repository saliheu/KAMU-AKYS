const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');

// Validation rules
const registerValidation = [
  body('username')
    .isLength({ min: 3 })
    .withMessage('Kullanıcı adı en az 3 karakter olmalıdır')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Kullanıcı adı sadece harf, rakam ve alt çizgi içerebilir'),
  body('email')
    .isEmail()
    .withMessage('Geçerli bir email adresi giriniz'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Şifre en az 6 karakter olmalıdır'),
  body('firstName')
    .notEmpty()
    .withMessage('Ad alanı zorunludur'),
  body('lastName')
    .notEmpty()
    .withMessage('Soyad alanı zorunludur'),
  body('department')
    .isMongoId()
    .withMessage('Geçerli bir departman seçiniz')
];

const loginValidation = [
  body('username')
    .notEmpty()
    .withMessage('Kullanıcı adı zorunludur'),
  body('password')
    .notEmpty()
    .withMessage('Şifre zorunludur')
];

const updateProfileValidation = [
  body('firstName')
    .optional()
    .notEmpty()
    .withMessage('Ad alanı boş olamaz'),
  body('lastName')
    .optional()
    .notEmpty()
    .withMessage('Soyad alanı boş olamaz'),
  body('email')
    .optional()
    .isEmail()
    .withMessage('Geçerli bir email adresi giriniz')
];

const changePasswordValidation = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Mevcut şifre zorunludur'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('Yeni şifre en az 6 karakter olmalıdır')
    .custom((value, { req }) => value !== req.body.currentPassword)
    .withMessage('Yeni şifre mevcut şifre ile aynı olamaz')
];

// Routes
router.post('/register', registerValidation, authController.register);
router.post('/login', loginValidation, authController.login);
router.get('/profile', authenticateToken, authController.getProfile);
router.put('/profile', authenticateToken, updateProfileValidation, authController.updateProfile);
router.post('/change-password', authenticateToken, changePasswordValidation, authController.changePassword);

module.exports = router;