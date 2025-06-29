
import React from 'react';
import { ChatMessage } from '@/api/chat';
import AudioMessage from './AudioMessage';

interface MessageBubbleProps {
  message: ChatMessage;
  isCurrentUser: boolean;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isCurrentUser }) => {
  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderMessageContent = () => {
    // Handle audio messages
    if (message.messageType === 'AUDIO' && message.attachments && message.attachments.length > 0) {
      const audioAttachment = message.attachments[0];
      return (
        <AudioMessage
          audioUrl={audioAttachment.fileUrl}
          duration={0} // Duration not stored in current schema
          isCurrentUser={isCurrentUser}
        />
      );
    }

    // Handle file/image messages
    if (message.messageType === 'FILE' && message.attachments && message.attachments.length > 0) {
      return (
        <div className="space-y-2">
          {message.message && (
            <p className="break-words">{message.message}</p>
          )}
          {message.attachments.map((attachment, index) => (
            <div key={index} className="space-y-1">
              {attachment.fileType === 'IMAGE' ? (
                <img
                  src={attachment.fileUrl}
                  alt={attachment.fileName}
                  className="max-w-xs rounded-lg shadow-sm"
                  style={{ maxHeight: '200px', objectFit: 'cover' }}
                />
              ) : (
                <div className={`p-3 rounded-lg border ${
                  isCurrentUser ? 'bg-purple-600 border-purple-500' : 'bg-gray-100 border-gray-200'
                }`}>
                  <div className="flex items-center space-x-2">
                    <div className={`text-sm ${
                      isCurrentUser ? 'text-purple-100' : 'text-gray-600'
                    }`}>
                      📎 {attachment.fileName}
                    </div>
                    <a
                      href={attachment.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`text-xs underline ${
                        isCurrentUser ? 'text-purple-200 hover:text-white' : 'text-purple-600 hover:text-purple-800'
                      }`}
                    >
                      Download
                    </a>
                  </div>
                  {attachment.fileSize && (
                    <div className={`text-xs mt-1 ${
                      isCurrentUser ? 'text-purple-200' : 'text-gray-500'
                    }`}>
                      {(attachment.fileSize / 1024).toFixed(1)} KB
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      );
    }

    // Handle text messages
    return <p className="break-words">{message.message}</p>;
  };

  return (
    <div className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} mb-2`}>
      <div
        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg shadow-sm ${
          isCurrentUser
            ? 'bg-purple-500 text-white'
            : 'bg-white border border-gray-200 text-gray-800'
        }`}
      >
        {/* User name for non-current users */}
        {!isCurrentUser && (
          <div className="text-xs font-medium text-purple-600 mb-1">
            {message.user?.name} ({message.user?.role})
          </div>
        )}

        {/* Message content */}
        <div className="mb-1">
          {renderMessageContent()}
        </div>

        {/* Timestamp */}
        <div
          className={`text-xs ${
            isCurrentUser ? 'text-purple-100' : 'text-gray-500'
          } text-right`}
        >
          {formatTime(message.createdAt)}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
