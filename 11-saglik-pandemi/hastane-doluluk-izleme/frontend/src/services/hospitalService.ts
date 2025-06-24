import api from './api';
import { Hospital } from '../types';

class HospitalService {
  async getHospitals(filters?: {
    city?: string;
    region?: string;
    type?: string;
  }): Promise<Hospital[]> {
    const params = new URLSearchParams();
    if (filters?.city) params.append('city', filters.city);
    if (filters?.region) params.append('region', filters.region);
    if (filters?.type) params.append('type', filters.type);

    const response = await api.get<Hospital[]>(`/hospitals?${params.toString()}`);
    return response.data;
  }

  async getHospitalById(id: string): Promise<Hospital> {
    const response = await api.get<Hospital>(`/hospitals/${id}`);
    return response.data;
  }

  async createHospital(data: Partial<Hospital>): Promise<Hospital> {
    const response = await api.post<Hospital>('/hospitals', data);
    return response.data;
  }

  async updateHospital(id: string, data: Partial<Hospital>): Promise<Hospital> {
    const response = await api.put<Hospital>(`/hospitals/${id}`, data);
    return response.data;
  }

  async getHospitalStats(id: string): Promise<any> {
    const response = await api.get(`/hospitals/${id}/stats`);
    return response.data;
  }
}

export default new HospitalService();