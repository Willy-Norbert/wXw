
import asyncHandler from 'express-async-handler';
import prisma from '../prismaClient.js';
import { notify } from '../utils/notify.js';

// Generate MoMo Payment Code
export const generateMoMoPaymentCode = asyncHandler(async (req, res) => {
  const orderId = Number(req.params.orderId);
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { user: true }
  });

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  if (order.userId && order.userId !== req.user?.id) {
    res.status(403);
    throw new Error('Not authorized');
  }

  const paymentCode = '0787778889'; // Static for demo

  // Optional: ensure customer email is set for authenticated users
  let updateData = { paymentCode };
  if (req.user && !order.customerEmail) {
    updateData.customerEmail = req.user.email;
    updateData.customerName = req.user.name;
  }

  const updated = await prisma.order.update({
    where: { id: orderId },
    data: updateData,
  });

  if (req.user) {
    await notify({
      userId: req.user.id,
      message: `Payment code generated for Order ID ${orderId}.`,
      recipientRole: 'ADMIN',
      relatedOrderId: orderId,
    });
  }

  res.json({ message: 'Payment code generated', paymentCode: updated.paymentCode });
});

// Confirm Client Payment
export const confirmClientPayment = asyncHandler(async (req, res) => {
  const orderId = Number(req.params.orderId);
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { user: true }
  });

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  if (order.userId && order.userId !== req.user?.id) {
    res.status(403);
    throw new Error('Not authorized');
  }

  if (!order.paymentCode) {
    res.status(400);
    throw new Error('Payment code not generated');
  }

  const updateData = {
    isPaid: true,
    paidAt: new Date(),
  };

  // Optional: ensure customer email and name are set
  if (req.user && !order.customerEmail) {
    updateData.customerEmail = req.user.email;
    updateData.customerName = req.user.name;
  }

  await prisma.order.update({
    where: { id: orderId },
    data: updateData,
  });

  if (req.user) {
    await notify({
      userId: req.user.id,
      message: `Client confirmed payment for Order ID ${orderId}.`,
      recipientRole: 'ADMIN',
      relatedOrderId: orderId,
    });
  }

  res.json({ message: 'Payment marked as completed. Awaiting admin confirmation.' });
});

// Admin Confirms Payment - FIXED CART CLEARING
export const confirmPaymentByAdmin = asyncHandler(async (req, res) => {
  const orderId = Number(req.params.orderId);
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      user: true,
      items: { include: { product: true } }
    }
  });

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  console.log(`🛠️ Confirming payment for Order ID: ${orderId}`);

  await prisma.order.update({
    where: { id: orderId },
    data: {
      isConfirmedByAdmin: true,
      confirmedAt: new Date(),
    },
  });

  // 📧 Send payment confirmation email
  try {
    const { sendPaymentConfirmationEmail } = await import('../utils/emailService.js');

    const customerEmail = order.customerEmail || order.user?.email;
    const customerName = order.customerName || order.user?.name || 'Valued Customer';

    if (!customerEmail) {
      console.warn(`⚠️ No email found for Order ID ${orderId}. Email not sent.`);
    } else {
      await sendPaymentConfirmationEmail({
        customerEmail,
        customerName,
        orderNumber: order.orderNumber,
        totalPrice: order.totalPrice,
        items: order.items,
        shippingAddress: order.shippingAddress,
        paymentCode: order.paymentCode
      });
      console.log(`📧 Payment confirmation email sent to: ${customerEmail}`);
    }
  } catch (emailError) {
    console.error('❌ Email send error:', emailError);
  }

  // 🧹 Clear cart for logged-in user only - FIXED NULL HANDLING
  if (order.userId && typeof order.userId === 'number' && !isNaN(order.userId)) {
    console.log('🧹 Clearing cart for userId:', order.userId);

    try {
      const userCart = await prisma.cart.findUnique({
        where: { userId: order.userId }
      });

      if (userCart) {
        await prisma.cartItem.deleteMany({ where: { cartId: userCart.id } });
        console.log(`✅ Cart cleared for cartId: ${userCart.id}`);
      } else {
        console.log('ℹ️ No cart found for userId:', order.userId);
      }

      await notify({
        userId: order.userId,
        message: `Admin confirmed your payment for Order ID ${orderId}.`,
        recipientRole: 'BUYER',
        relatedOrderId: orderId,
      });
    } catch (cartError) {
      console.error('❌ Error clearing cart:', cartError);
    }
  } else {
    console.log('🚫 Skipping cart clear: Invalid or null userId:', order.userId);
  }

  console.log('✅ Payment confirmed by admin');
  res.json({ message: 'Payment confirmed by admin' });
});
