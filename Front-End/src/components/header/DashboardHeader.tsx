
import React, { useContext, useState } from 'react';
import { Bell, Moon, LogOut, User, Settings, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AuthContext } from '../../contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getNotifications } from '@/api/notifications';
import LanguageSwitcher from '../LanguageSwitcher';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

export const DashboardHeader: React.FC = () => {
  const { user, logout } = useContext(AuthContext);
  const { t } = useLanguage();

  const { data: notificationsData } = useQuery({
    queryKey: ['notifications'],
    queryFn: getNotifications,
    enabled: !!user,
  });

  const notifications = notificationsData?.data || [];
  const unreadCount = notifications.filter((n: any) => !n.isRead).length;

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
            <DropdownMenuContent align="end" className="w-80 bg-white border border-gray-200 shadow-lg z-50">
              {notifications.length > 0 ? (
                notifications.slice(0, 5).map((notification: any) => (
                  <DropdownMenuItem key={notification.id} className="p-3">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm">{notification.message}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(notification.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </DropdownMenuItem>
                ))
              ) : (
                <DropdownMenuItem>
                  <p className="text-sm text-gray-500">{t('dashboard.notifications')}</p>
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
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
