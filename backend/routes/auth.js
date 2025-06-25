const express = require('express');
const router = express.Router();
const passport = require('passport');
const authController = require('../controllers/authController');
const { validateLogin, validateRegister, validatePasswordReset } = require('../middleware/validation');
const rateLimiter = require('../middleware/rateLimiter');

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
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Başarılı giriş
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       422:
 *         $ref: '#/components/responses/ValidationError'
 */
router.post('/login', 
  rateLimiter.authLimiter,
  validateLogin,
  authController.login
);

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
 *               - tcKimlikNo
 *               - ad
 *               - soyad
 *               - email
 *               - telefon
 *               - password
 *             properties:
 *               tcKimlikNo:
 *                 type: string
 *                 pattern: '^[0-9]{11}$'
 *               ad:
 *                 type: string
 *               soyad:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               telefon:
 *                 type: string
 *                 pattern: '^[0-9]{10}$'
 *               password:
 *                 type: string
 *                 minLength: 6
 *               rol:
 *                 type: string
 *                 enum: [vatandas, avukat]
 *     responses:
 *       201:
 *         description: Kayıt başarılı
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Kullanıcı zaten mevcut
 *       422:
 *         $ref: '#/components/responses/ValidationError'
 */
router.post('/register',
  rateLimiter.authLimiter,
  validateRegister,
  authController.register
);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Kullanıcı çıkışı
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Başarılı çıkış
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post('/logout',
  passport.authenticate('jwt', { session: false }),
  authController.logout
);

/**
 * @swagger
 * /api/auth/refresh:
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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                 refreshToken:
 *                   type: string
 *       401:
 *         description: Geçersiz refresh token
 */
router.post('/refresh',
  rateLimiter.authLimiter,
  authController.refreshToken
);

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Mevcut kullanıcı bilgileri
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Kullanıcı bilgileri
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/me',
  passport.authenticate('jwt', { session: false }),
  authController.getCurrentUser
);

/**
 * @swagger
 * /api/auth/password/reset-request:
 *   post:
 *     summary: Şifre sıfırlama talebi
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - tcKimlikNo
 *               - email
 *             properties:
 *               tcKimlikNo:
 *                 type: string
 *                 pattern: '^[0-9]{11}$'
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Sıfırlama e-postası gönderildi
 *       404:
 *         description: Kullanıcı bulunamadı
 */
router.post('/password/reset-request',
  rateLimiter.passwordResetLimiter,
  authController.requestPasswordReset
);

/**
 * @swagger
 * /api/auth/password/reset:
 *   post:
 *     summary: Şifre sıfırlama
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - password
 *             properties:
 *               token:
 *                 type: string
 *               password:
 *                 type: string
 *                 minLength: 6
 *     responses:
 *       200:
 *         description: Şifre başarıyla sıfırlandı
 *       400:
 *         description: Geçersiz veya süresi dolmuş token
 */
router.post('/password/reset',
  validatePasswordReset,
  authController.resetPassword
);

/**
 * @swagger
 * /api/auth/e-devlet/login:
 *   get:
 *     summary: E-Devlet ile giriş
 *     tags: [Auth]
 *     responses:
 *       302:
 *         description: E-Devlet giriş sayfasına yönlendirme
 */
router.get('/e-devlet/login', authController.eDevletLogin);

/**
 * @swagger
 * /api/auth/e-devlet/callback:
 *   get:
 *     summary: E-Devlet giriş callback
 *     tags: [Auth]
 *     parameters:
 *       - in: query
 *         name: token
 *         schema:
 *           type: string
 *         required: true
 *         description: E-Devlet token
 *     responses:
 *       302:
 *         description: Başarılı giriş sonrası yönlendirme
 *       401:
 *         description: E-Devlet doğrulama hatası
 */
router.get('/e-devlet/callback',
  passport.authenticate('e-devlet', { session: false }),
  authController.eDevletCallback
);

/**
 * @swagger
 * /api/auth/verify-email:
 *   post:
 *     summary: E-posta doğrulama
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *             properties:
 *               token:
 *                 type: string
 *     responses:
 *       200:
 *         description: E-posta doğrulandı
 *       400:
 *         description: Geçersiz veya süresi dolmuş token
 */
router.post('/verify-email', authController.verifyEmail);

/**
 * @swagger
 * /api/auth/verify-phone:
 *   post:
 *     summary: Telefon doğrulama
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
 *               - code
 *             properties:
 *               code:
 *                 type: string
 *                 pattern: '^[0-9]{6}$'
 *     responses:
 *       200:
 *         description: Telefon doğrulandı
 *       400:
 *         description: Geçersiz doğrulama kodu
 */
router.post('/verify-phone',
  passport.authenticate('jwt', { session: false }),
  authController.verifyPhone
);

/**
 * @swagger
 * /api/auth/send-verification-sms:
 *   post:
 *     summary: Doğrulama SMS'i gönder
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: SMS gönderildi
 *       429:
 *         description: Çok fazla deneme
 */
router.post('/send-verification-sms',
  passport.authenticate('jwt', { session: false }),
  rateLimiter.smsLimiter,
  authController.sendVerificationSMS
);

module.exports = router;