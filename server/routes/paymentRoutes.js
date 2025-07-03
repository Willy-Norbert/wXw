
// Payment Routes
import express from 'express';
import {
  generateMoMoPaymentCode,
  confirmClientPayment,
  confirmPaymentByAdmin
} from '../controllers/paymentController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const paymentRouter = express.Router();

// Allow anonymous users to generate payment codes and confirm payments
paymentRouter.post('/:orderId/generate-code', generateMoMoPaymentCode);
paymentRouter.post('/:orderId/confirm-client', confirmClientPayment);

// Admin-only route
paymentRouter.post('/:orderId/confirm-admin', protect, authorizeRoles('admin'), confirmPaymentByAdmin);

export default paymentRouter;
