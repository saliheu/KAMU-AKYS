import axios, { AxiosInstance, AxiosError, AxiosRequestConfig } from 'axios';
import toast from 'react-hot-toast';
import { store } from '@/store';
import { setCredentials, logout } from '@/store/slices/authSlice';

const API_URL = import.meta.env.VITE_API_URL || '/api';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor
    this.api.interceptors.request.use(
      (config) => {
        const token = store.getState().auth.token;
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.api.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          const refreshToken = store.getState().auth.refreshToken;
          if (refreshToken) {
            try {
              const response = await this.api.post('/auth/refresh', { refreshToken });
              const { token, refreshToken: newRefreshToken } = response.data;

              store.dispatch(setCredentials({
                user: store.getState().auth.user!,
                token,
                refreshToken: newRefreshToken,
              }));

              if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${token}`;
              }
              return this.api(originalRequest);
            } catch (refreshError) {
              store.dispatch(logout());
              window.location.href = '/auth/login';
              return Promise.reject(refreshError);
            }
          } else {
            store.dispatch(logout());
            window.location.href = '/auth/login';
          }
        }

        // Show error messages
        if (error.response?.data) {
          const errorData = error.response.data as any;
          const message = errorData.error || errorData.message || 'Bir hata oluştu';
          toast.error(message);
        }

        return Promise.reject(error);
      }
    );
  }

  get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.api.get<T>(url, config).then((response) => response.data);
  }

  post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.api.post<T>(url, data, config).then((response) => response.data);
  }

  put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.api.put<T>(url, data, config).then((response) => response.data);
  }

  delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.api.delete<T>(url, config).then((response) => response.data);
  }

  upload<T>(url: string, formData: FormData, onProgress?: (progress: number) => void): Promise<T> {
    return this.api
      .post<T>(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onProgress(progress);
          }
        },
      })
      .then((response) => response.data);
  }
}

export default new ApiService();