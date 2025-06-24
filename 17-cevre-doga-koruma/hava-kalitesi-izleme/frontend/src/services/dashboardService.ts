import api from './api';
import { DashboardData, MapData } from '../types';

class DashboardService {
  async getDashboardData(): Promise<DashboardData> {
    const response = await api.get('/dashboard');
    return response.data;
  }

  async getMapData(): Promise<MapData[]> {
    const response = await api.get('/dashboard/map');
    return response.data.stations;
  }

  async getRealtimeStats(): Promise<any> {
    const response = await api.get('/dashboard/realtime');
    return response.data;
  }

  async getAQITrends(params?: {
    period?: string;
    stationId?: string;
  }): Promise<any> {
    const response = await api.get('/dashboard/aqi-trends', { params });
    return response.data;
  }

  async getPollutantDistribution(params?: {
    date?: Date;
    stationId?: string;
  }): Promise<any> {
    const response = await api.get('/dashboard/pollutant-distribution', { params });
    return response.data;
  }

  async getHeatmapData(params?: {
    pollutant?: string;
    date?: Date;
  }): Promise<any> {
    const response = await api.get('/dashboard/heatmap', { params });
    return response.data;
  }

  async getComparisonData(params: {
    stationIds: string[];
    startDate: Date;
    endDate: Date;
    pollutant?: string;
  }): Promise<any> {
    const response = await api.get('/dashboard/comparison', { params });
    return response.data;
  }

  async getHealthRecommendations(aqi: number): Promise<any> {
    const response = await api.get('/dashboard/health-recommendations', { params: { aqi } });
    return response.data;
  }

  async getForecast(params?: {
    stationId?: string;
    days?: number;
  }): Promise<any> {
    const response = await api.get('/dashboard/forecast', { params });
    return response.data;
  }
}

export default new DashboardService();