import api from './api';
import { Station } from '../types';

class StationService {
  async getStations(params?: {
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<{ stations: Station[]; total: number }> {
    const response = await api.get('/stations', { params });
    return response.data;
  }

  async getStation(id: string): Promise<Station> {
    const response = await api.get(`/stations/${id}`);
    return response.data.station;
  }

  async createStation(data: Partial<Station>): Promise<Station> {
    const response = await api.post('/stations', data);
    return response.data.station;
  }

  async updateStation(id: string, data: Partial<Station>): Promise<Station> {
    const response = await api.put(`/stations/${id}`, data);
    return response.data.station;
  }

  async deleteStation(id: string): Promise<void> {
    await api.delete(`/stations/${id}`);
  }

  async getStationSensors(id: string): Promise<any[]> {
    const response = await api.get(`/stations/${id}/sensors`);
    return response.data.sensors;
  }

  async getStationMeasurements(id: string, params?: {
    startDate?: Date;
    endDate?: Date;
    limit?: number;
  }): Promise<any> {
    const response = await api.get(`/stations/${id}/measurements`, { params });
    return response.data;
  }

  async getStationAlerts(id: string, params?: {
    status?: string;
    severity?: string;
    limit?: number;
  }): Promise<any> {
    const response = await api.get(`/stations/${id}/alerts`, { params });
    return response.data;
  }

  async exportStationData(id: string, params: {
    startDate: Date;
    endDate: Date;
    format: 'csv' | 'excel';
  }): Promise<Blob> {
    const response = await api.get(`/stations/${id}/export`, {
      params,
      responseType: 'blob',
    });
    return response.data;
  }
}

export default new StationService();