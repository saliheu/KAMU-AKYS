import api from './api';
import { LoginCredentials, RegisterData, AuthResponse, User } from '../types/auth';

class AuthService {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await api.post('/auth/login/', credentials);
    return response.data;
  }

  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await api.post('/auth/register/', data);
    return response.data;
  }

  async logout(refreshToken: string): Promise<void> {
    await api.post('/auth/logout/', { refresh_token: refreshToken });
  }

  async getProfile(): Promise<User> {
    const response = await api.get('/auth/profile/');
    return response.data;
  }

  async updateProfile(data: Partial<User>): Promise<User> {
    const response = await api.patch('/auth/profile/', data);
    return response.data;
  }

  async changePassword(data: {
    old_password: string;
    new_password: string;
    new_password2: string;
  }): Promise<void> {
    await api.post('/auth/change-password/', data);
  }

  async getUsers(params?: { department?: number; role?: string }): Promise<User[]> {
    const response = await api.get('/auth/users/', { params });
    return response.data;
  }
}

export default new AuthService();