import asyncHandler from 'express-async-handler';
import prisma from '../prismaClient.js';
import { notify } from '../utils/notify.js';
import { sendOrderConfirmationEmail, sendAdminOrderNotification, sendOrderStatusUpdateEmail, sendPaymentConfirmationEmail, sendDeliveryStatusUpdateEmail, sendOrderCancellationEmail, sendSellerOrderConfirmationEmail } from '../utils/emailService.js';
import { checkSellerPermission } from '../middleware/permissionMiddleware.js';

// Global constants
const APP_CONSTANTS = {
  DELIVERY_FEE: 1200,
  DISCOUNT_RATE: 0.02,
  PAYMENT_METHODS: {
    MTN: 'MTN',
    PAY_ON_DELIVERY: 'PAY_ON_DELIVERY'
  }
};

// Get Order by ID (Admin/Seller)
export const getOrderById = asyncHandler(async (req, res) => {
  console.log('Request params:', req.params);
  
  const orderId = parseInt(req.params.id);
  if (isNaN(orderId)) {
    res.status(400);
    throw new Error('Invalid order ID');
  }

  console.log('Getting order by ID:', orderId, 'for user role:', req.user?.role);

  let whereClause = { id: orderId };

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
  
  console.log(' addToCart called with:', { productId, quantity, cartId, hasUser: !!req.user, userId: req.user?.id });
  
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
    if (!userId || typeof userId !== 'number') {
  res.status(400);
  throw new Error('Valid user ID is required');
}
if (!req.user || !req.user.id) {
  res.status(401);
  throw new Error('User not authenticated');
}

    console.log(' Handling authenticated user cart for userId:', userId);
    
    cart = await prisma.cart.findUnique({ where: { userId } });
    if (!cart) {
      cart = await prisma.cart.create({ data: { userId } });
      console.log(' Created new user cart:', cart.id);
    } else {
      console.log(' Found existing user cart:', cart.id);
    }
  } else {
    // Unauthenticated user
    if (cartId) {
      console.log(' Looking for existing anonymous cart with ID:', cartId);
      cart = await prisma.cart.findUnique({ where: { id: cartId } });
    }
    
    if (!cart) {
      console.log(' Creating new anonymous cart');
      cart = await prisma.cart.create({ data: {} });
      console.log(' Created anonymous cart with ID:', cart.id);
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
    console.log(' Updated existing cart item quantity');
  } else {
    await prisma.cartItem.create({
      data: { cartId: cart.id, productId, quantity }
    });
    console.log(' Created new cart item');
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

  console.log(' Returning updated cart with cartId:', cart.id, 'items count:', updatedCart?.items?.length);
  res.json({ data: updatedCart, cartId: cart.id });
});

// Remove Product from Cart (FIXED AUTHENTICATION)
export const removeFromCart = asyncHandler(async (req, res) => {
  const { productId, cartId } = req.body;

  console.log(' removeFromCart called with:', { productId, cartId, hasUser: !!req.user, userId: req.user?.id });

  let cart;
  if (req.user && req.user.id) {
    // Authenticated user
    const userId = req.user.id;
    console.log(' Removing from authenticated user cart for userId:', userId);
    cart = await prisma.cart.findUnique({ where: { userId } });
  } else {
    // Unauthenticated user - use cartId from request
    if (!cartId) {
      res.status(400);
      throw new Error('Cart ID required for unauthenticated users');
    }
    console.log(' Removing from anonymous cart with ID:', cartId);
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

  console.log(' Returning updated cart after removal, cartId:', cart.id, 'items count:', updatedCart?.items?.length);
  res.json({ data: updatedCart, cartId: cart.id });
});

// Get User Cart (FIXED NULL USERID HANDLING)
export const getCart = asyncHandler(async (req, res) => {
  const { cartId } = req.query;
  console.log(' getCart called with hasUser:', !!req.user, 'userId:', req.user?.id, 'cartId:', cartId);
  
  let cart;
  if (req.user && req.user.id) {
    // Authenticated user
    const userId = req.user.id;
    console.log(' Getting authenticated user cart for userId:', userId);
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
      console.log(' Found authenticated user cart:', cart?.id, 'with items:', cart?.items?.length);
    } catch (error) {
      console.error(' Error getting authenticated user cart:', error);
      cart = null;
    }
  } else {
    // Unauthenticated user
    if (cartId) {
      const parsedCartId = parseInt(cartId);
      if (!isNaN(parsedCartId)) {
        console.log(' Getting anonymous cart with ID:', parsedCartId);
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
          console.log(' Found anonymous cart:', cart?.id, 'with items:', cart?.items?.length);
        } catch (error) {
          console.error(' Error getting anonymous cart:', error);
          cart = null;
        }
      } else {
        console.log(' Invalid cartId provided:', cartId);
      }
    } else {
      console.log(' No cartId provided for anonymous user');
    }
  }

  console.log(' Returning cart data with items:', cart?.items?.length || 0, 'cartId:', cart?.id);
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

  const subtotal = orderItemsData.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const discount = Math.round(subtotal * APP_CONSTANTS.DISCOUNT_RATE);
  const subtotalAfterDiscount = subtotal - discount;
  
  // Add delivery fee unless Pay on Delivery is selected
  const deliveryFee = paymentMethod === APP_CONSTANTS.PAYMENT_METHODS.PAY_ON_DELIVERY 
    ? 0 
    : APP_CONSTANTS.DELIVERY_FEE;
  
  const totalPrice = subtotalAfterDiscount + deliveryFee;

  // Generate order number
  const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

const order = await prisma.order.create({
  data: {
    user: {
      connect: { id: userId } // ✅ Proper way to set a relation
    },
    orderNumber,
    shippingAddress, // ✅ Must be a JSON object
    paymentMethod,
    totalPrice,
    shippingPrice: deliveryFee,
    discountAmount: discount,
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

  // Send email notifications with proper delivery fee and payment info
  try {
    await sendOrderConfirmationEmail({
      customerEmail: order.user.email,
      customerName: order.user.name,
      orderNumber: order.orderNumber,
      totalPrice: order.totalPrice,
      items: order.items,
      shippingAddress: order.shippingAddress,
      paymentMethod: order.paymentMethod,
      deliveryFee: deliveryFee,
      discount: discount
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
    console.error('✉️ Error sending emails:', emailError);
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
  const { customerName, customerEmail, billingAddress, shippingAddress, paymentMethod, cartId } = req.body;

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

  const subtotal = orderItemsData.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const discount = Math.round(subtotal * APP_CONSTANTS.DISCOUNT_RATE);
  const subtotalAfterDiscount = subtotal - discount;
  
  // Add delivery fee unless Pay on Delivery is selected
  const deliveryFee = paymentMethod === APP_CONSTANTS.PAYMENT_METHODS.PAY_ON_DELIVERY 
    ? 0 
    : APP_CONSTANTS.DELIVERY_FEE;
  
  const totalPrice = subtotalAfterDiscount + deliveryFee;

  const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

  const order = await prisma.order.create({
    data: {
      orderNumber,
      customerName,
      customerEmail,
      billingAddress: billingAddress || null,
      shippingAddress,
      paymentMethod,
      totalPrice,
      shippingPrice: deliveryFee,
      discountAmount: discount,
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

  // Send emails with proper payment method display
  try {
    await sendOrderConfirmationEmail({
      customerEmail: order.customerEmail,
      customerName: order.customerName,
      orderNumber: order.orderNumber,
      totalPrice: order.totalPrice,
      items: order.items,
      shippingAddress: order.shippingAddress,
      paymentMethod: order.paymentMethod,
      deliveryFee: deliveryFee,
      discount: discount
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
    console.error('✉️ Error sending emails:', emailError);
  }

  res.status(201).json(order);
});

// Create Order by Admin/Seller
export const createOrder = asyncHandler(async (req, res) => {
  const { userId, customerName, customerEmail, customerPhone, billingAddress, shippingAddress, paymentMethod, items, totalPrice, shippingPrice = 0 } = req.body;

  console.log('Creating order for user:', userId, 'by:', req.user.role, 'userId type:', typeof userId);

  // Handle both registered users and guest customers
  let user = null;
  if (userId && typeof userId === 'number' && !isNaN(userId)) {
    // Validate user exists for registered customers
    user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }
  } else if (!customerName || !customerEmail) {
    // For guest customers, name and email are required
    res.status(400);
    throw new Error('Customer name and email are required for guest orders');
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
      ...(userId && { userId }),
      orderNumber,
      customerName: customerName || user?.name,
      customerEmail: customerEmail || user?.email,
      customerPhone: customerPhone || user?.phone || null,
      billingAddress: billingAddress || null,
      shippingAddress,
      paymentMethod,
      totalPrice,
      shippingPrice: shippingPrice || 0,
      isPaid: false, // Never automatically mark as paid
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

  // FIXED: Send order confirmation email to customer regardless of who creates it
  try {
    const emailData = {
      customerEmail: order.customerEmail,
      customerName: order.customerName,
      orderNumber: order.orderNumber,
      totalPrice: order.totalPrice,
      items: order.items,
      shippingAddress: order.shippingAddress,
      paymentMethod: order.paymentMethod,
    };

    if (req.user.role.toLowerCase() === 'seller') {
      await sendSellerOrderConfirmationEmail({
        ...emailData,
        sellerName: req.user.name,
        sellerBusinessName: req.user.businessName
      });
      console.log('✅ Seller order confirmation email sent to customer:', order.customerEmail);
    } else {
      // Admin creating order - send regular confirmation email
      await sendOrderConfirmationEmail({
        ...emailData,
        deliveryFee: shippingPrice || 0,
        discount: 0
      });
      console.log('✅ Admin order confirmation email sent to customer:', order.customerEmail);
    }
  } catch (emailError) {
    console.error('❌ Error sending order confirmation email:', emailError);
  }

  await notify({
    userId: req.user.id,
    title: 'Order Created',
    message: `Order #${order.orderNumber} created by ${req.user.role} for customer ${order.customerName}.`,
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

// Admin: Get All Orders - FIXED GUEST NAME DISPLAY
export const getAllOrders = asyncHandler(async (req, res) => {
  console.log('🔍 getAllOrders called - user role:', req.user?.role, 'user ID:', req.user?.id);
  
  let whereClause = {};
  
  // If seller, only get orders for their products
  if (req.user.role.toLowerCase() === 'seller') {
    console.log('🔍 Seller filtering orders for their products');
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
    console.log('🔍 Admin getting all orders');
  }
  
  try {
    console.log('🔍 Prisma query whereClause:', JSON.stringify(whereClause, null, 2));
    
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
    
    // Fix guest name display - use customerName if user is null
    const ordersWithFixedNames = orders.map(order => ({
      ...order,
      displayName: order.user?.name || order.customerName || 'Guest User',
      displayEmail: order.user?.email || order.customerEmail || 'No email'
    }));
    
    console.log('✅ Orders found:', ordersWithFixedNames.length);
    console.log('✅ Order IDs:', ordersWithFixedNames.map(o => o.id));
    
    res.json(ordersWithFixedNames);
  } catch (error) {
    console.error('❌ Error in getAllOrders:', error);
    throw error;
  }
});

// Update Order (Admin/Seller) - ENHANCED WITH CANCELLATION
export const updateOrder = asyncHandler(async (req, res) => {
  const orderId = parseInt(req.params.id);
  const { userId, shippingAddress, paymentMethod, items, totalPrice, status, isCancelled } = req.body;

  console.log('Updating order:', orderId, 'with data:', { status, isCancelled });

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
    include: { 
      user: true, 
      items: { include: { product: true } }
    }
  });

  if (!order) {
    res.status(404);
    throw new Error('Order not found or unauthorized');
  }

  // Handle order cancellation
  if (isCancelled === true || status === 'CANCELLED') {
    const cancelledOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'CANCELLED',
        isCancelled: true,
        cancelledAt: new Date(),
        cancelledBy: req.user.id
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
        items: { include: { product: true } }
      }
    });

    // Send cancellation email
    const customerEmail = order.user?.email || order.customerEmail;
    const customerName = order.user?.name || order.customerName;
    
    if (customerEmail) {
      try {
        await sendOrderCancellationEmail({
          customerEmail,
          customerName,
          orderNumber: order.orderNumber,
          items: order.items,
          cancelReason: 'Order cancelled by admin'
        });
        console.log('✅ Order cancellation email sent to:', customerEmail);
      } catch (emailError) {
        console.error('❌ Error sending cancellation email:', emailError);
      }
    }

    // Notify customer about cancellation
    if (order.userId) {
      await notify({
        userId: order.userId,
        title: 'Order Cancelled',
        message: `Your order #${order.orderNumber} has been cancelled. Please contact support if you have any questions.`,
        recipientRole: 'BUYER',
        relatedOrderId: order.id,
      });
    }

    console.log('✅ Order cancelled successfully');
    return res.json(cancelledOrder);
  }

  // Update order details
  const updateData = {};
  if (userId) updateData.userId = userId;
  if (shippingAddress) updateData.shippingAddress = shippingAddress;
  if (paymentMethod) updateData.paymentMethod = paymentMethod;
  if (totalPrice) updateData.totalPrice = totalPrice;
  if (status) updateData.status = status;

  // Update order
  const updatedOrder = await prisma.order.update({
    where: { id: orderId },
    data: updateData,
    include: {
      user: { select: { id: true, name: true, email: true } },
      items: { include: { product: true } }
    }
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

  console.log(' Order updated successfully');
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

// Update Order Status (Admin/Seller) - FIXED EMAIL NOTIFICATIONS AND PERMISSION CHECKING
export const updateOrderStatus = asyncHandler(async (req, res) => {
  const orderId = parseInt(req.params.id);
  const { isPaid, isDelivered, status, isCancelled } = req.body;
  
  console.log('🔄 Updating order status:', orderId, 'by user:', req.user.id, 'role:', req.user.role);
  console.log('🔄 Status changes:', { isPaid, isDelivered, status, isCancelled });

  // Find the order first
  let whereClause = { id: orderId };
  
  // If seller, ensure they can only update orders for their products AND check permissions
  if (req.user.role.toLowerCase() === 'seller') {
    // Get seller permissions
    const seller = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { sellerPermissions: true, sellerStatus: true }
    });

    if (!seller || seller.sellerStatus !== 'ACTIVE') {
      res.status(403);
      throw new Error('Seller account is not active');
    }

    let permissions = {};
    if (seller?.sellerPermissions) {
      try {
        permissions = JSON.parse(seller.sellerPermissions);
      } catch (error) {
        console.error('Error parsing seller permissions:', error);
        permissions = {};
      }
    }
    
    // Check specific permissions
    if (isPaid !== undefined && !permissions.canConfirmOrder) {
      res.status(403);
      throw new Error('You do not have permission to confirm orders');
    }
    if (isDelivered !== undefined && !permissions.canConfirmOrder) {
      res.status(403);
      throw new Error('You do not have permission to update delivery status');
    }
    if (isCancelled === true && !permissions.canCancelOrder) {
      res.status(403);
      throw new Error('You do not have permission to cancel orders');
    }

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
    throw new Error('Order not found or unauthorized');
  }

  // Handle order cancellation
  if (isCancelled === true || status === 'CANCELLED') {
    const cancelledOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'CANCELLED',
        isCancelled: true,
        cancelledAt: new Date(),
        cancelledBy: req.user.id,
        isConfirmedByAdmin: false,
        confirmedAt: null
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
        items: { include: { product: true } }
      }
    });

    // Send cancellation notifications
    const customerEmail = order.user?.email || order.customerEmail;
    const customerName = order.user?.name || order.customerName;
    
    if (customerEmail) {
      try {
        await sendOrderCancellationEmail({
          customerEmail,
          customerName,
          orderNumber: order.orderNumber,
          items: order.items,
          cancelReason: `Order cancelled by ${req.user.role.toLowerCase()}`
        });
        console.log('✅ Order cancellation email sent to:', customerEmail);
      } catch (emailError) {
        console.error('❌ Error sending cancellation email:', emailError);
      }
    }

    // Notify customer about cancellation
    if (order.userId) {
      await notify({
        userId: order.userId,
        title: 'Order Cancelled',
        message: `Your order #${order.orderNumber} has been cancelled. Please contact support if you have any questions.`,
        type: 'WARNING',
        recipientRole: 'BUYER',
        relatedOrderId: order.id,
      });
    }

    console.log('✅ Order cancelled successfully');
    return res.json(cancelledOrder);
  }

  // Update order status
  const updateData = {};
  if (isPaid !== undefined) updateData.isPaid = isPaid;
  if (isDelivered !== undefined) {
    updateData.isDelivered = isDelivered;
    if (isDelivered) {
      updateData.deliveredAt = new Date();
    }
  }
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

  // FIXED: Always get customer email and name regardless of user vs anonymous order
  const customerEmail = updatedOrder.user?.email || updatedOrder.customerEmail;
  const customerName = updatedOrder.user?.name || updatedOrder.customerName || 'Valued Customer';
  
  console.log('📧 Preparing to send email to:', customerEmail, 'for customer:', customerName);

  // Send email notifications for status changes
  if (customerEmail) {
    try {
      // Send delivery status email for delivery updates
      if (isDelivered !== undefined) {
        console.log('📧 Sending delivery status email for delivery update...');
        console.log('📧 Email details:', { customerEmail, customerName, orderNumber: updatedOrder.orderNumber });
        await sendDeliveryStatusUpdateEmail({
          customerEmail,
          customerName,
          orderNumber: updatedOrder.orderNumber,
          productNames: updatedOrder.items.map(item => item.product.name),
          deliveryStatus: isDelivered ? 'Delivered' : 'Out for Delivery',
          updateDateTime: new Date(),
          orderViewLink: `${process.env.FRONTEND_URL || 'http://localhost:8080'}/orders/${orderId}`
        });
        console.log('✅ Delivery status email sent successfully to:', customerEmail);
      }
      // Send payment confirmation email for payment updates (FIXED to work without admin confirmation)
      else if (isPaid === true) {
        console.log('📧 Sending payment confirmation email for payment status change...');
        await sendPaymentConfirmationEmail({
          customerEmail,
          customerName,
          orderNumber: updatedOrder.orderNumber,
          totalPrice: updatedOrder.totalPrice,
          items: updatedOrder.items,
          shippingAddress: updatedOrder.shippingAddress,
          paymentCode: updatedOrder.paymentCode || '0784720884'
        });
        console.log('✅ Payment confirmation email sent successfully to:', customerEmail);
      }
      // Send general status update email for other status changes
      else if (status !== undefined) {
        console.log('📧 Sending general status update email...');
        await sendOrderStatusUpdateEmail(
          customerEmail,
          status,
          updatedOrder.items.map(item => item.product.name).join(', ')
        );
        console.log('✅ Status update email sent successfully to:', customerEmail);
      }
    } catch (emailError) {
      console.error('❌ Error sending status update email:', emailError.message);
      console.error('❌ Full email error:', emailError);
    }
  } else {
    console.warn('⚠️ No customer email found for order:', orderId);
  }

  // Create in-app notification for buyers when status changes
  if (updatedOrder.userId) {
    let notificationMessage = '';
    let notificationType = 'INFO';
    
    if (isDelivered === true) {
      notificationMessage = `🎉 Great news! Your order #${updatedOrder.orderNumber} has been delivered successfully.`;
      notificationType = 'SUCCESS';
    } else if (isDelivered === false) {
      notificationMessage = `📦 Your order #${updatedOrder.orderNumber} is now out for delivery.`;
      notificationType = 'INFO';
    } else if (isPaid === true) {
      notificationMessage = `✅ Payment confirmed for your order #${updatedOrder.orderNumber}.`;
      notificationType = 'SUCCESS';
    } else if (status) {
      notificationMessage = `📋 Your order #${updatedOrder.orderNumber} status has been updated to: ${status}`;
      notificationType = 'INFO';
    }

    if (notificationMessage) {
      await notify({
        userId: updatedOrder.userId,
        title: 'Order Update',
        message: notificationMessage,
        type: notificationType,
        recipientRole: 'BUYER',
        relatedOrderId: updatedOrder.id,
      });
    }
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

  console.log(' Payment confirmed successfully');

  // FIXED: Clear user's cart only if userId is valid
  if (order.userId && typeof order.userId === 'number' && !isNaN(order.userId)) {
    try {
      const userCart = await prisma.cart.findUnique({ where: { userId: order.userId } });
      if (userCart) {
        await prisma.cartItem.deleteMany({ where: { cartId: userCart.id } });
        console.log(' Cart cleared for userId:', order.userId);
      }
    } catch (cartError) {
      console.error(' Error clearing cart:', cartError);
    }

    // Notify user of payment confirmation
    await notify({
      userId: order.userId,
      title: 'Payment Confirmed',
      message: `Your payment for Order #${order.orderNumber} has been confirmed by admin.`,
      type: 'SUCCESS',
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
      console.log(' Payment confirmation email sent to:', customerEmail);
    } catch (emailError) {
      console.error(' Error sending payment confirmation email:', emailError);
    }
  }

  res.json(updatedOrder);
});
