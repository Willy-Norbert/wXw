
import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import prisma from '../prismaClient.js';
import dotenv from 'dotenv';

dotenv.config();

// Middleware to protect routes
export const protect = asyncHandler(async (req, res, next) => {
  let token;

  console.log('Auth middleware: Checking authorization header');
  console.log('Authorization header:', req.headers.authorization);

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      console.log('Auth middleware: Token extracted, length:', token.length);
      
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('Auth middleware: Token decoded successfully, user ID:', decoded.id);

      // Add retry logic for database connection
      let user = null;
      let retries = 3;
      
      while (retries > 0 && !user) {
        try {
          user = await prisma.user.findUnique({
            where: { id: decoded.id },
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
              sellerStatus: true,
              isActive: true,
            },
          });
          break;
        } catch (dbError) {
          console.log(`Database connection attempt ${4 - retries} failed:`, dbError.message);
          retries--;
          if (retries > 0) {
            await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
          }
        }
      }

      if (!user) {
        console.log('Auth middleware: User not found in database after retries');
        res.status(401);
        throw new Error('User not found or database connection failed');
      }

      console.log('Auth middleware: User found:', user.email, 'Role:', user.role);
      req.user = user;
      next();
    } catch (error) {
      console.error('Auth middleware: JWT error:', error.message);
      res.status(401);
      throw new Error('Not authorized, token failed');
    }
  } else {
    console.log('Auth middleware: No authorization header found');
    res.status(401);
    throw new Error('Not authorized, no token');
  }
});

// Role-based access control
export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    const userRole = req.user.role?.toLowerCase();
    const allowedRoles = roles.map(r => r.toLowerCase());

    console.log('Role authorization check:');
    console.log('User role:', userRole);
    console.log('Allowed roles:', allowedRoles);
    console.log('User details:', {
      id: req.user.id,
      email: req.user.email,
      role: req.user.role,
      sellerStatus: req.user.sellerStatus,
      isActive: req.user.isActive
    });

    // Special check for sellers - they must be active
    if (userRole === 'seller') {
      if (req.user.sellerStatus !== 'ACTIVE' || !req.user.isActive) {
        console.log('Seller not active:', {
          sellerStatus: req.user.sellerStatus,
          isActive: req.user.isActive
        });
        res.status(403);
        throw new Error('Your seller account is not active. Please wait for admin approval.');
      }
    }

    if (!allowedRoles.includes(userRole)) {
      console.log('Role authorization failed');
      res.status(403);
      throw new Error(`Role (${req.user.role}) not authorized`);
    }
    
    console.log('Role authorization passed');
    next();
  };
};

// Middleware specifically for checking seller status
export const checkSellerStatus = asyncHandler(async (req, res, next) => {
  const user = req.user;
  
  if (user.role?.toLowerCase() === 'seller') {
    if (user.sellerStatus !== 'ACTIVE' || !user.isActive) {
      console.log('Seller access blocked:', {
        userId: user.id,
        sellerStatus: user.sellerStatus,
        isActive: user.isActive
      });
      
      res.status(403).json({
        message: 'Your seller account is not active. Please wait for admin approval.',
        sellerStatus: user.sellerStatus,
        isActive: user.isActive,
        restricted: true
      });
      return;
    }
  }
  
  next();
});

// Error handler middleware
export const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack,
  });
};
export const optionalProtect = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await prisma.user.findUnique({ where: { id: decoded.id } });
      if (user) req.user = user;
    } catch (error) {
      console.log('optionalProtect: invalid token, ignoring');
    }
  }
  next();
});
