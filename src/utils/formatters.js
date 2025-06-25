/**
 * Date and time formatting utilities for Turkish locale
 * Optimized for court appointment system
 */

// Turkish month names
const TURKISH_MONTHS = [
  'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
];

// Turkish short month names
const TURKISH_MONTHS_SHORT = [
  'Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz',
  'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'
];

// Turkish day names
const TURKISH_DAYS = [
  'Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'
];

// Turkish short day names
const TURKISH_DAYS_SHORT = [
  'Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'
];

/**
 * Format date in DD/MM/YYYY format
 * @param {Date|string} date - Date to format
 * @returns {string} Formatted date string
 */
export const formatDate = (date) => {
  if (!date) return '';
  
  try {
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) return '';
    
    const day = dateObj.getDate().toString().padStart(2, '0');
    const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
    const year = dateObj.getFullYear();
    
    return `${day}/${month}/${year}`;
  } catch (error) {
    console.error('Date formatting error:', error);
    return '';
  }
};

/**
 * Format date in DD Month YYYY format (Turkish)
 * @param {Date|string} date - Date to format
 * @returns {string} Formatted date string
 */
export const formatDateLong = (date) => {
  if (!date) return '';
  
  try {
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) return '';
    
    const day = dateObj.getDate();
    const month = TURKISH_MONTHS[dateObj.getMonth()];
    const year = dateObj.getFullYear();
    
    return `${day} ${month} ${year}`;
  } catch (error) {
    console.error('Date formatting error:', error);
    return '';
  }
};

/**
 * Format date with day name in Turkish
 * @param {Date|string} date - Date to format
 * @returns {string} Formatted date string with day name
 */
export const formatDateWithDay = (date) => {
  if (!date) return '';
  
  try {
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) return '';
    
    const dayName = TURKISH_DAYS[dateObj.getDay()];
    const formattedDate = formatDateLong(dateObj);
    
    return `${dayName}, ${formattedDate}`;
  } catch (error) {
    console.error('Date formatting error:', error);
    return '';
  }
};

/**
 * Format time in HH:MM format
 * @param {Date|string} time - Time to format
 * @returns {string} Formatted time string
 */
export const formatTime = (time) => {
  if (!time) return '';
  
  try {
    let timeObj;
    
    // Handle time string (HH:MM format)
    if (typeof time === 'string') {
      if (/^\d{2}:\d{2}$/.test(time)) {
        return time;
      }
      timeObj = new Date(time);
    } else {
      timeObj = new Date(time);
    }
    
    if (isNaN(timeObj.getTime())) return '';
    
    const hours = timeObj.getHours().toString().padStart(2, '0');
    const minutes = timeObj.getMinutes().toString().padStart(2, '0');
    
    return `${hours}:${minutes}`;
  } catch (error) {
    console.error('Time formatting error:', error);
    return '';
  }
};

/**
 * Format date and time together
 * @param {Date|string} datetime - DateTime to format
 * @returns {string} Formatted datetime string
 */
export const formatDateTime = (datetime) => {
  if (!datetime) return '';
  
  try {
    const dateObj = new Date(datetime);
    if (isNaN(dateObj.getTime())) return '';
    
    const date = formatDate(dateObj);
    const time = formatTime(dateObj);
    
    return `${date} ${time}`;
  } catch (error) {
    console.error('DateTime formatting error:', error);
    return '';
  }
};

/**
 * Format date and time in long format with day name
 * @param {Date|string} datetime - DateTime to format
 * @returns {string} Formatted datetime string
 */
export const formatDateTimeLong = (datetime) => {
  if (!datetime) return '';
  
  try {
    const dateObj = new Date(datetime);
    if (isNaN(dateObj.getTime())) return '';
    
    const dateWithDay = formatDateWithDay(dateObj);
    const time = formatTime(dateObj);
    
    return `${dateWithDay} ${time}`;
  } catch (error) {
    console.error('DateTime formatting error:', error);
    return '';
  }
};

/**
 * Get relative time description (today, tomorrow, yesterday, etc.)
 * @param {Date|string} date - Date to compare
 * @returns {string} Relative time description
 */
export const getRelativeTime = (date) => {
  if (!date) return '';
  
  try {
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) return '';
    
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    // Reset time to compare only dates
    const resetTime = (d) => {
      d.setHours(0, 0, 0, 0);
      return d;
    };
    
    const targetDate = resetTime(new Date(dateObj));
    const todayDate = resetTime(new Date(today));
    const tomorrowDate = resetTime(new Date(tomorrow));
    const yesterdayDate = resetTime(new Date(yesterday));
    
    if (targetDate.getTime() === todayDate.getTime()) {
      return 'Bugün';
    } else if (targetDate.getTime() === tomorrowDate.getTime()) {
      return 'Yarın';
    } else if (targetDate.getTime() === yesterdayDate.getTime()) {
      return 'Dün';
    } else {
      const diffTime = targetDate.getTime() - todayDate.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays > 0 && diffDays <= 7) {
        return `${diffDays} gün sonra`;
      } else if (diffDays < 0 && diffDays >= -7) {
        return `${Math.abs(diffDays)} gün önce`;
      } else {
        return formatDateLong(dateObj);
      }
    }
  } catch (error) {
    console.error('Relative time formatting error:', error);
    return '';
  }
};

/**
 * Format duration between two dates/times
 * @param {Date|string} startDate - Start date
 * @param {Date|string} endDate - End date
 * @returns {string} Duration description
 */
export const formatDuration = (startDate, endDate) => {
  if (!startDate || !endDate) return '';
  
  try {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return '';
    
    const diffMs = end.getTime() - start.getTime();
    const diffMinutes = Math.round(diffMs / (1000 * 60));
    
    if (diffMinutes < 60) {
      return `${diffMinutes} dakika`;
    } else {
      const hours = Math.floor(diffMinutes / 60);
      const minutes = diffMinutes % 60;
      
      if (minutes === 0) {
        return `${hours} saat`;
      } else {
        return `${hours} saat ${minutes} dakika`;
      }
    }
  } catch (error) {
    console.error('Duration formatting error:', error);
    return '';
  }
};

/**
 * Check if a date is today
 * @param {Date|string} date - Date to check
 * @returns {boolean} True if date is today
 */
export const isToday = (date) => {
  if (!date) return false;
  
  try {
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) return false;
    
    const today = new Date();
    
    return dateObj.getDate() === today.getDate() &&
           dateObj.getMonth() === today.getMonth() &&
           dateObj.getFullYear() === today.getFullYear();
  } catch (error) {
    return false;
  }
};

/**
 * Check if a date is tomorrow
 * @param {Date|string} date - Date to check
 * @returns {boolean} True if date is tomorrow
 */
export const isTomorrow = (date) => {
  if (!date) return false;
  
  try {
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) return false;
    
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    return dateObj.getDate() === tomorrow.getDate() &&
           dateObj.getMonth() === tomorrow.getMonth() &&
           dateObj.getFullYear() === tomorrow.getFullYear();
  } catch (error) {
    return false;
  }
};

/**
 * Check if a date is in the past
 * @param {Date|string} date - Date to check
 * @returns {boolean} True if date is in the past
 */
export const isPastDate = (date) => {
  if (!date) return false;
  
  try {
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) return false;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    dateObj.setHours(0, 0, 0, 0);
    
    return dateObj.getTime() < today.getTime();
  } catch (error) {
    return false;
  }
};

/**
 * Check if a date is in the future
 * @param {Date|string} date - Date to check
 * @returns {boolean} True if date is in the future
 */
export const isFutureDate = (date) => {
  if (!date) return false;
  
  try {
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) return false;
    
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    
    return dateObj.getTime() > today.getTime();
  } catch (error) {
    return false;
  }
};

/**
 * Check if a date is a weekend (Saturday or Sunday)
 * @param {Date|string} date - Date to check
 * @returns {boolean} True if date is weekend
 */
export const isWeekend = (date) => {
  if (!date) return false;
  
  try {
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) return false;
    
    const dayOfWeek = dateObj.getDay();
    return dayOfWeek === 0 || dayOfWeek === 6; // Sunday or Saturday
  } catch (error) {
    return false;
  }
};

/**
 * Check if a date is a working day (Monday to Friday)
 * @param {Date|string} date - Date to check
 * @returns {boolean} True if date is a working day
 */
export const isWorkingDay = (date) => {
  return !isWeekend(date);
};

/**
 * Get the next working day from a given date
 * @param {Date|string} date - Starting date
 * @returns {Date} Next working day
 */
export const getNextWorkingDay = (date) => {
  if (!date) return null;
  
  try {
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) return null;
    
    let nextDay = new Date(dateObj);
    nextDay.setDate(nextDay.getDate() + 1);
    
    while (isWeekend(nextDay)) {
      nextDay.setDate(nextDay.getDate() + 1);
    }
    
    return nextDay;
  } catch (error) {
    return null;
  }
};

/**
 * Format time range (e.g., "09:00 - 10:00")
 * @param {string} startTime - Start time
 * @param {string} endTime - End time
 * @returns {string} Formatted time range
 */
export const formatTimeRange = (startTime, endTime) => {
  if (!startTime || !endTime) return '';
  
  const start = formatTime(startTime);
  const end = formatTime(endTime);
  
  if (!start || !end) return '';
  
  return `${start} - ${end}`;
};

/**
 * Format phone number in Turkish format
 * @param {string} phone - Phone number to format
 * @returns {string} Formatted phone number
 */
export const formatPhoneNumber = (phone) => {
  if (!phone) return '';
  
  // Remove all non-digits
  const cleaned = phone.replace(/\D/g, '');
  
  // Turkish mobile format: +90 5XX XXX XX XX
  if (cleaned.length === 11 && cleaned.startsWith('0')) {
    return `+90 ${cleaned.slice(1, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7, 9)} ${cleaned.slice(9)}`;
  }
  
  // Turkish mobile format without country code: 5XX XXX XX XX
  if (cleaned.length === 10 && cleaned.startsWith('5')) {
    return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6, 8)} ${cleaned.slice(8)}`;
  }
  
  // Return original if format not recognized
  return phone;
};

/**
 * Format Turkish ID number (mask middle digits)
 * @param {string} tcNo - Turkish ID number
 * @returns {string} Masked ID number
 */
export const formatTcNo = (tcNo) => {
  if (!tcNo || tcNo.length !== 11) return tcNo;
  
  return `${tcNo.slice(0, 3)}****${tcNo.slice(-2)}`;
};

/**
 * Format currency in Turkish Lira
 * @param {number} amount - Amount to format
 * @returns {string} Formatted currency
 */
export const formatCurrency = (amount) => {
  if (typeof amount !== 'number' || isNaN(amount)) return '0,00 ₺';
  
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

/**
 * Format number with Turkish locale
 * @param {number} number - Number to format
 * @returns {string} Formatted number
 */
export const formatNumber = (number) => {
  if (typeof number !== 'number' || isNaN(number)) return '0';
  
  return new Intl.NumberFormat('tr-TR').format(number);
};

/**
 * Parse date string in DD/MM/YYYY format
 * @param {string} dateString - Date string to parse
 * @returns {Date|null} Parsed date or null if invalid
 */
export const parseDate = (dateString) => {
  if (!dateString) return null;
  
  const parts = dateString.split('/');
  if (parts.length !== 3) return null;
  
  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1; // Month is 0-indexed
  const year = parseInt(parts[2], 10);
  
  if (isNaN(day) || isNaN(month) || isNaN(year)) return null;
  
  const date = new Date(year, month, day);
  
  // Validate the date
  if (date.getDate() !== day || 
      date.getMonth() !== month || 
      date.getFullYear() !== year) {
    return null;
  }
  
  return date;
};

/**
 * Get age from birth date
 * @param {Date|string} birthDate - Birth date
 * @returns {number} Age in years
 */
export const getAge = (birthDate) => {
  if (!birthDate) return 0;
  
  try {
    const birth = new Date(birthDate);
    if (isNaN(birth.getTime())) return 0;
    
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return Math.max(0, age);
  } catch (error) {
    return 0;
  }
};

export default {
  formatDate,
  formatDateLong,
  formatDateWithDay,
  formatTime,
  formatDateTime,
  formatDateTimeLong,
  getRelativeTime,
  formatDuration,
  isToday,
  isTomorrow,
  isPastDate,
  isFutureDate,
  isWeekend,
  isWorkingDay,
  getNextWorkingDay,
  formatTimeRange,
  formatPhoneNumber,
  formatTcNo,
  formatCurrency,
  formatNumber,
  parseDate,
  getAge
};