
import asyncHandler from 'express-async-handler';
import prisma from '../prismaClient.js';

// Get notifications for the logged-in user based on role and userId
export const getNotifications = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const role = req.user.role;

  const notifications = await prisma.notification.findMany({
    where: {
      OR: [
        { userId: userId },           // notifications specifically for this user
        { recipientRole: role }       // notifications for this user's role (admin/seller)
      ]
    },
    orderBy: { createdAt: 'desc' }
  });

  res.json(notifications);
});

// Mark notification as read
export const markNotificationRead = asyncHandler(async (req, res) => {
  const notificationId = Number(req.params.id);

  const notification = await prisma.notification.findUnique({
    where: { id: notificationId }
  });

  if (!notification) {
    res.status(404);
    throw new Error('Notification not found');
  }

  if (notification.userId !== req.user.id && notification.recipientRole !== req.user.role) {
    res.status(403);
    throw new Error('Not authorized to mark this notification');
  }

  const updated = await prisma.notification.update({
    where: { id: notificationId },
    data: { isRead: true }
  });

  res.json(updated);
});

// Delete notification
export const deleteNotification = asyncHandler(async (req, res) => {
  const notificationId = Number(req.params.id);

  const notification = await prisma.notification.findUnique({
    where: { id: notificationId }
  });

  if (!notification) {
    res.status(404);
    throw new Error('Notification not found');
  }

  if (notification.userId !== req.user.id && notification.recipientRole !== req.user.role) {
    res.status(403);
    throw new Error('Not authorized to delete this notification');
  }

  await prisma.notification.delete({
    where: { id: notificationId }
  });

  res.json({ message: 'Notification deleted successfully' });
});
