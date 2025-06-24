import api from './api';

class DocumentService {
  async getDocuments(params: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    status?: string;
    sortBy?: string;
    sortOrder?: string;
  }) {
    const response = await api.get('/documents', { params });
    return response.data;
  }

  async getDocument(id: string) {
    const response = await api.get(`/documents/${id}`);
    return response.data;
  }

  async createDocument(formData: FormData) {
    const response = await api.post('/documents', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async updateDocument(id: string, formData: FormData) {
    const response = await api.put(`/documents/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async deleteDocument(id: string) {
    const response = await api.delete(`/documents/${id}`);
    return response.data;
  }

  async lockDocument(id: string) {
    const response = await api.post(`/documents/${id}/lock`);
    return response.data;
  }

  async unlockDocument(id: string) {
    const response = await api.post(`/documents/${id}/unlock`);
    return response.data;
  }

  async getVersions(documentId: string) {
    const response = await api.get(`/versions/document/${documentId}`);
    return response.data;
  }

  async getVersion(id: string) {
    const response = await api.get(`/versions/${id}`);
    return response.data;
  }

  async restoreVersion(versionId: string) {
    const response = await api.post(`/versions/${versionId}/restore`);
    return response.data;
  }

  async compareVersions(versionId1: string, versionId2: string) {
    const response = await api.get(`/versions/${versionId1}/compare/${versionId2}`);
    return response.data;
  }

  async signDocument(documentId: string, certificateData?: any) {
    const response = await api.post(`/signatures/sign/${documentId}`, {
      certificateData,
    });
    return response.data;
  }

  async verifySignatures(documentId: string) {
    const response = await api.get(`/signatures/verify/${documentId}`);
    return response.data;
  }

  async requestSignatures(documentId: string, data: {
    userIds: string[];
    deadline?: Date;
    message?: string;
  }) {
    const response = await api.post(`/signatures/request/${documentId}`, data);
    return response.data;
  }

  async search(params: {
    q: string;
    type?: string;
    category?: string;
    dateFrom?: Date;
    dateTo?: Date;
    status?: string;
    tags?: string[];
    page?: number;
    limit?: number;
  }) {
    const response = await api.get('/search', { params });
    return response.data;
  }

  async getSearchSuggestions(query: string) {
    const response = await api.get('/search/suggestions', { params: { q: query } });
    return response.data;
  }

  async advancedSearch(filters: any) {
    const response = await api.post('/search/advanced', filters);
    return response.data;
  }

  async downloadDocument(id: string) {
    const response = await api.get(`/documents/${id}/download`, {
      responseType: 'blob',
    });
    return response.data;
  }
}

export default new DocumentService();