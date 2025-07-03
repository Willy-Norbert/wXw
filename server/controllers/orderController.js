import asyncHandler from 'express-async-handler';
import prisma from '../prismaClient.js';
import { notify } from '../utils/notify.js';

// Get Cart
export const getCart = asyncHandler(async (req, res) => {
  const { cartId } = req.query;
  let cart;

  if (cartId) {
    // Guest user with cartId
    cart = await prisma.cart.findUnique({
      where: { guestId: cartId.toString() },
      include: { items: { include: { product: true } } },
    });
  } else if (req.user) {
    // Logged-in user
    cart = await prisma.cart.findUnique({
      where: { userId: req.user.id },
      include: { items: { include: { product: true } } },
    });
  } else {
    // Anonymous user without cartId
    return res.json({ id: null, items: [] });
  }

  if (!cart) {
    return res.json({ id: null, items: [] });
  }

  res.json(cart);
});

// Add to Cart
export const addToCart = asyncHandler(async (req, res) => {
  const { productId, quantity, cartId } = req.body;

  if (quantity <= 0) {
    res.status(400);
    throw new Error('Quantity must be greater than 0');
  }

  let cart;

  if (cartId) {
    // Guest user with cartId
    cart = await prisma.cart.findUnique({
      where: { guestId: cartId.toString() },
      include: { items: true },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { guestId: cartId.toString() },
        include: { items: true },
      });
    }
  } else if (req.user) {
    // Logged-in user
    cart = await prisma.cart.findUnique({
      where: { userId: req.user.id },
      include: { items: true },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId: req.user.id },
        include: { items: true },
      });
    }
  } else {
    // Anonymous user without cartId
    return res.status(400).json({ message: 'Cart ID is required for guest users' });
  }

  // Check if the product already exists in the cart
  const existingItem = cart.items.find((item) => item.productId === productId);

  if (existingItem) {
    // Update quantity if item exists
    await prisma.cartItem.update({
      where: { id: existingItem.id },
      data: { quantity: { increment: quantity } },
    });
  } else {
    // Add new item to cart
    await prisma.cartItem.create({
      data: {
        cartId: cart.id,
        productId,
        quantity,
      },
    });
  }

  // Fetch the updated cart
  const updatedCart = await prisma.cart.findUnique({
    where: { id: cart.id },
    include: { items: { include: { product: true } } },
  });

  res.status(201).json(updatedCart);
});

// Remove from Cart
export const removeFromCart = asyncHandler(async (req, res) => {
  const { productId, cartId } = req.body;

  let cart;

  if (cartId) {
    // Guest user with cartId
    cart = await prisma.cart.findUnique({
      where: { guestId: cartId.toString() },
      include: { items: true },
    });
  } else if (req.user) {
    // Logged-in user
    cart = await prisma.cart.findUnique({
      where: { userId: req.user.id },
      include: { items: true },
    });
  } else {
    // Anonymous user without cartId
    return res.status(400).json({ message: 'Cart ID is required for guest users' });
  }

  if (!cart) {
    res.status(404);
    throw new Error('Cart not found');
  }

  // Find the item to remove
  const itemToRemove = cart.items.find((item) => item.productId === productId);

  if (!itemToRemove) {
    res.status(404);
    throw new Error('Item not found in cart');
  }

  // Remove the item from the cart
  await prisma.cartItem.delete({
    where: { id: itemToRemove.id },
  });

  res.json({ message: 'Item removed from cart' });
});

// Place Order (for logged-in users)
export const placeOrder = asyncHandler(async (req, res) => {
  const { shippingAddress, paymentMethod } = req.body;

  if (!shippingAddress || !paymentMethod) {
    res.status(400);
    throw new Error('Please provide shipping address and payment method');
  }

  const cart = await prisma.cart.findUnique({
    where: { userId: req.user.id },
    include: { items: { include: { product: true } } },
  });

  if (!cart || cart.items.length === 0) {
    res.status(400);
    throw new Error('Your cart is empty');
  }

  // Calculate total price
  const itemsPrice = cart.items.reduce((acc, item) => acc + item.product.price * item.quantity, 0);

  // Create order
  const order = await prisma.order.create({
    data: {
      userId: req.user.id,
      orderNumber: Math.floor(Math.random() * 100000).toString(),
      customerName: req.user.name,
      customerEmail: req.user.email,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      totalPrice: itemsPrice, // For simplicity, setting total price to items price
      items: {
        create: cart.items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.product.price,
        })),
      },
    },
  });

  // Clear cart
  await prisma.cartItem.deleteMany({
    where: { cartId: cart.id },
  });

  res.status(201).json(order);
});

// Place Anonymous Order (for guest users)
export const placeAnonymousOrder = asyncHandler(async (req, res) => {
  const { customerName, customerEmail, shippingAddress, paymentMethod, cartId } = req.body;

  if (!customerName || !customerEmail || !shippingAddress || !paymentMethod || !cartId) {
    res.status(400);
    throw new Error('Please provide all required fields');
  }

  const cart = await prisma.cart.findUnique({
    where: { guestId: cartId.toString() },
    include: { items: { include: { product: true } } },
  });

  if (!cart || cart.items.length === 0) {
    res.status(400);
    throw new Error('Your cart is empty');
  }

  // Calculate total price
  const itemsPrice = cart.items.reduce((acc, item) => acc + item.product.price * item.quantity, 0);

  // Create order
  const order = await prisma.order.create({
    data: {
      orderNumber: Math.floor(Math.random() * 100000).toString(),
      customerName,
      customerEmail,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      totalPrice: itemsPrice, // For simplicity, setting total price to items price
      items: {
        create: cart.items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.product.price,
        })),
      },
    },
  });

  // Clear cart
  await prisma.cartItem.deleteMany({
    where: { cartId: cart.id },
  });

  res.status(201).json(order);
});

// Create Order by Admin/Seller
export const createOrder = asyncHandler(async (req, res) => {
  const { userId, shippingAddress, paymentMethod, items, totalPrice, customerName, customerEmail, customerPhone } = req.body;

  if (!userId || !shippingAddress || !paymentMethod || !items || items.length === 0 || !totalPrice) {
    res.status(400);
    throw new Error('Please provide all required fields');
  }

  // Validate items array
  if (!Array.isArray(items) || items.length === 0) {
    res.status(400);
    throw new Error('Items must be a non-empty array');
  }

  // Check if the user exists
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  // Create order
  const order = await prisma.order.create({
    data: {
      userId: userId,
      orderNumber: Math.floor(Math.random() * 100000).toString(),
      customerName: customerName || user.name,
      customerEmail: customerEmail || user.email,
      customerPhone: customerPhone || user.phone,
      shippingAddress,
      paymentMethod,
      totalPrice,
      items: {
        create: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
        })),
      },
    },
  });

  res.status(201).json(order);
});

// Get User Orders
export const getUserOrders = asyncHandler(async (req, res) => {
  const orders = await prisma.order.findMany({
    where: { userId: req.user.id },
    include: { items: { include: { product: true } } },
    orderBy: { createdAt: 'desc' },
  });

  res.json(orders);
});

// Get All Orders (Admin Only)
export const getAllOrders = asyncHandler(async (req, res) => {
  const orders = await prisma.order.findMany({
    include: {
      user: true,
      items: { include: { product: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
  res.json(orders);
});

// Get Order by ID
export const getOrderById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const order = await prisma.order.findUnique({
    where: { id: Number(id) },
    include: {
      user: true,
      items: { include: { product: true } },
    },
  });

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  res.json(order);
});

export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { isPaid, isDelivered, ...additionalData } = req.body;

  console.log(`🔄 Updating order ${id} status:`, { isPaid, isDelivered, additionalData });

  const order = await prisma.order.findUnique({
    where: { id: Number(id) },
    include: {
      user: true,
      items: { include: { product: true } }
    }
  });

  if (!order) {
    return res.status(404).json({ message: 'Order not found' });
  }

  // Build update data
  const updateData = {
    ...additionalData,
  };

  // Handle payment status change
  if (isPaid !== undefined) {
    updateData.isPaid = isPaid;
    if (isPaid) {
      updateData.paidAt = new Date();
    }
  }

  // Handle delivery status change
  if (isDelivered !== undefined) {
    updateData.isDelivered = isDelivered;
    if (isDelivered) {
      updateData.deliveredAt = new Date();
    }
  }

  const updatedOrder = await prisma.order.update({
    where: { id: Number(id) },
    data: updateData,
    include: {
      user: true,
      items: { include: { product: true } }
    }
  });

  // Send email notifications for status changes
  try {
    const customerEmail = updatedOrder.customerEmail || updatedOrder.user?.email;
    const customerName = updatedOrder.customerName || updatedOrder.user?.name || 'Valued Customer';

    if (customerEmail) {
      // Send payment received email when payment status changes to paid
      if (isPaid === true && !order.isPaid) {
        const { sendPaymentReceivedEmail } = await import('../utils/emailService.js');
        await sendPaymentReceivedEmail({
          customerEmail,
          customerName,
          orderNumber: updatedOrder.orderNumber,
          totalPrice: updatedOrder.totalPrice,
          items: updatedOrder.items,
          shippingAddress: updatedOrder.shippingAddress,
          paymentMethod: updatedOrder.paymentMethod
        });
        console.log(`📧 Payment received email sent to: ${customerEmail}`);
      }

      // Send delivery confirmation email when delivery status changes to delivered
      if (isDelivered === true && !order.isDelivered) {
        const { sendDeliveryConfirmationEmail } = await import('../utils/emailService.js');
        await sendDeliveryConfirmationEmail({
          customerEmail,
          customerName,
          orderNumber: updatedOrder.orderNumber,
          totalPrice: updatedOrder.totalPrice,
          items: updatedOrder.items,
          shippingAddress: updatedOrder.shippingAddress
        });
        console.log(`📧 Delivery confirmation email sent to: ${customerEmail}`);
      }
    }
  } catch (emailError) {
    console.error('❌ Email send error:', emailError);
  }

  // Clear cart when payment is confirmed
  if (isPaid === true && !order.isPaid && updatedOrder.userId) {
    try {
      const userCart = await prisma.cart.findUnique({
        where: { userId: updatedOrder.userId }
      });

      if (userCart) {
        await prisma.cartItem.deleteMany({ where: { cartId: userCart.id } });
        console.log(`✅ Cart cleared for cartId: ${userCart.id}`);
      }
    } catch (cartError) {
      console.error('❌ Error clearing cart:', cartError);
    }
  }

  res.json({ message: 'Order status updated successfully', order: updatedOrder });
});

// Confirm Order Payment
export const confirmOrderPayment = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const order = await prisma.order.update({
    where: { id: Number(id) },
    data: {
      isPaid: true,
      paidAt: new Date(),
    },
  });

  res.json({ message: 'Order payment confirmed', order });
});

// Update Order
export const updateOrder = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { customerName, customerEmail, shippingAddress, paymentMethod, items, totalPrice } = req.body;

  const order = await prisma.order.update({
    where: { id: Number(id) },
    data: {
      customerName,
      customerEmail,
      shippingAddress,
      paymentMethod,
      totalPrice,
      items: {
        deleteMany: {}, // Delete all existing items
        create: items?.map((item) => ({ // Create new items if provided
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
        })),
      },
    },
  });

  res.json({ message: 'Order updated successfully', order });
});

// Delete Order
export const deleteOrder = asyncHandler(async (req, res) => {
  const { id } = req.params;

  await prisma.order.delete({
    where: { id: Number(id) },
  });

  res.json({ message: 'Order deleted successfully' });
});
