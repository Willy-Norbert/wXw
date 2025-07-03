
import api from './api';

export interface ProfileUpdateData {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  bio?: string;
  company?: string;
}

export const updateProfile = async (data: ProfileUpdateData) => {
  const response = await api.put('/auth/profile', data);
  return response.data;
};

export const getUserProfile = async () => {
  const response = await api.get('/auth/profile');
  return response.data;
};
