import api from './api';
import { Alert, AlertRule } from '../types';

class AlertService {
  async getAlerts(filters?: {
    status?: string;
    severity?: string;
    stationId?: string;
    limit?: number;
  }): Promise<{ alerts: Alert[] }> {
    const response = await api.get('/alerts', { params: filters });
    return response.data;
  }

  async getAlert(id: string): Promise<Alert> {
    const response = await api.get(`/alerts/${id}`);
    return response.data.alert;
  }

  async acknowledgeAlert(id: string): Promise<Alert> {
    const response = await api.put(`/alerts/${id}/acknowledge`);
    return response.data.alert;
  }

  async resolveAlert(id: string, notes?: string): Promise<Alert> {
    const response = await api.put(`/alerts/${id}/resolve`, { notes });
    return response.data.alert;
  }

  async getAlertRules(filters?: {
    active?: boolean;
    pollutant?: string;
    stationId?: string;
  }): Promise<{ rules: AlertRule[] }> {
    const response = await api.get('/alerts/rules', { params: filters });
    return response.data;
  }

  async getAlertRule(id: string): Promise<AlertRule> {
    const response = await api.get(`/alerts/rules/${id}`);
    return response.data.rule;
  }

  async createAlertRule(data: Partial<AlertRule>): Promise<AlertRule> {
    const response = await api.post('/alerts/rules', data);
    return response.data.rule;
  }

  async updateAlertRule(id: string, data: Partial<AlertRule>): Promise<AlertRule> {
    const response = await api.put(`/alerts/rules/${id}`, data);
    return response.data.rule;
  }

  async deleteAlertRule(id: string): Promise<void> {
    await api.delete(`/alerts/rules/${id}`);
  }

  async testAlertRule(data: Partial<AlertRule>): Promise<any> {
    const response = await api.post('/alerts/rules/test', data);
    return response.data;
  }

  async getAlertStatistics(params?: {
    stationId?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<any> {
    const response = await api.get('/alerts/statistics', { params });
    return response.data;
  }
}

export default new AlertService();