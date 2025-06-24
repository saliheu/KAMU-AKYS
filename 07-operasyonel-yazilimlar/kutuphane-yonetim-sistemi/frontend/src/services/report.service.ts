import api from './api';
import { DashboardStats } from '../types';

class ReportService {
  async getDashboardStats(): Promise<DashboardStats> {
    const response = await api.get<DashboardStats>('/reports/dashboard/');
    return response.data;
  }
  
  async getLoanReport(params?: {
    date_from?: string;
    date_to?: string;
  }): Promise<any> {
    const response = await api.get('/reports/loans/', { params });
    return response.data;
  }
  
  async getInventoryReport(): Promise<any> {
    const response = await api.get('/reports/inventory/');
    return response.data;
  }
  
  async getMemberReport(): Promise<any> {
    const response = await api.get('/reports/members/');
    return response.data;
  }
  
  async getOverdueReport(): Promise<any> {
    const response = await api.get('/reports/overdue/');
    return response.data;
  }
  
  async getPopularBooksReport(params?: {
    days?: number;
    limit?: number;
  }): Promise<any> {
    const response = await api.get('/reports/popular-books/', { params });
    return response.data;
  }
  
  async exportReport(reportType: 'inventory' | 'members' | 'loans'): Promise<Blob> {
    const response = await api.get(`/reports/export/${reportType}/`, {
      responseType: 'blob',
    });
    return response.data;
  }
}

export default new ReportService();