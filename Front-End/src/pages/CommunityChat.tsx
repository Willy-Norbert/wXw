
import React, { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { MessageSquare } from 'lucide-react';
import WhatsAppChat from '@/components/chat/WhatsAppChat';

const CommunityChat = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (user.role === 'buyer') {
      navigate('/');
    }
  }, [user, navigate]);

  if (!user || user.role === 'buyer') return null;

  return (
    <DashboardLayout currentPage="community-chat">
      <div className="h-full flex flex-col space-y-6">
        <div className="flex items-center space-x-3 overflow-hidden">
          
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r -purple-600 bg-clip-text ">
              Community Chat
            </h1>
            <p className="text-gray-600">
              Connect with other vendors and administrators
            </p>
          </div>
        </div>

        <WhatsAppChat currentUser={user} />
      </div>
    </DashboardLayout>
  );
};

export default CommunityChat;
