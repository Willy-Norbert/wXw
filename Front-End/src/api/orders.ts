import { ReactNode } from 'react';
import api from './api';

export interface CartItem {
  id: number;
  productId: number;
  quantity: number;
  product: {
    id: number;
    name: string;
    price: number;
    coverImage: string;
  };
}

export interface Cart {
  id: number;
  userId?: number;
  items: CartItem[];
}

export interface Order {
  status: string;
  customerNotes: string;
  orderNumber: ReactNode;
  createdAt: string | number | Date;
  isPaid: any;
  isDelivered: any;
  isConfirmedByAdmin: any;
  confirmedAt: string;
  user: any;
  customerName: any;
  customerEmail: any;
  shippingAddress(shippingAddress: any): import("react").ReactNode;
  paymentMethod: ReactNode;
  items: any;
  totalPrice: any;
}

export interface PlaceOrderData { 
  shippingAddress: string;
  paymentMethod: string;
}

export interface PlaceAnonymousOrderData {
  customerName: string;
  customerEmail: string;
  billingAddress?: string;
  shippingAddress: string;
  paymentMethod: string;
  cartId: number;
}

export interface CreateOrderData {
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  billingAddress?: string;
  shippingAddress: string;
  paymentMethod: string;
  items: Array<{
    productId: number;
    quantity: number;
    price: number;
  }>;
  totalPrice: number;
}

export const getCart = (cartId?: number | null) => {
  console.log('🔍 API getCart: Getting cart with cartId:', cartId);
  const params: Record<string, string> = {};
  if (cartId) {
    params.cartId = cartId.toString();
    console.log('📤 API getCart: Sending cartId parameter:', cartId);
  }
  return api.get<Cart>('/orders/cart', { params });
};

export const addToCart = async (productId: number, quantity: number, cartId?: number | null) => {
  const data: any = { productId, quantity };
  
  // Include cartId for anonymous users if available
  if (cartId) {
    data.cartId = cartId;
  }
  
  console.log('📤 API addToCart: Request data:', data);
  const response = await api.post('/orders/cart', data);
  console.log('📥 API addToCart: Response data:', response.data);
  
  return response;
};

export const removeFromCart = (productId: number, cartId?: number | null) => {
  const data = { productId, ...(cartId && { cartId }) };
  console.log('📤 API removeFromCart: Request data:', data);
  return api.delete('/orders/cart', { data });
};

export const placeOrder = (data: PlaceOrderData) =>
  api.post<Order>('/orders', data);

export const placeAnonymousOrder = (data: PlaceAnonymousOrderData) =>
  api.post<Order>('/orders/anonymous', data);

export const createOrder = (data: CreateOrderData) =>
  api.post<Order>('/orders/create', data);

export const getUserOrders = () => api.get<Order[]>('/orders');

export const getAllOrders = async (userRole?: string, userId?: number) => {
  const response = await api.get<Order[]>('/orders/all');
  return response;
};

export const getOrderById = (id: number) => api.get<Order>(`/orders/${id}`);
export const updateOrderStatus = (id: number, isPaid?: boolean, isDelivered?: boolean, additionalData?: any) => {
  const data: any = {};
  if (isPaid !== undefined) data.isPaid = isPaid;
  if (isDelivered !== undefined) data.isDelivered = isDelivered;
  if (additionalData) {
    Object.assign(data, additionalData);
  }
  return api.put(`/orders/${id}/status`, data);
};

export const confirmOrderPayment = (id: number) =>
  api.put(`/orders/${id}/confirm-payment`);

export const deleteOrder = (id: number) => api.delete(`/orders/${id}`);
export const updateOrder = (id: number, data: Partial<CreateOrderData>) =>
  api.put(`/orders/${id}`, data);
