import asyncHandler from 'express-async-handler';
import prisma from '../prismaClient.js';

export const checkSellerPermission = (requiredPermission) => {
  return asyncHandler(async (req, res, next) => {
    // Only apply to sellers
    if (req.user.role.toLowerCase() !== 'seller') {
      return next();
    }

    const seller = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { sellerPermissions: true, sellerStatus: true }
    });

    if (!seller || seller.sellerStatus !== 'ACTIVE') {
      res.status(403);
      throw new Error('Seller account is not active');
    }

    let permissions = {};
    if (seller.sellerPermissions) {
      try {
        permissions = JSON.parse(seller.sellerPermissions);
      } catch (error) {
        console.error('Error parsing seller permissions:', error);
        res.status(403);
        throw new Error('Invalid seller permissions');
      }
    }

    if (!permissions[requiredPermission]) {
      res.status(403);
      throw new Error(`Permission denied: ${requiredPermission} not granted`);
    }

    // Store permissions in request for later use
    req.sellerPermissions = permissions;
    next();
  });
};