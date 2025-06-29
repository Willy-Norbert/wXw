import asyncHandler from 'express-async-handler';
import prisma from '../prismaClient.js';
import { sendSellerStatusEmail } from '../utils/emailService.js';

// Submit Seller Request
export const submitSellerRequest = asyncHandler(async (req, res) => {
  const { userId, businessName, businessDescription, businessAddress, businessPhone } = req.body;

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  if (user.role === 'SELLER') {
    res.status(400);
    throw new Error('User is already a seller');
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      businessName,
      bio: businessDescription,
      address: businessAddress,
      phone: businessPhone,
      role: 'SELLER',
      sellerStatus: 'INACTIVE',
    }
  });

  res.status(201).json({
    message: 'Seller request submitted successfully. Awaiting admin approval.',
    user: {
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      businessName: updatedUser.businessName,
      sellerStatus: updatedUser.sellerStatus
    }
  });
});

// Get All Sellers (Admin only) - FIXED to return all sellers, not just pending
export const getPendingSellers = asyncHandler(async (req, res) => {
  const allSellers = await prisma.user.findMany({
    where: {
      role: 'SELLER'
      // Removed the sellerStatus filter to show ALL sellers
    },
    select: {
      id: true,
      name: true,
      email: true,
      businessName: true,
      bio: true,
      address: true,
      phone: true,
      createdAt: true,
      sellerStatus: true,
      isActive: true,
      gender: true
    },
    orderBy: { createdAt: 'desc' }
  });

  res.json(allSellers);
});

// Update Seller Status (Admin only)
export const updateSellerStatus = asyncHandler(async (req, res) => {
  const { sellerId } = req.params;
  const { status, isActive } = req.body;

  const seller = await prisma.user.findUnique({
    where: { id: parseInt(sellerId) },
  });

  if (!seller) {
    res.status(404);
    throw new Error('Seller not found');
  }

  if (seller.role !== 'SELLER') {
    res.status(400);
    throw new Error('User is not a seller');
  }

  const updateData = {};
  if (status) updateData.sellerStatus = status;
  if (isActive !== undefined) updateData.isActive = isActive;

  const updatedSeller = await prisma.user.update({
    where: { id: parseInt(sellerId) },
    data: updateData,
  });

  // Send email notification
  try {
    await sendSellerStatusEmail(
      {
        email: updatedSeller.email,
        name: updatedSeller.name,
        businessName: updatedSeller.businessName
      },
      status || updatedSeller.sellerStatus
    );
  } catch (emailError) {
    console.error('Error sending seller status email:', emailError);
  }

  res.json({
    message: 'Seller status updated successfully',
    seller: {
      id: updatedSeller.id,
      name: updatedSeller.name,
      email: updatedSeller.email,
      businessName: updatedSeller.businessName,
      sellerStatus: updatedSeller.sellerStatus,
      isActive: updatedSeller.isActive
    }
  });
});

// Get Seller Products
export const getSellerProducts = asyncHandler(async (req, res) => {
  const sellerId = req.user.id;
  
  const products = await prisma.product.findMany({
    where: { createdById: sellerId },
    include: {
      category: {
        select: {
          id: true,
          name: true,
          description: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  res.json(products);
});

// Get Seller Customers - FIXED to include anonymous customers
export const getSellerCustomers = asyncHandler(async (req, res) => {
  const sellerId = req.user.id;
  
  console.log('👥 Getting customers for seller:', sellerId);

  try {
    // Get all orders for this seller's products
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
            email: true,
            phone: true,
            address: true,
            createdAt: true
          }
        }
      },
      distinct: ['userId', 'customerEmail'] // Get unique customers
    });

    console.log('📋 Found orders for seller:', orders.length);

    // Create a map to track unique customers
    const customerMap = new Map();

    orders.forEach(order => {
      let customerId, customerKey;
      
      if (order.user) {
        // Registered customer
        customerId = order.user.id;
        customerKey = `user_${customerId}`;
        
        if (!customerMap.has(customerKey)) {
          customerMap.set(customerKey, {
            id: customerId,
            name: order.user.name,
            email: order.user.email,
            phone: order.user.phone,
            address: order.user.address,
            createdAt: order.user.createdAt,
            type: 'registered',
            _count: { orders: 0 }
          });
        }
      } else if (order.customerEmail) {
        // Anonymous customer
        customerKey = `guest_${order.customerEmail}`;
        
        if (!customerMap.has(customerKey)) {
          customerMap.set(customerKey, {
            id: `guest_${order.customerEmail}`,
            name: order.customerName || 'Anonymous Customer',
            email: order.customerEmail,
            phone: null,
            address: order.shippingAddress,
            createdAt: order.createdAt,
            type: 'guest',
            _count: { orders: 0 }
          });
        }
      }
      
      // Increment order count
      if (customerMap.has(customerKey)) {
        customerMap.get(customerKey)._count.orders++;
      }
    });

    const customers = Array.from(customerMap.values());
    
    console.log('👥 Returning unique customers:', customers.length);
    res.json(customers);
    
  } catch (error) {
    console.error('❌ Error getting seller customers:', error);
    res.status(500);
    throw new Error('Failed to get customers');
  }
});

// Update Seller Customer
export const updateSellerCustomer = asyncHandler(async (req, res) => {
  const { customerId } = req.params;
  const { name, email, phone, address } = req.body;
  
  const updatedCustomer = await prisma.user.update({
    where: { id: parseInt(customerId) },
    data: { name, email, phone, address }
  });
  
  res.json(updatedCustomer);
});

// Remove Seller Customer
export const removeSellerCustomer = asyncHandler(async (req, res) => {
  const { customerId } = req.params;
  
  await prisma.user.delete({
    where: { id: parseInt(customerId) }
  });
  
  res.json({ message: 'Customer removed successfully' });
});

// Get Seller Orders
export const getSellerOrders = asyncHandler(async (req, res) => {
  const sellerId = req.user.id;
  
  console.log('🔍 Getting orders for seller:', sellerId);
  
  try {
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
    
    console.log('✅ Seller orders found:', orders.length);
    res.json(orders);
  } catch (error) {
    console.error('❌ Error in getSellerOrders:', error);
    throw error;
  }
});

// Get Seller Stats
export const getSellerStats = asyncHandler(async (req, res) => {
  const sellerId = req.user.id;
  
  const [productCount, orderCount, totalRevenue] = await Promise.all([
    prisma.product.count({
      where: { createdById: sellerId }
    }),
    prisma.order.count({
      where: {
        items: {
          some: {
            product: {
              createdById: sellerId
            }
          }
        }
      }
    }),
    prisma.order.aggregate({
      where: {
        items: {
          some: {
            product: {
              createdById: sellerId
            }
          }
        },
        isPaid: true
      },
      _sum: {
        totalPrice: true
      }
    })
  ]);
  
  res.json({
    productCount,
    orderCount,
    totalRevenue: totalRevenue._sum.totalPrice || 0
  });
});
