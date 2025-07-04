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
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'seller' | 'buyer';
  token: string;
  user?: any;
  sellerPermissions?: any;
  isActive?: any;
  sellerStatus?: string;
  updateUser?: (data: Partial<UserResponse>) => void;
}

export const registerUser = (data: RegisterData) =>
  api.post<UserResponse>('/auth/register', data);

export const loginUser = async (data: LoginData) => {
  console.log('🌐 API: Making login request to /auth/login with data:', { email: data.email });
  try {
    const response = await api.post<UserResponse>('/auth/login', data);
    console.log('🌐 API: Login response received:', response.data);
    return response;
  } catch (error) {
    console.error('🌐 API: Login request failed:', error);
    throw error;
  }
};
