import api from './api';
import { Collection, Book } from '@/types';

interface CollectionsResponse {
  collections: Collection[];
  pagination: {
    total: number;
    page: number;
    pages: number;
    limit: number;
  };
}

interface CollectionResponse {
  collection: Collection;
}

interface CollectionBooksResponse {
  books: Book[];
  pagination: {
    total: number;
    page: number;
    pages: number;
    limit: number;
  };
}

class CollectionService {
  async getMyCollections(page = 1): Promise<CollectionsResponse> {
    return api.get<CollectionsResponse>(`/collections/my?page=${page}`);
  }

  async getPublicCollections(page = 1, search?: string): Promise<CollectionsResponse> {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    if (search) params.append('search', search);
    
    return api.get<CollectionsResponse>(`/collections/public?${params.toString()}`);
  }

  async getUserCollections(userId: string, page = 1): Promise<CollectionsResponse> {
    return api.get<CollectionsResponse>(`/collections/user/${userId}?page=${page}`);
  }

  async getCollection(id: string): Promise<CollectionResponse> {
    return api.get<CollectionResponse>(`/collections/${id}`);
  }

  async getCollectionBooks(id: string, page = 1): Promise<CollectionBooksResponse> {
    return api.get<CollectionBooksResponse>(`/collections/${id}/books?page=${page}`);
  }

  async createCollection(data: {
    name: string;
    description?: string;
    isPublic?: boolean;
  }): Promise<CollectionResponse> {
    return api.post<CollectionResponse>('/collections', data);
  }

  async updateCollection(id: string, data: {
    name?: string;
    description?: string;
    isPublic?: boolean;
  }): Promise<CollectionResponse> {
    return api.put<CollectionResponse>(`/collections/${id}`, data);
  }

  async deleteCollection(id: string): Promise<{ message: string }> {
    return api.delete<{ message: string }>(`/collections/${id}`);
  }

  async addBookToCollection(collectionId: string, bookId: string): Promise<{ message: string }> {
    return api.post<{ message: string }>(`/collections/${collectionId}/books`, { bookId });
  }

  async removeBookFromCollection(collectionId: string, bookId: string): Promise<{ message: string }> {
    return api.delete<{ message: string }>(`/collections/${collectionId}/books/${bookId}`);
  }

  async followCollection(id: string): Promise<{ message: string }> {
    return api.post<{ message: string }>(`/collections/${id}/follow`);
  }

  async unfollowCollection(id: string): Promise<{ message: string }> {
    return api.delete<{ message: string }>(`/collections/${id}/follow`);
  }

  async getFollowedCollections(page = 1): Promise<CollectionsResponse> {
    return api.get<CollectionsResponse>(`/collections/followed?page=${page}`);
  }

  async shareCollection(id: string): Promise<{ shareUrl: string }> {
    return api.post<{ shareUrl: string }>(`/collections/${id}/share`);
  }
}

export default new CollectionService();