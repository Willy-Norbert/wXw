
import express from 'express';
import {
  submitSellerRequest,
  getPendingSellers,
  getAllSellers,
  updateSellerStatus,
  getSellerProducts,
  getSellerCustomers,
  updateSellerCustomer,
  removeSellerCustomer,
  getSellerOrders,
  getSellerStats
} from '../controllers/sellerController.js';
import { protect, authorizeRoles, checkSellerStatus } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public route for seller requests
router.post('/request', submitSellerRequest);

// Admin routes for managing sellers
router.get('/pending', protect, authorizeRoles('admin'), getPendingSellers);
router.get('/all', protect, authorizeRoles('admin'), getAllSellers);
router.put('/:sellerId/status', protect, authorizeRoles('admin'), updateSellerStatus);

// Seller-specific routes - ONLY for active sellers
router.get('/my-products', protect, authorizeRoles('seller'), checkSellerStatus, getSellerProducts);
router.get('/my-customers', protect, authorizeRoles('seller'), checkSellerStatus, getSellerCustomers);
router.put('/customers/:customerId', protect, authorizeRoles('seller'), checkSellerStatus, updateSellerCustomer);
router.delete('/customers/:customerId', protect, authorizeRoles('seller'), checkSellerStatus, removeSellerCustomer);
router.get('/my-orders', protect, authorizeRoles('seller'), checkSellerStatus, getSellerOrders);
router.get('/my-stats', protect, authorizeRoles('seller'), checkSellerStatus, getSellerStats);

export default router;
