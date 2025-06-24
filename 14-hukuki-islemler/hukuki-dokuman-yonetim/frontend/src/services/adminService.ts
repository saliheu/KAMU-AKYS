import api from './api';

class AdminService {
  async getUsers(params: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
    department?: string;
    isActive?: boolean;
  }) {
    const response = await api.get('/admin/users', { params });
    return response.data;
  }

  async createUser(userData: {
    name: string;
    email: string;
    password: string;
    role: string;
    department?: string;
    title?: string;
  }) {
    const response = await api.post('/admin/users', userData);
    return response.data;
  }

  async updateUser(id: string, data: {
    name?: string;
    email?: string;
    role?: string;
    department?: string;
    title?: string;
    isActive?: boolean;
  }) {
    const response = await api.put(`/admin/users/${id}`, data);
    return response.data;
  }

  async resetUserPassword(userId: string) {
    const response = await api.post(`/admin/users/${userId}/reset-password`);
    return response.data;
  }

  async getSettings() {
    const response = await api.get('/admin/settings');
    return response.data;
  }

  async updateSettings(settings: any) {
    const response = await api.put('/admin/settings', settings);
    return response.data;
  }

  async getStats() {
    const response = await api.get('/admin/stats');
    return response.data;
  }

  async getAuditLogs(params: {
    page?: number;
    limit?: number;
    userId?: string;
    action?: string;
    dateFrom?: Date;
    dateTo?: Date;
  }) {
    const response = await api.get('/admin/audit-logs', { params });
    return response.data;
  }

  async performMaintenance(type: 'cleanup' | 'reindex') {
    if (type === 'cleanup') {
      const response = await api.post('/admin/maintenance/cleanup', { type: 'all' });
      return response.data;
    } else {
      const response = await api.post('/admin/maintenance/reindex');
      return response.data;
    }
  }

  async getDashboardData() {
    const response = await api.get('/reports/dashboard');
    return response.data;
  }

  async getActivityReport(params: {
    dateFrom?: Date;
    dateTo?: Date;
    groupBy?: string;
  }) {
    const response = await api.get('/reports/activity', { params });
    return response.data;
  }

  async getUsersReport() {
    const response = await api.get('/reports/users');
    return response.data;
  }

  async exportReport(data: {
    format: 'excel' | 'pdf';
    reportType: string;
    filters?: any;
  }) {
    const response = await api.post('/reports/export', data, {
      responseType: 'blob',
    });
    return response.data;
  }
}

export default new AdminService();