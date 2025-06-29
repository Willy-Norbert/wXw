
import api from './api';

export interface ChatAttachment {
  id: number;
  fileName: string;
  fileUrl: string;
  fileType: 'IMAGE' | 'PDF' | 'AUDIO' | 'VIDEO' | 'DOCUMENT';
  fileSize?: number;
}

export interface ChatMessage {
  id: number;
  message?: string;
  userId: number;
  messageType: 'TEXT' | 'FILE' | 'IMAGE' | 'AUDIO';
  createdAt: string;
  updatedAt: string;
  user: {
    id: number;
    name: string;
    role: string;
  };
  attachments?: ChatAttachment[];
}

export interface CreateMessageData {
  message?: string;
  messageType?: 'TEXT' | 'FILE' | 'IMAGE' | 'AUDIO';
  attachments?: {
    fileName: string;
    fileUrl: string;
    fileType: 'IMAGE' | 'PDF' | 'AUDIO' | 'VIDEO' | 'DOCUMENT';
    fileSize?: number;
  }[];
}

export const getChatMessages = async () => {
  const response = await api.get('/chat/messages');
  return response.data;
};

export const createChatMessage = async (data: CreateMessageData) => {
  const response = await api.post('/chat/messages', data);
  return response.data;
};

export const deleteChatMessage = async (messageId: number) => {
  const response = await api.delete(`/chat/messages/${messageId}`);
  return response.data;
};
