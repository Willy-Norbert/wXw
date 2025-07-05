
import React, { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Download, Edit, Trash2, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChatMessage } from '@/api/chat';
import AudioMessage from './AudioMessage';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateChatMessage, deleteChatMessage } from '@/api/chat';
import { useToast } from '@/hooks/use-toast';

interface MessageBubbleProps {
  message: ChatMessage;
  isCurrentUser: boolean;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isCurrentUser }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(message.message || '');
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const updateMutation = useMutation({
    mutationFn: (data: { messageId: number; message: string }) =>
      updateChatMessage(data.messageId, { message: data.message }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['whatsapp-chat-messages'] });
      setIsEditing(false);
      toast({
        title: "Message updated",
        description: "Your message has been updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update message",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (messageId: number) => deleteChatMessage(messageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['whatsapp-chat-messages'] });
      toast({
        title: "Message deleted",
        description: "Your message has been deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to delete message",
        variant: "destructive",
      });
    },
  });

  const handleEdit = () => {
    if (editText.trim()) {
      updateMutation.mutate({
        messageId: message.id,
        message: editText.trim(),
      });
    }
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this message?')) {
      deleteMutation.mutate(message.id);
    }
  };

  const cancelEdit = () => {
    setEditText(message.message || '');
    setIsEditing(false);
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getFileIcon = (fileType: string) => {
    switch (fileType.toLowerCase()) {
      case 'image': return '🖼️';
      case 'pdf': return '📄';
      case 'audio': return '🎵';
      case 'video': return '🎥';
      default: return '📁';
    }
  };

  return (
    <div className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} mb-3`}>
      <div className={`max-w-xs lg:max-w-md ${isCurrentUser ? 'order-2' : 'order-1'}`}>
        {/* User info */}
        {!isCurrentUser && (
          <div className="flex items-center space-x-2 mb-1">
            <div className="w-6 h-6 bg-gray-400 rounded-full flex items-center justify-center text-white text-xs font-medium">
              {message.user.name.charAt(0).toUpperCase()}
            </div>
            <span className="text-xs text-gray-600 font-medium">
              {message.user.name}
            </span>
            <span className="text-xs text-gray-400 uppercase">
              {message.user.role}
            </span>
          </div>
        )}

        {/* Message content */}
        <div
          className={`px-4 py-2 rounded-lg shadow-sm ${
            isCurrentUser
              ? 'bg-purple-500 text-gray-700'
              : 'bg-white border border-gray-200'
          }`}
        >
          {/* Text message */}
          {message.messageType === 'TEXT' && (
            <>
              {isEditing ? (
                <div className="space-y-2">
                  <Input
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className="text-sm"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleEdit();
                      if (e.key === 'Escape') cancelEdit();
                    }}
                  />
                  <div className="flex space-x-1">
                    <Button
                      size="sm"
                      onClick={handleEdit}
                      disabled={updateMutation.isPending}
                      className="h-6 px-2 text-xs"
                    >
                      <Check className="w-3 h-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={cancelEdit}
                      className="h-6 px-2 text-xs"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-sm whitespace-pre-wrap break-words">
                  {message.message}
                </p>
              )}
            </>
          )}

          {/* Audio message */}
          {message.messageType === 'AUDIO' && message.attachments?.[0] && (
            <AudioMessage
              audioUrl={message.attachments[0].fileUrl}
              isCurrentUser={isCurrentUser}
            />
          )}

          {/* File attachments */}
          {(message.messageType === 'FILE' || message.messageType === 'IMAGE') && message.attachments && (
            <div className="space-y-2">
              {message.attachments.map((attachment, index) => (
                <div key={index}>
                  {attachment.fileType === 'IMAGE' ? (
                    <img
                      src={attachment.fileUrl}
                      alt={attachment.fileName}
                      className="max-w-full h-auto rounded"
                      loading="lazy"
                    />
                  ) : (
                    <div className={`flex items-center justify-between p-2 rounded ${
                      isCurrentUser ? 'bg-purple-600' : 'bg-gray-50'
                    }`}>
                      <div className="flex items-center space-x-2 min-w-0">
                        <span className="text-sm">
                          {getFileIcon(attachment.fileType)}
                        </span>
                        <div className="min-w-0">
                          <p className={`text-xs font-medium truncate ${
                            isCurrentUser ? 'text-white' : 'text-gray-700'
                          }`}>
                            {attachment.fileName}
                          </p>
                          {attachment.fileSize && (
                            <p className={`text-xs ${
                              isCurrentUser ? 'text-purple-100' : 'text-gray-500'
                            }`}>
                              {formatFileSize(attachment.fileSize)}
                            </p>
                          )}
                        </div>
                      </div>
                      <a
                        href={attachment.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`ml-2 p-1 rounded hover:bg-opacity-80 ${
                          isCurrentUser ? 'hover:bg-purple-700' : 'hover:bg-gray-200'
                        }`}
                      >
                        <Download className={`w-4 h-4 ${
                          isCurrentUser ? 'text-white' : 'text-gray-600'
                        }`} />
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Message actions */}
          {isCurrentUser && !isEditing && (
            <div className="flex items-center justify-end space-x-1 mt-2">
              {message.messageType === 'TEXT' && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setIsEditing(true)}
                  className="h-6 w-6 p-0 hover:bg-purple-600"
                  title="Edit message"
                >
                  <Edit className="w-3 h-3 text-purple-100" />
                </Button>
              )}
              <Button
                size="sm"
                variant="ghost"
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
                className="h-6 w-6 p-0 hover:bg-purple-600"
                title="Delete message"
              >
                <Trash2 className="w-3 h-3 text-purple-100" />
              </Button>
            </div>
          )}
        </div>

        {/* Timestamp */}
        <div className={`flex items-center space-x-2 mt-1 text-xs text-gray-500 ${
          isCurrentUser ? 'justify-end' : 'justify-start'
        }`}>
          <span>
            {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
          </span>
          {message.createdAt !== message.updatedAt && (
            <span className="text-gray-400">(edited)</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
