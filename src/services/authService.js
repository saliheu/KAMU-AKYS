import { apiHelpers, endpoints } from './api';

class AuthService {
  /**
   * Login with E-Devlet credentials
   * @param {Object} credentials - Login credentials
   * @param {string} credentials.tcNo - Turkish ID number
   * @param {string} credentials.password - E-Devlet password
   * @param {boolean} credentials.rememberMe - Remember user preference
   * @returns {Promise<Object>} Authentication response
   */
  async loginWithEDevlet(credentials) {
    try {
      // Validate input
      this.validateLoginCredentials(credentials);
      
      const response = await apiHelpers.post(endpoints.auth.login, {
        tcNo: credentials.tcNo,
        password: credentials.password,
        rememberMe: credentials.rememberMe || false,
        loginType: 'edevlet'
      });
      
      // Validate response
      if (!response.token || !response.user) {
        throw new Error('Geçersiz sunucu yanıtı');
      }
      
      // Store token
      if (credentials.rememberMe) {
        localStorage.setItem('authToken', response.token);
      }
      
      return {
        user: this.sanitizeUser(response.user),
        token: response.token,
        expiresIn: response.expiresIn,
        refreshToken: response.refreshToken
      };
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }
  
  /**
   * Refresh authentication token
   * @param {string} currentToken - Current auth token
   * @returns {Promise<Object>} New token response
   */
  async refreshToken(currentToken) {
    try {
      if (!currentToken) {
        throw new Error('Token bulunamadı');
      }
      
      const response = await apiHelpers.post(endpoints.auth.refresh, {
        token: currentToken
      });
      
      if (!response.token) {
        throw new Error('Token yenileme başarısız');
      }
      
      return {
        token: response.token,
        user: response.user ? this.sanitizeUser(response.user) : null,
        expiresIn: response.expiresIn
      };
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }
  
  /**
   * Validate authentication token
   * @param {string} token - Auth token to validate
   * @returns {Promise<Object>} Validation response
   */
  async validateToken(token) {
    try {
      if (!token) {
        throw new Error('Token bulunamadı');
      }
      
      const response = await apiHelpers.post(endpoints.auth.validate, {
        token
      });
      
      return {
        valid: response.valid || false,
        user: response.user ? this.sanitizeUser(response.user) : null,
        expiresIn: response.expiresIn
      };
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }
  
  /**
   * Logout user
   * @param {string} token - Auth token
   * @returns {Promise<Object>} Logout response
   */
  async logout(token) {
    try {
      const response = await apiHelpers.post(endpoints.auth.logout, {
        token
      });
      
      // Clear local storage
      localStorage.removeItem('authToken');
      
      return {
        success: true,
        message: response.message || 'Başarıyla çıkış yapıldı'
      };
    } catch (error) {
      // Even if logout fails on server, clear local storage
      localStorage.removeItem('authToken');
      
      console.warn('Logout request failed:', error);
      return {
        success: true,
        message: 'Çıkış yapıldı'
      };
    }
  }
  
  /**
   * Update user profile
   * @param {Object} profileData - Profile update data
   * @returns {Promise<Object>} Update response
   */
  async updateProfile(profileData) {
    try {
      // Validate profile data
      this.validateProfileData(profileData);
      
      const response = await apiHelpers.put(endpoints.auth.profile, profileData);
      
      return {
        user: this.sanitizeUser(response.user),
        message: response.message || 'Profil başarıyla güncellendi'
      };
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }
  
  /**
   * Get current user profile
   * @returns {Promise<Object>} User profile
   */
  async getProfile() {
    try {
      const response = await apiHelpers.get(endpoints.auth.profile);
      
      return {
        user: this.sanitizeUser(response.user)
      };
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }
  
  /**
   * Change user password
   * @param {Object} passwordData - Password change data
   * @param {string} passwordData.currentPassword - Current password
   * @param {string} passwordData.newPassword - New password
   * @param {string} passwordData.confirmPassword - Password confirmation
   * @returns {Promise<Object>} Change response
   */
  async changePassword(passwordData) {
    try {
      this.validatePasswordChange(passwordData);
      
      const response = await apiHelpers.put(`${endpoints.auth.profile}/password`, {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      
      return {
        success: true,
        message: response.message || 'Şifre başarıyla değiştirildi'
      };
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }
  
  /**
   * Request password reset
   * @param {string} tcNo - Turkish ID number
   * @returns {Promise<Object>} Reset request response
   */
  async requestPasswordReset(tcNo) {
    try {
      if (!this.validateTcNo(tcNo)) {
        throw new Error('Geçersiz T.C. Kimlik Numarası');
      }
      
      const response = await apiHelpers.post('/auth/password-reset/request', {
        tcNo
      });
      
      return {
        success: true,
        message: response.message || 'Şifre sıfırlama talebi gönderildi'
      };
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }
  
  /**
   * Check if user is authenticated
   * @returns {boolean} Authentication status
   */
  isAuthenticated() {
    const token = localStorage.getItem('authToken');
    return !!token;
  }
  
  /**
   * Get stored auth token
   * @returns {string|null} Auth token
   */
  getAuthToken() {
    return localStorage.getItem('authToken');
  }
  
  /**
   * Clear authentication data
   */
  clearAuth() {
    localStorage.removeItem('authToken');
  }
  
  // Private helper methods
  
  /**
   * Validate login credentials
   * @param {Object} credentials - Login credentials
   * @throws {Error} Validation error
   */
  validateLoginCredentials(credentials) {
    if (!credentials) {
      throw new Error('Giriş bilgileri gereklidir');
    }
    
    const { tcNo, password } = credentials;
    
    if (!tcNo || !password) {
      throw new Error('T.C. Kimlik Numarası ve şifre gereklidir');
    }
    
    if (!this.validateTcNo(tcNo)) {
      throw new Error('Geçersiz T.C. Kimlik Numarası formatı');
    }
    
    if (password.length < 6) {
      throw new Error('Şifre en az 6 karakter olmalıdır');
    }
  }
  
  /**
   * Validate Turkish ID number
   * @param {string} tcNo - Turkish ID number
   * @returns {boolean} Validation result
   */
  validateTcNo(tcNo) {
    if (!tcNo || typeof tcNo !== 'string') {
      return false;
    }
    
    // Remove spaces and convert to string
    const cleaned = tcNo.replace(/\s/g, '');
    
    // Check if it's exactly 11 digits
    if (!/^\d{11}$/.test(cleaned)) {
      return false;
    }
    
    // Check if all digits are the same
    if (/^(\d)\1{10}$/.test(cleaned)) {
      return false;
    }
    
    // Turkish ID number algorithm validation
    const digits = cleaned.split('').map(Number);
    const oddSum = digits[0] + digits[2] + digits[4] + digits[6] + digits[8];
    const evenSum = digits[1] + digits[3] + digits[5] + digits[7];
    
    const check1 = (oddSum * 7 - evenSum) % 10;
    const check2 = (oddSum + evenSum + digits[9]) % 10;
    
    return check1 === digits[9] && check2 === digits[10];
  }
  
  /**
   * Validate profile update data
   * @param {Object} profileData - Profile data
   * @throws {Error} Validation error
   */
  validateProfileData(profileData) {
    if (!profileData || typeof profileData !== 'object') {
      throw new Error('Geçersiz profil verisi');
    }
    
    const { name, email, phone } = profileData;
    
    if (name && (typeof name !== 'string' || name.trim().length < 2)) {
      throw new Error('Geçersiz isim formatı');
    }
    
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new Error('Geçersiz e-posta formatı');
    }
    
    if (phone && !/^[0-9\s\-\+\(\)]{10,15}$/.test(phone)) {
      throw new Error('Geçersiz telefon formatı');
    }
  }
  
  /**
   * Validate password change data
   * @param {Object} passwordData - Password change data
   * @throws {Error} Validation error
   */
  validatePasswordChange(passwordData) {
    const { currentPassword, newPassword, confirmPassword } = passwordData;
    
    if (!currentPassword || !newPassword || !confirmPassword) {
      throw new Error('Tüm şifre alanları gereklidir');
    }
    
    if (newPassword.length < 8) {
      throw new Error('Yeni şifre en az 8 karakter olmalıdır');
    }
    
    if (newPassword !== confirmPassword) {
      throw new Error('Yeni şifreler eşleşmiyor');
    }
    
    if (currentPassword === newPassword) {
      throw new Error('Yeni şifre mevcut şifreden farklı olmalıdır');
    }
    
    // Password strength validation
    const hasUpperCase = /[A-Z]/.test(newPassword);
    const hasLowerCase = /[a-z]/.test(newPassword);
    const hasNumbers = /\d/.test(newPassword);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword);
    
    if (!hasUpperCase || !hasLowerCase || !hasNumbers) {
      throw new Error('Şifre en az bir büyük harf, bir küçük harf ve bir rakam içermelidir');
    }
  }
  
  /**
   * Sanitize user data for client use
   * @param {Object} user - Raw user data
   * @returns {Object} Sanitized user data
   */
  sanitizeUser(user) {
    if (!user) return null;
    
    const {
      id,
      tcNo,
      name,
      email,
      phone,
      role,
      isActive,
      createdAt,
      lastLoginAt,
      // Remove sensitive fields
      password,
      refreshToken,
      ...otherFields
    } = user;
    
    return {
      id,
      tcNo: tcNo ? `${tcNo.slice(0, 3)}****${tcNo.slice(-2)}` : null, // Mask TC number
      name,
      email,
      phone,
      role: role || 'citizen',
      isActive: isActive !== false,
      createdAt,
      lastLoginAt,
      ...otherFields
    };
  }
  
  /**
   * Handle authentication errors
   * @param {Error} error - Original error
   * @returns {Error} Formatted error
   */
  handleAuthError(error) {
    // If it's already a formatted error, pass it through
    if (error.type) {
      return error;
    }
    
    // Default auth error messages
    const authErrorMessages = {
      invalid_credentials: 'Geçersiz T.C. Kimlik Numarası veya şifre',
      account_locked: 'Hesabınız geçici olarak kilitlenmiştir',
      account_disabled: 'Hesabınız devre dışı bırakılmıştır',
      too_many_attempts: 'Çok fazla başarısız giriş denemesi',
      token_expired: 'Oturum süreniz dolmuştur',
      invalid_token: 'Geçersiz oturum',
      network_error: 'Ağ bağlantı hatası'
    };
    
    const message = error.message || 
                   authErrorMessages[error.code] || 
                   'Kimlik doğrulama hatası';
    
    return new Error(message);
  }
}

// Create singleton instance
const authService = new AuthService();

export default authService;