import api from './api';

class TemplateService {
  async getTemplates(params: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    isActive?: boolean;
  }) {
    const response = await api.get('/templates', { params });
    return response.data;
  }

  async getTemplate(id: string) {
    const response = await api.get(`/templates/${id}`);
    return response.data;
  }

  async getCategories() {
    const response = await api.get('/templates/categories');
    return response.data;
  }

  async createTemplate(formData: FormData) {
    const response = await api.post('/templates', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async updateTemplate(id: string, formData: FormData) {
    const response = await api.put(`/templates/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async deleteTemplate(id: string) {
    const response = await api.delete(`/templates/${id}`);
    return response.data;
  }

  async generateDocument(id: string, data: {
    data: any;
    title?: string;
    description?: string;
    category?: string;
  }) {
    const response = await api.post(`/templates/${id}/generate`, data);
    return response.data;
  }
}

export default new TemplateService();