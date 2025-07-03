import api from './api';

export interface VerifyUserData {
  email?: string;
  phone?: string;
}

export interface VerifyUserResponse {
  success: boolean;
  user?: {
    id: number;
    name: string;
    email: string;
    phone?: string;
    role: string;
    isActive: boolean;
  };
  message?: string;
}

// Verify if user exists by email or phone
export const verifyUserExists = (data: VerifyUserData) =>
  api.post<VerifyUserResponse>('/auth/verify-user', data);