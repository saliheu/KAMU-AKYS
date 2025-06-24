import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { ComplaintStatus, ComplaintPriority } from '../types';
import { STATUS_LABELS, PRIORITY_LABELS } from './constants';

// Format date functions
export const formatDate = (date: string | Date): string => {
  return format(new Date(date), 'dd/MM/yyyy', { locale: tr });
};

export const formatDateTime = (date: string | Date): string => {
  return format(new Date(date), 'dd/MM/yyyy HH:mm', { locale: tr });
};

export const formatRelativeTime = (date: string | Date): string => {
  const now = new Date();
  const then = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - then.getTime()) / 1000);

  if (diffInSeconds < 60) return 'az önce';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} dakika önce`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} saat önce`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} gün önce`;
  
  return formatDate(date);
};

// Get status/priority labels
export const getStatusLabel = (status: ComplaintStatus): string => {
  return STATUS_LABELS[status] || status;
};

export const getPriorityLabel = (priority: ComplaintPriority): string => {
  return PRIORITY_LABELS[priority] || priority;
};

// File helpers
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const getFileExtension = (filename: string): string => {
  return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2);
};

export const isImageFile = (filename: string): boolean => {
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'];
  const extension = getFileExtension(filename).toLowerCase();
  return imageExtensions.includes(extension);
};

// Validation helpers
export const validateTcNo = (tcNo: string): boolean => {
  if (!/^[1-9]\d{10}$/.test(tcNo)) return false;
  
  const digits = tcNo.split('').map(Number);
  const oddSum = digits[0] + digits[2] + digits[4] + digits[6] + digits[8];
  const evenSum = digits[1] + digits[3] + digits[5] + digits[7];
  
  const tenthDigit = ((oddSum * 7) - evenSum) % 10;
  const eleventhDigit = (oddSum + evenSum + digits[9]) % 10;
  
  return digits[9] === tenthDigit && digits[10] === eleventhDigit;
};

export const validatePhone = (phone: string): boolean => {
  return /^(05|5)\d{9}$/.test(phone.replace(/\s/g, ''));
};

export const validateEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

// String helpers
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
};

export const capitalizeFirst = (text: string): string => {
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

// Error helpers
export const getErrorMessage = (error: any): string => {
  if (typeof error === 'string') return error;
  if (error?.message) return error.message;
  if (error?.response?.data?.message) return error.response.data.message;
  if (error?.response?.data?.error) return error.response.data.error;
  return 'Bir hata oluştu';
};

// Local storage helpers
export const setLocalStorage = (key: string, value: any): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('LocalStorage error:', error);
  }
};

export const getLocalStorage = <T>(key: string, defaultValue: T | null = null): T | null => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error('LocalStorage error:', error);
    return defaultValue;
  }
};

export const removeLocalStorage = (key: string): void => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error('LocalStorage error:', error);
  }
};