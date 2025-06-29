
import api from './api';

export interface Notification {
  id: number;
  userId?: number;
  message: string;
  recipientRole: string;
  relatedOrderId?: number;
  isRead: boolean;
  createdAt: string;
}

export const getNotifications = () => api.get<Notification[]>('/notifications');

export const markNotificationRead = (id: number) =>
  api.put(`/notifications/${id}/read`);

export const deleteNotification = (id: number) =>
  api.delete(`/notifications/${id}`);
