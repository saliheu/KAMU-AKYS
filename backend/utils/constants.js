// Application constants
module.exports = {
  // User roles
  USER_ROLES: {
    CITIZEN: 'vatandas',
    LAWYER: 'avukat',
    JUDGE: 'hakim',
    STAFF: 'personel',
    ADMIN: 'admin'
  },

  // Appointment status
  APPOINTMENT_STATUS: {
    PENDING: 'beklemede',
    CONFIRMED: 'onaylandi',
    CANCELLED: 'iptal',
    COMPLETED: 'tamamlandi'
  },

  // Appointment types
  APPOINTMENT_TYPES: {
    LAWSUIT: 'dava_acma',
    HEARING: 'durusma',
    DOCUMENT_SUBMISSION: 'evrak_teslimi',
    INFORMATION: 'bilgi_alma',
    FEE_PAYMENT: 'harc_odeme',
    MEDIATION: 'uzlasma',
    WITNESS: 'taniklik',
    EXPERT: 'bilirkisi',
    OTHER: 'diger'
  },

  // Court types
  COURT_TYPES: {
    CIVIL_COURT: 'asliye_hukuk',
    CRIMINAL_COURT: 'asliye_ceza',
    HEAVY_PENAL_COURT: 'agir_ceza',
    PEACE_CIVIL: 'sulh_hukuk',
    PEACE_CRIMINAL: 'sulh_ceza',
    ENFORCEMENT: 'icra',
    FAMILY: 'aile',
    LABOR: 'is',
    COMMERCIAL: 'ticaret',
    INTELLECTUAL_PROPERTY: 'fikri_mulkiyet',
    CONSUMER: 'tuketici',
    CADASTRE: 'kadastro',
    ADMINISTRATIVE: 'idare'
  },

  // Lawyer specializations
  LAWYER_SPECIALIZATIONS: {
    CRIMINAL: 'ceza',
    CIVIL: 'hukuk',
    ADMINISTRATIVE: 'idare',
    TAX: 'vergi',
    LABOR: 'is',
    FAMILY: 'aile',
    COMMERCIAL: 'ticaret',
    REAL_ESTATE: 'gayrimenkul',
    INHERITANCE: 'miras',
    BANKRUPTCY: 'icra_iflas',
    INTELLECTUAL_PROPERTY: 'fikri_mulkiyet',
    INSURANCE: 'sigorta',
    HEALTH: 'saglik',
    CONSUMER: 'tuketici',
    IT: 'bilisim',
    OTHER: 'diger'
  },

  // Approval status
  APPROVAL_STATUS: {
    PENDING: 'beklemede',
    APPROVED: 'onaylandi',
    REJECTED: 'reddedildi'
  },

  // Time constants
  TIME_CONSTANTS: {
    APPOINTMENT_DURATION_MINUTES: 30,
    WORKING_HOURS_START: '08:00',
    WORKING_HOURS_END: '17:30',
    LUNCH_BREAK_START: '12:00',
    LUNCH_BREAK_END: '13:00',
    SATURDAY_WORKING_START: '09:00',
    SATURDAY_WORKING_END: '13:00'
  },

  // Limits and restrictions
  LIMITS: {
    MAX_DAILY_APPOINTMENTS_PER_USER: 2,
    MAX_FUTURE_APPOINTMENTS_PER_USER: 5,
    MAX_APPOINTMENT_DAYS_IN_ADVANCE: 30,
    MIN_APPOINTMENT_HOURS_IN_ADVANCE: 24,
    MAX_CANCELLATION_HOURS_BEFORE: 2,
    MAX_FILE_UPLOAD_SIZE_MB: 10,
    MAX_FILES_PER_UPLOAD: 5,
    MAX_LOGIN_ATTEMPTS: 5,
    LOGIN_LOCKOUT_DURATION_MINUTES: 15,
    PASSWORD_MIN_LENGTH: 6,
    PASSWORD_RESET_TOKEN_EXPIRY_HOURS: 1,
    EMAIL_VERIFICATION_TOKEN_EXPIRY_DAYS: 7,
    SESSION_TIMEOUT_MINUTES: 30,
    REFRESH_TOKEN_EXPIRY_DAYS: 7
  },

  // Rate limits
  RATE_LIMITS: {
    API_REQUESTS_PER_MINUTE: 60,
    AUTH_REQUESTS_PER_HOUR: 5,
    APPOINTMENT_REQUESTS_PER_HOUR: 10,
    SMS_REQUESTS_PER_HOUR: 5,
    EMAIL_REQUESTS_PER_HOUR: 10,
    PASSWORD_RESET_REQUESTS_PER_HOUR: 3
  },

  // File types
  ALLOWED_FILE_TYPES: [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ],

  // Turkish provinces
  PROVINCES: [
    'Adana', 'Adıyaman', 'Afyonkarahisar', 'Ağrı', 'Amasya', 'Ankara', 'Antalya',
    'Artvin', 'Aydın', 'Balıkesir', 'Bilecik', 'Bingöl', 'Bitlis', 'Bolu',
    'Burdur', 'Bursa', 'Çanakkale', 'Çankırı', 'Çorum', 'Denizli', 'Diyarbakır',
    'Edirne', 'Elazığ', 'Erzincan', 'Erzurum', 'Eskişehir', 'Gaziantep', 'Giresun',
    'Gümüşhane', 'Hakkari', 'Hatay', 'Isparta', 'Mersin', 'İstanbul', 'İzmir',
    'Kars', 'Kastamonu', 'Kayseri', 'Kırklareli', 'Kırşehir', 'Kocaeli', 'Konya',
    'Kütahya', 'Malatya', 'Manisa', 'Kahramanmaraş', 'Mardin', 'Muğla', 'Muş',
    'Nevşehir', 'Niğde', 'Ordu', 'Rize', 'Sakarya', 'Samsun', 'Siirt', 'Sinop',
    'Sivas', 'Tekirdağ', 'Tokat', 'Trabzon', 'Tunceli', 'Şanlıurfa', 'Uşak',
    'Van', 'Yozgat', 'Zonguldak', 'Aksaray', 'Bayburt', 'Karaman', 'Kırıkkale',
    'Batman', 'Şırnak', 'Bartın', 'Ardahan', 'Iğdır', 'Yalova', 'Karabük',
    'Kilis', 'Osmaniye', 'Düzce'
  ],

  // Error codes
  ERROR_CODES: {
    // Authentication errors (1xxx)
    INVALID_CREDENTIALS: 'ERR_1001',
    TOKEN_EXPIRED: 'ERR_1002',
    TOKEN_INVALID: 'ERR_1003',
    UNAUTHORIZED: 'ERR_1004',
    ACCOUNT_LOCKED: 'ERR_1005',
    ACCOUNT_INACTIVE: 'ERR_1006',

    // Validation errors (2xxx)
    VALIDATION_ERROR: 'ERR_2001',
    INVALID_TC_KIMLIK: 'ERR_2002',
    INVALID_PHONE: 'ERR_2003',
    INVALID_EMAIL: 'ERR_2004',
    INVALID_DATE: 'ERR_2005',

    // Resource errors (3xxx)
    NOT_FOUND: 'ERR_3001',
    ALREADY_EXISTS: 'ERR_3002',
    CONFLICT: 'ERR_3003',
    QUOTA_EXCEEDED: 'ERR_3004',

    // Business logic errors (4xxx)
    APPOINTMENT_NOT_AVAILABLE: 'ERR_4001',
    APPOINTMENT_LIMIT_EXCEEDED: 'ERR_4002',
    CANCELLATION_NOT_ALLOWED: 'ERR_4003',
    PAST_DATE_NOT_ALLOWED: 'ERR_4004',

    // External service errors (5xxx)
    UYAP_ERROR: 'ERR_5001',
    SMS_SERVICE_ERROR: 'ERR_5002',
    EMAIL_SERVICE_ERROR: 'ERR_5003',
    PAYMENT_SERVICE_ERROR: 'ERR_5004',

    // System errors (9xxx)
    INTERNAL_ERROR: 'ERR_9001',
    DATABASE_ERROR: 'ERR_9002',
    CACHE_ERROR: 'ERR_9003',
    FILE_SYSTEM_ERROR: 'ERR_9004'
  },

  // Success messages
  SUCCESS_MESSAGES: {
    APPOINTMENT_CREATED: 'Randevu başarıyla oluşturuldu',
    APPOINTMENT_UPDATED: 'Randevu başarıyla güncellendi',
    APPOINTMENT_CANCELLED: 'Randevu başarıyla iptal edildi',
    APPOINTMENT_CONFIRMED: 'Randevu başarıyla onaylandı',
    LOGIN_SUCCESS: 'Giriş başarılı',
    LOGOUT_SUCCESS: 'Çıkış başarılı',
    REGISTRATION_SUCCESS: 'Kayıt başarılı',
    PASSWORD_RESET_SUCCESS: 'Şifre başarıyla sıfırlandı',
    PASSWORD_CHANGED: 'Şifre başarıyla değiştirildi',
    EMAIL_VERIFIED: 'E-posta adresi doğrulandı',
    PHONE_VERIFIED: 'Telefon numarası doğrulandı',
    PROFILE_UPDATED: 'Profil başarıyla güncellendi',
    FILE_UPLOADED: 'Dosya başarıyla yüklendi',
    SMS_SENT: 'SMS gönderildi',
    EMAIL_SENT: 'E-posta gönderildi'
  },

  // Regex patterns
  REGEX_PATTERNS: {
    TC_KIMLIK_NO: /^\d{11}$/,
    PHONE: /^5\d{9}$/,
    EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    TIME: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
    DATE: /^\d{4}-\d{2}-\d{2}$/,
    UUID: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    APPOINTMENT_CODE: /^[A-Z0-9]{8}$/,
    PASSWORD_STRONG: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
  },

  // Cache TTL (in seconds)
  CACHE_TTL: {
    COURT_LIST: 3600,      // 1 hour
    COURT_DETAIL: 600,     // 10 minutes
    AVAILABLE_SLOTS: 300,  // 5 minutes
    USER_SESSION: 1800,    // 30 minutes
    API_RESPONSE: 60,      // 1 minute
    STATISTICS: 900,       // 15 minutes
    HOLIDAYS: 86400,       // 24 hours
    UYAP_DATA: 3600       // 1 hour
  },

  // Queue names
  QUEUE_NAMES: {
    EMAIL: 'email_queue',
    SMS: 'sms_queue',
    NOTIFICATION: 'notification_queue',
    APPOINTMENT_REMINDER: 'appointment_reminder_queue',
    CLEANUP: 'cleanup_queue',
    REPORT: 'report_queue'
  },

  // Notification types
  NOTIFICATION_TYPES: {
    APPOINTMENT_CREATED: 'appointment_created',
    APPOINTMENT_CONFIRMED: 'appointment_confirmed',
    APPOINTMENT_CANCELLED: 'appointment_cancelled',
    APPOINTMENT_REMINDER: 'appointment_reminder',
    APPOINTMENT_UPDATED: 'appointment_updated',
    ACCOUNT_CREATED: 'account_created',
    PASSWORD_RESET: 'password_reset',
    EMAIL_VERIFICATION: 'email_verification',
    SYSTEM_ANNOUNCEMENT: 'system_announcement'
  },

  // Environment names
  ENVIRONMENTS: {
    DEVELOPMENT: 'development',
    TEST: 'test',
    STAGING: 'staging',
    PRODUCTION: 'production'
  },

  // Default values
  DEFAULTS: {
    PAGE_SIZE: 20,
    MAX_PAGE_SIZE: 100,
    COURT_CAPACITY: 100,
    REMINDER_HOURS: 24,
    SESSION_DURATION: 30,
    TIMEZONE: 'Europe/Istanbul',
    LOCALE: 'tr-TR',
    CURRENCY: 'TRY'
  }
};