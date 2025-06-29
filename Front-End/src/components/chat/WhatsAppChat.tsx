
import React, { useState, useRef, useEffect } from 'react';
import { Send, MessageSquare, Users } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getChatMessages, createChatMessage, ChatMessage, CreateMessageData } from '@/api/chat';
import { useToast } from '@/hooks/use-toast';
import MessageBubble from './MessageBubble';
import FileUpload, { FileData } from './FileUpload';
import AudioRecorder, { AudioData } from './AudioRecorder';

interface WhatsAppChatProps {
  currentUser: any;
}

const WhatsAppChat: React.FC<WhatsAppChatProps> = ({ currentUser }) => {
  const [newMessage, setNewMessage] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<FileData[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  console.log('WhatsAppChat - Current user:', currentUser?.id, currentUser?.role);

  // Real-time message fetching with frequent updates
  const { data: messagesData, isLoading, error } = useQuery({
    queryKey: ['whatsapp-chat-messages'],
    queryFn: async () => {
      console.log('Fetching chat messages...');
      try {
        const result = await getChatMessages();
        console.log('Chat messages fetched:', result);
        return result;
      } catch (error) {
        console.error('Error fetching chat messages:', error);
        throw error;
      }
    },
    refetchInterval: 1000, // Real-time updates every second
    staleTime: 500,
    gcTime: 5000,
  });

  const messages = Array.isArray(messagesData) ? messagesData : (messagesData?.data || []);
  console.log('Processed messages:', messages.length);

  const createMessageMutation = useMutation({
    mutationFn: async (messageData: CreateMessageData) => {
      console.log('Creating chat message:', messageData);
      return createChatMessage(messageData);
    },
    onMutate: async (newMessageData) => {
      await queryClient.cancelQueries({ queryKey: ['whatsapp-chat-messages'] });
      const previousMessages = queryClient.getQueryData(['whatsapp-chat-messages']);

      // Optimistic update
      const optimisticMessage = {
        id: Math.random(),
        message: newMessageData.message,
        messageType: newMessageData.messageType || 'TEXT',
        user: currentUser,
        userId: currentUser.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        attachments: newMessageData.attachments || [],
      };

      queryClient.setQueryData(['whatsapp-chat-messages'], (old: any) => {
        if (Array.isArray(old)) {
          return [...old, optimisticMessage];
        }
        return [...(old?.data || []), optimisticMessage];
      });

      return { previousMessages };
    },
    onSuccess: (data) => {
      console.log('Message created successfully:', data);
      setNewMessage('');
      setSelectedFiles([]);
      queryClient.invalidateQueries({ queryKey: ['whatsapp-chat-messages'] });
    },
    onError: (error: any, _, context) => {
      console.error('Message creation error:', error);
      queryClient.setQueryData(['whatsapp-chat-messages'], context?.previousMessages);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to send message",
        variant: "destructive",
      });
    },
  });

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() && selectedFiles.length === 0) return;

    const messageData: CreateMessageData = {
      message: newMessage.trim() || undefined,
      messageType: selectedFiles.length > 0 ? 'FILE' : 'TEXT',
      attachments: selectedFiles.map(file => ({
        fileName: file.file.name,
        fileUrl: file.url,
        fileType: file.type.toUpperCase() as any,
        fileSize: file.file.size,
      })),
    };

    createMessageMutation.mutate(messageData);
  };

  const handleFileSelect = (files: FileData[]) => {
    console.log('Files selected:', files);
    setSelectedFiles(files);
    
    // Auto-send files
    const messageData: CreateMessageData = {
      messageType: 'FILE',
      attachments: files.map(file => ({
        fileName: file.file.name,
        fileUrl: file.url,
        fileType: file.type.toUpperCase() as any,
        fileSize: file.file.size,
      })),
    };

    createMessageMutation.mutate(messageData);
  };

  const handleAudioReady = (audioData: AudioData) => {
    console.log('Audio ready:', audioData);
    
    const messageData: CreateMessageData = {
      messageType: 'AUDIO',
      attachments: [{
        fileName: audioData.file.name,
        fileUrl: audioData.url,
        fileType: 'AUDIO',
        fileSize: audioData.file.size,
      }],
    };

    createMessageMutation.mutate(messageData);
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (error) {
    console.error('Chat loading error:', error);
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-600 mb-4">Failed to load chat</p>
          <Button onClick={() => queryClient.invalidateQueries({ queryKey: ['whatsapp-chat-messages'] })}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Card className="flex flex-col h-[calc(100vh-200px)] bg-gray-50">
      {/* Chat Header - WhatsApp Style */}
      <CardHeader className="bg-purple-600 text-white p-4 rounded-t-lg">
        <CardTitle className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-purple-700 rounded-full flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Community Chat</h2>
            <p className="text-sm text-purple-100">
              {messages.length} messages • Vendors & Admins
            </p>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
        {/* Messages Area - WhatsApp Style */}
        <div 
          className="flex-1 overflow-y-auto p-4 space-y-2 bg-cover bg-center"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23f0f0f0' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        >
          {messages.length > 0 ? (
            messages.map((message: ChatMessage) => (
              <MessageBubble
                key={message.id}
                message={message}
                isCurrentUser={message.userId === currentUser?.id}
              />
            ))
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No messages yet. Start the conversation!</p>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area - WhatsApp Style */}
        <div className="bg-white border-t p-4">
          <div className="flex items-center space-x-2 mb-2">
            <FileUpload 
              onFileSelect={handleFileSelect} 
              disabled={createMessageMutation.isPending}
            />
            <AudioRecorder 
              onAudioReady={handleAudioReady}
              disabled={createMessageMutation.isPending}
            />
          </div>
          
          <form onSubmit={handleSendMessage} className="flex items-end space-x-2">
            <div className="flex-1">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className="rounded-full border-gray-300 focus:border-purple-500"
                disabled={createMessageMutation.isPending}
                maxLength={1000}
              />
            </div>
            <Button 
              type="submit" 
              disabled={!newMessage.trim() || createMessageMutation.isPending}
              className="rounded-full bg-purple-500 hover:bg-purple-600 w-12 h-12 p-0"
            >
              <Send className="w-5 h-5" />
            </Button>
          </form>
          
          {newMessage.length > 0 && (
            <p className="text-xs text-gray-500 mt-1 text-right">
              {newMessage.length}/1000 characters
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default WhatsAppChat;
