import api from './api';
import { User, LoginCredentials, RegisterData } from '@/types';

interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
}

class AuthService {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    return api.post<AuthResponse>('/auth/login', credentials);
  }

  async register(data: RegisterData): Promise<AuthResponse> {
    return api.post<AuthResponse>('/auth/register', data);
  }

  async getProfile(): Promise<{ user: User }> {
    return api.get<{ user: User }>('/auth/profile');
  }

  async updateProfile(data: Partial<User>): Promise<{ user: User }> {
    return api.put<{ user: User }>('/auth/profile', data);
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<{ message: string }> {
    return api.put<{ message: string }>('/auth/change-password', {
      currentPassword,
      newPassword,
    });
  }

  async forgotPassword(email: string): Promise<{ message: string }> {
    return api.post<{ message: string }>('/auth/forgot-password', { email });
  }

  async resetPassword(token: string, password: string): Promise<{ message: string }> {
    return api.post<{ message: string }>('/auth/reset-password', { token, password });
  }

  async verifyEmail(token: string): Promise<{ message: string }> {
    return api.get<{ message: string }>(`/auth/verify-email/${token}`);
  }

  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      // Ignore logout errors
    }
  }

  async refreshToken(refreshToken: string): Promise<{ token: string; refreshToken: string }> {
    return api.post<{ token: string; refreshToken: string }>('/auth/refresh', { refreshToken });
  }
}

export default new AuthService();