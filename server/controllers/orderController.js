import asyncHandler from 'express-async-handler';
import prisma from '../prismaClient.js';
import { notify } from '../utils/notify.js';
import { sendOrderConfirmationEmail, sendAdminOrderNotification, sendOrderStatusUpdateEmail, sendPaymentConfirmationEmail } from '../utils/emailService.js';

// Get Order by ID (Admin/Seller)
export const getOrderById = asyncHandler(async (req, res) => {
  const orderId = parseInt(req.params.id);

  console.log('Getting order by ID:', orderId, 'for user role:', req.user?.role);

  let whereClause = { id: orderId };
  
  // If seller, only get orders for their products
  if (req.user.role.toLowerCase() === 'seller') {
    whereClause = {
      id: orderId,
      items: {
        some: {
          product: {
            createdById: req.user.id
          }
        }
      }
    };
  }

  const order = await prisma.order.findFirst({
    where: whereClause,
    include: {
      user: { select: { id: true, name: true, email: true } },
      items: { 
        include: { 
          product: {
            include: {
              createdBy: {
                select: {
                  id: true,
                  name: true,
                  businessName: true
                }
              }
            }
          }
        } 
      }
    }
  });

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  console.log('Order found:', order.id);
  res.json(order);
});

// Add or Update Product in Cart (FIXED AUTHENTICATION)
export const addToCart = asyncHandler(async (req, res) => {
  const { productId, quantity, cartId } = req.body;
  
  console.log('🛒 addToCart called with:', { productId, quantity, cartId, hasUser: !!req.user, userId: req.user?.id });
  
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  let cart;
  
  // FIXED: Check if user is authenticated properly
  if (req.user && req.user.id) {
    // Authenticated user - find or create user cart
    const userId = req.user.id;
    console.log('👤 Handling authenticated user cart for userId:', userId);
    
    cart = await prisma.cart.findUnique({ where: { userId } });
    if (!cart) {
      cart = await prisma.cart.create({ data: { userId } });
      console.log('📦 Created new user cart:', cart.id);
    } else {
      console.log('📦 Found existing user cart:', cart.id);
    }
  } else {
    // Unauthenticated user
    if (cartId) {
      console.log('👻 Looking for existing anonymous cart with ID:', cartId);
      cart = await prisma.cart.findUnique({ where: { id: cartId } });
    }
    
    if (!cart) {
      console.log('👻 Creating new anonymous cart');
      cart = await prisma.cart.create({ data: {} });
      console.log('📦 Created anonymous cart with ID:', cart.id);
    }
  }

  const existingItem = await prisma.cartItem.findFirst({
    where: { cartId: cart.id, productId }
  });

  if (existingItem) {
    await prisma.cartItem.update({
      where: { id: existingItem.id },
      data: { quantity: existingItem.quantity + quantity }
    });
    console.log('✅ Updated existing cart item quantity');
  } else {
    await prisma.cartItem.create({
      data: { cartId: cart.id, productId, quantity }
    });
    console.log('✅ Created new cart item');
  }

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
              coverImage: true,
              description: true,
              stock: true
            }
          }
        } 
      } 
    }
  });

  console.log('📦 Returning updated cart with cartId:', cart.id, 'items count:', updatedCart?.items?.length);
  res.json({ data: updatedCart, cartId: cart.id });
});

// Remove Product from Cart (FIXED AUTHENTICATION)
export const removeFromCart = asyncHandler(async (req, res) => {
  const { productId, cartId } = req.body;

  console.log('🗑️ removeFromCart called with:', { productId, cartId, hasUser: !!req.user, userId: req.user?.id });

  let cart;
  if (req.user && req.user.id) {
    // Authenticated user
    const userId = req.user.id;
    console.log('👤 Removing from authenticated user cart for userId:', userId);
    cart = await prisma.cart.findUnique({ where: { userId } });
  } else {
    // Unauthenticated user - use cartId from request
    if (!cartId) {
      res.status(400);
      throw new Error('Cart ID required for unauthenticated users');
    }
    console.log('👻 Removing from anonymous cart with ID:', cartId);
    cart = await prisma.cart.findUnique({ where: { id: cartId } });
  }

  if (!cart) {
    res.status(404);
    throw new Error('Cart not found');
  }

  await prisma.cartItem.deleteMany({
    where: { cartId: cart.id, productId }
  });

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
              coverImage: true,
              description: true,
              stock: true
            }
          }
        } 
      } 
    }
  });

  console.log('📦 Returning updated cart after removal, cartId:', cart.id, 'items count:', updatedCart?.items?.length);
  res.json({ data: updatedCart, cartId: cart.id });
});

// Get User Cart (FIXED NULL USERID HANDLING)
export const getCart = asyncHandler(async (req, res) => {
  const { cartId } = req.query;
  console.log('🔍 getCart called with hasUser:', !!req.user, 'userId:', req.user?.id, 'cartId:', cartId);
  
  let cart;
  if (req.user && req.user.id) {
    // Authenticated user
    const userId = req.user.id;
    console.log('👤 Getting authenticated user cart for userId:', userId);
    try {
      cart = await prisma.cart.findUnique({
        where: { userId },
        include: { 
          items: { 
            include: { 
              product: {
                select: {
                  id: true,
                  name: true,
                  price: true,
                  coverImage: true,
                  description: true,
                  stock: true
                }
              }
            } 
          } 
        }
      });
      console.log('👤 Found authenticated user cart:', cart?.id, 'with items:', cart?.items?.length);
    } catch (error) {
      console.error('❌ Error getting authenticated user cart:', error);
      cart = null;
    }
  } else {
    // Unauthenticated user
    if (cartId) {
      const parsedCartId = parseInt(cartId);
      if (!isNaN(parsedCartId)) {
        console.log('👻 Getting anonymous cart with ID:', parsedCartId);
        try {
          cart = await prisma.cart.findUnique({
            where: { id: parsedCartId },
            include: { 
              items: { 
                include: { 
                  product: {
                    select: {
                      id: true,
                      name: true,
                      price: true,
                      coverImage: true,
                      description: true,
                      stock: true
                    }
                  }
                } 
              } 
            }
          });
          console.log('👻 Found anonymous cart:', cart?.id, 'with items:', cart?.items?.length);
        } catch (error) {
          console.error('❌ Error getting anonymous cart:', error);
          cart = null;
        }
      } else {
        console.log('❌ Invalid cartId provided:', cartId);
      }
    } else {
      console.log('👻 No cartId provided for anonymous user');
    }
  }

  console.log('📦 Returning cart data with items:', cart?.items?.length || 0, 'cartId:', cart?.id);
  res.json({ data: cart || { items: [] }, cartId: cart?.id });
});

// Place an Order (from Cart) - requires authentication
export const placeOrder = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { shippingAddress, paymentMethod } = req.body;

  console.log('Placing order for user:', userId);

  const cart = await prisma.cart.findUnique({
    where: { userId },
    include: { items: { include: { product: true } } }
  });

  if (!cart || cart.items.length === 0) {
    res.status(400);
    throw new Error('Cart is empty');
  }

  const orderItemsData = cart.items.map(item => ({
    productId: item.productId,
    quantity: item.quantity,
    price: item.product.price,
  }));

  const totalPrice = orderItemsData.reduce(
    (acc, item) => acc + item.price * item.quantity, 0
  );

  // Generate order number
  const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

  const order = await prisma.order.create({
    data: {
      userId,
      orderNumber,
      shippingAddress,
      paymentMethod,
      totalPrice,
      isPaid: false,
      items: {
        create: orderItemsData
      }
    },
    include: {
      items: { include: { product: true } },
      user: { select: { id: true, name: true, email: true } }
    }
  });

  await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });

  console.log('Order created successfully:', order.id);

  // Send email notifications
  try {
    await sendOrderConfirmationEmail({
      customerEmail: order.user.email,
      customerName: order.user.name,
      orderNumber: order.orderNumber,
      totalPrice: order.totalPrice,
      items: order.items,
      shippingAddress: order.shippingAddress
    });

    await sendAdminOrderNotification({
      customerEmail: order.user.email,
      customerName: order.user.name,
      orderNumber: order.orderNumber,
      totalPrice: order.totalPrice,
      items: order.items,
      shippingAddress: order.shippingAddress
    });
  } catch (emailError) {
    console.error('❌ Error sending emails:', emailError);
    // Don't fail the order creation if email fails
  }

  await notify({
    userId,
    message: `New order placed by user ${req.user.name}.`,
    recipientRole: 'ADMIN',
    relatedOrderId: order.id,
  });

  res.status(201).json(order);
});

// Place Anonymous Order (from Cart) - no authentication required
export const placeAnonymousOrder = asyncHandler(async (req, res) => {
  const { customerName, customerEmail, shippingAddress, paymentMethod, cartId } = req.body;

  if (!cartId) {
    res.status(400);
    throw new Error('Cart ID is required for anonymous orders');
  }
  if (!customerEmail) {
    res.status(400);
    throw new Error('Customer email is required for anonymous orders');
  }

  const cart = await prisma.cart.findUnique({
    where: { id: cartId },
    include: { items: { include: { product: true } } }
  });

  if (!cart || cart.items.length === 0) {
    res.status(400);
    throw new Error('Cart is empty or not found');
  }

  const orderItemsData = cart.items.map(item => ({
    productId: item.productId,
    quantity: item.quantity,
    price: item.product.price,
  }));

  const totalPrice = orderItemsData.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

  const order = await prisma.order.create({
    data: {
      orderNumber,
      customerName,
      customerEmail,  // store guest email here
      shippingAddress,
      paymentMethod,
      totalPrice,
      isPaid: false,
      items: {
        create: orderItemsData
      }
    },
    include: {
      items: { include: { product: true } }
    }
  });

  // Clear the anonymous cart
  await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
  await prisma.cart.delete({ where: { id: cart.id } });

  // Send emails
  try {
    await sendOrderConfirmationEmail({
      customerEmail: order.customerEmail,
      customerName: order.customerName,
      orderNumber: order.orderNumber,
      totalPrice: order.totalPrice,
      items: order.items,
      shippingAddress: order.shippingAddress
    });

    await sendAdminOrderNotification({
      customerEmail: order.customerEmail,
      customerName: order.customerName,
      orderNumber: order.orderNumber,
      totalPrice: order.totalPrice,
      items: order.items,
      shippingAddress: order.shippingAddress
    });
  } catch (emailError) {
    console.error('❌ Error sending emails:', emailError);
  }

  res.status(201).json(order);
});

// Create Order by Admin/Seller
export const createOrder = asyncHandler(async (req, res) => {
  const { userId, shippingAddress, paymentMethod, items, totalPrice, shippingPrice = 0 } = req.body;

  console.log('Creating order for user:', userId, 'by:', req.user.role);

  // Validate user exists
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  // If seller, validate they can only create orders with their products
  if (req.user.role.toLowerCase() === 'seller') {
    const productIds = items.map(item => item.productId);
    const products = await prisma.product.findMany({
      where: { 
        id: { in: productIds },
        createdById: req.user.id
      }
    });
    
    if (products.length !== productIds.length) {
      res.status(403);
      throw new Error('You can only create orders with your own products');
    }
  }

  // Generate order number
  const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

  const order = await prisma.order.create({
    data: {
      userId,
      orderNumber,
      shippingAddress,
      paymentMethod,
      totalPrice,
      shippingPrice: shippingPrice || 0,
      isPaid: false, // Never automatically mark as paid
      customerName: req.user.name,
      customerEmail: req.user.email,
      items: {
        create: items
      }
    },
    include: {
      items: { include: { product: true } },
      user: { select: { id: true, name: true, email: true } }
    }
  });

  console.log('Order created successfully by admin/seller:', order.id);

  await notify({
    userId: req.user.id,
    title: 'Order Created',
    message: `Order #${order.orderNumber} created by ${req.user.role} for user ${user.name}.`,
    type: 'SUCCESS',
    recipientRole: 'BUYER',
    relatedOrderId: order.id,
  });

  res.status(201).json(order);
});

// Get User Orders
export const getUserOrders = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  console.log('Getting orders for user:', userId);

  const orders = await prisma.order.findMany({
    where: { userId },
    include: {
      items: { include: { product: true } },
      user: { select: { id: true, name: true, email: true } }
    },
    orderBy: { createdAt: 'desc' }
  });

  console.log('User orders found:', orders.length);
  res.json(orders);
});

// Admin: Get All Orders
export const getAllOrders = asyncHandler(async (req, res) => {
  console.log('🔍 getAllOrders called - user role:', req.user?.role, 'user ID:', req.user?.id);
  
  let whereClause = {};
  
  // If seller, only get orders for their products
  if (req.user.role.toLowerCase() === 'seller') {
    console.log('🏪 Seller filtering orders for their products');
    whereClause = {
      items: {
        some: {
          product: {
            createdById: req.user.id
          }
        }
      }
    };
  } else {
    console.log('👑 Admin getting all orders');
  }
  
  try {
    console.log('📊 Prisma query whereClause:', JSON.stringify(whereClause, null, 2));
    
    const orders = await prisma.order.findMany({
      where: whereClause,
      include: {
        user: { select: { id: true, name: true, email: true } },
        items: { 
          include: { 
            product: {
              include: {
                createdBy: {
                  select: {
                    id: true,
                    name: true,
                    businessName: true
                  }
                }
              }
            }
          } 
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    console.log('✅ Orders found:', orders.length);
    console.log('📋 Order IDs:', orders.map(o => o.id));
    
    res.json(orders);
  } catch (error) {
    console.error('❌ Error in getAllOrders:', error);
    throw error;
  }
});

// Update Order (Admin/Seller)
export const updateOrder = asyncHandler(async (req, res) => {
  const orderId = parseInt(req.params.id);
  const { userId, shippingAddress, paymentMethod, items, totalPrice } = req.body;

  console.log('Updating order:', orderId);

  let whereClause = { id: orderId };
  
  // If seller, only update orders for their products
  if (req.user.role.toLowerCase() === 'seller') {
    whereClause = {
      id: orderId,
      items: {
        some: {
          product: {
            createdById: req.user.id
          }
        }
      }
    };
  }

  const order = await prisma.order.findFirst({
    where: whereClause,
    include: { user: true, items: true }
  });

  if (!order) {
    res.status(404);
    throw new Error('Order not found or unauthorized');
  }

  // Update order details
  const updateData = {};
  if (userId) updateData.userId = userId;
  if (shippingAddress) updateData.shippingAddress = shippingAddress;
  if (paymentMethod) updateData.paymentMethod = paymentMethod;
  if (totalPrice) updateData.totalPrice = totalPrice;

  // Update order
  const updatedOrder = await prisma.order.update({
    where: { id: orderId },
    data: updateData,
    include: {
      user: { select: { id: true, name: true, email: true } },
      items: { include: { product: true } }
    }
  });
  // Clear user's cart after payment confirmation
  const userCart = await prisma.cart.findUnique({ where: { userId: order.userId } });
  if (userCart) {
    await prisma.cartItem.deleteMany({ where: { cartId: userCart.id } });
  }

  await notify({
    userId: order.userId,
    message: `Your payment for Order #${order.id} has been confirmed by admin.`,
    recipientRole: 'BUYER',
    relatedOrderId: order.id,
  });
  // Update items if provided
  if (items && items.length > 0) {
    // Delete existing items
    await prisma.orderItem.deleteMany({
      where: { orderId }
    });

    // Create new items
    await prisma.orderItem.createMany({
      data: items.map(item => ({
        orderId,
        productId: item.productId,
        quantity: item.quantity,
        price: item.price
      }))
    });
  }

  console.log('Order updated successfully');

  res.json(updatedOrder);
});

// Delete Order (Admin only)
export const deleteOrder = asyncHandler(async (req, res) => {
  const orderId = parseInt(req.params.id);

  console.log('Deleting order:', orderId);

  const order = await prisma.order.findUnique({
    where: { id: orderId }
  });

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  // Delete order items first
  await prisma.orderItem.deleteMany({
    where: { orderId }
  });

  // Delete order
  await prisma.order.delete({
    where: { id: orderId }
  });

  console.log('Order deleted successfully');
  res.json({ message: 'Order deleted successfully' });
});

// Update Order Status (Admin/Seller) - FIXED EMAIL SENDING
export const updateOrderStatus = asyncHandler(async (req, res) => {
  const orderId = parseInt(req.params.id);
  const { isPaid, isDelivered, status } = req.body;
  
  console.log('🔄 Updating order status:', orderId, 'by user:', req.user.id, 'role:', req.user.role);

  // Find the order first
  let whereClause = { id: orderId };
  
  // If seller, ensure they can only update orders for their products
  if (req.user.role.toLowerCase() === 'seller') {
    whereClause = {
      id: orderId,
      items: {
        some: {
          product: {
            createdById: req.user.id
          }
        }
      }
    };
  }

  const order = await prisma.order.findFirst({
    where: whereClause,
    include: {
      user: { select: { id: true, name: true, email: true } },
      items: { 
        include: { 
          product: {
            include: {
              createdBy: {
                select: {
                  id: true,
                  name: true,
                  businessName: true
                }
              }
            }
          }
        } 
      }
    }
  });

  if (!order) {
    res.status(404);
    throw new Error('Order not found or you do not have permission to update this order');
  }

  // Update order status
  const updateData = {};
  if (isPaid !== undefined) updateData.isPaid = isPaid;
  if (isDelivered !== undefined) updateData.isDelivered = isDelivered;
  if (status !== undefined) updateData.status = status;

  const updatedOrder = await prisma.order.update({
    where: { id: orderId },
    data: updateData,
    include: {
      user: { select: { id: true, name: true, email: true } },
      items: { 
        include: { 
          product: {
            include: {
              createdBy: {
                select: {
                  id: true,
                  name: true,
                  businessName: true
                }
              }
            }
          }
        } 
      }
    }
  });

  // FIXED: Send email notification to customer about status change
  const customerEmail = order.user?.email || order.customerEmail;
  const customerName = order.user?.name || order.customerName;
  
  if (customerEmail && (isDelivered !== undefined || status !== undefined || isPaid !== undefined)) {
    try {
      // If order is confirmed as paid, send payment confirmation email
      if (isPaid === true) {
        await sendPaymentConfirmationEmail({
          customerEmail,
          customerName,
          orderNumber: order.orderNumber,
          totalPrice: order.totalPrice,
          items: order.items,
          shippingAddress: order.shippingAddress,
          paymentCode: order.paymentCode || '0787778889'
        });
        console.log('📧 Payment confirmation email sent to:', customerEmail);
      } else {
        // Send general status update email
        await sendOrderStatusUpdateEmail(
          customerEmail,
          status || (isDelivered ? 'Delivered' : isPaid ? 'Paid' : 'Processing'),
          order.items.map(item => item.product.name).join(', ')
        );
        console.log('📧 Status update email sent to:', customerEmail);
      }
    } catch (emailError) {
      console.error('❌ Error sending status update email:', emailError);
    }
  }

  // Create in-app notification if user exists
  if (order.userId) {
    await notify({
      userId: order.userId,
      title: 'Order Status Updated',
      message: `Your order #${order.orderNumber} status has been updated to: ${status || (isDelivered ? 'Delivered' : isPaid ? 'Paid' : 'Processing')}`,
      recipientRole: 'BUYER',
      relatedOrderId: order.id,
    });
  }

  console.log('✅ Order status updated successfully');
  res.json(updatedOrder);
});

// Confirm Order Payment (Admin) - FIXED CART CLEARING
export const confirmOrderPayment = asyncHandler(async (req, res) => {
  const orderId = parseInt(req.params.id);

  console.log('Confirming payment for order:', orderId);

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

  const updatedOrder = await prisma.order.update({
    where: { id: orderId },
    data: {
      isPaid: true,
      paidAt: new Date(),
      isConfirmedByAdmin: true,
      confirmedAt: new Date()
    },
    include: {
      user: { select: { id: true, name: true, email: true } },
      items: { include: { product: true } }
    }
  });

  console.log('✅ Payment confirmed successfully');

  // FIXED: Clear user's cart only if userId is valid
  if (order.userId && typeof order.userId === 'number' && !isNaN(order.userId)) {
    try {
      const userCart = await prisma.cart.findUnique({ where: { userId: order.userId } });
      if (userCart) {
        await prisma.cartItem.deleteMany({ where: { cartId: userCart.id } });
        console.log('🧹 Cart cleared for userId:', order.userId);
      }
    } catch (cartError) {
      console.error('❌ Error clearing cart:', cartError);
    }

    // Notify user of payment confirmation
    await notify({
      userId: order.userId,
      message: `Your payment for Order #${orderId} has been confirmed by admin.`,
      recipientRole: 'BUYER',
      relatedOrderId: orderId,
    });
  }

  // FIXED: Send payment confirmation email
  const customerEmail = order.user?.email || order.customerEmail;
  const customerName = order.user?.name || order.customerName;
  
  if (customerEmail) {
    try {
      await sendPaymentConfirmationEmail({
        customerEmail,
        customerName,
        orderNumber: order.orderNumber,
        totalPrice: order.totalPrice,
        items: order.items,
        shippingAddress: order.shippingAddress,
        paymentCode: order.paymentCode || '0787778889'
      });
      console.log('📧 Payment confirmation email sent to:', customerEmail);
    } catch (emailError) {
      console.error('❌ Error sending payment confirmation email:', emailError);
    }
  }

  res.json(updatedOrder);
});
