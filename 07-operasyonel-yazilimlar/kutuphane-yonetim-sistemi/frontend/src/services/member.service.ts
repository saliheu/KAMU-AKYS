import api from './api';
import { Member, PaginatedResponse } from '../types';

class MemberService {
  async getMembers(params?: any): Promise<PaginatedResponse<Member>> {
    const response = await api.get<PaginatedResponse<Member>>('/members/', { params });
    return response.data;
  }
  
  async getMember(id: number): Promise<Member> {
    const response = await api.get<Member>(`/members/${id}/`);
    return response.data;
  }
  
  async createMember(data: Partial<Member>): Promise<Member> {
    const response = await api.post<Member>('/members/', data);
    return response.data;
  }
  
  async updateMember(id: number, data: Partial<Member>): Promise<Member> {
    const response = await api.put<Member>(`/members/${id}/`, data);
    return response.data;
  }
  
  async deleteMember(id: number): Promise<void> {
    await api.delete(`/members/${id}/`);
  }
  
  async suspendMember(id: number, reason?: string): Promise<void> {
    await api.post(`/members/${id}/suspend/`, { reason });
  }
  
  async activateMember(id: number, reason?: string): Promise<void> {
    await api.post(`/members/${id}/activate/`, { reason });
  }
  
  async getMemberHistory(id: number): Promise<any[]> {
    const response = await api.get(`/members/${id}/history/`);
    return response.data;
  }
  
  async getMemberLoans(id: number): Promise<any> {
    const response = await api.get(`/members/${id}/loans/`);
    return response.data;
  }
  
  async generateMemberCard(id: number): Promise<Blob> {
    const response = await api.get(`/members/${id}/card/`, {
      responseType: 'blob',
    });
    return response.data;
  }
  
  async searchMembers(query: string): Promise<Member[]> {
    const response = await api.get<PaginatedResponse<Member>>('/members/', {
      params: { search: query }
    });
    return response.data.results;
  }
}

export default new MemberService();