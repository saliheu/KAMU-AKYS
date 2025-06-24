import api from './api';
import { OccupancyData } from '../types';

class OccupancyService {
  async getCurrentOccupancy(filters?: {
    region?: string;
    city?: string;
    critical?: boolean;
  }): Promise<OccupancyData[]> {
    const params = new URLSearchParams();
    if (filters?.region) params.append('region', filters.region);
    if (filters?.city) params.append('city', filters.city);
    if (filters?.critical !== undefined) params.append('critical', filters.critical.toString());

    const response = await api.get<OccupancyData[]>(`/occupancy/current?${params.toString()}`);
    return response.data;
  }

  async getOccupancyHistory(params: {
    hospitalId?: string;
    departmentId?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<any[]> {
    const queryParams = new URLSearchParams();
    if (params.hospitalId) queryParams.append('hospitalId', params.hospitalId);
    if (params.departmentId) queryParams.append('departmentId', params.departmentId);
    if (params.startDate) queryParams.append('startDate', params.startDate.toISOString());
    if (params.endDate) queryParams.append('endDate', params.endDate.toISOString());

    const response = await api.get(`/occupancy/history?${queryParams.toString()}`);
    return response.data;
  }

  async updateOccupancy(data: {
    hospitalId: string;
    departmentId: string;
    occupiedBeds: number;
    totalBeds?: number;
    reservedBeds?: number;
    ventilatorOccupied?: number;
    ventilatorTotal?: number;
  }): Promise<any> {
    const response = await api.post('/occupancy/update', data);
    return response.data;
  }
}

export default new OccupancyService();