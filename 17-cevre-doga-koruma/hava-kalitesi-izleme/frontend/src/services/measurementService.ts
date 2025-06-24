import api from './api';
import { Measurement } from '../types';

class MeasurementService {
  async getMeasurements(params: {
    stationId?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
  }): Promise<{ measurements: Measurement[] }> {
    const response = await api.get('/measurements', { params });
    return response.data;
  }

  async getLatestMeasurements(): Promise<any[]> {
    const response = await api.get('/measurements/latest');
    return response.data.measurements;
  }

  async getMeasurement(id: string): Promise<Measurement> {
    const response = await api.get(`/measurements/${id}`);
    return response.data.measurement;
  }

  async getChartData(params: {
    type: string;
    period?: string;
    stationId?: string;
  }): Promise<any> {
    const response = await api.get('/measurements/chart', { params });
    return response.data;
  }

  async getTrends(params: {
    stationId?: string;
    period?: string;
    pollutant?: string;
  }): Promise<any> {
    const response = await api.get('/measurements/trends', { params });
    return response.data;
  }

  async getStatistics(params: {
    stationId?: string;
    startDate?: Date;
    endDate?: Date;
    groupBy?: 'hour' | 'day' | 'week' | 'month';
  }): Promise<any> {
    const response = await api.get('/measurements/statistics', { params });
    return response.data;
  }

  async exportMeasurements(params: {
    stationId?: string;
    startDate: Date;
    endDate: Date;
    format: 'csv' | 'excel';
  }): Promise<Blob> {
    const response = await api.get('/measurements/export', {
      params,
      responseType: 'blob',
    });
    return response.data;
  }

  async uploadBulkMeasurements(file: File): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post('/measurements/bulk-upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }
}

export default new MeasurementService();