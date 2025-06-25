// Turkish provinces with their codes
export const PROVINCES = [
  { value: '01', label: 'Adana' },
  { value: '02', label: 'Adıyaman' },
  { value: '03', label: 'Afyonkarahisar' },
  { value: '04', label: 'Ağrı' },
  { value: '05', label: 'Amasya' },
  { value: '06', label: 'Ankara' },
  { value: '07', label: 'Antalya' },
  { value: '08', label: 'Artvin' },
  { value: '09', label: 'Aydın' },
  { value: '10', label: 'Balıkesir' },
  { value: '11', label: 'Bilecik' },
  { value: '12', label: 'Bingöl' },
  { value: '13', label: 'Bitlis' },
  { value: '14', label: 'Bolu' },
  { value: '15', label: 'Burdur' },
  { value: '16', label: 'Bursa' },
  { value: '17', label: 'Çanakkale' },
  { value: '18', label: 'Çankırı' },
  { value: '19', label: 'Çorum' },
  { value: '20', label: 'Denizli' },
  { value: '21', label: 'Diyarbakır' },
  { value: '22', label: 'Edirne' },
  { value: '23', label: 'Elazığ' },
  { value: '24', label: 'Erzincan' },
  { value: '25', label: 'Erzurum' },
  { value: '26', label: 'Eskişehir' },
  { value: '27', label: 'Gaziantep' },
  { value: '28', label: 'Giresun' },
  { value: '29', label: 'Gümüşhane' },
  { value: '30', label: 'Hakkâri' },
  { value: '31', label: 'Hatay' },
  { value: '32', label: 'Isparta' },
  { value: '33', label: 'Mersin' },
  { value: '34', label: 'İstanbul' },
  { value: '35', label: 'İzmir' },
  { value: '36', label: 'Kars' },
  { value: '37', label: 'Kastamonu' },
  { value: '38', label: 'Kayseri' },
  { value: '39', label: 'Kırklareli' },
  { value: '40', label: 'Kırşehir' },
  { value: '41', label: 'Kocaeli' },
  { value: '42', label: 'Konya' },
  { value: '43', label: 'Kütahya' },
  { value: '44', label: 'Malatya' },
  { value: '45', label: 'Manisa' },
  { value: '46', label: 'Kahramanmaraş' },
  { value: '47', label: 'Mardin' },
  { value: '48', label: 'Muğla' },
  { value: '49', label: 'Muş' },
  { value: '50', label: 'Nevşehir' },
  { value: '51', label: 'Niğde' },
  { value: '52', label: 'Ordu' },
  { value: '53', label: 'Rize' },
  { value: '54', label: 'Sakarya' },
  { value: '55', label: 'Samsun' },
  { value: '56', label: 'Siirt' },
  { value: '57', label: 'Sinop' },
  { value: '58', label: 'Sivas' },
  { value: '59', label: 'Tekirdağ' },
  { value: '60', label: 'Tokat' },
  { value: '61', label: 'Trabzon' },
  { value: '62', label: 'Tunceli' },
  { value: '63', label: 'Şanlıurfa' },
  { value: '64', label: 'Uşak' },
  { value: '65', label: 'Van' },
  { value: '66', label: 'Yozgat' },
  { value: '67', label: 'Zonguldak' },
  { value: '68', label: 'Aksaray' },
  { value: '69', label: 'Bayburt' },
  { value: '70', label: 'Karaman' },
  { value: '71', label: 'Kırıkkale' },
  { value: '72', label: 'Batman' },
  { value: '73', label: 'Şırnak' },
  { value: '74', label: 'Bartın' },
  { value: '75', label: 'Ardahan' },
  { value: '76', label: 'Iğdır' },
  { value: '77', label: 'Yalova' },
  { value: '78', label: 'Karabük' },
  { value: '79', label: 'Kilis' },
  { value: '80', label: 'Osmaniye' },
  { value: '81', label: 'Düzce' }
];

// Court types
export const COURT_TYPES = [
  { value: 'civil', label: 'Hukuk Mahkemesi' },
  { value: 'criminal', label: 'Ceza Mahkemesi' },
  { value: 'commercial', label: 'Ticaret Mahkemesi' },
  { value: 'labor', label: 'İş Mahkemesi' },
  { value: 'family', label: 'Aile Mahkemesi' },
  { value: 'administrative', label: 'İdare Mahkemesi' },
  { value: 'tax', label: 'Vergi Mahkemesi' },
  { value: 'execution', label: 'İcra Müdürlüğü' },
  { value: 'land_registry', label: 'Tapu Müdürlüğü' },
  { value: 'notary', label: 'Noterlik' }
];

// Appointment types
export const APPOINTMENT_TYPES = [
  { value: 'consultation', label: 'Hukuki Danışmanlık' },
  { value: 'document_submission', label: 'Evrak Teslimi' },
  { value: 'hearing', label: 'Duruşma Randevusu' },
  { value: 'mediation', label: 'Arabuluculuk' },
  { value: 'expert_examination', label: 'Bilirkişi İncelemesi' },
  { value: 'evidence_submission', label: 'Delil Sunumu' },
  { value: 'case_inquiry', label: 'Dava Takibi' },
  { value: 'appeal', label: 'İtiraz İşlemi' },
  { value: 'execution_procedure', label: 'İcra İşlemi' },
  { value: 'notarization', label: 'Noter İşlemi' },
  { value: 'certificate_request', label: 'Belge Talebi' },
  { value: 'other', label: 'Diğer' }
];

// Appointment statuses
export const APPOINTMENT_STATUSES = [
  { value: 'pending', label: 'Beklemede', color: '#ed8936' },
  { value: 'confirmed', label: 'Onaylandı', color: '#38a169' },
  { value: 'cancelled', label: 'İptal Edildi', color: '#e53e3e' },
  { value: 'completed', label: 'Tamamlandı', color: '#3182ce' },
  { value: 'no_show', label: 'Gelmedi', color: '#a0aec0' },
  { value: 'rescheduled', label: 'Ertelendi', color: '#805ad5' }
];

// Time slots (default working hours)
export const DEFAULT_TIME_SLOTS = [
  { startTime: '09:00', endTime: '09:30' },
  { startTime: '09:30', endTime: '10:00' },
  { startTime: '10:00', endTime: '10:30' },
  { startTime: '10:30', endTime: '11:00' },
  { startTime: '11:00', endTime: '11:30' },
  { startTime: '11:30', endTime: '12:00' },
  { startTime: '13:00', endTime: '13:30' },
  { startTime: '13:30', endTime: '14:00' },
  { startTime: '14:00', endTime: '14:30' },
  { startTime: '14:30', endTime: '15:00' },
  { startTime: '15:00', endTime: '15:30' },
  { startTime: '15:30', endTime: '16:00' },
  { startTime: '16:00', endTime: '16:30' }
];

// User roles
export const USER_ROLES = [
  { value: 'citizen', label: 'Vatandaş' },
  { value: 'lawyer', label: 'Avukat' },
  { value: 'court_staff', label: 'Mahkeme Personeli' },
  { value: 'admin', label: 'Yönetici' },
  { value: 'super_admin', label: 'Sistem Yöneticisi' }
];

// Date and time constants
export const DATE_FORMATS = {
  SHORT: 'DD/MM/YYYY',
  LONG: 'DD MMMM YYYY dddd',
  WITH_TIME: 'DD/MM/YYYY HH:mm',
  FULL: 'DD MMMM YYYY dddd HH:mm'
};

export const TIME_FORMATS = {
  SHORT: 'HH:mm',
  WITH_SECONDS: 'HH:mm:ss'
};

// Working days and hours
export const WORKING_DAYS = [1, 2, 3, 4, 5]; // Monday to Friday
export const WORKING_HOURS = {
  start: '09:00',
  end: '17:00',
  lunchStart: '12:00',
  lunchEnd: '13:00'
};

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [5, 10, 20, 50],
  MAX_PAGE_SIZE: 100
};

// File upload
export const FILE_UPLOAD = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_TYPES: [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/jpg',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ],
  ALLOWED_EXTENSIONS: ['.pdf', '.jpg', '.jpeg', '.png', '.doc', '.docx']
};

// API endpoints
export const API_ENDPOINTS = {
  BASE_URL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001/api',
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000
};

// Cache settings
export const CACHE_SETTINGS = {
  COURTS_TTL: 60 * 60 * 1000, // 1 hour
  SLOTS_TTL: 5 * 60 * 1000, // 5 minutes
  USER_PROFILE_TTL: 30 * 60 * 1000, // 30 minutes
  APPOINTMENTS_TTL: 10 * 60 * 1000 // 10 minutes
};

// Error messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Ağ bağlantı hatası. Lütfen internet bağlantınızı kontrol edin.',
  SERVER_ERROR: 'Sunucu hatası. Lütfen daha sonra tekrar deneyin.',
  VALIDATION_ERROR: 'Girdiğiniz bilgilerde hata var. Lütfen kontrol edin.',
  UNAUTHORIZED: 'Bu işlem için yetkiniz bulunmamaktadır.',
  NOT_FOUND: 'İstenen kaynak bulunamadı.',
  TIMEOUT: 'İstek zaman aşımına uğradı. Lütfen tekrar deneyin.',
  UNKNOWN: 'Beklenmeyen bir hata oluştu.'
};

// Success messages
export const SUCCESS_MESSAGES = {
  APPOINTMENT_CREATED: 'Randevunuz başarıyla oluşturuldu.',
  APPOINTMENT_UPDATED: 'Randevu başarıyla güncellendi.',
  APPOINTMENT_CANCELLED: 'Randevu başarıyla iptal edildi.',
  PROFILE_UPDATED: 'Profiliniz başarıyla güncellendi.',
  PASSWORD_CHANGED: 'Şifreniz başarıyla değiştirildi.',
  LOGIN_SUCCESS: 'Başarıyla giriş yaptınız.',
  LOGOUT_SUCCESS: 'Başarıyla çıkış yaptınız.'
};

// Validation rules
export const VALIDATION_RULES = {
  TC_NO: {
    LENGTH: 11,
    PATTERN: /^\d{11}$/
  },
  PASSWORD: {
    MIN_LENGTH: 6,
    MAX_LENGTH: 50,
    PATTERN: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/
  },
  PHONE: {
    PATTERN: /^[0-9\s\-\+\(\)]{10,15}$/
  },
  EMAIL: {
    PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  },
  NAME: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 50,
    PATTERN: /^[a-zA-ZçğıöşüÇĞIİÖŞÜ\s]+$/
  },
  DESCRIPTION: {
    MAX_LENGTH: 500
  }
};

// Local storage keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'authToken',
  USER_PREFERENCES: 'userPreferences',
  THEME: 'theme',
  LANGUAGE: 'language',
  REMEMBER_ME: 'rememberMe'
};

// Theme settings
export const THEME = {
  PRIMARY_COLOR: '#3182ce',
  SECONDARY_COLOR: '#4a5568',
  SUCCESS_COLOR: '#38a169',
  WARNING_COLOR: '#ed8936',
  ERROR_COLOR: '#e53e3e',
  INFO_COLOR: '#3182ce'
};

// Application settings
export const APP_SETTINGS = {
  NAME: 'Mahkeme Randevu Sistemi',
  VERSION: '1.0.0',
  DESCRIPTION: 'T.C. Adalet Bakanlığı Mahkeme Randevu Sistemi',
  CONTACT_EMAIL: 'destek@mahkeme.gov.tr',
  CONTACT_PHONE: '444 1 XXX',
  SUPPORT_HOURS: 'Pazartesi - Cuma 09:00 - 17:00'
};

// Feature flags
export const FEATURES = {
  ENABLE_NOTIFICATIONS: true,
  ENABLE_EMAIL_REMINDERS: true,
  ENABLE_SMS_REMINDERS: false,
  ENABLE_CALENDAR_INTEGRATION: true,
  ENABLE_DOCUMENT_UPLOAD: true,
  ENABLE_VIDEO_APPOINTMENTS: false,
  ENABLE_PAYMENT_INTEGRATION: false
};

// Browser support
export const BROWSER_SUPPORT = {
  MINIMUM_VERSIONS: {
    chrome: 70,
    firefox: 65,
    safari: 12,
    edge: 44
  }
};

export default {
  PROVINCES,
  COURT_TYPES,
  APPOINTMENT_TYPES,
  APPOINTMENT_STATUSES,
  DEFAULT_TIME_SLOTS,
  USER_ROLES,
  DATE_FORMATS,
  TIME_FORMATS,
  WORKING_DAYS,
  WORKING_HOURS,
  PAGINATION,
  FILE_UPLOAD,
  API_ENDPOINTS,
  CACHE_SETTINGS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  VALIDATION_RULES,
  STORAGE_KEYS,
  THEME,
  APP_SETTINGS,
  FEATURES,
  BROWSER_SUPPORT
};