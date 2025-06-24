import api from './api';
import { Book, BookCopy, Author, Publisher, Category, PaginatedResponse } from '../types';

class BookService {
  // Books
  async getBooks(params?: any): Promise<PaginatedResponse<Book>> {
    const response = await api.get<PaginatedResponse<Book>>('/books/', { params });
    return response.data;
  }
  
  async getBook(id: number): Promise<Book> {
    const response = await api.get<Book>(`/books/${id}/`);
    return response.data;
  }
  
  async createBook(data: Partial<Book>): Promise<Book> {
    const response = await api.post<Book>('/books/', data);
    return response.data;
  }
  
  async updateBook(id: number, data: Partial<Book>): Promise<Book> {
    const response = await api.put<Book>(`/books/${id}/`, data);
    return response.data;
  }
  
  async deleteBook(id: number): Promise<void> {
    await api.delete(`/books/${id}/`);
  }
  
  async searchBooks(query: string): Promise<Book[]> {
    const response = await api.get<Book[]>('/books/search/', {
      params: { search: query }
    });
    return response.data;
  }
  
  async getPopularBooks(): Promise<Book[]> {
    const response = await api.get<Book[]>('/books/popular/');
    return response.data;
  }
  
  async getNewArrivals(): Promise<Book[]> {
    const response = await api.get<Book[]>('/books/new_arrivals/');
    return response.data;
  }
  
  async getBookRecommendations(bookId: number): Promise<Book[]> {
    const response = await api.get<Book[]>(`/books/${bookId}/recommendations/`);
    return response.data;
  }
  
  // Book Copies
  async getBookCopies(bookId: number): Promise<BookCopy[]> {
    const response = await api.get<BookCopy[]>(`/books/${bookId}/copies/`);
    return response.data;
  }
  
  async addBookCopy(bookId: number, data: Partial<BookCopy>): Promise<BookCopy> {
    const response = await api.post<BookCopy>(`/books/${bookId}/add_copy/`, data);
    return response.data;
  }
  
  async updateCopyStatus(copyId: number, status: string, notes?: string): Promise<void> {
    await api.post(`/books/copies/${copyId}/update_status/`, {
      status,
      condition_notes: notes
    });
  }
  
  // Authors
  async getAuthors(params?: any): Promise<PaginatedResponse<Author>> {
    const response = await api.get<PaginatedResponse<Author>>('/books/authors/', { params });
    return response.data;
  }
  
  async getAuthor(id: number): Promise<Author> {
    const response = await api.get<Author>(`/books/authors/${id}/`);
    return response.data;
  }
  
  async createAuthor(data: Partial<Author>): Promise<Author> {
    const response = await api.post<Author>('/books/authors/', data);
    return response.data;
  }
  
  async getAuthorBooks(authorId: number): Promise<Book[]> {
    const response = await api.get<Book[]>(`/books/authors/${authorId}/books/`);
    return response.data;
  }
  
  // Publishers
  async getPublishers(params?: any): Promise<PaginatedResponse<Publisher>> {
    const response = await api.get<PaginatedResponse<Publisher>>('/books/publishers/', { params });
    return response.data;
  }
  
  async createPublisher(data: Partial<Publisher>): Promise<Publisher> {
    const response = await api.post<Publisher>('/books/publishers/', data);
    return response.data;
  }
  
  // Categories
  async getCategories(): Promise<Category[]> {
    const response = await api.get<{ results: Category[] }>('/books/categories/');
    return response.data.results;
  }
  
  async getCategoryTree(): Promise<Category[]> {
    const response = await api.get<Category[]>('/books/categories/tree/');
    return response.data;
  }
  
  async createCategory(data: Partial<Category>): Promise<Category> {
    const response = await api.post<Category>('/books/categories/', data);
    return response.data;
  }
}

export default new BookService();