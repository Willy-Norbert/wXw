import { MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import { getUnreadMessageCount } from '@/api/chat'; // make sure path is correct

const ChatBadge = () => {
  const [newMessages, setNewMessages] = useState(0);

  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const data = await getUnreadMessageCount();
        setNewMessages(data.count);
      } catch (err) {
        console.error('Failed to fetch unread messages:', err);
      }
    };

    fetchUnread();

    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Link to="/community-chat">
      <Button variant="ghost" size="icon" className="relative text-gray-700 hover:text-purple-600">
        <MessageSquare className="w-5 h-5" />
        {newMessages > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
            {newMessages}
          </span>
        )}
      </Button>
    </Link>
  );
};

export default ChatBadge;
