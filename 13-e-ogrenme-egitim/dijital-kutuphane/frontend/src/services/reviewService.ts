import api from './api';
import { Review } from '@/types';

interface ReviewsResponse {
  reviews: Review[];
  pagination: {
    total: number;
    page: number;
    pages: number;
    limit: number;
  };
  stats: {
    average: number;
    count: number;
    distribution: {
      1: number;
      2: number;
      3: number;
      4: number;
      5: number;
    };
  };
}

interface ReviewResponse {
  review: Review;
}

class ReviewService {
  async getBookReviews(bookId: string, page = 1, sortBy = 'createdAt'): Promise<ReviewsResponse> {
    return api.get<ReviewsResponse>(`/reviews/book/${bookId}?page=${page}&sortBy=${sortBy}`);
  }

  async getUserReviews(userId: string, page = 1): Promise<ReviewsResponse> {
    return api.get<ReviewsResponse>(`/reviews/user/${userId}?page=${page}`);
  }

  async getMyReviews(page = 1): Promise<ReviewsResponse> {
    return api.get<ReviewsResponse>(`/reviews/my?page=${page}`);
  }

  async createReview(data: {
    bookId: string;
    rating: number;
    title: string;
    content: string;
  }): Promise<ReviewResponse> {
    return api.post<ReviewResponse>('/reviews', data);
  }

  async updateReview(id: string, data: {
    rating?: number;
    title?: string;
    content?: string;
  }): Promise<ReviewResponse> {
    return api.put<ReviewResponse>(`/reviews/${id}`, data);
  }

  async deleteReview(id: string): Promise<{ message: string }> {
    return api.delete<{ message: string }>(`/reviews/${id}`);
  }

  async likeReview(id: string): Promise<ReviewResponse> {
    return api.post<ReviewResponse>(`/reviews/${id}/like`);
  }

  async unlikeReview(id: string): Promise<ReviewResponse> {
    return api.delete<ReviewResponse>(`/reviews/${id}/like`);
  }

  async reportReview(id: string, reason: string): Promise<{ message: string }> {
    return api.post<{ message: string }>(`/reviews/${id}/report`, { reason });
  }

  async getReviewStats(bookId: string): Promise<{
    average: number;
    count: number;
    distribution: {
      1: number;
      2: number;
      3: number;
      4: number;
      5: number;
    };
  }> {
    return api.get<{
      average: number;
      count: number;
      distribution: {
        1: number;
        2: number;
        3: number;
        4: number;
        5: number;
      };
    }>(`/reviews/book/${bookId}/stats`);
  }
}

export default new ReviewService();