
import asyncHandler from 'express-async-handler';
import prisma from '../prismaClient.js';

// @desc    Get all chat messages for community chat
// @route   GET /api/chat/messages
// @access  Private (Admin/Seller only)
export const getChatMessages = asyncHandler(async (req, res) => {
  const messages = await prisma.chatMessage.findMany({
    include: {
      user: {
        select: {
          id: true,
          name: true,
          role: true,
        },
      },
      attachments: true,
    },
    orderBy: {
      createdAt: 'asc',
    },
  });

  res.status(200).json(messages);
});

// @desc    Create a new chat message
// @route   POST /api/chat/messages
// @access  Private (Admin/Seller only)
export const createChatMessage = asyncHandler(async (req, res) => {
  const { message, messageType = 'TEXT', attachments = [] } = req.body;
  const userId = req.user.id;

  // Validate message or attachments exist
  if (!message?.trim() && attachments.length === 0) {
    res.status(400);
    throw new Error('Message or attachments are required');
  }

  // Ensure user has proper role
  const userRole = req.user.role.toLowerCase();
  if (userRole !== 'admin' && userRole !== 'seller') {
    res.status(403);
    throw new Error('Only admins and sellers can post messages');
  }

  // Create the chat message with attachments
  const chatMessage = await prisma.chatMessage.create({
    data: {
      message: message?.trim() || null,
      messageType,
      userId,
      attachments: {
        create: attachments.map(attachment => ({
          fileName: attachment.fileName,
          fileUrl: attachment.fileUrl,
          fileType: attachment.fileType,
          fileSize: attachment.fileSize,
        })),
      },
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          role: true,
        },
      },
      attachments: true,
    },
  });

  res.status(201).json(chatMessage);
});

// @desc    Delete a chat message
// @route   DELETE /api/chat/messages/:id
// @access  Private (Admin or message owner)
export const deleteChatMessage = asyncHandler(async (req, res) => {
  const messageId = parseInt(req.params.id);
  const userId = req.user.id;
  const userRole = req.user.role.toLowerCase();

  const message = await prisma.chatMessage.findUnique({
    where: { id: messageId },
    include: { attachments: true }
  });

  if (!message) {
    res.status(404);
    throw new Error('Message not found');
  }

  // Allow deletion if user is admin or message owner
  if (userRole !== 'admin' && message.userId !== userId) {
    res.status(403);
    throw new Error('Not authorized to delete this message');
  }

  // Delete message (attachments will be deleted via cascade)
  await prisma.chatMessage.delete({
    where: { id: messageId }
  });

  res.status(200).json({ message: 'Message deleted successfully' });
});
