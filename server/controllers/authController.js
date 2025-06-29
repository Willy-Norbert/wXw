import asyncHandler from 'express-async-handler';
import prisma from '../prismaClient.js';
import generateToken from '../utils/generateToken.js';
import bcrypt from 'bcryptjs';
import { notify } from '../utils/notify.js';

// Register User
export const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  const userExists = await prisma.user.findUnique({ where: { email } });
  if (userExists) {
    res.status(400);
    throw new Error('User already exists');
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role: role.toUpperCase(),
    }
  });

  try {
    await notify({
      userId: null,
      message: `New user registered: ${user.name} (${user.role})`,
      recipientRole: 'ADMIN',
      relatedOrderId: null,
    });
  } catch (error) {
    console.error('Notification error:', error);
  }

  if (user) {
    res.status(201).json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      sellerStatus: user.sellerStatus,
      token: generateToken(user.id, user.role),
    });
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
});

// Login User
export const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });

  if (user && (await bcrypt.compare(password, user.password))) {
    console.log('🟢 Login user:', {
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      sellerStatus: user.sellerStatus,
    });

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      sellerStatus: user.sellerStatus,
      token: generateToken(user.id, user.role),
    });
  } else {
    res.status(401);
    throw new Error('Invalid email or password');
  }
});

// Verify token endpoint
export const verifyToken = asyncHandler(async (req, res) => {
  const dbUser = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      sellerStatus: true
    }
  });

  if (!dbUser) {
    res.status(404);
    throw new Error('User not found');
  }

  console.log('🟢 Verified token for user:', dbUser);

  res.json({ success: true, user: dbUser });
});

// Get user profile
export const getUserProfile = asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      phone: true,
      address: true,
      bio: true,
      company: true,
      createdAt: true,
      isActive: true,
      sellerStatus: true
    }
  });

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  res.json(user);
});

// Update user profile
export const updateUserProfile = asyncHandler(async (req, res) => {
  const { name, email, phone, address, bio, company } = req.body;

  const user = await prisma.user.findUnique({
    where: { id: req.user.id }
  });

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  if (email && email !== user.email) {
    const emailExists = await prisma.user.findUnique({
      where: { email }
    });
    if (emailExists) {
      res.status(400);
      throw new Error('Email already exists');
    }
  }

  const updatedUser = await prisma.user.update({
    where: { id: req.user.id },
    data: {
      ...(name && { name }),
      ...(email && { email }),
      ...(phone && { phone }),
      ...(address && { address }),
      ...(bio && { bio }),
      ...(company && { company })
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      phone: true,
      address: true,
      bio: true,
      company: true,
      isActive: true,
      sellerStatus: true
    }
  });

  res.json(updatedUser);
});

// Get single user (Admin only)
export const getUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  console.log('Getting user:', userId);

  const user = await prisma.user.findUnique({
    where: { id: parseInt(userId) },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      phone: true,
      address: true,
      bio: true,
      company: true,
      isActive: true,
      sellerStatus: true,
      businessName: true,
      createdAt: true
    }
  });

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  console.log('User found successfully');
  res.json(user);
});

// Create user (Admin only)
export const createUser = asyncHandler(async (req, res) => {
  const { name, email, password, role, phone, address, bio, company } = req.body;

  console.log('Creating user:', email);

  const userExists = await prisma.user.findUnique({ where: { email } });
  if (userExists) {
    res.status(400);
    throw new Error('User already exists');
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role: role.toUpperCase(),
      ...(phone && { phone }),
      ...(address && { address }),
      ...(bio && { bio }),
      ...(company && { company })
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      phone: true,
      address: true,
      bio: true,
      company: true,
      isActive: true,
      sellerStatus: true,
      businessName: true,
      createdAt: true
    }
  });

  console.log('User created successfully');
  res.status(201).json(user);
});

// Get all users (Admin only)
export const getAllUsers = asyncHandler(async (req, res) => {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      phone: true,
      isActive: true,
      sellerStatus: true,
      businessName: true,
      createdAt: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  res.status(200).json(users);
});

// Delete user (Admin only)
export const deleteUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  console.log('Deleting user:', userId);

  const user = await prisma.user.findUnique({
    where: { id: parseInt(userId) }
  });

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  if (user.role === 'ADMIN') {
    res.status(403);
    throw new Error('Cannot delete admin users');
  }

  await prisma.user.delete({
    where: { id: parseInt(userId) }
  });

  console.log('User deleted successfully');
  res.json({ message: 'User deleted successfully' });
});

// Update user (Admin only)
export const updateUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { name, email, role, isActive } = req.body;

  console.log('Updating user:', userId, req.body);

  const user = await prisma.user.findUnique({
    where: { id: parseInt(userId) }
  });

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  if (email && email !== user.email) {
    const emailExists = await prisma.user.findUnique({
      where: { email }
    });
    if (emailExists) {
      res.status(400);
      throw new Error('Email already exists');
    }
  }

  const updatedUser = await prisma.user.update({
    where: { id: parseInt(userId) },
    data: {
      ...(name && { name }),
      ...(email && { email }),
      ...(role && { role: role.toUpperCase() }),
      ...(typeof isActive === 'boolean' && { isActive })
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      phone: true,
      isActive: true,
      sellerStatus: true,
      businessName: true,
      createdAt: true
    }
  });

  console.log('User updated successfully');
  res.json(updatedUser);
});

// Logout User
export const logoutUser = (req, res) => {
  res.cookie('token', '', { httpOnly: true, expires: new Date(0) });
  res.status(200).json({ message: 'Logged out successfully' });
};
