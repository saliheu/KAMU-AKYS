import apiClient from './api';
import { User, LoginFormData, RegisterFormData, Citizen, Officer } from '../types';

interface LoginResponse {
  token: string;
  user: User;
  citizen?: Citizen;
  officer?: Officer;
}

class AuthService {
  // Login user
  async login(credentials: LoginFormData): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>('/auth/login', credentials);
    
    // Store token and user data
    localStorage.setItem('authToken', response.token);
    localStorage.setItem('user', JSON.stringify(response.user));
    
    if (response.citizen) {
      localStorage.setItem('citizen', JSON.stringify(response.citizen));
    }
    
    if (response.officer) {
      localStorage.setItem('officer', JSON.stringify(response.officer));
    }
    
    return response;
  }

  // Register new citizen
  async register(data: RegisterFormData): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>('/auth/register', data);
    
    // Store token and user data
    localStorage.setItem('authToken', response.token);
    localStorage.setItem('user', JSON.stringify(response.user));
    
    if (response.citizen) {
      localStorage.setItem('citizen', JSON.stringify(response.citizen));
    }
    
    return response;
  }

  // Logout user
  logout(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    localStorage.removeItem('citizen');
    localStorage.removeItem('officer');
  }

  // Get current user from localStorage
  getCurrentUser(): User | null {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  // Get current citizen from localStorage
  getCurrentCitizen(): Citizen | null {
    const citizenStr = localStorage.getItem('citizen');
    return citizenStr ? JSON.parse(citizenStr) : null;
  }

  // Get current officer from localStorage
  getCurrentOfficer(): Officer | null {
    const officerStr = localStorage.getItem('officer');
    return officerStr ? JSON.parse(officerStr) : null;
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!localStorage.getItem('authToken');
  }

  // Get auth token
  getToken(): string | null {
    return localStorage.getItem('authToken');
  }

  // Verify token
  async verifyToken(): Promise<User> {
    try {
      const user = await apiClient.get<User>('/auth/verify');
      localStorage.setItem('user', JSON.stringify(user));
      return user;
    } catch (error) {
      this.logout();
      throw error;
    }
  }

  // Change password
  async changePassword(oldPassword: string, newPassword: string): Promise<void> {
    await apiClient.post('/auth/change-password', { oldPassword, newPassword });
  }

  // Request password reset
  async requestPasswordReset(email: string): Promise<void> {
    await apiClient.post('/auth/request-reset', { email });
  }

  // Reset password
  async resetPassword(token: string, newPassword: string): Promise<void> {
    await apiClient.post('/auth/reset-password', { token, newPassword });
  }
}

export default new AuthService();