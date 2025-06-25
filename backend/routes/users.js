const express = require('express');
const router = express.Router();
const passport = require('passport');
const { authorize } = require('../config/passport');
const userController = require('../controllers/userController');
const { validateUserUpdate, validatePasswordChange } = require('../middleware/validation');

// All routes require authentication
router.use(passport.authenticate('jwt', { session: false }));

/**
 * @swagger
 * /api/users/profile:
 *   get:
 *     summary: Kullanıcı profili
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Kullanıcı profil bilgileri
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/profile', userController.getProfile);

/**
 * @swagger
 * /api/users/profile:
 *   put:
 *     summary: Profil güncelle
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
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
 *               adres:
 *                 type: object
 *     responses:
 *       200:
 *         description: Profil güncellendi
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       422:
 *         $ref: '#/components/responses/ValidationError'
 */
router.put('/profile',
  validateUserUpdate,
  userController.updateProfile
);

/**
 * @swagger
 * /api/users/change-password:
 *   post:
 *     summary: Şifre değiştir
 *     tags: [Users]
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
 *                 minLength: 6
 *     responses:
 *       200:
 *         description: Şifre değiştirildi
 *       400:
 *         description: Mevcut şifre hatalı
 *       422:
 *         $ref: '#/components/responses/ValidationError'
 */
router.post('/change-password',
  validatePasswordChange,
  userController.changePassword
);

/**
 * @swagger
 * /api/users/appointments:
 *   get:
 *     summary: Kullanıcı randevuları
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: durum
 *         schema:
 *           type: string
 *           enum: [beklemede, onaylandi, iptal, tamamlandi]
 *       - in: query
 *         name: tarihBaslangic
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: tarihBitis
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Randevu listesi
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Appointment'
 */
router.get('/appointments', userController.getUserAppointments);

/**
 * @swagger
 * /api/users/notifications:
 *   get:
 *     summary: Kullanıcı bildirimleri
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: okunmamis
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *     responses:
 *       200:
 *         description: Bildirim listesi
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   baslik:
 *                     type: string
 *                   mesaj:
 *                     type: string
 *                   tur:
 *                     type: string
 *                   okundu:
 *                     type: boolean
 *                   tarih:
 *                     type: string
 *                     format: date-time
 */
router.get('/notifications', userController.getNotifications);

/**
 * @swagger
 * /api/users/notifications/{id}/mark-read:
 *   put:
 *     summary: Bildirimi okundu olarak işaretle
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Bildirim okundu olarak işaretlendi
 *       404:
 *         description: Bildirim bulunamadı
 */
router.put('/notifications/:id/mark-read', userController.markNotificationAsRead);

/**
 * @swagger
 * /api/users/preferences:
 *   get:
 *     summary: Kullanıcı tercihleri
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Tercihler
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 emailBildirimleri:
 *                   type: boolean
 *                 smsBildirimleri:
 *                   type: boolean
 *                 randevuHatirlatma:
 *                   type: boolean
 *                 hatirlatmaSuresi:
 *                   type: integer
 *                   description: Saat cinsinden
 */
router.get('/preferences', userController.getPreferences);

/**
 * @swagger
 * /api/users/preferences:
 *   put:
 *     summary: Tercihleri güncelle
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               emailBildirimleri:
 *                 type: boolean
 *               smsBildirimleri:
 *                 type: boolean
 *               randevuHatirlatma:
 *                 type: boolean
 *               hatirlatmaSuresi:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Tercihler güncellendi
 */
router.put('/preferences', userController.updatePreferences);

// Admin routes
router.use(authorize(['admin']));

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Tüm kullanıcıları listele (Admin)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: rol
 *         schema:
 *           type: string
 *           enum: [vatandas, avukat, hakim, personel, admin]
 *       - in: query
 *         name: aktif
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *     responses:
 *       200:
 *         description: Kullanıcı listesi
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       403:
 *         description: Yetki hatası
 */
router.get('/', userController.getAllUsers);

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Kullanıcı detayı (Admin)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Kullanıcı detayları
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       403:
 *         description: Yetki hatası
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.get('/:id', userController.getUserById);

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Kullanıcı güncelle (Admin)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               ad:
 *                 type: string
 *               soyad:
 *                 type: string
 *               email:
 *                 type: string
 *               telefon:
 *                 type: string
 *               rol:
 *                 type: string
 *                 enum: [vatandas, avukat, hakim, personel, admin]
 *               aktif:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Kullanıcı güncellendi
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       403:
 *         description: Yetki hatası
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.put('/:id', userController.updateUser);

/**
 * @swagger
 * /api/users/{id}/activate:
 *   post:
 *     summary: Kullanıcıyı aktifleştir (Admin)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Kullanıcı aktifleştirildi
 *       403:
 *         description: Yetki hatası
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.post('/:id/activate', userController.activateUser);

/**
 * @swagger
 * /api/users/{id}/deactivate:
 *   post:
 *     summary: Kullanıcıyı deaktif et (Admin)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Kullanıcı deaktif edildi
 *       403:
 *         description: Yetki hatası
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.post('/:id/deactivate', userController.deactivateUser);

module.exports = router;