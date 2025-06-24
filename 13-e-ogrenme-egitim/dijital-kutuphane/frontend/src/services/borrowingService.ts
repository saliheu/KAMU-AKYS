import api from './api';
import { Borrowing, BorrowingFilters, Reservation } from '@/types';

interface BorrowingsResponse {
  borrowings: Borrowing[];
  pagination: {
    total: number;
    page: number;
    pages: number;
    limit: number;
  };
}

interface BorrowingResponse {
  borrowing: Borrowing;
}

interface ReturnResponse {
  borrowing: Borrowing;
  fine: number;
}

interface ReservationsResponse {
  reservations: Reservation[];
}

interface ReservationResponse {
  reservation: Reservation;
}

interface BorrowingStatsResponse {
  summary: {
    active: number;
    overdue: number;
    returned: number;
    totalFines: number;
  };
  recentBorrowings: Borrowing[];
  overdueBooks: Borrowing[];
}

class BorrowingService {
  async getMyBorrowings(page = 1, filters?: BorrowingFilters): Promise<BorrowingsResponse> {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    
    if (filters) {
      if (filters.status) params.append('status', filters.status);
      if (filters.bookId) params.append('bookId', filters.bookId);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      if (filters.overdue !== undefined) params.append('overdue', filters.overdue.toString());
    }
    
    return api.get<BorrowingsResponse>(`/borrowings/my?${params.toString()}`);
  }

  async getBorrowings(page = 1, filters?: BorrowingFilters): Promise<BorrowingsResponse> {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    
    if (filters) {
      if (filters.userId) params.append('userId', filters.userId);
      if (filters.status) params.append('status', filters.status);
      if (filters.bookId) params.append('bookId', filters.bookId);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      if (filters.overdue !== undefined) params.append('overdue', filters.overdue.toString());
    }
    
    return api.get<BorrowingsResponse>(`/borrowings?${params.toString()}`);
  }

  async getBorrowing(id: string): Promise<BorrowingResponse> {
    return api.get<BorrowingResponse>(`/borrowings/${id}`);
  }

  async borrowBook(data: {
    userId: string;
    bookId: string;
    dueDate?: string;
    notes?: string;
  }): Promise<BorrowingResponse> {
    return api.post<BorrowingResponse>('/borrowings', data);
  }

  async renewBorrowing(id: string): Promise<BorrowingResponse> {
    return api.put<BorrowingResponse>(`/borrowings/${id}/renew`);
  }

  async returnBook(id: string, condition?: string, notes?: string): Promise<ReturnResponse> {
    return api.put<ReturnResponse>(`/borrowings/${id}/return`, {
      condition,
      notes,
    });
  }

  async getMyReservations(): Promise<ReservationsResponse> {
    return api.get<ReservationsResponse>('/borrowings/reservations/my');
  }

  async getReservations(bookId?: string): Promise<ReservationsResponse> {
    const params = bookId ? `?bookId=${bookId}` : '';
    return api.get<ReservationsResponse>(`/borrowings/reservations${params}`);
  }

  async createReservation(bookId: string): Promise<ReservationResponse> {
    return api.post<ReservationResponse>('/borrowings/reservations', { bookId });
  }

  async cancelReservation(id: string): Promise<{ message: string }> {
    return api.delete<{ message: string }>(`/borrowings/reservations/${id}`);
  }

  async getBorrowingStats(): Promise<BorrowingStatsResponse> {
    return api.get<BorrowingStatsResponse>('/borrowings/stats');
  }

  async exportBorrowingHistory(format: 'pdf' | 'excel'): Promise<void> {
    const filename = `borrowing-history-${new Date().toISOString().split('T')[0]}.${format === 'pdf' ? 'pdf' : 'xlsx'}`;
    return api.download(`/borrowings/export?format=${format}`, filename);
  }
}

export default new BorrowingService();