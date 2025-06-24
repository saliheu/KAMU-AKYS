// API configuration
export const API_BASE_URL = process.env.REACT_APP_API_URL || '/api';
export const API_TIMEOUT = 10000; // 10 seconds

// Storage keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'authToken',
  USER: 'user',
  CITIZEN: 'citizen',
  OFFICER: 'officer',
};

// Pagination
export const DEFAULT_PAGE_SIZE = 10;
export const PAGE_SIZE_OPTIONS = [5, 10, 25, 50];

// File upload
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

// Status labels in Turkish
export const STATUS_LABELS = {
  PENDING: 'Beklemede',
  IN_PROGRESS: 'İşlemde',
  RESOLVED: 'Çözüldü',
  REJECTED: 'Reddedildi',
};

// Priority labels in Turkish
export const PRIORITY_LABELS = {
  LOW: 'Düşük',
  MEDIUM: 'Orta',
  HIGH: 'Yüksek',
  URGENT: 'Acil',
};

// Date formats
export const DATE_FORMAT = 'dd/MM/yyyy';
export const DATETIME_FORMAT = 'dd/MM/yyyy HH:mm';

// Validation patterns
export const VALIDATION_PATTERNS = {
  TC_NO: /^[1-9]\d{10}$/,
  PHONE: /^(05|5)\d{9}$/,
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
};