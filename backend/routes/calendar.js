const express = require('express');
const router = express.Router();
const passport = require('passport');
const { authorize } = require('../config/passport');
const calendarController = require('../controllers/calendarController');

// All routes require authentication
router.use(passport.authenticate('jwt', { session: false }));

/**
 * @swagger
 * /api/calendar/appointments:
 *   get:
 *     summary: Takvim görünümü için randevuları getir
 *     tags: [Calendar]
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
 *       - in: query
 *         name: mahkemeId
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: hakimId
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Takvim randevuları
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   title:
 *                     type: string
 *                   start:
 *                     type: string
 *                     format: date-time
 *                   end:
 *                     type: string
 *                     format: date-time
 *                   color:
 *                     type: string
 *                   status:
 *                     type: string
 *                   courtName:
 *                     type: string
 *                   judgeName:
 *                     type: string
 */
router.get('/appointments', calendarController.getCalendarAppointments);

/**
 * @swagger
 * /api/calendar/availability:
 *   get:
 *     summary: Müsaitlik durumunu kontrol et
 *     tags: [Calendar]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: mahkemeId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: hakimId
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Müsaitlik bilgisi
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 date:
 *                   type: string
 *                   format: date
 *                 availableSlots:
 *                   type: array
 *                   items:
 *                     type: string
 *                     pattern: '^[0-9]{2}:[0-9]{2}$'
 *                 bookedSlots:
 *                   type: array
 *                   items:
 *                     type: string
 *                     pattern: '^[0-9]{2}:[0-9]{2}$'
 *                 workingHours:
 *                   type: object
 *                   properties:
 *                     start:
 *                       type: string
 *                     end:
 *                       type: string
 */
router.get('/availability', calendarController.checkAvailability);

/**
 * @swagger
 * /api/calendar/holidays:
 *   get:
 *     summary: Resmi tatilleri getir
 *     tags: [Calendar]
 *     parameters:
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *           default: 2024
 *     responses:
 *       200:
 *         description: Tatil listesi
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   date:
 *                     type: string
 *                     format: date
 *                   name:
 *                     type: string
 *                   type:
 *                     type: string
 *                     enum: [resmi, dini, milli]
 */
router.get('/holidays', calendarController.getHolidays);

/**
 * @swagger
 * /api/calendar/working-days:
 *   get:
 *     summary: Çalışma günlerini getir
 *     tags: [Calendar]
 *     parameters:
 *       - in: query
 *         name: mahkemeId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: month
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 12
 *       - in: query
 *         name: year
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Çalışma günleri
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   date:
 *                     type: string
 *                     format: date
 *                   isWorkingDay:
 *                     type: boolean
 *                   workingHours:
 *                     type: object
 *                   capacity:
 *                     type: integer
 *                   bookedCount:
 *                     type: integer
 */
router.get('/working-days', calendarController.getWorkingDays);

// Judge specific calendar routes
router.use('/judge', authorize(['hakim']));

/**
 * @swagger
 * /api/calendar/judge/schedule:
 *   get:
 *     summary: Hakim takvimi
 *     tags: [Calendar]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *           description: Belirli bir gün (varsayılan bugün)
 *       - in: query
 *         name: week
 *         schema:
 *           type: boolean
 *           description: Haftalık görünüm
 *     responses:
 *       200:
 *         description: Hakim programı
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   time:
 *                     type: string
 *                   appointment:
 *                     type: object
 *                   available:
 *                     type: boolean
 */
router.get('/judge/schedule', calendarController.getJudgeSchedule);

/**
 * @swagger
 * /api/calendar/judge/block-time:
 *   post:
 *     summary: Zaman bloğu oluştur
 *     tags: [Calendar]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - date
 *               - startTime
 *               - endTime
 *               - reason
 *             properties:
 *               date:
 *                 type: string
 *                 format: date
 *               startTime:
 *                 type: string
 *                 pattern: '^[0-9]{2}:[0-9]{2}$'
 *               endTime:
 *                 type: string
 *                 pattern: '^[0-9]{2}:[0-9]{2}$'
 *               reason:
 *                 type: string
 *                 enum: [toplanti, egitim, izin, diger]
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Zaman bloğu oluşturuldu
 *       400:
 *         description: Çakışan randevu var
 */
router.post('/judge/block-time', calendarController.blockJudgeTime);

// Court staff calendar routes
router.use('/court', authorize(['personel', 'admin']));

/**
 * @swagger
 * /api/calendar/court/overview:
 *   get:
 *     summary: Mahkeme genel takvim görünümü
 *     tags: [Calendar]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: mahkemeId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Mahkeme takvim özeti
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalAppointments:
 *                   type: integer
 *                 totalCapacity:
 *                   type: integer
 *                 utilizationRate:
 *                   type: number
 *                 judgeSchedules:
 *                   type: array
 *                   items:
 *                     type: object
 *                 timeSlotSummary:
 *                   type: array
 *                   items:
 *                     type: object
 */
router.get('/court/overview', calendarController.getCourtOverview);

/**
 * @swagger
 * /api/calendar/court/capacity:
 *   put:
 *     summary: Mahkeme kapasitesini güncelle
 *     tags: [Calendar]
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
 *               - date
 *               - capacity
 *             properties:
 *               mahkemeId:
 *                 type: string
 *                 format: uuid
 *               date:
 *                 type: string
 *                 format: date
 *               capacity:
 *                 type: integer
 *               timeSlotCapacities:
 *                 type: object
 *                 description: Saat bazlı kapasite ayarları
 *     responses:
 *       200:
 *         description: Kapasite güncellendi
 *       403:
 *         description: Yetki hatası
 */
router.put('/court/capacity', calendarController.updateCourtCapacity);

/**
 * @swagger
 * /api/calendar/export:
 *   get:
 *     summary: Takvimi dışa aktar
 *     tags: [Calendar]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: format
 *         required: true
 *         schema:
 *           type: string
 *           enum: [ics, pdf, excel]
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
 *       - in: query
 *         name: mahkemeId
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: hakimId
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Takvim dosyası
 *         content:
 *           text/calendar:
 *             schema:
 *               type: string
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 */
router.get('/export', calendarController.exportCalendar);

module.exports = router;