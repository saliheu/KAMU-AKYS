const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { authenticate, authorize, checkInstitution } = require('../middleware/auth');
const wasteEntryController = require('../controllers/wasteEntry.controller');
const multer = require('multer');

const upload = multer({
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Sadece resim dosyaları yüklenebilir'));
    }
  }
});

const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

router.use(authenticate);

// Get all waste entries
router.get('/', checkInstitution, wasteEntryController.getAllEntries);

// Get waste entry by ID
router.get('/:id', wasteEntryController.getEntry);

// Create waste entry
router.post('/', [
  body('wastePointId').isUUID(),
  body('wasteType').isIn(['organik', 'kağıt', 'plastik', 'cam', 'metal', 'elektronik', 'tehlikeli', 'pil', 'yağ', 'tıbbi', 'diğer']),
  body('quantity').isFloat({ min: 0 }),
  body('unit').optional().isIn(['kg', 'litre', 'adet'])
], validateRequest, wasteEntryController.createEntry);

// Create bulk entries
router.post('/bulk', authorize('yonetici', 'sorumlu'), wasteEntryController.createBulkEntries);

// Create entry by QR code
router.post('/qr-scan', [
  body('qrCode').notEmpty(),
  body('quantity').isFloat({ min: 0 })
], validateRequest, wasteEntryController.createEntryByQR);

// Update waste entry
router.put('/:id', authorize('yonetici', 'sorumlu'), wasteEntryController.updateEntry);

// Verify waste entry
router.post('/:id/verify', authorize('yonetici', 'sorumlu'), wasteEntryController.verifyEntry);

// Upload photos for entry
router.post('/:id/photos', upload.array('photos', 5), wasteEntryController.uploadPhotos);

// Delete waste entry
router.delete('/:id', authorize('admin', 'yonetici'), wasteEntryController.deleteEntry);

// Get statistics
router.get('/stats/summary', checkInstitution, wasteEntryController.getStatistics);

module.exports = router;