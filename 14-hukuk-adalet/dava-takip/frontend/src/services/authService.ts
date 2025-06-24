import api from './api';
import { User, LoginRequest, LoginResponse } from '@/types';

class AuthService {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    return api.post<LoginResponse>('/auth/login', credentials);
  }

  async register(data: any): Promise<LoginResponse> {
    return api.post<LoginResponse>('/auth/register', data);
  }

  async logout(): Promise<void> {
    return api.post('/auth/logout');
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

  async refreshToken(refreshToken: string): Promise<{ token: string; refreshToken: string }> {
    return api.post<{ token: string; refreshToken: string }>('/auth/refresh', { refreshToken });
  }
}

export default new AuthService();