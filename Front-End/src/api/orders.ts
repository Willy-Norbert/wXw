
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

export interface Order { /* unchanged */ }

export interface PlaceOrderData { 
  shippingAddress: string;
  paymentMethod: string;
}

export interface PlaceAnonymousOrderData {
  customerName: string;
  customerEmail: string;
  shippingAddress: string;
  paymentMethod: string;
  cartId: number;
}

export interface CreateOrderData { /* unchanged */ }

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
export const updateOrderStatus = (id: number, isPaid?: boolean, isDelivered?: boolean) =>
  api.put(`/orders/${id}/status`, { isPaid, isDelivered });

export const confirmOrderPayment = (id: number) =>
  api.put(`/orders/${id}/confirm-payment`);

export const deleteOrder = (id: number) => api.delete(`/orders/${id}`);
export const updateOrder = (id: number, data: Partial<CreateOrderData>) =>
  api.put(`/orders/${id}`, data);
