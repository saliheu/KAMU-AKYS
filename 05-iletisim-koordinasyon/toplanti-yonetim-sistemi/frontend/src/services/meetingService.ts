import api from './api';
import { Meeting, CreateMeetingRequest, UpdateMeetingRequest } from '../types';

export const meetingService = {
  createMeeting: async (data: CreateMeetingRequest): Promise<Meeting> => {
    const response = await api.post<Meeting>('/meetings', data);
    return response.data;
  },
  
  updateMeeting: async (id: number, data: UpdateMeetingRequest): Promise<Meeting> => {
    const response = await api.put<Meeting>(`/meetings/${id}`, data);
    return response.data;
  },
  
  getMeeting: async (id: number): Promise<Meeting> => {
    const response = await api.get<Meeting>(`/meetings/${id}`);
    return response.data;
  },
  
  getMyMeetings: async (page = 0, size = 20) => {
    const response = await api.get('/meetings/my-meetings', {
      params: { page, size },
    });
    return response.data;
  },
  
  getOrganizedMeetings: async (page = 0, size = 20) => {
    const response = await api.get('/meetings/organized', {
      params: { page, size },
    });
    return response.data;
  },
  
  getUpcomingMeetings: async (): Promise<Meeting[]> => {
    const response = await api.get<Meeting[]>('/meetings/upcoming');
    return response.data;
  },
  
  searchMeetings: async (query: string, page = 0, size = 20) => {
    const response = await api.get('/meetings/search', {
      params: { q: query, page, size },
    });
    return response.data;
  },
  
  cancelMeeting: async (id: number): Promise<void> => {
    await api.post(`/meetings/${id}/cancel`);
  },
  
  startMeeting: async (id: number): Promise<void> => {
    await api.post(`/meetings/${id}/start`);
  },
  
  completeMeeting: async (id: number): Promise<void> => {
    await api.post(`/meetings/${id}/complete`);
  },
};