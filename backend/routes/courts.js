const express = require('express');
const router = express.Router();
const passport = require('passport');
const { authorize } = require('../config/passport');
const courtController = require('../controllers/courtController');
const { validateCourt, validateCourtUpdate } = require('../middleware/validation');

/**
 * @swagger
 * /api/courts:
 *   get:
 *     summary: Mahkemeleri listele
 *     tags: [Courts]
 *     parameters:
 *       - in: query
 *         name: il
 *         schema:
 *           type: string
 *       - in: query
 *         name: ilce
 *         schema:
 *           type: string
 *       - in: query
 *         name: tur
 *         schema:
 *           type: string
 *           enum: [asliye_hukuk, asliye_ceza, agir_ceza, sulh_hukuk, sulh_ceza, icra, aile, is, ticaret, fikri_mulkiyet, tuketici]
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: lat
 *         schema:
 *           type: number
 *         description: Enlem (yakındaki mahkemeler için)
 *       - in: query
 *         name: lng
 *         schema:
 *           type: number
 *         description: Boylam (yakındaki mahkemeler için)
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
 *         description: Mahkeme listesi
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Court'
 */
router.get('/', courtController.getCourts);

/**
 * @swagger
 * /api/courts/{id}:
 *   get:
 *     summary: Mahkeme detayı
 *     tags: [Courts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Mahkeme detayları
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Court'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.get('/:id', courtController.getCourtById);

/**
 * @swagger
 * /api/courts/{id}/judges:
 *   get:
 *     summary: Mahkeme hakimlerini listele
 *     tags: [Courts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Hakim listesi
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     format: uuid
 *                   ad:
 *                     type: string
 *                   soyad:
 *                     type: string
 *                   sicilNo:
 *                     type: string
 *                   unvan:
 *                     type: string
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.get('/:id/judges', courtController.getCourtJudges);

/**
 * @swagger
 * /api/courts/{id}/available-slots:
 *   get:
 *     summary: Müsait randevu saatlerini getir
 *     tags: [Courts]
 *     parameters:
 *       - in: path
 *         name: id
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
 *       - in: query
 *         name: judgeId
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Müsait saatler
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: string
 *                 pattern: '^[0-9]{2}:[0-9]{2}$'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.get('/:id/available-slots', courtController.getAvailableSlots);

/**
 * @swagger
 * /api/courts/{id}/statistics:
 *   get:
 *     summary: Mahkeme istatistikleri
 *     tags: [Courts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
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
 *       403:
 *         description: Yetki hatası
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.get('/:id/statistics',
  passport.authenticate('jwt', { session: false }),
  authorize(['personel', 'hakim', 'admin']),
  courtController.getCourtStatistics
);

// Admin routes
router.use(passport.authenticate('jwt', { session: false }));
router.use(authorize(['admin']));

/**
 * @swagger
 * /api/courts:
 *   post:
 *     summary: Yeni mahkeme ekle (Admin)
 *     tags: [Courts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - ad
 *               - tur
 *               - adres
 *             properties:
 *               ad:
 *                 type: string
 *               tur:
 *                 type: string
 *                 enum: [asliye_hukuk, asliye_ceza, agir_ceza, sulh_hukuk, sulh_ceza, icra, aile, is, ticaret, fikri_mulkiyet, tuketici]
 *               adres:
 *                 type: object
 *                 properties:
 *                   il:
 *                     type: string
 *                   ilce:
 *                     type: string
 *                   mahalle:
 *                     type: string
 *                   cadde:
 *                     type: string
 *                   binaNo:
 *                     type: string
 *                   postaKodu:
 *                     type: string
 *               telefon:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               koordinat:
 *                 type: object
 *                 properties:
 *                   lat:
 *                     type: number
 *                   lng:
 *                     type: number
 *               calismaSaatleri:
 *                 type: object
 *               kapasite:
 *                 type: integer
 *               uyapKodu:
 *                 type: string
 *     responses:
 *       201:
 *         description: Mahkeme oluşturuldu
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Court'
 *       403:
 *         description: Yetki hatası
 *       422:
 *         $ref: '#/components/responses/ValidationError'
 */
router.post('/',
  validateCourt,
  courtController.createCourt
);

/**
 * @swagger
 * /api/courts/{id}:
 *   put:
 *     summary: Mahkeme güncelle (Admin)
 *     tags: [Courts]
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
 *               tur:
 *                 type: string
 *               adres:
 *                 type: object
 *               telefon:
 *                 type: string
 *               email:
 *                 type: string
 *               koordinat:
 *                 type: object
 *               calismaSaatleri:
 *                 type: object
 *               kapasite:
 *                 type: integer
 *               aktif:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Mahkeme güncellendi
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Court'
 *       403:
 *         description: Yetki hatası
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       422:
 *         $ref: '#/components/responses/ValidationError'
 */
router.put('/:id',
  validateCourtUpdate,
  courtController.updateCourt
);

/**
 * @swagger
 * /api/courts/{id}:
 *   delete:
 *     summary: Mahkeme sil (Admin)
 *     tags: [Courts]
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
 *         description: Mahkeme silindi
 *       403:
 *         description: Yetki hatası
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.delete('/:id', courtController.deleteCourt);

module.exports = router;