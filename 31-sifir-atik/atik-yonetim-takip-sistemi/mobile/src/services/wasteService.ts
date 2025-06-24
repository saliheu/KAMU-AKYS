import api from './api';
import { WasteEntry, WasteType } from '../types';

export const wasteService = {
  getWasteTypes: async (): Promise<WasteType[]> => {
    const response = await api.get('/waste-types');
    return response.data;
  },

  createWasteEntry: async (data: FormData): Promise<WasteEntry> => {
    const response = await api.post('/waste-entries', data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getWasteEntries: async (userId?: string): Promise<WasteEntry[]> => {
    const response = await api.get('/waste-entries', {
      params: { userId },
    });
    return response.data;
  },

  getWasteEntry: async (id: string): Promise<WasteEntry> => {
    const response = await api.get(`/waste-entries/${id}`);
    return response.data;
  },

  updateWasteEntry: async (id: string, data: Partial<WasteEntry>): Promise<WasteEntry> => {
    const response = await api.put(`/waste-entries/${id}`, data);
    return response.data;
  },

  deleteWasteEntry: async (id: string): Promise<void> => {
    await api.delete(`/waste-entries/${id}`);
  },

  getUserStats: async (userId: string): Promise<any> => {
    const response = await api.get(`/waste-entries/stats/${userId}`);
    return response.data;
  },

  syncEntries: async (entries: WasteEntry[]): Promise<{ synced: string[]; failed: string[] }> => {
    const response = await api.post('/waste-entries/sync', { entries });
    return response.data;
  },
};