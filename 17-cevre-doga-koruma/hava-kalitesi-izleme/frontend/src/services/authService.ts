import api from './api';
import { LoginCredentials, RegisterData, User } from '../types';

class AuthService {
  async login(credentials: LoginCredentials): Promise<{ user: User; token: string }> {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  }

  async register(data: RegisterData): Promise<{ user: User; token: string }> {
    const response = await api.post('/auth/register', data);
    return response.data;
  }

  async getProfile(): Promise<User> {
    const response = await api.get('/auth/profile');
    return response.data.user;
  }

  async updateProfile(data: Partial<User>): Promise<User> {
    const response = await api.put('/auth/profile', data);
    return response.data.user;
  }

  async changePassword(data: { currentPassword: string; newPassword: string }): Promise<void> {
    await api.put('/auth/change-password', data);
  }

  async refreshToken(): Promise<{ token: string }> {
    const response = await api.post('/auth/refresh');
    return response.data;
  }

  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      // Ignore logout errors
    }
  }
}

export default new AuthService();