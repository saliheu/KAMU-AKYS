import api from './api';

interface DashboardStats {
  books: {
    total: number;
    available: number;
    borrowed: number;
    reserved: number;
  };
  users: {
    total: number;
    active: number;
    newThisMonth: number;
  };
  borrowings: {
    active: number;
    overdue: number;
    returnedToday: number;
    totalThisMonth: number;
  };
  categories: {
    total: number;
    popular: Array<{
      id: string;
      name: string;
      bookCount: number;
    }>;
  };
}

interface UserStats {
  borrowingHistory: {
    total: number;
    active: number;
    overdue: number;
    returned: number;
  };
  readingStats: {
    booksRead: number;
    pagesRead: number;
    averageRating: number;
    favoriteCategory: string;
    favoriteAuthor: string;
  };
  activityChart: Array<{
    date: string;
    borrowings: number;
    returns: number;
  }>;
  genreDistribution: Array<{
    category: string;
    count: number;
    percentage: number;
  }>;
}

interface LibraryReport {
  period: string;
  summary: {
    totalBorrowings: number;
    totalReturns: number;
    newUsers: number;
    newBooks: number;
    totalFines: number;
  };
  popularBooks: Array<{
    id: string;
    title: string;
    borrowCount: number;
  }>;
  activeUsers: Array<{
    id: string;
    name: string;
    borrowCount: number;
  }>;
  categoryStats: Array<{
    category: string;
    borrowings: number;
    percentage: number;
  }>;
}

class StatsService {
  async getDashboardStats(): Promise<DashboardStats> {
    return api.get<DashboardStats>('/stats/dashboard');
  }

  async getUserStats(userId?: string): Promise<UserStats> {
    const endpoint = userId ? `/stats/user/${userId}` : '/stats/my';
    return api.get<UserStats>(endpoint);
  }

  async getLibraryReport(period: 'daily' | 'weekly' | 'monthly' | 'yearly', date?: string): Promise<LibraryReport> {
    const params = new URLSearchParams();
    params.append('period', period);
    if (date) params.append('date', date);
    
    return api.get<LibraryReport>(`/stats/report?${params.toString()}`);
  }

  async exportReport(period: 'daily' | 'weekly' | 'monthly' | 'yearly', format: 'pdf' | 'excel'): Promise<void> {
    const filename = `library-report-${period}-${new Date().toISOString().split('T')[0]}.${format === 'pdf' ? 'pdf' : 'xlsx'}`;
    return api.download(`/stats/report/export?period=${period}&format=${format}`, filename);
  }

  async getBookStats(bookId: string): Promise<{
    totalBorrows: number;
    currentBorrows: number;
    averageRating: number;
    totalReviews: number;
    monthlyBorrows: Array<{
      month: string;
      count: number;
    }>;
  }> {
    return api.get(`/stats/book/${bookId}`);
  }

  async getCategoryStats(): Promise<Array<{
    id: string;
    name: string;
    bookCount: number;
    borrowCount: number;
    availableCount: number;
  }>> {
    return api.get('/stats/categories');
  }

  async getOverdueStats(): Promise<{
    total: number;
    totalFines: number;
    books: Array<{
      borrowingId: string;
      bookTitle: string;
      userName: string;
      daysOverdue: number;
      fine: number;
    }>;
  }> {
    return api.get('/stats/overdue');
  }
}

export default new StatsService();