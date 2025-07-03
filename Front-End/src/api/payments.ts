
import api from './api';

export interface PaymentCodeResponse {
  message: string;
  paymentCode: string;
}

export interface PaymentConfirmResponse {
  message: string;
}

// Generate MoMo payment code for an order
export const generatePaymentCode = (orderId: number) =>
  api.post<PaymentCodeResponse>(`/payments/${orderId}/generate-code`);

// Client confirms payment
export const confirmClientPayment = (orderId: number) =>
  api.post<PaymentConfirmResponse>(`/payments/${orderId}/confirm-client`);

// Admin confirms payment
export const confirmPaymentByAdmin = (orderId: number) =>
  api.post<PaymentConfirmResponse>(`/payments/${orderId}/confirm-admin`);
