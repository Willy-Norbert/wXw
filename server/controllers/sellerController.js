
import asyncHandler from 'express-async-handler';
import prisma from '../prismaClient.js';

// Submit seller request
export const submitSellerRequest = asyncHandler(async (req, res) => {
  const { businessName, businessDescription } = req.body;
  const userId = req.user.id;

  // Check if user already has a seller request
  const existingRequest = await prisma.sellerRequest.findUnique({
    where: { userId }
  });

  if (existingRequest) {
    res.status(400);
    throw new Error('You have already submitted a seller request');
  }

  const sellerRequest = await prisma.sellerRequest.create({
    data: {
      userId,
      businessName,
      businessDescription,
      status: 'PENDING'
    }
  });

  res.json({ message: 'Seller request submitted successfully', sellerRequest });
});

// Get pending sellers (Admin only)
export const getPendingSellers = asyncHandler(async (req, res) => {
  const pendingSellers = await prisma.sellerRequest.findMany({
    where: { status: 'PENDING' },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true
        }
      }
    }
  });

  res.json(pendingSellers);
});

// Update seller status (Admin only)
export const updateSellerStatus = asyncHandler(async (req, res) => {
  const { sellerId } = req.params;
  const { status } = req.body;

  const sellerRequest = await prisma.sellerRequest.findUnique({
    where: { id: parseInt(sellerId) },
    include: { user: true }
  });

  if (!sellerRequest) {
    res.status(404);
    throw new Error('Seller request not found');
  }

  // Update seller request status
  await prisma.sellerRequest.update({
    where: { id: parseInt(sellerId) },
    data: { status }
  });

  // If approved, update user role and seller status
  if (status === 'ACTIVE') {
    await prisma.user.update({
      where: { id: sellerRequest.userId },
      data: { 
        role: 'SELLER',
        sellerStatus: 'ACTIVE'
      }
    });
  }

  // Send email notification
  try {
    const { sendSellerStatusEmail } = await import('../utils/emailService.js');
    await sendSellerStatusEmail({
      email: sellerRequest.user.email,
      name: sellerRequest.user.name,
      businessName: sellerRequest.businessName
    }, status);
  } catch (emailError) {
    console.error('Email error:', emailError);
  }

  res.json({ message: 'Seller status updated successfully' });
});

// Get seller's products
export const getSellerProducts = asyncHandler(async (req, res) => {
  const sellerId = req.user.id;
  
  const products = await prisma.product.findMany({
    where: { createdById: sellerId },
    include: {
      category: {
        select: {
          id: true,
          name: true
        }
      },
      _count: {
        select: {
          orderItems: true,
          reviews: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  res.json(products);
});

// Get seller's customers - FIXED TO SHOW ALL CUSTOMERS
export const getSellerCustomers = asyncHandler(async (req, res) => {
  const sellerId = req.user.id;
  
  console.log('🔍 Fetching customers for seller:', sellerId);

  try {
    // Get all orders for seller's products (including anonymous orders)
    const sellerOrders = await prisma.order.findMany({
      where: {
        items: {
          some: {
            product: {
              createdById: sellerId
            }
          }
        }
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            address: true,
            createdAt: true
          }
        },
        _count: {
          select: {
            items: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log('📦 Found seller orders:', sellerOrders.length);

    // Create a map to track unique customers (both registered and anonymous)
    const customerMap = new Map();

    sellerOrders.forEach(order => {
      let customerId, customerData;
      
      if (order.user) {
        // Registered customer
        customerId = `user_${order.user.id}`;
        customerData = {
          id: order.user.id,
          name: order.user.name,
          email: order.user.email,
          phone: order.user.phone || null,
          address: order.user.address || null,
          createdAt: order.user.createdAt,
          type: 'registered',
          _count: {
            orders: 0
          }
        };
      } else {
        // Anonymous customer - use email as identifier
        const email = order.customerEmail;
        if (email) {
          customerId = `anon_${email}`;
          customerData = {
            id: `anon_${order.id}`, // Use order ID for anonymous customers
            name: order.customerName || 'Anonymous Customer',
            email: order.customerEmail,
            phone: null,
            address: order.shippingAddress || null,
            createdAt: order.createdAt,
            type: 'anonymous',
            _count: {
              orders: 0
            }
          };
        }
      }

      if (customerId && customerData) {
        if (customerMap.has(customerId)) {
          // Increment order count for existing customer
          customerMap.get(customerId)._count.orders += 1;
        } else {
          // Add new customer with order count of 1
          customerData._count.orders = 1;
          customerMap.set(customerId, customerData);
        }
      }
    });

    // Convert map to array
    const customers = Array.from(customerMap.values());
    
    console.log('👥 Processed customers:', customers.length);
    console.log('📊 Customer types:', {
      registered: customers.filter(c => c.type === 'registered').length,
      anonymous: customers.filter(c => c.type === 'anonymous').length
    });

    res.json(customers);
  } catch (error) {
    console.error('❌ Error fetching seller customers:', error);
    res.status(500);
    throw new Error('Failed to fetch customers');
  }
});

// Update seller customer
export const updateSellerCustomer = asyncHandler(async (req, res) => {
  const { customerId } = req.params;
  const { name, email, phone, address } = req.body;
  const sellerId = req.user.id;

  // Verify this customer has orders from this seller
  const customerOrder = await prisma.order.findFirst({
    where: {
      OR: [
        { userId: parseInt(customerId) },
        { customerEmail: email }
      ],
      items: {
        some: {
          product: {
            createdById: sellerId
          }
        }
      }
    }
  });

  if (!customerOrder) {
    res.status(404);
    throw new Error('Customer not found or not associated with your products');
  }

  // Update user if it's a registered customer
  if (!isNaN(parseInt(customerId))) {
    const updatedCustomer = await prisma.user.update({
      where: { id: parseInt(customerId) },
      data: { name, email, phone, address }
    });
    res.json(updatedCustomer);
  } else {
    // For anonymous customers, we can't update their info directly
    res.status(400);
    throw new Error('Cannot update anonymous customer information');
  }
});

// Remove seller customer (soft delete - just remove from seller's view)
export const removeSellerCustomer = asyncHandler(async (req, res) => {
  const { customerId } = req.params;
  const sellerId = req.user.id;

  // We can't actually delete customers, just return that it's not allowed
  res.status(400);
  throw new Error('Cannot remove customers - they may have active orders');
});

// Get seller's orders
export const getSellerOrders = asyncHandler(async (req, res) => {
  const sellerId = req.user.id;

  const orders = await prisma.order.findMany({
    where: {
      items: {
        some: {
          product: {
            createdById: sellerId
          }
        }
      }
    },
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
        },
        where: {
          product: {
            createdById: sellerId
          }
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  res.json(orders);
});

// Get seller's stats
export const getSellerStats = asyncHandler(async (req, res) => {
  const sellerId = req.user.id;

  // Get total products
  const totalProducts = await prisma.product.count({
    where: { createdById: sellerId }
  });

  // Get orders for seller's products
  const sellerOrders = await prisma.order.findMany({
    where: {
      items: {
        some: {
          product: {
            createdById: sellerId
          }
        }
      }
    },
    include: {
      items: {
        where: {
          product: {
            createdById: sellerId
          }
        }
      }
    }
  });

  const totalOrders = sellerOrders.length;
  
  // Calculate total revenue from seller's products
  const totalRevenue = sellerOrders.reduce((sum, order) => {
    const sellerItemsRevenue = order.items.reduce((itemSum, item) => {
      return itemSum + (item.price * item.quantity);
    }, 0);
    return sum + sellerItemsRevenue;
  }, 0);

  // Get unique customers (registered + anonymous)
  const customerEmails = new Set();
  const customerUserIds = new Set();
  
  sellerOrders.forEach(order => {
    if (order.userId) {
      customerUserIds.add(order.userId);
    } else if (order.customerEmail) {
      customerEmails.add(order.customerEmail);
    }
  });
  
  const totalCustomers = customerUserIds.size + customerEmails.size;

  res.json({
    totalProducts,
    totalOrders,
    totalRevenue,
    totalCustomers
  });
});
