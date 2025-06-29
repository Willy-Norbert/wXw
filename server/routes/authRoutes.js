
import express from 'express';
import { 
  registerUser, 
  authUser, 
  verifyToken, 
  getAllUsers, 
  getUser,
  createUser,
  deleteUser,
  updateUser,
  logoutUser, 
  getUserProfile, 
  updateUserProfile 
} from '../controllers/authController.js';
import { submitSellerRequest } from '../controllers/sellerController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.post('/register', registerUser);
router.post('/login', authUser);
router.post('/seller-request', submitSellerRequest);
router.post('/logout', logoutUser);

// Protected routes
router.get('/verify-token', protect, verifyToken);
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);

// Admin only routes
router.route('/users')
  .get(protect, authorizeRoles('admin'), getAllUsers)
  .post(protect, authorizeRoles('admin'), createUser);

router.route('/users/:userId')
  .get(protect, authorizeRoles('admin'), getUser)
  .put(protect, authorizeRoles('admin'), updateUser)
  .delete(protect, authorizeRoles('admin'), deleteUser);

export default router;
