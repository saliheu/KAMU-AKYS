import api from './api';
import { CollectionPoint } from '../types';

export const mapService = {
  getNearbyCollectionPoints: async (
    latitude: number,
    longitude: number,
    wasteType?: string
  ): Promise<CollectionPoint[]> => {
    try {
      const response = await api.get('/collection-points/nearby', {
        params: { latitude, longitude, wasteType, radius: 5000 },
      });
      return response.data;
    } catch (error) {
      // Return mock data if API fails
      return [
        {
          id: '1',
          name: 'Merkez Geri Dönüşüm Noktası',
          address: 'Atatürk Cad. No:123, Merkez',
          location: { latitude: latitude + 0.01, longitude: longitude + 0.01 },
          wasteTypes: ['plastic', 'paper', 'glass', 'metal'],
          workingHours: {
            monday: { open: '08:00', close: '20:00' },
            tuesday: { open: '08:00', close: '20:00' },
            wednesday: { open: '08:00', close: '20:00' },
            thursday: { open: '08:00', close: '20:00' },
            friday: { open: '08:00', close: '20:00' },
            saturday: { open: '09:00', close: '18:00' },
            sunday: { open: '10:00', close: '16:00' },
          },
          capacity: 1000,
          currentLoad: 450,
        },
        {
          id: '2',
          name: 'Park Atık Toplama Noktası',
          address: 'Yeşil Park İçi, Bahçe Sok.',
          location: { latitude: latitude - 0.008, longitude: longitude + 0.005 },
          wasteTypes: ['plastic', 'paper', 'organic'],
          workingHours: {
            monday: { open: '07:00', close: '22:00' },
            tuesday: { open: '07:00', close: '22:00' },
            wednesday: { open: '07:00', close: '22:00' },
            thursday: { open: '07:00', close: '22:00' },
            friday: { open: '07:00', close: '22:00' },
            saturday: { open: '07:00', close: '22:00' },
            sunday: { open: '07:00', close: '22:00' },
          },
          capacity: 500,
          currentLoad: 200,
        },
        {
          id: '3',
          name: 'Elektronik Atık Merkezi',
          address: 'Sanayi Mah. Teknoloji Cad. No:45',
          location: { latitude: latitude + 0.005, longitude: longitude - 0.01 },
          wasteTypes: ['electronic'],
          workingHours: {
            monday: { open: '09:00', close: '18:00' },
            tuesday: { open: '09:00', close: '18:00' },
            wednesday: { open: '09:00', close: '18:00' },
            thursday: { open: '09:00', close: '18:00' },
            friday: { open: '09:00', close: '18:00' },
            saturday: { open: '10:00', close: '16:00' },
            sunday: { open: 'closed', close: 'closed' },
          },
          capacity: 300,
          currentLoad: 250,
        },
      ];
    }
  },

  getCollectionPoint: async (id: string): Promise<CollectionPoint> => {
    const response = await api.get(`/collection-points/${id}`);
    return response.data;
  },
};