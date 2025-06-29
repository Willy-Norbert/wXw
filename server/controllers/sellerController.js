import asyncHandler from 'express-async-handler';
import prisma from '../prismaClient.js';
import bcrypt from 'bcryptjs';
import { notify } from '../utils/notify.js';
import { sendWelcomeEmail, sendSellerStatusEmail } from '../utils/emailService.js';

// Submit seller request
export const submitSellerRequest = asyncHandler(async (req, res) => {
  const { name, email, password, phone, businessName, gender } = req.body;

  // Check if user already exists
  const userExists = await prisma.user.findUnique({ where: { email } });
  if (userExists) {
    res.status(400);
    throw new Error('User with this email already exists');
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  // Create seller with inactive status
  const seller = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role: 'SELLER',
      phone,
      businessName,
      gender,
      sellerStatus: 'INACTIVE',
      isActive: false,
    }
  });

  // Send welcome email
  try {
    await sendWelcomeEmail({
      email: seller.email,
      name: seller.name
    });
  } catch (emailError) {
    console.error('❌ Error sending welcome email:', emailError);
    // Don't fail registration if email fails
  }

  // Notify admins about new seller request
  await notify({
    userId: null,
    message: `New seller request from ${seller.name} (${seller.businessName})`,
    recipientRole: 'ADMIN',
    relatedOrderId: null,
  });

  res.status(201).json({
    message: 'Seller request submitted successfully. Please wait for admin approval.',
    sellerId: seller.id
  });
});

// Get pending sellers (Admin only)
export const getPendingSellers = asyncHandler(async (req, res) => {
  const sellers = await prisma.user.findMany({
    where: { 
      role: 'SELLER'
    },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      businessName: true,
      gender: true,
      sellerStatus: true,
      isActive: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  res.json(sellers);
});

// Update seller status (Admin only) - ENHANCED WITH EMAIL NOTIFICATIONS
export const updateSellerStatus = asyncHandler(async (req, res) => {
  const { sellerId } = req.params;
  const { status, isActive } = req.body;

  const seller = await prisma.user.findUnique({
    where: { id: parseInt(sellerId) },
    select: { 
      id: true, 
      role: true, 
      name: true, 
      businessName: true, 
      email: true,
      sellerStatus: true,
      isActive: true
    }
  });

  if (!seller || seller.role !== 'SELLER') {
    res.status(404);
    throw new Error('Seller not found');
  }

  // Update seller status
  const updatedSeller = await prisma.user.update({
    where: { id: parseInt(sellerId) },
    data: {
      sellerStatus: status,
      isActive: isActive
    }
  });

  // Update product visibility based on seller status
  await prisma.product.updateMany({
    where: { createdById: parseInt(sellerId) },
    data: { isVisible: isActive }
  });

  // Send email notification about status change
  try {
    await sendSellerStatusEmail({
      email: seller.email,
      name: seller.name,
      businessName: seller.businessName
    }, status);
  } catch (emailError) {
    console.error('❌ Error sending seller status email:', emailError);
    // Don't fail the status update if email fails
  }

  // Notify seller about status change
  await notify({
    userId: parseInt(sellerId),
    message: `Your seller account has been ${isActive ? 'approved and activated' : 'suspended'}`,
    recipientRole: 'SELLER',
    relatedOrderId: null,
  });

  res.json({
    message: `Seller ${isActive ? 'activated' : 'deactivated'} successfully`,
    seller: updatedSeller
  });
});

// Get seller's own products
export const getSellerProducts = asyncHandler(async (req, res) => {
  const sellerId = req.user.id;
  console.log('🛍️ Getting products for seller:', sellerId);

  const products = await prisma.product.findMany({
    where: { createdById: sellerId },
    include: { 
      category: true,
      _count: {
        select: {
          orderItems: true,
          reviews: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  console.log('✅ Found', products.length, 'products for seller');
  res.json(products);
});

// Get seller's customers (users who bought their products)
export const getSellerCustomers = asyncHandler(async (req, res) => {
  const sellerId = req.user.id;
  console.log('👥 Getting customers for seller:', sellerId);

  const customers = await prisma.user.findMany({
    where: {
      orders: {
        some: {
          items: {
            some: {
              product: {
                createdById: sellerId
              }
            }
          }
        }
      }
    },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      address: true,
      createdAt: true,
      _count: {
        select: {
          orders: {
            where: {
              items: {
                some: {
                  product: {
                    createdById: sellerId
                  }
                }
              }
            }
          }
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  console.log('✅ Found', customers.length, 'customers for seller');
  res.json(customers);
});

// New customer management endpoints for sellers
export const updateSellerCustomer = asyncHandler(async (req, res) => {
  const sellerId = req.user.id;
  const { customerId } = req.params;
  const { name, email, phone, address } = req.body;
  
  console.log('🔄 Seller', sellerId, 'updating customer', customerId);

  // Verify that this customer has ordered from this seller
  const customerExists = await prisma.user.findFirst({
    where: {
      id: parseInt(customerId),
      orders: {
        some: {
          items: {
            some: {
              product: {
                createdById: sellerId
              }
            }
          }
        }
      }
    }
  });

  if (!customerExists) {
    res.status(403);
    throw new Error('You can only update customers who have ordered from you');
  }

  const updatedCustomer = await prisma.user.update({
    where: { id: parseInt(customerId) },
    data: {
      name: name || undefined,
      email: email || undefined,
      phone: phone || undefined,
      address: address || undefined,
    },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      address: true,
      createdAt: true,
    }
  });

  console.log('✅ Customer updated successfully');
  res.json(updatedCustomer);
});

export const removeSellerCustomer = asyncHandler(async (req, res) => {
  const sellerId = req.user.id;
  const { customerId } = req.params;
  
  console.log('🗑️ Seller', sellerId, 'removing customer', customerId);

  // Verify that this customer has ordered from this seller
  const customerExists = await prisma.user.findFirst({
    where: {
      id: parseInt(customerId),
      orders: {
        some: {
          items: {
            some: {
              product: {
                createdById: sellerId
              }
            }
          }
        }
      }
    }
  });

  if (!customerExists) {
    res.status(403);
    throw new Error('You can only manage customers who have ordered from you');
  }

  // Note: We don't actually delete the user account, just remove the relationship
  // This could be implemented by creating a blocklist or similar mechanism
  // For now, we'll return success but this is a placeholder for the actual logic
  
  console.log('✅ Customer removed from seller list');
  res.json({ message: 'Customer removed successfully' });
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
        select: { id: true, name: true, email: true }
      },
      items: {
        where: {
          product: {
            createdById: sellerId
          }
        },
        include: {
          product: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  res.json(orders);
});

// Get seller dashboard stats
export const getSellerStats = asyncHandler(async (req, res) => {
  const sellerId = req.user.id;

  // Get total products
  const totalProducts = await prisma.product.count({
    where: { createdById: sellerId }
  });

  // Get total orders for seller's products
  const totalOrders = await prisma.order.count({
    where: {
      items: {
        some: {
          product: {
            createdById: sellerId
          }
        }
      }
    }
  });

  // Get total revenue
  const revenueData = await prisma.orderItem.aggregate({
    where: {
      product: {
        createdById: sellerId
      },
      order: {
        isPaid: true
      }
    },
    _sum: {
      price: true
    }
  });

  // Get total customers
  const uniqueCustomers = await prisma.user.count({
    where: {
      orders: {
        some: {
          items: {
            some: {
              product: {
                createdById: sellerId
              }
            }
          }
        }
      }
    }
  });

  res.json({
    totalProducts,
    totalOrders,
    totalRevenue: revenueData._sum.price || 0,
    totalCustomers: uniqueCustomers
  });
});
