import apiClient from './api';
import { 
  Complaint, 
  ComplaintFormData, 
  ComplaintResponse, 
  ComplaintFilters, 
  PaginatedResponse, 
  DashboardStats,
  Department
} from '../types';

class ComplaintService {
  // Get all complaints with filters and pagination
  async getComplaints(
    page: number = 1, 
    pageSize: number = 10, 
    filters?: ComplaintFilters
  ): Promise<PaginatedResponse<Complaint>> {
    const params = {
      page,
      pageSize,
      ...filters
    };
    return await apiClient.get<PaginatedResponse<Complaint>>('/complaints', { params });
  }

  // Get complaint by ID
  async getComplaintById(id: number): Promise<Complaint> {
    return await apiClient.get<Complaint>(`/complaints/${id}`);
  }

  // Get complaints for current citizen
  async getMyComplaints(
    page: number = 1, 
    pageSize: number = 10
  ): Promise<PaginatedResponse<Complaint>> {
    return await apiClient.get<PaginatedResponse<Complaint>>('/complaints/my', { 
      params: { page, pageSize } 
    });
  }

  // Create new complaint
  async createComplaint(data: ComplaintFormData): Promise<Complaint> {
    if (data.attachments && data.attachments.length > 0) {
      // If there are attachments, use FormData
      const formData = new FormData();
      formData.append('departmentId', data.departmentId.toString());
      formData.append('subject', data.subject);
      formData.append('description', data.description);
      formData.append('priority', data.priority);
      
      data.attachments.forEach((file) => {
        formData.append('attachments', file);
      });
      
      return await apiClient.upload<Complaint>('/complaints', formData);
    } else {
      // No attachments, send as JSON
      const { attachments, ...jsonData } = data;
      return await apiClient.post<Complaint>('/complaints', jsonData);
    }
  }

  // Update complaint (for officers/admins)
  async updateComplaint(id: number, data: Partial<Complaint>): Promise<Complaint> {
    return await apiClient.put<Complaint>(`/complaints/${id}`, data);
  }

  // Update complaint status
  async updateComplaintStatus(id: number, status: string): Promise<Complaint> {
    return await apiClient.patch<Complaint>(`/complaints/${id}/status`, { status });
  }

  // Delete complaint (for admins)
  async deleteComplaint(id: number): Promise<void> {
    await apiClient.delete(`/complaints/${id}`);
  }

  // Add response to complaint
  async addResponse(
    complaintId: number, 
    responseText: string, 
    attachments?: File[]
  ): Promise<ComplaintResponse> {
    if (attachments && attachments.length > 0) {
      const formData = new FormData();
      formData.append('responseText', responseText);
      attachments.forEach((file) => {
        formData.append('attachments', file);
      });
      
      return await apiClient.upload<ComplaintResponse>(
        `/complaints/${complaintId}/responses`, 
        formData
      );
    } else {
      return await apiClient.post<ComplaintResponse>(
        `/complaints/${complaintId}/responses`, 
        { responseText }
      );
    }
  }

  // Get complaint responses
  async getComplaintResponses(complaintId: number): Promise<ComplaintResponse[]> {
    return await apiClient.get<ComplaintResponse[]>(`/complaints/${complaintId}/responses`);
  }

  // Get dashboard statistics
  async getDashboardStats(): Promise<DashboardStats> {
    return await apiClient.get<DashboardStats>('/complaints/stats');
  }

  // Get all departments
  async getDepartments(): Promise<Department[]> {
    return await apiClient.get<Department[]>('/departments');
  }

  // Get active departments
  async getActiveDepartments(): Promise<Department[]> {
    return await apiClient.get<Department[]>('/departments/active');
  }

  // Export complaints to Excel
  async exportComplaints(filters?: ComplaintFilters): Promise<Blob> {
    const response = await apiClient.get('/complaints/export', {
      params: filters,
      responseType: 'blob'
    });
    return response as unknown as Blob;
  }

  // Get complaint statistics by date range
  async getComplaintStatsByDateRange(startDate: string, endDate: string): Promise<any> {
    return await apiClient.get('/complaints/stats/date-range', {
      params: { startDate, endDate }
    });
  }
}

export default new ComplaintService();