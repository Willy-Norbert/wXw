import api from './api';

export interface Seller {
  id: number;
  name: string;
  email: string;
  phone?: string;
  businessName?: string;
  sellerStatus: string;
  isActive: boolean;
  sellerPermissions?: string;
  createdAt: string;
}

export interface SellerRequestData {
  name: string;
  email: string;
  phone?: string;
  businessName: string;
  businessDescription?: string;
}

export interface UpdateSellerStatusData {
  status: string;
  permissions?: any;
}

// Submit seller request (public)
export const submitSellerRequest = (data: SellerRequestData) =>
  api.post('/sellers/request', data);

// Get all sellers (Admin only)
export const getAllSellers = () => api.get<Seller[]>('/sellers/all');

// Get pending sellers (Admin only)
export const getPendingSellers = () => api.get<Seller[]>('/sellers/pending');

// Update seller status and permissions (Admin only)
export const updateSellerStatus = (sellerId: number, data: UpdateSellerStatusData) =>
  api.put(`/sellers/${sellerId}/status`, data);

// Get seller's products (Seller only)
export const getSellerProducts = () => api.get('/sellers/my-products');

// Get seller's customers (Seller only)
export const getSellerCustomers = () => api.get('/sellers/my-customers');

// Get seller's orders (Seller only)
export const getSellerOrders = () => api.get('/sellers/my-orders');

// Get seller stats (Seller only)
export const getSellerStats = () => api.get('/sellers/my-stats');