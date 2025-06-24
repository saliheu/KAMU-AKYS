import api from './api';
import { Alert, AlertRule } from '../types';

class AlertService {
  async getAlerts(filters?: {
    status?: string;
    type?: string;
    hospitalId?: string;
    limit?: number;
  }): Promise<Alert[]> {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.type) params.append('type', filters.type);
    if (filters?.hospitalId) params.append('hospitalId', filters.hospitalId);
    if (filters?.limit) params.append('limit', filters.limit.toString());

    const response = await api.get<Alert[]>(`/alerts?${params.toString()}`);
    return response.data;
  }

  async acknowledgeAlert(id: string): Promise<Alert> {
    const response = await api.post<Alert>(`/alerts/${id}/acknowledge`);
    return response.data;
  }

  async resolveAlert(id: string): Promise<Alert> {
    const response = await api.post<Alert>(`/alerts/${id}/resolve`);
    return response.data;
  }

  async getAlertRules(): Promise<AlertRule[]> {
    const response = await api.get<AlertRule[]>('/alert-rules');
    return response.data;
  }

  async createAlertRule(data: Partial<AlertRule>): Promise<AlertRule> {
    const response = await api.post<AlertRule>('/alert-rules', data);
    return response.data;
  }

  async updateAlertRule(id: string, data: Partial<AlertRule>): Promise<AlertRule> {
    const response = await api.put<AlertRule>(`/alert-rules/${id}`, data);
    return response.data;
  }

  async deleteAlertRule(id: string): Promise<void> {
    await api.delete(`/alert-rules/${id}`);
  }
}

export default new AlertService();