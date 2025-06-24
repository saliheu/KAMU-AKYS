import api from './api';
import { Loan, Reservation, Fine, PaginatedResponse } from '../types';

class LoanService {
  // Loans
  async getLoans(params?: any): Promise<PaginatedResponse<Loan>> {
    const response = await api.get<PaginatedResponse<Loan>>('/loans/', { params });
    return response.data;
  }
  
  async getLoan(id: number): Promise<Loan> {
    const response = await api.get<Loan>(`/loans/${id}/`);
    return response.data;
  }
  
  async createLoan(data: {
    member: number;
    book_copy: number;
    due_date?: string;
    notes?: string;
  }): Promise<Loan> {
    const response = await api.post<Loan>('/loans/', data);
    return response.data;
  }
  
  async returnBook(loanId: number, notes?: string): Promise<void> {
    await api.post(`/loans/${loanId}/return_book/`, { notes });
  }
  
  async renewLoan(loanId: number): Promise<{ status: string; new_due_date: string }> {
    const response = await api.post<{ status: string; new_due_date: string }>(
      `/loans/${loanId}/renew/`
    );
    return response.data;
  }
  
  async getOverdueLoans(): Promise<Loan[]> {
    const response = await api.get<Loan[]>('/loans/overdue/');
    return response.data;
  }
  
  async getLoanStatistics(): Promise<any> {
    const response = await api.get('/loans/statistics/');
    return response.data;
  }
  
  // Reservations
  async getReservations(params?: any): Promise<PaginatedResponse<Reservation>> {
    const response = await api.get<PaginatedResponse<Reservation>>('/loans/reservations/', { params });
    return response.data;
  }
  
  async createReservation(data: {
    member: number;
    book: number;
    notes?: string;
  }): Promise<Reservation> {
    const response = await api.post<Reservation>('/loans/reservations/', data);
    return response.data;
  }
  
  async cancelReservation(id: number): Promise<void> {
    await api.post(`/loans/reservations/${id}/cancel/`);
  }
  
  async fulfillReservation(id: number): Promise<{ status: string; loan_id: number }> {
    const response = await api.post<{ status: string; loan_id: number }>(
      `/loans/reservations/${id}/fulfill/`
    );
    return response.data;
  }
  
  async getReservationQueue(bookId: number): Promise<Reservation[]> {
    const response = await api.get<Reservation[]>('/loans/reservations/queue/', {
      params: { book_id: bookId }
    });
    return response.data;
  }
  
  // Fines
  async getFines(params?: any): Promise<PaginatedResponse<Fine>> {
    const response = await api.get<PaginatedResponse<Fine>>('/loans/fines/', { params });
    return response.data;
  }
  
  async payFine(id: number, paymentNote?: string): Promise<void> {
    await api.post(`/loans/fines/${id}/pay/`, { payment_note: paymentNote });
  }
  
  async getUnpaidFines(groupByMember?: boolean): Promise<any> {
    const response = await api.get('/loans/fines/unpaid/', {
      params: { group_by_member: groupByMember }
    });
    return response.data;
  }
  
  // Member Loan Summary
  async getMemberLoanSummary(memberId: string): Promise<any> {
    const response = await api.get(`/loans/summary/member/${memberId}/`);
    return response.data;
  }
}

export default new LoanService();