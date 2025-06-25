import axios from 'axios';
import store from '../store/store';
import { clearAuth, refreshToken } from '../store/slices/authSlice';

// API Configuration
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001/api';
const API_TIMEOUT = 30000; // 30 seconds

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor for adding authentication token
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage or Redux store
    const token = localStorage.getItem('authToken') || 
                  store.getState()?.auth?.token;
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Add request timestamp for debugging
    config.metadata = { startTime: new Date() };
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling common responses and errors
api.interceptors.response.use(
  (response) => {
    // Add response time for debugging
    if (response.config.metadata) {
      response.config.metadata.endTime = new Date();
      response.config.metadata.duration = 
        response.config.metadata.endTime - response.config.metadata.startTime;
    }
    
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Handle network errors
    if (!error.response) {
      console.error('Network Error:', error.message);
      return Promise.reject({
        message: 'Ağ bağlantı hatası. Lütfen internet bağlantınızı kontrol edin.',
        type: 'network_error',
        originalError: error
      });
    }
    
    const { status, data } = error.response;
    
    // Handle authentication errors
    if (status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Try to refresh token
        const state = store.getState();
        if (state.auth.token) {
          await store.dispatch(refreshToken()).unwrap();
          
          // Retry original request with new token
          const newToken = store.getState().auth.token;
          if (newToken) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return api(originalRequest);
          }
        }
      } catch (refreshError) {
        // Refresh failed, clear auth state
        store.dispatch(clearAuth());
        
        // Redirect to login if not already there
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
        
        return Promise.reject({
          message: 'Oturum süreniz dolmuştur. Lütfen tekrar giriş yapın.',
          type: 'auth_expired',
          originalError: error
        });
      }
    }
    
    // Handle other HTTP errors
    const errorMessage = getErrorMessage(status, data);
    
    return Promise.reject({
      message: errorMessage,
      status,
      data,
      type: 'api_error',
      originalError: error
    });
  }
);

// Helper function to get appropriate error messages
const getErrorMessage = (status, data) => {
  // Check if server provided a localized message
  if (data?.message) {
    return data.message;
  }
  
  // Default messages based on HTTP status codes
  switch (status) {
    case 400:
      return 'Geçersiz istek. Lütfen bilgilerinizi kontrol edin.';
    case 401:
      return 'Yetkilendirme hatası. Lütfen giriş yapın.';
    case 403:
      return 'Bu işlem için yetkiniz bulunmamaktadır.';
    case 404:
      return 'İstenen kaynak bulunamadı.';
    case 409:
      return 'Çakışma hatası. Bu işlem şu anda gerçekleştirilemez.';
    case 422:
      return 'Gönderilen veriler geçersiz.';
    case 429:
      return 'Çok fazla istek gönderildi. Lütfen biraz bekleyin.';
    case 500:
      return 'Sunucu hatası. Lütfen daha sonra tekrar deneyin.';
    case 502:
      return 'Ağ geçidi hatası. Lütfen daha sonra tekrar deneyin.';
    case 503:
      return 'Servis geçici olarak kullanılamıyor.';
    case 504:
      return 'İstek zaman aşımına uğradı. Lütfen tekrar deneyin.';
    default:
      return 'Beklenmeyen bir hata oluştu. Lütfen daha sonra tekrar deneyin.';
  }
};

// API helper functions
export const apiHelpers = {
  // GET request
  get: async (url, config = {}) => {
    try {
      const response = await api.get(url, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // POST request
  post: async (url, data = {}, config = {}) => {
    try {
      const response = await api.post(url, data, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // PUT request
  put: async (url, data = {}, config = {}) => {
    try {
      const response = await api.put(url, data, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // PATCH request
  patch: async (url, data = {}, config = {}) => {
    try {
      const response = await api.patch(url, data, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // DELETE request
  delete: async (url, config = {}) => {
    try {
      const response = await api.delete(url, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // File upload
  upload: async (url, formData, config = {}) => {
    try {
      const response = await api.post(url, formData, {
        ...config,
        headers: {
          ...config.headers,
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // Download file
  download: async (url, config = {}) => {
    try {
      const response = await api.get(url, {
        ...config,
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

// API endpoints
export const endpoints = {
  // Authentication
  auth: {
    login: '/auth/login',
    logout: '/auth/logout',
    refresh: '/auth/refresh',
    validate: '/auth/validate',
    profile: '/auth/profile',
  },
  
  // Appointments
  appointments: {
    list: '/appointments',
    create: '/appointments',
    byId: (id) => `/appointments/${id}`,
    update: (id) => `/appointments/${id}`,
    cancel: (id) => `/appointments/${id}/cancel`,
    reschedule: (id) => `/appointments/${id}/reschedule`,
    userAppointments: (userId) => `/users/${userId}/appointments`,
    upcoming: (userId) => `/users/${userId}/appointments/upcoming`,
    statistics: (userId) => `/users/${userId}/appointments/statistics`,
  },
  
  // Courts
  courts: {
    list: '/courts',
    byId: (id) => `/courts/${id}`,
    byType: (type) => `/courts/type/${type}`,
    byProvince: (province) => `/courts/province/${province}`,
    slots: (courtId) => `/courts/${courtId}/slots`,
    availableSlots: (courtId) => `/courts/${courtId}/available-slots`,
  },
  
  // System
  system: {
    health: '/health',
    version: '/version',
  },
};

// Request/Response logging for development
if (process.env.NODE_ENV === 'development') {
  api.interceptors.request.use((config) => {
    console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`, {
      params: config.params,
      data: config.data,
    });
    return config;
  });
  
  api.interceptors.response.use(
    (response) => {
      const duration = response.config.metadata?.duration || 0;
      console.log(`✅ API Response: ${response.status} ${response.config.url} (${duration}ms)`, {
        data: response.data,
      });
      return response;
    },
    (error) => {
      console.error(`❌ API Error: ${error.response?.status || 'Network'} ${error.config?.url}`, {
        error: error.response?.data || error.message,
      });
      return Promise.reject(error);
    }
  );
}

export default api;