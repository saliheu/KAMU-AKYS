const express = require('express');
const router = express.Router();
const passport = require('passport');
const { authorize } = require('../config/passport');
const appointmentController = require('../controllers/appointmentController');
const { validateAppointment, validateAppointmentUpdate } = require('../middleware/validation');
const rateLimiter = require('../middleware/rateLimiter');

// All routes require authentication
router.use(passport.authenticate('jwt', { session: false }));

/**
 * @swagger
 * /api/appointments:
 *   get:
 *     summary: Randevuları listele
 *     tags: [Appointments]
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
 *       - in: query
 *         name: mahkemeId
 *         schema:
 *           type: string
 *           format: uuid
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
 *         description: Randevu listesi
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Appointment'
 */
router.get('/', appointmentController.getAppointments);

/**
 * @swagger
 * /api/appointments/{id}:
 *   get:
 *     summary: Randevu detayı
 *     tags: [Appointments]
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
 *         description: Randevu detayları
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Appointment'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.get('/:id', appointmentController.getAppointmentById);

/**
 * @swagger
 * /api/appointments/code/{code}:
 *   get:
 *     summary: Randevu kodu ile sorgula
 *     tags: [Appointments]
 *     parameters:
 *       - in: path
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^[A-Z0-9]{8}$'
 *     responses:
 *       200:
 *         description: Randevu detayları
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Appointment'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.get('/code/:code', appointmentController.getAppointmentByCode);

/**
 * @swagger
 * /api/appointments:
 *   post:
 *     summary: Yeni randevu oluştur
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - mahkemeId
 *               - randevuTarihi
 *               - randevuSaati
 *               - islemTuru
 *             properties:
 *               mahkemeId:
 *                 type: string
 *                 format: uuid
 *               hakimId:
 *                 type: string
 *                 format: uuid
 *               randevuTarihi:
 *                 type: string
 *                 format: date
 *               randevuSaati:
 *                 type: string
 *                 pattern: '^[0-9]{2}:[0-9]{2}$'
 *               islemTuru:
 *                 type: string
 *                 enum: [dava_acma, durusma, evrak_teslimi, bilgi_alma, harc_odeme, diger]
 *               notlar:
 *                 type: string
 *     responses:
 *       201:
 *         description: Randevu oluşturuldu
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Appointment'
 *       400:
 *         description: Randevu oluşturulamadı
 *       422:
 *         $ref: '#/components/responses/ValidationError'
 */
router.post('/',
  rateLimiter.appointmentLimiter,
  validateAppointment,
  appointmentController.createAppointment
);

/**
 * @swagger
 * /api/appointments/{id}:
 *   put:
 *     summary: Randevu güncelle
 *     tags: [Appointments]
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
 *               randevuTarihi:
 *                 type: string
 *                 format: date
 *               randevuSaati:
 *                 type: string
 *                 pattern: '^[0-9]{2}:[0-9]{2}$'
 *               islemTuru:
 *                 type: string
 *                 enum: [dava_acma, durusma, evrak_teslimi, bilgi_alma, harc_odeme, diger]
 *               notlar:
 *                 type: string
 *     responses:
 *       200:
 *         description: Randevu güncellendi
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Appointment'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       422:
 *         $ref: '#/components/responses/ValidationError'
 */
router.put('/:id',
  validateAppointmentUpdate,
  appointmentController.updateAppointment
);

/**
 * @swagger
 * /api/appointments/{id}/cancel:
 *   post:
 *     summary: Randevu iptal et
 *     tags: [Appointments]
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
 *             required:
 *               - iptalNedeni
 *             properties:
 *               iptalNedeni:
 *                 type: string
 *     responses:
 *       200:
 *         description: Randevu iptal edildi
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.post('/:id/cancel', appointmentController.cancelAppointment);

/**
 * @swagger
 * /api/appointments/{id}/confirm:
 *   post:
 *     summary: Randevu onayla (Personel)
 *     tags: [Appointments]
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
 *         description: Randevu onaylandı
 *       403:
 *         description: Yetki hatası
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.post('/:id/confirm',
  authorize(['personel', 'admin']),
  appointmentController.confirmAppointment
);

/**
 * @swagger
 * /api/appointments/{id}/complete:
 *   post:
 *     summary: Randevu tamamla (Personel)
 *     tags: [Appointments]
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
 *         description: Randevu tamamlandı
 *       403:
 *         description: Yetki hatası
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.post('/:id/complete',
  authorize(['personel', 'hakim', 'admin']),
  appointmentController.completeAppointment
);

/**
 * @swagger
 * /api/appointments/statistics:
 *   get:
 *     summary: Randevu istatistikleri
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: İstatistikler
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 toplamRandevu:
 *                   type: integer
 *                 tamamlanan:
 *                   type: integer
 *                 iptalEdilen:
 *                   type: integer
 *                 bekleyen:
 *                   type: integer
 *                 onaylanan:
 *                   type: integer
 */
router.get('/statistics',
  authorize(['personel', 'hakim', 'admin']),
  appointmentController.getStatistics
);

/**
 * @swagger
 * /api/appointments/export:
 *   get:
 *     summary: Randevuları dışa aktar
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: format
 *         schema:
 *           type: string
 *           enum: [pdf, excel]
 *           default: pdf
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Dosya indirildi
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *           application/vnd.openxmlformats-officedocument.spreadsheetml.sheet:
 *             schema:
 *               type: string
 *               format: binary
 */
router.get('/export', appointmentController.exportAppointments);

module.exports = router;