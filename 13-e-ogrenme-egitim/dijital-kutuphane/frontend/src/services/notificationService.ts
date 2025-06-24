import api from './api';
import { Notification } from '@/types';

interface NotificationsResponse {
  notifications: Notification[];
  pagination: {
    total: number;
    page: number;
    pages: number;
    limit: number;
  };
}

interface NotificationResponse {
  notification: Notification;
}

class NotificationService {
  async getNotifications(params?: {
    page?: number;
    unreadOnly?: boolean;
    type?: string;
  }): Promise<NotificationsResponse> {
    const searchParams = new URLSearchParams();
    
    if (params) {
      if (params.page) searchParams.append('page', params.page.toString());
      if (params.unreadOnly !== undefined) searchParams.append('unreadOnly', params.unreadOnly.toString());
      if (params.type) searchParams.append('type', params.type);
    }
    
    return api.get<NotificationsResponse>(`/notifications?${searchParams.toString()}`);
  }

  async getNotification(id: string): Promise<NotificationResponse> {
    return api.get<NotificationResponse>(`/notifications/${id}`);
  }

  async getUnreadCount(): Promise<number> {
    const response = await api.get<{ count: number }>('/notifications/unread-count');
    return response.count;
  }

  async markAsRead(id: string): Promise<Notification> {
    const response = await api.put<NotificationResponse>(`/notifications/${id}/read`);
    return response.notification;
  }

  async markAllAsRead(): Promise<{ message: string }> {
    return api.put<{ message: string }>('/notifications/read-all');
  }

  async deleteNotification(id: string): Promise<{ message: string }> {
    return api.delete<{ message: string }>(`/notifications/${id}`);
  }

  async updatePreferences(preferences: {
    email?: boolean;
    push?: boolean;
    types?: string[];
  }): Promise<{ message: string }> {
    return api.put<{ message: string }>('/notifications/preferences', preferences);
  }

  async getPreferences(): Promise<{
    email: boolean;
    push: boolean;
    types: string[];
  }> {
    return api.get<{
      email: boolean;
      push: boolean;
      types: string[];
    }>('/notifications/preferences');
  }

  async testNotification(): Promise<{ message: string }> {
    return api.post<{ message: string }>('/notifications/test');
  }
}

export default new NotificationService();