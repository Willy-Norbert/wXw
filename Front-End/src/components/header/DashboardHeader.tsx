import React, { useContext, useState } from 'react';
import { Bell, Moon, LogOut, User, Settings, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AuthContext } from '../../contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getNotifications, markNotificationRead, deleteNotification } from '@/api/notifications';
import { useToast } from '@/hooks/use-toast';
import LanguageSwitcher from '../LanguageSwitcher';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import ChatBadge from '../ChatBadge';

export const DashboardHeader: React.FC = () => {
  const { user, logout } = useContext(AuthContext);
  const { t } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: notificationsData } = useQuery({
    queryKey: ['notifications'],
    queryFn: getNotifications,
    enabled: !!user,
  });

  const markReadMutation = useMutation({
    mutationFn: markNotificationRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteNotification,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const notifications = notificationsData?.data || [];
  const unreadCount = notifications.filter((n: any) => !n.isRead).length;

  const handleNotificationClick = (notification: any) => {
    // Mark as read if not already read
    if (!notification.isRead) {
      markReadMutation.mutate(notification.id);
    }
    
    // Auto-delete after viewing
    setTimeout(() => {
      deleteMutation.mutate(notification.id);
    }, 500);
  };

  const handleLogout = () => {
    logout();
  };

  if (!user) return null;

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/">
            <Button variant="ghost" className="text-purple-600 hover:text-purple-700">
              <Home className="w-4 h-4 mr-2" />
              {t('nav.home')}
            </Button>
          </Link>
          {(user.role === 'admin' || user.role === 'seller') && (
            <Link to="/dashboard">
              <Button variant="ghost" className="text-purple-600 hover:text-purple-700">
                {t('nav.dashboard')}
              </Button>
            </Link>
          )}
        </div>
        
        <div className="flex items-center space-x-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-red-500">
                    {unreadCount}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              align="end" 
              className="w-96 max-w-[90vw] bg-white border border-gray-200 shadow-lg z-50 p-0"
            >
              <div className="p-3 border-b border-gray-100">
                <h3 className="font-medium text-sm text-gray-900">Notifications</h3>
              </div>
              
              {notifications.length > 0 ? (
                <ScrollArea className="max-h-80">
                  <div className="p-1">
                    {notifications.slice(0, 10).map((notification: any) => (
                      <DropdownMenuItem 
                        key={notification.id} 
                        className="p-3 cursor-pointer hover:bg-gray-50 focus:bg-gray-50"
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <div className="flex flex-col space-y-1 w-full min-w-0">
                          <p className={`text-sm break-words ${
                            notification.isRead 
                              ? 'text-gray-700' 
                              : 'text-gray-900 font-medium'
                          }`}>
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(notification.createdAt).toLocaleDateString()} at{' '}
                            {new Date(notification.createdAt).toLocaleTimeString()}
                          </p>
                          {!notification.isRead && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full self-end"></div>
                          )}
                        </div>
                      </DropdownMenuItem>
                    ))}
                    {notifications.length > 10 && (
                      <div className="p-2 text-center border-t border-gray-100">
                        <p className="text-xs text-gray-500">
                          Showing 10 of {notifications.length} notifications
                        </p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              ) : (
                <div className="p-6 text-center">
                  <Bell className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm text-gray-500">{t('dashboard.notifications')}</p>
                </div>
              )}
            </DropdownMenuContent>
             <div className=" text-center">
                  <ChatBadge  className="w-6 h-6 mx-auto mb-2 text-gray-400" />
                  
                </div>
          </DropdownMenu>

          <LanguageSwitcher variant="dashboard" />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-purple-400 rounded-full flex items-center justify-center text-white font-medium">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-medium">{user.name}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-white border border-gray-200 shadow-lg z-50">
              <DropdownMenuItem asChild>
                <Link to="/profile" className="flex items-center">
                  <User className="w-4 h-4 mr-2" />
                  {t('dashboard.profile')}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                {/* <Settings className="w-4 h-4 mr-2" />
                {t('dashboard.settings')} */}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                {t('auth.logout')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};
