import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bell, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
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
    // Mark as read if not already read
    if (!notification.isRead) {
      markReadMutation.mutate(notification.id);
    }
    
    // Auto-delete after a short delay to allow the read status to update
    setTimeout(() => {
      deleteMutation.mutate(notification.id);
    }, 500);
  };

  const handleDeleteClick = (e: React.MouseEvent, notificationId: number) => {
    e.stopPropagation();
    deleteMutation.mutate(notificationId);
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
    <div className="w-full max-w-md">
      {notificationList.length === 0 ? (
        <div className="p-4 text-center text-gray-500">
          <Bell className="w-6 h-6 mx-auto mb-2 text-gray-400" />
          <p className="text-sm">No notifications</p>
        </div>
      ) : (
        <ScrollArea className="h-96 w-full">
          <div className="space-y-2 p-2">
            {notificationList.map((notification) => (
              <div
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                className={`p-3 border rounded-lg cursor-pointer transition-colors hover:shadow-md ${
                  notification.isRead 
                    ? 'bg-gray-50 border-gray-200 hover:bg-gray-100' 
                    : 'bg-blue-50 border-blue-200 hover:bg-blue-100'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm break-words ${
                      notification.isRead 
                        ? 'text-gray-700' 
                        : 'text-blue-900 font-medium'
                    }`}>
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-500 mt-1 truncate">
                      {new Date(notification.createdAt).toLocaleDateString()} at{' '}
                      {new Date(notification.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => handleDeleteClick(e, notification.id)}
                    disabled={deleteMutation.isPending}
                    className="text-red-600 hover:text-red-800 hover:bg-red-50 p-1 h-auto flex-shrink-0"
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
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
};

export default NotificationList;
