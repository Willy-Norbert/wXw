
import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bell, X, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getNotifications, markNotificationRead, deleteNotification } from '@/api/notifications';
import { useToast } from '@/hooks/use-toast';

const NotificationList = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: notifications, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: getNotifications,
    staleTime: 10000,
    refetchInterval: 15000,
  });

  const markReadMutation = useMutation({
    mutationFn: markNotificationRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to mark as read",
        variant: "destructive",
      });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: deleteNotification,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast({
        title: "Notification deleted",
        description: "The notification has been removed",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to delete notification",
        variant: "destructive",
      });
    }
  });

  const handleNotificationClick = (notification: any) => {
    if (!notification.isRead) {
      markReadMutation.mutate(notification.id);
    }
    // Auto-delete notification after marking as read
    setTimeout(() => {
      deleteMutation.mutate(notification.id);
    }, 1000);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  const notificationList = notifications?.data || [];

  return (
    <div className="space-y-2 max-h-96 overflow-y-auto">
      {notificationList.length === 0 ? (
        <div className="p-4 text-center text-gray-500">
          <Bell className="w-6 h-6 mx-auto mb-2 text-gray-400" />
          <p className="text-sm">No notifications</p>
        </div>
      ) : (
        notificationList.map((notification) => (
          <div
            key={notification.id}
            onClick={() => handleNotificationClick(notification)}
            className={`p-3 border rounded-lg cursor-pointer transition-colors ${
              notification.isRead ? 'bg-gray-50 hover:bg-gray-100' : 'bg-blue-50 border-blue-200 hover:bg-blue-100'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 pr-2">
                <p className={`text-sm ${notification.isRead ? 'text-gray-700' : 'text-blue-900 font-medium'}`}>
                  {notification.message}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(notification.createdAt).toLocaleDateString()} at{' '}
                  {new Date(notification.createdAt).toLocaleTimeString()}
                </p>
              </div>
              
              <div className="flex items-center space-x-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteMutation.mutate(notification.id);
                  }}
                  disabled={deleteMutation.isPending}
                  className="text-red-600 hover:text-red-800 hover:bg-red-50 p-1 h-auto"
                  title="Delete notification"
                >
                  {deleteMutation.isPending ? (
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-red-500"></div>
                  ) : (
                    <Trash2 className="w-3 h-3" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default NotificationList;
