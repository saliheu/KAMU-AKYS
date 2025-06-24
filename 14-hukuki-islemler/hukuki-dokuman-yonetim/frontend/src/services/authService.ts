import api from './api';

class AuthService {
  async login(email: string, password: string) {
    const response = await api.post('/auth/login', { email, password });
    const { accessToken, refreshToken, user } = response.data;
    
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    
    return { user };
  }

  async register(userData: {
    name: string;
    email: string;
    password: string;
    department?: string;
    title?: string;
  }) {
    const response = await api.post('/auth/register', userData);
    const { accessToken, refreshToken, user } = response.data;
    
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    
    return { user };
  }

  async logout() {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }
  }

  async getCurrentUser() {
    const response = await api.get('/auth/me');
    return response.data;
  }

  async updateProfile(data: {
    name?: string;
    phone?: string;
    preferences?: any;
  }) {
    const response = await api.put('/auth/me', data);
    return response.data;
  }

  async changePassword(currentPassword: string, newPassword: string) {
    const response = await api.post('/auth/change-password', {
      currentPassword,
      newPassword,
    });
    return response.data;
  }

  async refreshToken(refreshToken: string) {
    const response = await api.post('/auth/refresh', { refreshToken });
    const { accessToken, refreshToken: newRefreshToken } = response.data;
    
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', newRefreshToken);
    
    return response.data;
  }
}

export default new AuthService();