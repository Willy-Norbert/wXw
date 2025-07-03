
import api from './api';

export interface Category {
  id: number;
  name: string;
  description: string;
}

export interface CreateCategoryData {
  name: string;
  description: string;
}

export const getCategories = () => api.get<Category[]>('/categories');

export const getCategoryById = (id: string) => api.get<Category>(`/categories/${id}`);

export const createCategory = (data: CreateCategoryData) => 
  api.post<Category>('/categories', data);

export const updateCategory = (id: string, data: Partial<CreateCategoryData>) =>
  api.put<Category>(`/categories/${id}`, data);

export const deleteCategory = (id: string) => api.delete(`/categories/${id}`);

export const getProductsByCategory = (id: string) => 
  api.get<any[]>(`/categories/${id}/products`);
