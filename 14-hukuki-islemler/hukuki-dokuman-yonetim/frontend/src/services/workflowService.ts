import api from './api';

class WorkflowService {
  async getWorkflows(params: {
    page?: number;
    limit?: number;
    status?: string;
    type?: string;
    priority?: string;
  }) {
    const response = await api.get('/workflows', { params });
    return response.data;
  }

  async getWorkflow(id: string) {
    const response = await api.get(`/workflows/${id}`);
    return response.data;
  }

  async createWorkflow(data: {
    name: string;
    description?: string;
    documentId: string;
    type: string;
    steps: Array<{
      name: string;
      description?: string;
      assignedTo: string;
    }>;
    deadline?: Date;
    priority: string;
  }) {
    const response = await api.post('/workflows', data);
    return response.data;
  }

  async advanceWorkflow(
    id: string,
    action: 'approve' | 'reject',
    comments?: string,
    data?: any
  ) {
    const response = await api.post(`/workflows/${id}/advance`, {
      action,
      comments,
      data,
    });
    return response.data;
  }

  async cancelWorkflow(id: string, reason: string) {
    const response = await api.post(`/workflows/${id}/cancel`, { reason });
    return response.data;
  }
}

export default new WorkflowService();