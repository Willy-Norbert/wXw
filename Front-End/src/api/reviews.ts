
import api from './api';

export interface Review {
  id: number;
  rating: number;
  comment: string;
  userId: number;
  productId: number;
  user: {
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateReviewData {
  rating: number;
  comment: string;
}

export const getProductReviews = (productId: string) => 
  api.get<Review[]>(`/products/${productId}/reviews`);

export const createProductReview = (productId: string, data: CreateReviewData) =>
  api.post<Review>(`/products/${productId}/reviews`, data);

export const updateReview = (productId: string, reviewId: number, data: Partial<CreateReviewData>) =>
  api.put<Review>(`/products/${productId}/reviews/${reviewId}`, data);

export const deleteReview = (productId: string, reviewId: number) =>
  api.delete(`/products/${productId}/reviews/${reviewId}`);

// Get all reviews for admin dashboard
export const getAllReviews = () => api.get<Review[]>('/reviews/all');
