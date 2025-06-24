import api from './api';
import { Book, BookFilters, Category, Author, Publisher } from '@/types';

interface BooksResponse {
  books: Book[];
  pagination: {
    total: number;
    page: number;
    pages: number;
    limit: number;
  };
}

interface BookResponse {
  book: Book;
}

class BookService {
  async getBooks(page = 1, filters?: BookFilters): Promise<BooksResponse> {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    
    if (filters) {
      if (filters.search) params.append('search', filters.search);
      if (filters.categoryId) params.append('categoryId', filters.categoryId);
      if (filters.authorId) params.append('authorId', filters.authorId);
      if (filters.publisherId) params.append('publisherId', filters.publisherId);
      if (filters.language) params.append('language', filters.language);
      if (filters.available !== undefined) params.append('available', filters.available.toString());
      if (filters.sortBy) params.append('sortBy', filters.sortBy);
      if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);
    }
    
    return api.get<BooksResponse>(`/books?${params.toString()}`);
  }

  async getBook(id: string): Promise<BookResponse> {
    return api.get<BookResponse>(`/books/${id}`);
  }

  async createBook(data: FormData): Promise<BookResponse> {
    return api.upload<BookResponse>('/books', data);
  }

  async updateBook(id: string, data: FormData | Partial<Book>): Promise<BookResponse> {
    if (data instanceof FormData) {
      return api.upload<BookResponse>(`/books/${id}`, data);
    }
    return api.put<BookResponse>(`/books/${id}`, data);
  }

  async deleteBook(id: string): Promise<{ message: string }> {
    return api.delete<{ message: string }>(`/books/${id}`);
  }

  async downloadBook(id: string, filename: string): Promise<void> {
    return api.download(`/books/${id}/download`, filename);
  }

  async getCategories(): Promise<{ categories: Category[] }> {
    return api.get<{ categories: Category[] }>('/categories');
  }

  async getAuthors(search?: string): Promise<{ authors: Author[] }> {
    const params = search ? `?search=${encodeURIComponent(search)}` : '';
    return api.get<{ authors: Author[] }>(`/authors${params}`);
  }

  async getPublishers(search?: string): Promise<{ publishers: Publisher[] }> {
    const params = search ? `?search=${encodeURIComponent(search)}` : '';
    return api.get<{ publishers: Publisher[] }>(`/publishers${params}`);
  }

  async createAuthor(data: { name: string; biography?: string }): Promise<{ author: Author }> {
    return api.post<{ author: Author }>('/authors', data);
  }

  async createPublisher(data: { name: string; address?: string; phone?: string }): Promise<{ publisher: Publisher }> {
    return api.post<{ publisher: Publisher }>('/publishers', data);
  }

  async createCategory(data: { name: string; parentId?: string }): Promise<{ category: Category }> {
    return api.post<{ category: Category }>('/categories', data);
  }
}

export default new BookService();