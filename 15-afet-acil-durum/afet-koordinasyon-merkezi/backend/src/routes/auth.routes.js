const router = require('express').Router();
const Joi = require('joi');
const authController = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/auth');
const validate = require('../middleware/validate');

// Validation schemas
const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/).required()
    .messages({
      'string.pattern.base': 'Şifre en az bir büyük harf, bir küçük harf, bir rakam ve bir özel karakter içermelidir'
    }),
  firstName: Joi.string().min(2).max(50).required(),
  lastName: Joi.string().min(2).max(50).required(),
  phoneNumber: Joi.string().pattern(/^[0-9]{10,15}$/).required(),
  institutionId: Joi.string().uuid().optional(),
  role: Joi.string().valid(
    'citizen',
    'volunteer',
    'field_officer',
    'ngo_representative',
    'institution_officer',
    'city_manager',
    'coordinator'
  ).optional()
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string().required()
});

const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string().min(8).pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/).required()
});

const updateProfileSchema = Joi.object({
  firstName: Joi.string().min(2).max(50).optional(),
  lastName: Joi.string().min(2).max(50).optional(),
  phoneNumber: Joi.string().pattern(/^[0-9]{10,15}$/).optional(),
  title: Joi.string().max(100).optional(),
  emergencyContact: Joi.object({
    name: Joi.string().optional(),
    relationship: Joi.string().optional(),
    phone: Joi.string().optional()
  }).optional(),
  skills: Joi.array().items(Joi.string()).optional()
});

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Kimlik doğrulama işlemleri
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Yeni kullanıcı kaydı
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - firstName
 *               - lastName
 *               - phoneNumber
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 8
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               phoneNumber:
 *                 type: string
 *               institutionId:
 *                 type: string
 *                 format: uuid
 *               role:
 *                 type: string
 *                 enum: [citizen, volunteer, field_officer]
 *     responses:
 *       201:
 *         description: Kayıt başarılı
 *       400:
 *         description: Geçersiz veri
 */
router.post('/register', validate(registerSchema), authController.register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Kullanıcı girişi
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Giriş başarılı
 *       401:
 *         description: Geçersiz kimlik bilgileri
 */
router.post('/login', validate(loginSchema), authController.login);

/**
 * @swagger
 * /api/auth/refresh-token:
 *   post:
 *     summary: Token yenileme
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Token yenilendi
 *       401:
 *         description: Geçersiz refresh token
 */
router.post('/refresh-token', validate(refreshTokenSchema), authController.refreshToken);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Çıkış yap
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Çıkış başarılı
 *       401:
 *         description: Yetkisiz erişim
 */
router.post('/logout', authenticate, authController.logout);

/**
 * @swagger
 * /api/auth/profile:
 *   get:
 *     summary: Profil bilgilerini getir
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profil bilgileri
 *       401:
 *         description: Yetkisiz erişim
 */
router.get('/profile', authenticate, authController.getProfile);

/**
 * @swagger
 * /api/auth/profile:
 *   put:
 *     summary: Profil güncelle
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               phoneNumber:
 *                 type: string
 *               title:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profil güncellendi
 *       401:
 *         description: Yetkisiz erişim
 */
router.put('/profile', authenticate, validate(updateProfileSchema), authController.updateProfile);

/**
 * @swagger
 * /api/auth/change-password:
 *   post:
 *     summary: Şifre değiştir
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *                 minLength: 8
 *     responses:
 *       200:
 *         description: Şifre değiştirildi
 *       400:
 *         description: Mevcut şifre yanlış
 *       401:
 *         description: Yetkisiz erişim
 */
router.post('/change-password', authenticate, validate(changePasswordSchema), authController.changePassword);

module.exports = router;