import api from './api';

class ShareService {
  async getMyShares(type: 'received' | 'sent' = 'received') {
    const response = await api.get('/shares/my-shares', { params: { type } });
    return response.data;
  }

  async getShareByLink(shareLink: string) {
    const response = await api.get(`/shares/link/${shareLink}`);
    return response.data;
  }

  async accessShareLink(shareLink: string, password?: string) {
    const response = await api.post(`/shares/link/${shareLink}/access`, { password });
    return response.data;
  }

  async createShare(data: {
    documentId: string;
    shareType: 'user' | 'department' | 'link';
    sharedWith?: string;
    permissions: string[];
    expiresAt?: Date;
    maxDownloads?: number;
    password?: string;
    notes?: string;
  }) {
    const response = await api.post('/shares', data);
    return response.data;
  }

  async updateShare(id: string, data: {
    permissions?: string[];
    expiresAt?: Date;
    maxDownloads?: number;
    notes?: string;
    isActive?: boolean;
  }) {
    const response = await api.put(`/shares/${id}`, data);
    return response.data;
  }

  async revokeShare(id: string) {
    const response = await api.delete(`/shares/${id}`);
    return response.data;
  }
}

export default new ShareService();