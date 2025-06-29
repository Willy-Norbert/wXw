
import express from 'express';
import { getChatMessages, createChatMessage, deleteChatMessage } from '../controllers/chatController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

// All chat routes require authentication and admin/seller role
router.use(protect);
router.use(authorizeRoles('admin', 'seller'));

// Chat message routes
router.route('/messages')
  .get(getChatMessages)
  .post(createChatMessage);

router.route('/messages/:id')
  .delete(deleteChatMessage);

export default router;
