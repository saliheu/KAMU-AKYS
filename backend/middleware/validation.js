const { body, query, param, validationResult } = require('express-validator');
const { AppError } = require('./errorHandler');

// Validation result handler
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const formattedErrors = {};
    errors.array().forEach(error => {
      if (!formattedErrors[error.param]) {
        formattedErrors[error.param] = [];
      }
      formattedErrors[error.param].push(error.msg);
    });
    
    return res.status(422).json({
      error: 'Doğrulama hatası',
      errors: formattedErrors
    });
  }
  
  next();
};

// Custom validators
const validators = {
  // TC Kimlik No validator
  tcKimlikNo: (value) => {
    if (!/^\d{11}$/.test(value)) {
      throw new Error('TC Kimlik No 11 haneli olmalıdır');
    }
    
    // TC Kimlik No algorithm validation
    const digits = value.split('').map(Number);
    const oddSum = digits[0] + digits[2] + digits[4] + digits[6] + digits[8];
    const evenSum = digits[1] + digits[3] + digits[5] + digits[7];
    const tenthDigit = ((oddSum * 7) - evenSum) % 10;
    const eleventhDigit = (digits.slice(0, 10).reduce((a, b) => a + b, 0)) % 10;
    
    if (digits[9] !== tenthDigit || digits[10] !== eleventhDigit) {
      throw new Error('Geçersiz TC Kimlik Numarası');
    }
    
    return true;
  },

  // Phone number validator
  phoneNumber: (value) => {
    if (!/^[0-9]{10}$/.test(value)) {
      throw new Error('Telefon numarası 10 haneli olmalıdır (5XXXXXXXXX)');
    }
    
    if (!value.startsWith('5')) {
      throw new Error('Telefon numarası 5 ile başlamalıdır');
    }
    
    return true;
  },

  // Date validator (not in past)
  futureDate: (value) => {
    const date = new Date(value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (date < today) {
      throw new Error('Geçmiş tarih seçilemez');
    }
    
    return true;
  },

  // Working hours validator
  workingHours: (value) => {
    const [hours, minutes] = value.split(':').map(Number);
    
    if (hours < 8 || hours >= 18 || (hours === 17 && minutes > 30)) {
      throw new Error('Randevu saati 08:00 - 17:30 arasında olmalıdır');
    }
    
    return true;
  },

  // UUID validator
  isUUID: (value) => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(value)) {
      throw new Error('Geçersiz ID formatı');
    }
    return true;
  }
};

// Auth validations
const validateLogin = [
  body('tcKimlikNo')
    .trim()
    .notEmpty().withMessage('TC Kimlik No gereklidir')
    .custom(validators.tcKimlikNo),
  body('password')
    .notEmpty().withMessage('Şifre gereklidir')
    .isLength({ min: 6 }).withMessage('Şifre en az 6 karakter olmalıdır'),
  handleValidationErrors
];

const validateRegister = [
  body('tcKimlikNo')
    .trim()
    .notEmpty().withMessage('TC Kimlik No gereklidir')
    .custom(validators.tcKimlikNo),
  body('ad')
    .trim()
    .notEmpty().withMessage('Ad gereklidir')
    .isLength({ min: 2, max: 100 }).withMessage('Ad 2-100 karakter arasında olmalıdır')
    .matches(/^[a-zA-ZğüşöçİĞÜŞÖÇ\s]+$/).withMessage('Ad sadece harf içermelidir'),
  body('soyad')
    .trim()
    .notEmpty().withMessage('Soyad gereklidir')
    .isLength({ min: 2, max: 100 }).withMessage('Soyad 2-100 karakter arasında olmalıdır')
    .matches(/^[a-zA-ZğüşöçİĞÜŞÖÇ\s]+$/).withMessage('Soyad sadece harf içermelidir'),
  body('email')
    .trim()
    .notEmpty().withMessage('E-posta gereklidir')
    .isEmail().withMessage('Geçerli bir e-posta adresi giriniz')
    .normalizeEmail(),
  body('telefon')
    .trim()
    .notEmpty().withMessage('Telefon numarası gereklidir')
    .custom(validators.phoneNumber),
  body('password')
    .notEmpty().withMessage('Şifre gereklidir')
    .isLength({ min: 6 }).withMessage('Şifre en az 6 karakter olmalıdır')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('Şifre en az bir büyük harf, bir küçük harf ve bir rakam içermelidir'),
  body('rol')
    .optional()
    .isIn(['vatandas', 'avukat']).withMessage('Geçersiz rol'),
  handleValidationErrors
];

const validatePasswordReset = [
  body('token')
    .notEmpty().withMessage('Token gereklidir'),
  body('password')
    .notEmpty().withMessage('Şifre gereklidir')
    .isLength({ min: 6 }).withMessage('Şifre en az 6 karakter olmalıdır')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('Şifre en az bir büyük harf, bir küçük harf ve bir rakam içermelidir'),
  handleValidationErrors
];

// User validations
const validateUserUpdate = [
  body('ad')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage('Ad 2-100 karakter arasında olmalıdır')
    .matches(/^[a-zA-ZğüşöçİĞÜŞÖÇ\s]+$/).withMessage('Ad sadece harf içermelidir'),
  body('soyad')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage('Soyad 2-100 karakter arasında olmalıdır')
    .matches(/^[a-zA-ZğüşöçİĞÜŞÖÇ\s]+$/).withMessage('Soyad sadece harf içermelidir'),
  body('email')
    .optional()
    .trim()
    .isEmail().withMessage('Geçerli bir e-posta adresi giriniz')
    .normalizeEmail(),
  body('telefon')
    .optional()
    .trim()
    .custom(validators.phoneNumber),
  handleValidationErrors
];

const validatePasswordChange = [
  body('currentPassword')
    .notEmpty().withMessage('Mevcut şifre gereklidir'),
  body('newPassword')
    .notEmpty().withMessage('Yeni şifre gereklidir')
    .isLength({ min: 6 }).withMessage('Şifre en az 6 karakter olmalıdır')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('Şifre en az bir büyük harf, bir küçük harf ve bir rakam içermelidir')
    .custom((value, { req }) => value !== req.body.currentPassword).withMessage('Yeni şifre mevcut şifre ile aynı olamaz'),
  handleValidationErrors
];

// Appointment validations
const validateAppointment = [
  body('mahkemeId')
    .notEmpty().withMessage('Mahkeme seçimi gereklidir')
    .custom(validators.isUUID),
  body('hakimId')
    .optional()
    .custom(validators.isUUID),
  body('randevuTarihi')
    .notEmpty().withMessage('Randevu tarihi gereklidir')
    .isDate().withMessage('Geçerli bir tarih giriniz')
    .custom(validators.futureDate),
  body('randevuSaati')
    .notEmpty().withMessage('Randevu saati gereklidir')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Geçerli bir saat formatı giriniz (HH:MM)')
    .custom(validators.workingHours),
  body('islemTuru')
    .notEmpty().withMessage('İşlem türü gereklidir')
    .isIn(['dava_acma', 'durusma', 'evrak_teslimi', 'bilgi_alma', 'harc_odeme', 'uzlasma', 'taniklik', 'bilirkisi', 'diger'])
    .withMessage('Geçersiz işlem türü'),
  body('notlar')
    .optional()
    .isLength({ max: 500 }).withMessage('Notlar en fazla 500 karakter olabilir'),
  handleValidationErrors
];

const validateAppointmentUpdate = [
  body('randevuTarihi')
    .optional()
    .isDate().withMessage('Geçerli bir tarih giriniz')
    .custom(validators.futureDate),
  body('randevuSaati')
    .optional()
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Geçerli bir saat formatı giriniz (HH:MM)')
    .custom(validators.workingHours),
  body('islemTuru')
    .optional()
    .isIn(['dava_acma', 'durusma', 'evrak_teslimi', 'bilgi_alma', 'harc_odeme', 'uzlasma', 'taniklik', 'bilirkisi', 'diger'])
    .withMessage('Geçersiz işlem türü'),
  body('notlar')
    .optional()
    .isLength({ max: 500 }).withMessage('Notlar en fazla 500 karakter olabilir'),
  handleValidationErrors
];

// Court validations
const validateCourt = [
  body('ad')
    .trim()
    .notEmpty().withMessage('Mahkeme adı gereklidir')
    .isLength({ min: 5, max: 255 }).withMessage('Mahkeme adı 5-255 karakter arasında olmalıdır'),
  body('tur')
    .notEmpty().withMessage('Mahkeme türü gereklidir')
    .isIn(['asliye_hukuk', 'asliye_ceza', 'agir_ceza', 'sulh_hukuk', 'sulh_ceza', 'icra', 'aile', 'is', 'ticaret', 'fikri_mulkiyet', 'tuketici', 'kadastro', 'idare'])
    .withMessage('Geçersiz mahkeme türü'),
  body('adres.il')
    .notEmpty().withMessage('İl gereklidir'),
  body('adres.ilce')
    .notEmpty().withMessage('İlçe gereklidir'),
  body('adres.cadde')
    .notEmpty().withMessage('Cadde/Sokak gereklidir'),
  body('telefon')
    .optional()
    .matches(/^[0-9\s\-\(\)]+$/).withMessage('Geçersiz telefon formatı'),
  body('email')
    .optional()
    .isEmail().withMessage('Geçerli bir e-posta adresi giriniz'),
  body('koordinat.lat')
    .optional()
    .isFloat({ min: -90, max: 90 }).withMessage('Geçersiz enlem değeri'),
  body('koordinat.lng')
    .optional()
    .isFloat({ min: -180, max: 180 }).withMessage('Geçersiz boylam değeri'),
  body('kapasite')
    .optional()
    .isInt({ min: 1, max: 1000 }).withMessage('Kapasite 1-1000 arasında olmalıdır'),
  handleValidationErrors
];

const validateCourtUpdate = [
  body('ad')
    .optional()
    .trim()
    .isLength({ min: 5, max: 255 }).withMessage('Mahkeme adı 5-255 karakter arasında olmalıdır'),
  body('tur')
    .optional()
    .isIn(['asliye_hukuk', 'asliye_ceza', 'agir_ceza', 'sulh_hukuk', 'sulh_ceza', 'icra', 'aile', 'is', 'ticaret', 'fikri_mulkiyet', 'tuketici', 'kadastro', 'idare'])
    .withMessage('Geçersiz mahkeme türü'),
  body('telefon')
    .optional()
    .matches(/^[0-9\s\-\(\)]+$/).withMessage('Geçersiz telefon formatı'),
  body('email')
    .optional()
    .isEmail().withMessage('Geçerli bir e-posta adresi giriniz'),
  body('koordinat.lat')
    .optional()
    .isFloat({ min: -90, max: 90 }).withMessage('Geçersiz enlem değeri'),
  body('koordinat.lng')
    .optional()
    .isFloat({ min: -180, max: 180 }).withMessage('Geçersiz boylam değeri'),
  body('kapasite')
    .optional()
    .isInt({ min: 1, max: 1000 }).withMessage('Kapasite 1-1000 arasında olmalıdır'),
  body('aktif')
    .optional()
    .isBoolean().withMessage('Aktif değeri boolean olmalıdır'),
  handleValidationErrors
];

// Query parameter validations
const validatePagination = [
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Limit 1-100 arasında olmalıdır'),
  query('offset')
    .optional()
    .isInt({ min: 0 }).withMessage('Offset 0 veya daha büyük olmalıdır'),
  handleValidationErrors
];

const validateDateRange = [
  query('startDate')
    .optional()
    .isDate().withMessage('Geçerli bir başlangıç tarihi giriniz'),
  query('endDate')
    .optional()
    .isDate().withMessage('Geçerli bir bitiş tarihi giriniz')
    .custom((value, { req }) => {
      if (req.query.startDate && value < req.query.startDate) {
        throw new Error('Bitiş tarihi başlangıç tarihinden önce olamaz');
      }
      return true;
    }),
  handleValidationErrors
];

// ID parameter validation
const validateId = [
  param('id')
    .custom(validators.isUUID),
  handleValidationErrors
];

module.exports = {
  validateLogin,
  validateRegister,
  validatePasswordReset,
  validateUserUpdate,
  validatePasswordChange,
  validateAppointment,
  validateAppointmentUpdate,
  validateCourt,
  validateCourtUpdate,
  validatePagination,
  validateDateRange,
  validateId,
  validators,
  handleValidationErrors
};