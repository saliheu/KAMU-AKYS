import api from './api';
import { Book, Author, SearchFilters } from '@/types';

interface SearchResult {
  books: Book[];
  authors: Author[];
  totalResults: number;
  took: number;
  aggregations?: {
    categories: Array<{ key: string; count: number }>;
    authors: Array<{ key: string; count: number }>;
    publishers: Array<{ key: string; count: number }>;
    languages: Array<{ key: string; count: number }>;
    years: Array<{ key: number; count: number }>;
  };
}

interface SearchSuggestion {
  text: string;
  type: 'book' | 'author' | 'category';
  id: string;
}

class SearchService {
  async search(query: string, filters?: SearchFilters, page = 1): Promise<SearchResult> {
    const params = new URLSearchParams();
    params.append('q', query);
    params.append('page', page.toString());
    
    if (filters) {
      if (filters.type) params.append('type', filters.type);
      if (filters.categoryId) params.append('categoryId', filters.categoryId);
      if (filters.authorId) params.append('authorId', filters.authorId);
      if (filters.publisherId) params.append('publisherId', filters.publisherId);
      if (filters.language) params.append('language', filters.language);
      if (filters.yearFrom) params.append('yearFrom', filters.yearFrom.toString());
      if (filters.yearTo) params.append('yearTo', filters.yearTo.toString());
      if (filters.available !== undefined) params.append('available', filters.available.toString());
    }
    
    return api.get<SearchResult>(`/search?${params.toString()}`);
  }

  async getSuggestions(query: string): Promise<SearchSuggestion[]> {
    return api.get<SearchSuggestion[]>(`/search/suggestions?q=${encodeURIComponent(query)}`);
  }

  async advancedSearch(params: {
    title?: string;
    author?: string;
    isbn?: string;
    publisher?: string;
    description?: string;
    yearFrom?: number;
    yearTo?: number;
    language?: string;
    categoryId?: string;
  }): Promise<SearchResult> {
    const searchParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        searchParams.append(key, value.toString());
      }
    });
    
    return api.get<SearchResult>(`/search/advanced?${searchParams.toString()}`);
  }

  async getPopularSearches(): Promise<string[]> {
    const response = await api.get<{ searches: string[] }>('/search/popular');
    return response.searches;
  }

  async saveSearchHistory(query: string): Promise<void> {
    await api.post('/search/history', { query });
  }

  async getSearchHistory(): Promise<string[]> {
    const response = await api.get<{ history: string[] }>('/search/history');
    return response.history;
  }

  async clearSearchHistory(): Promise<void> {
    await api.delete('/search/history');
  }
}

export default new SearchService();