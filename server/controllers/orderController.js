
import asyncHandler from 'express-async-handler';
import prisma from '../prismaClient.js';

// Add to cart
export const addToCart = asyncHandler(async (req, res) => {
  const { productId, quantity, cartId: providedCartId } = req.body;
  const userId = req.user?.id || null; // Can be null for anonymous users

  console.log('🛒 AddToCart:', {
    userId,
    productId,
    quantity,
    providedCartId,
    isAuthenticated: !!req.user
  });

  const product = await prisma.product.findUnique({
    where: { id: productId }
  });

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  let cart;

  if (userId) {
    // AUTHENTICATED USER: Find or create cart by userId
    console.log('👤 Handling authenticated user cart');
    
    cart = await prisma.cart.findUnique({
      where: { userId: userId },
      include: { items: true }
    });

    if (!cart) {
      console.log('🆕 Creating new cart for authenticated user');
      cart = await prisma.cart.create({
        data: { userId: userId },
        include: { items: true }
      });
    }
  } else {
    // ANONYMOUS USER: Find or create cart by cartId
    console.log('👻 Handling anonymous user cart');
    
    if (providedCartId) {
      console.log('🔍 Looking for existing anonymous cart:', providedCartId);
      cart = await prisma.cart.findUnique({
        where: { id: providedCartId },
        include: { items: true }
      });
    }

    if (!cart) {
      console.log('🆕 Creating new anonymous cart');
      cart = await prisma.cart.create({
        data: { userId: null }, // Explicitly set to null for anonymous
        include: { items: true }
      });
    }
  }

  console.log('📦 Using cart:', { id: cart.id, userId: cart.userId });

  // Check if product already in cart
  const existingItem = await prisma.cartItem.findUnique({
    where: {
      cartId_productId: {
        cartId: cart.id,
        productId: productId
      }
    }
  });

  if (existingItem) {
    console.log('📝 Updating existing cart item');
    await prisma.cartItem.update({
      where: { id: existingItem.id },
      data: { quantity: existingItem.quantity + quantity }
    });
  } else {
    console.log('🆕 Creating new cart item');
    await prisma.cartItem.create({
      data: {
        cartId: cart.id,
        productId: productId,
        quantity: quantity
      }
    });
  }

  // Return cart with items
  const updatedCart = await prisma.cart.findUnique({
    where: { id: cart.id },
    include: {
      items: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              price: true,
              coverImage: true
            }
          }
        }
      }
    }
  });

  console.log('✅ Cart updated successfully');
  res.json({ 
    message: 'Product added to cart',
    cart: updatedCart,
    cartId: cart.id
  });
});

// Get cart
export const getCart = asyncHandler(async (req, res) => {
  const userId = req.user?.id || null;
  const { cartId } = req.query;

  console.log('🔍 GetCart:', {
    userId,
    cartId,
    isAuthenticated: !!req.user
  });

  let cart = null;

  if (userId) {
    // AUTHENTICATED USER: Get cart by userId
    console.log('👤 Getting authenticated user cart');
    cart = await prisma.cart.findUnique({
      where: { userId: userId },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                price: true,
                coverImage: true
              }
            }
          }
        }
      }
    });
  } else if (cartId && !isNaN(parseInt(cartId))) {
    // ANONYMOUS USER: Get cart by cartId
    console.log('👻 Getting anonymous user cart:', cartId);
    cart = await prisma.cart.findUnique({
      where: { id: parseInt(cartId) },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                price: true,
                coverImage: true
              }
            }
          }
        }
      }
    });
  }

  console.log('📦 Cart found:', !!cart, cart ? `with ${cart.items?.length || 0} items` : 'no cart');

  if (!cart) {
    return res.json({ data: null });
  }

  res.json({ data: cart });
});

// Remove from cart
export const removeFromCart = asyncHandler(async (req, res) => {
  const { productId, cartId: providedCartId } = req.body;
  const userId = req.user?.id || null;

  console.log('➖ RemoveFromCart:', {
    userId,
    productId,
    providedCartId,
    isAuthenticated: !!req.user
  });

  let cart;

  if (userId) {
    // AUTHENTICATED USER
    cart = await prisma.cart.findUnique({
      where: { userId: userId }
    });
  } else if (providedCartId) {
    // ANONYMOUS USER
    cart = await prisma.cart.findUnique({
      where: { id: providedCartId }
    });
  }

  if (!cart) {
    res.status(404);
    throw new Error('Cart not found');
  }

  await prisma.cartItem.deleteMany({
    where: {
      cartId: cart.id,
      productId: productId
    }
  });

  console.log('✅ Item removed from cart');
  res.json({ message: 'Product removed from cart' });
});

// Place order (authenticated users)
export const placeOrder = asyncHandler(async (req, res) => {
  const { shippingAddress, paymentMethod } = req.body;
  const userId = req.user.id;

  const cart = await prisma.cart.findUnique({
    where: { userId },
    include: {
      items: {
        include: { product: true }
      }
    }
  });

  if (!cart || cart.items.length === 0) {
    res.status(400);
    throw new Error('Cart is empty');
  }

  const totalPrice = cart.items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

  const order = await prisma.order.create({
    data: {
      userId,
      customerName: req.user.name,
      customerEmail: req.user.email,
      shippingAddress,
      paymentMethod,
      totalPrice,
      orderNumber: `ORD-${Date.now()}`,
      items: {
        create: cart.items.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.product.price
        }))
      }
    },
    include: {
      items: {
        include: { product: true }
      }
    }
  });

  // Send order confirmation email
  try {
    const { sendOrderConfirmationEmail } = await import('../utils/emailService.js');
    await sendOrderConfirmationEmail({
      customerEmail: req.user.email,
      customerName: req.user.name,
      orderNumber: order.orderNumber,
      totalPrice: order.totalPrice,
      items: order.items,
      shippingAddress: order.shippingAddress
    });
  } catch (emailError) {
    console.error('Email error:', emailError);
  }

  res.json(order);
});

// Place anonymous order
export const placeAnonymousOrder = asyncHandler(async (req, res) => {
  const { customerName, customerEmail, shippingAddress, paymentMethod, cartId } = req.body;

  console.log('📝 PlaceAnonymousOrder:', {
    customerName,
    customerEmail,
    cartId,
    shippingAddress: shippingAddress?.substring(0, 50) + '...'
  });

  const cart = await prisma.cart.findUnique({
    where: { id: cartId },
    include: {
      items: {
        include: { product: true }
      }
    }
  });

  if (!cart || cart.items.length === 0) {
    res.status(400);
    throw new Error('Cart not found or empty');
  }

  const totalPrice = cart.items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

  const order = await prisma.order.create({
    data: {
      userId: null, // Anonymous order
      customerName,
      customerEmail,
      shippingAddress,
      paymentMethod,
      totalPrice,
      orderNumber: `ORD-${Date.now()}`,
      items: {
        create: cart.items.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.product.price
        }))
      }
    },
    include: {
      items: {
        include: { product: true }
      }
    }
  });

  // Send order confirmation email
  try {
    const { sendOrderConfirmationEmail } = await import('../utils/emailService.js');
    await sendOrderConfirmationEmail({
      customerEmail,
      customerName,
      orderNumber: order.orderNumber,
      totalPrice: order.totalPrice,
      items: order.items,
      shippingAddress: order.shippingAddress
    });
  } catch (emailError) {
    console.error('Email error:', emailError);
  }

  console.log('✅ Anonymous order created:', order.orderNumber);
  res.json(order);
});

// Create order (Admin/Seller)
export const createOrder = asyncHandler(async (req, res) => {
  const { customerName, customerEmail, shippingAddress, items, paymentMethod } = req.body;

  const totalPrice = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const order = await prisma.order.create({
    data: {
      customerName,
      customerEmail,
      shippingAddress,
      paymentMethod: paymentMethod || 'MTN Mobile Money',
      totalPrice,
      orderNumber: `ORD-${Date.now()}`,
      items: {
        create: items.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.price
        }))
      }
    },
    include: {
      items: {
        include: { product: true }
      }
    }
  });

  res.json(order);
});

// Get user orders
export const getUserOrders = asyncHandler(async (req, res) => {
  const orders = await prisma.order.findMany({
    where: { userId: req.user.id },
    include: {
      items: {
        include: { product: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  res.json(orders);
});

// Get all orders (Admin/Seller)
export const getAllOrders = asyncHandler(async (req, res) => {
  const userRole = req.user.role?.toLowerCase();
  const userId = req.user.id;

  console.log('📋 GetAllOrders:', { userRole, userId });

  let whereClause = {};

  if (userRole === 'seller') {
    // Sellers only see orders for their products
    whereClause = {
      items: {
        some: {
          product: {
            createdById: userId
          }
        }
      }
    };
  }
  // Admin sees all orders (empty where clause)

  const orders = await prisma.order.findMany({
    where: whereClause,
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true
        }
      },
      items: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              coverImage: true,
              createdById: true
            }
          }
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  console.log('✅ Orders fetched:', orders.length);
  res.json(orders);
});

// Get order by ID
export const getOrderById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const order = await prisma.order.findUnique({
    where: { id: parseInt(id) },
    include: {
      user: true,
      items: {
        include: { product: true }
      }
    }
  });

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  res.json(order);
});

// Update order status
export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { isPaid, isDelivered } = req.body;

  const order = await prisma.order.update({
    where: { id: parseInt(id) },
    data: { 
      ...(isPaid !== undefined && { isPaid, paidAt: isPaid ? new Date() : null }),
      ...(isDelivered !== undefined && { isDelivered, deliveredAt: isDelivered ? new Date() : null })
    }
  });

  res.json(order);
});

// Update order
export const updateOrder = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  const order = await prisma.order.update({
    where: { id: parseInt(id) },
    data: updateData,
    include: {
      items: {
        include: { product: true }
      }
    }
  });

  res.json(order);
});

// Delete order
export const deleteOrder = asyncHandler(async (req, res) => {
  const { id } = req.params;

  await prisma.orderItem.deleteMany({
    where: { orderId: parseInt(id) }
  });

  await prisma.order.delete({
    where: { id: parseInt(id) }
  });

  res.json({ message: 'Order deleted successfully' });
});

// Confirm order payment
export const confirmOrderPayment = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const order = await prisma.order.findUnique({
    where: { id: parseInt(id) },
    include: {
      items: {
        include: { product: true }
      }
    }
  });

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  await prisma.order.update({
    where: { id: parseInt(id) },
    data: {
      isPaid: true,
      paidAt: new Date(),
      isConfirmedByAdmin: true,
      confirmedAt: new Date()
    }
  });

  // Clear cart for authenticated users only - FIXED NULL HANDLING
  if (order.userId && typeof order.userId === 'number' && !isNaN(order.userId)) {
    console.log('🧹 Clearing cart for authenticated user:', order.userId);
    
    try {
      const userCart = await prisma.cart.findUnique({
        where: { userId: order.userId }
      });

      if (userCart) {
        await prisma.cartItem.deleteMany({ where: { cartId: userCart.id } });
        console.log('✅ Cart cleared for authenticated user');
      }
    } catch (cartError) {
      console.error('❌ Error clearing cart:', cartError);
    }
  }

  // Send confirmation email
  try {
    const { sendPaymentConfirmationEmail } = await import('../utils/emailService.js');
    
    const customerEmail = order.customerEmail || order.user?.email;
    const customerName = order.customerName || order.user?.name || 'Valued Customer';

    if (customerEmail) {
      await sendPaymentConfirmationEmail({
        customerEmail,
        customerName,
        orderNumber: order.orderNumber,
        totalPrice: order.totalPrice,
        items: order.items,
        shippingAddress: order.shippingAddress,
        paymentCode: order.paymentCode
      });
      console.log('✅ Payment confirmation email sent');
    }
  } catch (emailError) {
    console.error('❌ Email error:', emailError);
  }

  res.json({ message: 'Payment confirmed successfully' });
});
