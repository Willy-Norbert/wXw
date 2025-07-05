import asyncHandler from 'express-async-handler';
import prisma from '../prismaClient.js';
import { notify } from '../utils/notify.js';
import bcrypt from 'bcryptjs';
import {sendSellerWelcomeEmail,sendSellerStatusEmail} from '../utils/emailService.js';

// Submit seller request
export const submitSellerRequest = asyncHandler(async (req, res) => {
  const { name, email, phone, businessName, businessDescription, password } = req.body;

  // Check if user already exists
  let user = await prisma.user.findUnique({
    where: { email }
  });

  if (user) {
    // Update existing user to request seller status
    if (user.sellerStatus === 'ACTIVE') {
      res.status(400);
      throw new Error('User is already an active seller');
    }

    // Hash the new password if provided
    const updateData = {
      sellerStatus: 'PENDING',
      businessName,
      bio: businessDescription || null,
      ...(phone && { phone })
    };

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateData.password = hashedPassword;
    }

    user = await prisma.user.update({
      where: { id: user.id },
      data: updateData
    });
  } else {
    // Create new user with seller request - use provided password
    if (!password) {
      res.status(400);
      throw new Error('Password is required for new seller registration');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone: phone || null,
        role: 'SELLER',
        sellerStatus: 'PENDING',
        businessName,
        bio: businessDescription || null,
        isActive: true  // Allow sellers to login immediately after registration
      }
    });
  }

 try {
    await sendSellerWelcomeEmail({
      email: user.email,
      name: user.name
    });
  } catch (emailError) {
    console.error('❌ Error sending welcome email:', emailError);
    // Don't fail registration if email fails
  }
  // Notify admins
  try {
    await notify({
      userId: null,
      message: `New seller request from ${name} (${businessName})`,
      recipientRole: 'ADMIN',
      relatedOrderId: null,
    });
  } catch (error) {
    console.error('Notification error:', error);
  }

  res.status(201).json({
    message: 'Seller request submitted successfully',
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      sellerStatus: user.sellerStatus
    }
  });
});

// Get all sellers (Admin only) - FIXED to get all sellers, not just pending
export const getAllSellers = asyncHandler(async (req, res) => {
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
      sellerPermissions: true,
      createdAt: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  res.json(sellers);
});

// Get pending seller requests (Admin only)
export const getPendingSellers = asyncHandler(async (req, res) => {
  const pendingSellers = await prisma.user.findMany({
    where: {
      sellerStatus: 'PENDING'
    },
    select: {
      id: true,
      name: true,
      email: true,
      businessName: true,
      createdAt: true,
      sellerStatus: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  res.json(pendingSellers);
});

// Update seller status (Admin only) - ENHANCED with permissions
export const updateSellerStatus = asyncHandler(async (req, res) => {
  const { sellerId } = req.params;
  const { status, permissions } = req.body;

  console.log('Updating seller status:', { sellerId, status, permissions });

  const seller = await prisma.user.findUnique({
    where: { id: parseInt(sellerId) }
  });

  if (!seller) {
    res.status(404);
    throw new Error('Seller not found');
  }

  // Update seller status and permissions
  const updatedSeller = await prisma.user.update({
    where: { id: parseInt(sellerId) },
    data: {
      sellerStatus: status.toUpperCase(),
      isActive: status.toUpperCase() === 'ACTIVE',
      // Store permissions as JSON string if provided
      ...(permissions && { sellerPermissions: JSON.stringify(permissions) })
    },
    select: {
      id: true,
      name: true,
      email: true,
      sellerStatus: true,
      isActive: true,
      businessName: true,
      sellerPermissions: true
    }
  });

  // Send email notification to seller
  try { 
    await sendSellerStatusEmail({
      email: updatedSeller.email,
      name: updatedSeller.name,
      status: updatedSeller.sellerStatus,
      permissions: updatedSeller.sellerPermissions ? JSON.parse(updatedSeller.sellerPermissions) : null
    });
  } catch (emailError) {
    console.error('Error sending seller status email:', emailError);
    // Don't fail if email fails
  }
  // Send notification to seller
  try {
    await notify({
      userId: seller.id,
      message: `Your seller status has been updated to: ${status}`,
      recipientRole: 'SELLER',
      relatedOrderId: null,
    });
  } catch (error) {
    console.error('Notification error:', error);
  }

  console.log('Seller status updated successfully');
  res.json(updatedSeller);

});

// Get seller's products (Seller only)
export const getSellerProducts = asyncHandler(async (req, res) => {
  const products = await prisma.product.findMany({
    where: {
      createdById: req.user.id
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  res.json(products);
});

// Get seller's customers (Seller only)
export const getSellerCustomers = asyncHandler(async (req, res) => {
  // Get customers who have bought from this seller (including guest customers)
  const orders = await prisma.order.findMany({
    where: {
      items: {
        some: {
          product: {
            createdById: req.user.id
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
          phone: true
        }
      }
    },
    distinct: ['userId', 'customerEmail'] // Include guest customers
  });

  // Combine registered users and guest customers
  const customers = [];
  const seenEmails = new Set();

  orders.forEach(order => {
    if (order.user) {
      // Registered user
      if (!customers.find(c => c.id === order.user.id)) {
        customers.push({
          id: order.user.id,
          name: order.user.name,
          email: order.user.email,
          phone: order.user.phone,
          isGuest: false
        });
      }
    } else if (order.customerEmail && !seenEmails.has(order.customerEmail)) {
      // Guest customer
      seenEmails.add(order.customerEmail);
      customers.push({
        id: `guest_${order.customerEmail}`, // Use email as identifier for guests
        name: order.customerName,
        email: order.customerEmail,
        phone: order.customerPhone,
        isGuest: true
      });
    }
  });
  
  res.json(customers);
});

// Update seller customer (Seller only)
export const updateSellerCustomer = asyncHandler(async (req, res) => {
  const { customerId } = req.params;
  const { name, email, phone } = req.body;

  // Verify this customer has bought from this seller
  const hasOrder = await prisma.order.findFirst({
    where: {
      userId: parseInt(customerId),
      items: {
        some: {
          product: {
            createdById: req.user.id
          }
        }
      }
    }
  });

  if (!hasOrder) {
    res.status(403);
    throw new Error('You can only update customers who have bought from you');
  }

  const updatedCustomer = await prisma.user.update({
    where: { id: parseInt(customerId) },
    data: {
      ...(name && { name }),
      ...(email && { email }),
      ...(phone && { phone })
    },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true
    }
  });

  res.json(updatedCustomer);
});

// Remove seller customer (Seller only)
export const removeSellerCustomer = asyncHandler(async (req, res) => {
  const { customerId } = req.params;

  // For safety, we don't actually delete the user, just remove the relationship
  // This could be implemented as blocking the customer or similar
  res.json({ message: 'Customer relationship removed' });
});

// Get seller's orders (Seller only)
export const getSellerOrders = asyncHandler(async (req, res) => {
  const orders = await prisma.order.findMany({
    where: {
      items: {
        some: {
          product: {
            createdById: req.user.id
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
            createdById: req.user.id
          }
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  res.json(orders);
});

// Get seller stats (Seller only)
export const getSellerStats = asyncHandler(async (req, res) => {
  const sellerId = req.user.id;

  // Get total products
  const totalProducts = await prisma.product.count({
    where: { createdById: sellerId }
  });

  // Get total orders containing seller's products
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

  // Get total revenue from seller's products
  const revenueResult = await prisma.orderItem.aggregate({
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

  const totalRevenue = revenueResult._sum.price || 0;

  // Get unique customers
  const uniqueCustomers = await prisma.order.findMany({
    where: {
      items: {
        some: {
          product: {
            createdById: sellerId
          }
        }
      }
    },
    select: {
      userId: true
    },
    distinct: ['userId']
  });

  res.json({
    totalProducts,
    totalOrders,
    totalRevenue,
    totalCustomers: uniqueCustomers.length
  });
});
