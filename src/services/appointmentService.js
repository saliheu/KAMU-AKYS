import { apiHelpers, endpoints } from './api';

class AppointmentService {
  /**
   * Get list of courts based on filters
   * @param {Object} params - Filter parameters
   * @param {string} params.province - Province code
   * @param {string} params.type - Court type
   * @param {string} params.search - Search term
   * @returns {Promise<Array>} List of courts
   */
  async getCourts(params = {}) {
    try {
      const queryParams = this.buildQueryParams(params);
      const response = await apiHelpers.get(`${endpoints.courts.list}${queryParams}`);
      
      return {
        courts: response.courts || response,
        totalCount: response.totalCount || response.length || 0
      };
    } catch (error) {
      throw this.handleAppointmentError(error, 'Mahkemeler yüklenirken hata oluştu');
    }
  }
  
  /**
   * Get court details by ID
   * @param {string} courtId - Court ID
   * @returns {Promise<Object>} Court details
   */
  async getCourtById(courtId) {
    try {
      if (!courtId) {
        throw new Error('Mahkeme ID gereklidir');
      }
      
      const response = await apiHelpers.get(endpoints.courts.byId(courtId));
      return response.court || response;
    } catch (error) {
      throw this.handleAppointmentError(error, 'Mahkeme detayları yüklenirken hata oluştu');
    }
  }
  
  /**
   * Get available time slots for a court on a specific date
   * @param {Object} params - Slot parameters
   * @param {string} params.courtId - Court ID
   * @param {string} params.date - Date in YYYY-MM-DD format
   * @param {string} params.appointmentType - Type of appointment
   * @returns {Promise<Array>} Available slots
   */
  async getAvailableSlots(params) {
    try {
      this.validateSlotParams(params);
      
      const { courtId, date, appointmentType } = params;
      const queryParams = this.buildQueryParams({ date, appointmentType });
      
      const response = await apiHelpers.get(
        `${endpoints.courts.availableSlots(courtId)}${queryParams}`
      );
      
      return {
        slots: response.slots || response,
        date: response.date || date,
        courtId: response.courtId || courtId
      };
    } catch (error) {
      throw this.handleAppointmentError(error, 'Uygun saatler yüklenirken hata oluştu');
    }
  }
  
  /**
   * Create a new appointment
   * @param {Object} appointmentData - Appointment data
   * @returns {Promise<Object>} Created appointment
   */
  async createAppointment(appointmentData) {
    try {
      this.validateAppointmentData(appointmentData);
      
      const response = await apiHelpers.post(endpoints.appointments.create, appointmentData);
      
      return {
        appointment: response.appointment || response,
        message: response.message || 'Randevu başarıyla oluşturuldu'
      };
    } catch (error) {
      throw this.handleAppointmentError(error, 'Randevu oluşturulurken hata oluştu');
    }
  }
  
  /**
   * Get user's appointments
   * @param {string|Object} userIdOrParams - User ID or params object
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} User appointments
   */
  async getUserAppointments(userIdOrParams, options = {}) {
    try {
      let userId, params = {};
      
      if (typeof userIdOrParams === 'string') {
        userId = userIdOrParams;
        params = options;
      } else {
        userId = userIdOrParams.userId;
        params = { ...userIdOrParams, ...options };
      }
      
      if (!userId) {
        throw new Error('Kullanıcı ID gereklidir');
      }
      
      const queryParams = this.buildQueryParams(params);
      const response = await apiHelpers.get(
        `${endpoints.appointments.userAppointments(userId)}${queryParams}`
      );
      
      return {
        appointments: response.appointments || response,
        totalCount: response.totalCount || response.length || 0,
        currentPage: response.currentPage || 1,
        totalPages: response.totalPages || 1
      };
    } catch (error) {
      throw this.handleAppointmentError(error, 'Randevular yüklenirken hata oluştu');
    }
  }
  
  /**
   * Get upcoming appointments for a user
   * @param {string} userId - User ID
   * @param {number} limit - Number of appointments to fetch
   * @returns {Promise<Array>} Upcoming appointments
   */
  async getUpcomingAppointments(userId, limit = 10) {
    try {
      if (!userId) {
        throw new Error('Kullanıcı ID gereklidir');
      }
      
      const queryParams = this.buildQueryParams({ limit });
      const response = await apiHelpers.get(
        `${endpoints.appointments.upcoming(userId)}${queryParams}`
      );
      
      return {
        appointments: response.appointments || response
      };
    } catch (error) {
      throw this.handleAppointmentError(error, 'Yaklaşan randevular yüklenirken hata oluştu');
    }
  }
  
  /**
   * Get appointment by ID
   * @param {string} appointmentId - Appointment ID
   * @returns {Promise<Object>} Appointment details
   */
  async getAppointmentById(appointmentId) {
    try {
      if (!appointmentId) {
        throw new Error('Randevu ID gereklidir');
      }
      
      const response = await apiHelpers.get(endpoints.appointments.byId(appointmentId));
      
      return {
        appointment: response.appointment || response
      };
    } catch (error) {
      throw this.handleAppointmentError(error, 'Randevu detayları yüklenirken hata oluştu');
    }
  }
  
  /**
   * Update an appointment
   * @param {string} appointmentId - Appointment ID
   * @param {Object} updateData - Update data
   * @returns {Promise<Object>} Updated appointment
   */
  async updateAppointment(appointmentId, updateData) {
    try {
      if (!appointmentId) {
        throw new Error('Randevu ID gereklidir');
      }
      
      this.validateUpdateData(updateData);
      
      const response = await apiHelpers.put(
        endpoints.appointments.update(appointmentId),
        updateData
      );
      
      return {
        appointment: response.appointment || response,
        message: response.message || 'Randevu başarıyla güncellendi'
      };
    } catch (error) {
      throw this.handleAppointmentError(error, 'Randevu güncellenirken hata oluştu');
    }
  }
  
  /**
   * Cancel an appointment
   * @param {string} appointmentId - Appointment ID
   * @param {string} reason - Cancellation reason
   * @returns {Promise<Object>} Cancellation response
   */
  async cancelAppointment(appointmentId, reason = '') {
    try {
      if (!appointmentId) {
        throw new Error('Randevu ID gereklidir');
      }
      
      const response = await apiHelpers.post(
        endpoints.appointments.cancel(appointmentId),
        { reason }
      );
      
      return {
        success: true,
        message: response.message || 'Randevu başarıyla iptal edildi',
        cancelledAt: response.cancelledAt || new Date().toISOString()
      };
    } catch (error) {
      throw this.handleAppointmentError(error, 'Randevu iptal edilirken hata oluştu');
    }
  }
  
  /**
   * Reschedule an appointment
   * @param {string} appointmentId - Appointment ID
   * @param {Object} rescheduleData - New appointment data
   * @param {string} rescheduleData.newDate - New date
   * @param {string} rescheduleData.newSlotId - New slot ID
   * @param {string} rescheduleData.reason - Reschedule reason
   * @returns {Promise<Object>} Rescheduled appointment
   */
  async rescheduleAppointment(appointmentId, rescheduleData) {
    try {
      if (!appointmentId) {
        throw new Error('Randevu ID gereklidir');
      }
      
      this.validateRescheduleData(rescheduleData);
      
      const response = await apiHelpers.post(
        endpoints.appointments.reschedule(appointmentId),
        rescheduleData
      );
      
      return {
        appointment: response.appointment || response,
        message: response.message || 'Randevu başarıyla yeniden planlandı'
      };
    } catch (error) {
      throw this.handleAppointmentError(error, 'Randevu yeniden planlanırken hata oluştu');
    }
  }
  
  /**
   * Get appointment statistics for a user
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Appointment statistics
   */
  async getAppointmentStatistics(userId) {
    try {
      if (!userId) {
        throw new Error('Kullanıcı ID gereklidir');
      }
      
      const response = await apiHelpers.get(endpoints.appointments.statistics(userId));
      
      return {
        statistics: response.statistics || response
      };
    } catch (error) {
      throw this.handleAppointmentError(error, 'İstatistikler yüklenirken hata oluştu');
    }
  }
  
  /**
   * Get courts by province
   * @param {string} province - Province code
   * @returns {Promise<Array>} Courts in province
   */
  async getCourtsByProvince(province) {
    try {
      if (!province) {
        throw new Error('İl kodu gereklidir');
      }
      
      const response = await apiHelpers.get(endpoints.courts.byProvince(province));
      
      return {
        courts: response.courts || response
      };
    } catch (error) {
      throw this.handleAppointmentError(error, 'İl mahkemeleri yüklenirken hata oluştu');
    }
  }
  
  /**
   * Get courts by type
   * @param {string} type - Court type
   * @returns {Promise<Array>} Courts of type
   */
  async getCourtsByType(type) {
    try {
      if (!type) {
        throw new Error('Mahkeme türü gereklidir');
      }
      
      const response = await apiHelpers.get(endpoints.courts.byType(type));
      
      return {
        courts: response.courts || response
      };
    } catch (error) {
      throw this.handleAppointmentError(error, 'Mahkeme türü yüklenirken hata oluştu');
    }
  }
  
  /**
   * Search appointments
   * @param {Object} searchParams - Search parameters
   * @returns {Promise<Object>} Search results
   */
  async searchAppointments(searchParams) {
    try {
      const queryParams = this.buildQueryParams(searchParams);
      const response = await apiHelpers.get(`${endpoints.appointments.list}${queryParams}`);
      
      return {
        appointments: response.appointments || response,
        totalCount: response.totalCount || response.length || 0,
        currentPage: response.currentPage || 1,
        totalPages: response.totalPages || 1
      };
    } catch (error) {
      throw this.handleAppointmentError(error, 'Randevu arama işleminde hata oluştu');
    }
  }
  
  // Private helper methods
  
  /**
   * Build query parameters string
   * @param {Object} params - Parameters object
   * @returns {string} Query string
   */
  buildQueryParams(params) {
    if (!params || Object.keys(params).length === 0) {
      return '';
    }
    
    const searchParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        searchParams.append(key, value);
      }
    });
    
    const queryString = searchParams.toString();
    return queryString ? `?${queryString}` : '';
  }
  
  /**
   * Validate slot parameters
   * @param {Object} params - Slot parameters
   * @throws {Error} Validation error
   */
  validateSlotParams(params) {
    if (!params || typeof params !== 'object') {
      throw new Error('Geçersiz slot parametreleri');
    }
    
    const { courtId, date } = params;
    
    if (!courtId) {
      throw new Error('Mahkeme ID gereklidir');
    }
    
    if (!date) {
      throw new Error('Tarih gereklidir');
    }
    
    // Validate date format (YYYY-MM-DD)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      throw new Error('Geçersiz tarih formatı (YYYY-MM-DD bekleniyor)');
    }
    
    // Check if date is in the future
    const selectedDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
      throw new Error('Geçmiş tarih için randevu alınamaz');
    }
  }
  
  /**
   * Validate appointment data
   * @param {Object} appointmentData - Appointment data
   * @throws {Error} Validation error
   */
  validateAppointmentData(appointmentData) {
    if (!appointmentData || typeof appointmentData !== 'object') {
      throw new Error('Geçersiz randevu verisi');
    }
    
    const requiredFields = [
      'userId', 'courtId', 'slotId', 'date', 'appointmentType'
    ];
    
    for (const field of requiredFields) {
      if (!appointmentData[field]) {
        throw new Error(`${field} alanı gereklidir`);
      }
    }
    
    // Validate date
    if (!/^\d{4}-\d{2}-\d{2}$/.test(appointmentData.date)) {
      throw new Error('Geçersiz tarih formatı');
    }
    
    // Check if date is in the future
    const appointmentDate = new Date(appointmentData.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (appointmentDate < today) {
      throw new Error('Geçmiş tarih için randevu oluşturulamaz');
    }
    
    // Validate description length if provided
    if (appointmentData.description && appointmentData.description.length > 500) {
      throw new Error('Açıklama 500 karakterden uzun olamaz');
    }
  }
  
  /**
   * Validate update data
   * @param {Object} updateData - Update data
   * @throws {Error} Validation error
   */
  validateUpdateData(updateData) {
    if (!updateData || typeof updateData !== 'object') {
      throw new Error('Geçersiz güncelleme verisi');
    }
    
    // At least one field should be provided
    const allowedFields = ['description', 'notes', 'status'];
    const hasValidField = allowedFields.some(field => updateData.hasOwnProperty(field));
    
    if (!hasValidField) {
      throw new Error('Güncellenecek en az bir alan belirtilmelidir');
    }
    
    // Validate status if provided
    if (updateData.status) {
      const validStatuses = ['pending', 'confirmed', 'cancelled', 'completed'];
      if (!validStatuses.includes(updateData.status)) {
        throw new Error('Geçersiz randevu durumu');
      }
    }
    
    // Validate description length if provided
    if (updateData.description && updateData.description.length > 500) {
      throw new Error('Açıklama 500 karakterden uzun olamaz');
    }
  }
  
  /**
   * Validate reschedule data
   * @param {Object} rescheduleData - Reschedule data
   * @throws {Error} Validation error
   */
  validateRescheduleData(rescheduleData) {
    if (!rescheduleData || typeof rescheduleData !== 'object') {
      throw new Error('Geçersiz yeniden planlama verisi');
    }
    
    const { newDate, newSlotId } = rescheduleData;
    
    if (!newDate || !newSlotId) {
      throw new Error('Yeni tarih ve saat gereklidir');
    }
    
    // Validate date format
    if (!/^\d{4}-\d{2}-\d{2}$/.test(newDate)) {
      throw new Error('Geçersiz tarih formatı');
    }
    
    // Check if new date is in the future
    const selectedDate = new Date(newDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
      throw new Error('Geçmiş tarih için randevu planlanamaz');
    }
  }
  
  /**
   * Handle appointment service errors
   * @param {Error} error - Original error
   * @param {string} defaultMessage - Default error message
   * @returns {Error} Formatted error
   */
  handleAppointmentError(error, defaultMessage = 'Randevu işleminde hata oluştu') {
    // If it's already a formatted error, pass it through
    if (error.type) {
      return error;
    }
    
    // Common appointment error codes
    const appointmentErrorMessages = {
      slot_not_available: 'Seçilen saat artık müsait değil',
      appointment_conflict: 'Bu tarihte zaten randevunuz bulunmaktadır',
      court_not_found: 'Mahkeme bulunamadı',
      invalid_appointment_type: 'Geçersiz randevu türü',
      appointment_not_found: 'Randevu bulunamadı',
      cannot_cancel: 'Bu randevu iptal edilemez',
      cannot_reschedule: 'Bu randevu yeniden planlanamaz',
      past_appointment: 'Geçmiş randevular için işlem yapılamaz',
      unauthorized_access: 'Bu randevuya erişim yetkiniz yok'
    };
    
    const message = error.message || 
                   appointmentErrorMessages[error.code] || 
                   defaultMessage;
    
    return new Error(message);
  }
}

// Create singleton instance
const appointmentService = new AppointmentService();

export default appointmentService;