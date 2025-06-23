import api from './api';
import {
  Document,
  DocumentVersion,
  DocumentAccess,
  DocumentLog,
  CreateDocumentData,
  UpdateDocumentData,
} from '../types/document';

class DocumentService {
  async getDocuments(params?: {
    category?: number;
    status?: string;
    search?: string;
    tag?: string;
    page?: number;
  }): Promise<{ results: Document[]; count: number }> {
    const response = await api.get('/documents/', { params });
    return response.data;
  }

  async getDocument(id: number): Promise<Document> {
    const response = await api.get(`/documents/${id}/`);
    return response.data;
  }

  async createDocument(data: CreateDocumentData): Promise<Document> {
    const formData = new FormData();
    formData.append('title', data.title);
    if (data.description) formData.append('description', data.description);
    formData.append('file', data.file);
    if (data.category) formData.append('category', data.category.toString());
    if (data.tags) formData.append('tags', JSON.stringify(data.tags));
    if (data.is_public !== undefined) formData.append('is_public', data.is_public.toString());
    if (data.metadata) formData.append('metadata', JSON.stringify(data.metadata));

    const response = await api.post('/documents/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async updateDocument(id: number, data: UpdateDocumentData): Promise<Document> {
    const formData = new FormData();
    
    if (data.title) formData.append('title', data.title);
    if (data.description) formData.append('description', data.description);
    if (data.category) formData.append('category', data.category.toString());
    if (data.tags) formData.append('tags', JSON.stringify(data.tags));
    if (data.status) formData.append('status', data.status);
    if (data.is_public !== undefined) formData.append('is_public', data.is_public.toString());
    if (data.metadata) formData.append('metadata', JSON.stringify(data.metadata));
    if (data.new_version_file) formData.append('new_version_file', data.new_version_file);
    if (data.version_notes) formData.append('version_notes', data.version_notes);

    const response = await api.patch(`/documents/${id}/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async deleteDocument(id: number): Promise<void> {
    await api.delete(`/documents/${id}/`);
  }

  async downloadDocument(id: number): Promise<{ url: string; filename: string; content_type: string }> {
    const response = await api.get(`/documents/${id}/download/`);
    return response.data;
  }

  async getDocumentVersions(documentId: number): Promise<DocumentVersion[]> {
    const response = await api.get(`/documents/${documentId}/versions/`);
    return response.data;
  }

  async getDocumentAccess(documentId: number): Promise<DocumentAccess[]> {
    const response = await api.get(`/documents/${documentId}/access/`);
    return response.data;
  }

  async grantDocumentAccess(
    documentId: number,
    data: {
      user?: number;
      department?: number;
      access_level: string;
      expires_at?: string;
    }
  ): Promise<DocumentAccess> {
    const response = await api.post(`/documents/${documentId}/access/`, data);
    return response.data;
  }

  async getDocumentLogs(documentId: number): Promise<DocumentLog[]> {
    const response = await api.get(`/documents/${documentId}/logs/`);
    return response.data;
  }
}

export default new DocumentService();