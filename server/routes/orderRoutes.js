
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
import { protect, authorizeRoles,optionalProtect } from '../middleware/authMiddleware.js';

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

// Create order by admin/seller
orderRouter.post('/create', protect, authorizeRoles('admin', 'seller'), createOrder);

// Admin routes
orderRouter.get('/all', protect, authorizeRoles('admin', 'seller'), getAllOrders);

// Individual order operations
orderRouter.route('/:id')
  .get(protect, authorizeRoles('admin', 'seller'), getOrderById)
  .put(protect, authorizeRoles('admin', 'seller'), updateOrder)
  .delete(protect, authorizeRoles('admin'), deleteOrder);

orderRouter.put('/:id/status', protect, authorizeRoles('admin', 'seller'), updateOrderStatus);
orderRouter.put('/:id/confirm-payment', protect, authorizeRoles('admin','seller'), confirmOrderPayment);

export default orderRouter;
