import api from './api';

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'seller' | 'buyer';
}

export interface LoginData {
  email: string;
  password: string;
}

export interface UserResponse {
  isActive: any;
  sellerStatus: string;
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'seller' | 'buyer';
  token: string;
}

export const registerUser = (data: RegisterData) =>
  api.post<UserResponse>('/auth/register', data);

export const loginUser = (data: LoginData) =>
  api.post<UserResponse>('/auth/login', data);
