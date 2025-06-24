import api from './api';
import { User, LoginRequest, AuthResponse } from '../types';

class AuthService {
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/members/users/login/', credentials);
    const { user, tokens } = response.data;
    
    localStorage.setItem('access_token', tokens.access);
    localStorage.setItem('refresh_token', tokens.refresh);
    localStorage.setItem('user', JSON.stringify(user));
    
    return response.data;
  }
  
  logout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  }
  
  getCurrentUser(): User | null {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      return JSON.parse(userStr);
    }
    return null;
  }
  
  isAuthenticated(): boolean {
    return !!localStorage.getItem('access_token');
  }
  
  async refreshToken(): Promise<string> {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) {
      throw new Error('No refresh token');
    }
    
    const response = await api.post<{ access: string }>('/auth/refresh/', {
      refresh: refreshToken,
    });
    
    const { access } = response.data;
    localStorage.setItem('access_token', access);
    
    return access;
  }
}

export default new AuthService();