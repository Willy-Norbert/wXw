
import express from 'express';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';
import prisma from '../prismaClient.js';

const userRouter = express.Router();

// Get all users (admin only)
userRouter.get('/', protect, authorizeRoles('admin'), async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        address: true,
        isActive: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    });
    
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Failed to fetch users' });
  }
});

export default userRouter;
