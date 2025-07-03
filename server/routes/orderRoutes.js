import prisma from '../utils/prismaClient.js';

import express from 'express';
import {
  addToCart,
  removeFromCart,
  getCart,
  placeOrder,
  placeAnonymousOrder,
  createOrder,
  getUserOrders,
  getAllOrders,
  updateOrderStatus,
  updateOrder,
  deleteOrder,
  confirmOrderPayment,
  getOrderById
} from '../controllers/orderController.js';
import { protect, authorizeRoles, optionalProtect } from '../middleware/authMiddleware.js';
import { checkSellerPermission } from '../middleware/permissionMiddleware.js';

const orderRouter = express.Router();

// Cart routes (public access for guest users)
orderRouter.route('/cart')
  .get(optionalProtect, getCart)
  .post(optionalProtect, addToCart)
  .delete(optionalProtect, removeFromCart);

// Order routes (require authentication)
orderRouter.route('/')
  .post(protect, placeOrder)
  .get(protect, getUserOrders);

// Anonymous order route (no authentication required)
orderRouter.post('/anonymous', placeAnonymousOrder);

// Create order by admin/seller - check permissions for sellers
orderRouter.post('/create', protect, authorizeRoles('admin', 'seller'), checkSellerPermission('canCreateCustomers'), createOrder);

// Admin routes
orderRouter.get('/all', protect, authorizeRoles('admin', 'seller'), getAllOrders);

// Individual order operations
orderRouter.route('/:id')
  .get(protect, authorizeRoles('admin', 'seller'), getOrderById) 
  .put(protect, authorizeRoles('admin', 'seller'), checkSellerPermission('canEditOrder'), updateOrder)
  .delete(protect, authorizeRoles('admin', 'seller'), checkSellerPermission('canDeleteOrder'), deleteOrder) 
  ;

// Order status updates with permission checks
orderRouter.put('/:id/status', protect, authorizeRoles('admin', 'seller'), updateOrderStatus);
orderRouter.put('/:id/confirm-payment', protect, authorizeRoles('admin', 'seller'), confirmOrderPayment);

// Delete all orders - Admin only
orderRouter.delete(
  '/',
  protect,
  authorizeRoles('admin'),
  async (req, res, next) => {
    try {
      // Delete all order items first (if you have order items related to orders)
      await prisma.orderItem.deleteMany({});
      // Delete all orders
      await prisma.order.deleteMany({});
      res.json({ message: 'All orders deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
);


export default orderRouter;
