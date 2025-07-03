
import prisma from '../prismaClient.js';

export const notify = async ({ userId, title, message, recipientRole, relatedOrderId }) => {
  try {
    await prisma.notification.create({
      data: {
        userId,
        title: title || 'Notification',
        message,
        recipientRole,
        relatedOrderId,
      },
    });
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};
