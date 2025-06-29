import asyncHandler from 'express-async-handler';
import prisma from '../prismaClient.js';
import { notify } from '../utils/notify.js';

export const createProduct = asyncHandler(async (req, res) => {
  const { name, description, price, stock, categoryId, coverImage, colors, sizes, assignedSellerId } = req.body;
  
  console.log('Creating product with data:', { name, description, price, stock, categoryId, coverImage, colors, sizes, assignedSellerId });
  console.log('Creating product for user:', req.user.id, 'Role:', req.user.role);
  
  // Validate required fields
  if (!name || !price || !stock || !categoryId) {
    res.status(400);
    throw new Error('Name, price, stock, and category are required');
  }
  
  const productCoverImage = coverImage || 'https://aannet.org/global_graphics/default-store-350x350.jpg';
  
  // Determine who will be the product owner
  let productOwnerId = req.user.id;
  
  // If admin assigns to a seller, use that seller's ID
  if (req.user.role.toLowerCase() === 'admin' && assignedSellerId) {
    const assignedSeller = await prisma.user.findUnique({
      where: { id: parseInt(assignedSellerId) },
      select: { id: true, role: true, sellerStatus: true, isActive: true }
    });
    
    if (!assignedSeller || assignedSeller.role.toLowerCase() !== 'seller') {
      res.status(400);
      throw new Error('Invalid seller assignment');
    }
    
    productOwnerId = assignedSeller.id;
    console.log('Admin assigning product to seller:', productOwnerId);
  }
  
  // If admin is creating for themselves, auto-approve them as seller
  if (req.user.role.toLowerCase() === 'admin' && !assignedSellerId) {
    console.log('Admin creating product for themselves - auto-approve as active seller');
    await prisma.user.update({
      where: { id: req.user.id },
      data: {
        role: 'ADMIN', // Keep admin role
        sellerStatus: 'ACTIVE',
        isActive: true
      }
    });
  }
  
  // Check if the product owner (seller) is active
  const productOwner = await prisma.user.findUnique({
    where: { id: productOwnerId },
    select: { sellerStatus: true, isActive: true, role: true }
  });
  
  // For non-admin users, check seller status
  if (productOwner.role.toLowerCase() === 'seller' && req.user.role.toLowerCase() !== 'admin') {
    if (productOwner.sellerStatus !== 'ACTIVE' || !productOwner.isActive) {
      res.status(403);
      throw new Error('Seller account is not active. Please contact admin.');
    }
  }
  
  // Ensure colors and sizes are arrays
  const productColors = Array.isArray(colors) ? colors : (colors ? [colors] : []);
  const productSizes = Array.isArray(sizes) ? sizes : (sizes ? [sizes] : []);
  
  try {
    const product = await prisma.product.create({
      data: {
        name: String(name),
        description: description ? String(description) : null,
        price: parseFloat(price),
        stock: parseInt(stock),
        categoryId: parseInt(categoryId),
        coverImage: productCoverImage,
        createdById: productOwnerId,
        colors: productColors,
        sizes: productSizes,
        isVisible: true,
      },
      include: {
        category: true,
        createdBy: {
          select: {
            id: true,
            name: true,
            businessName: true
          }
        }
      }
    });
    
    console.log('✅ Product created successfully:', product.id);
    
    await notify({
      userId: req.user.id,
      title: 'Product Created',
      message: `New product "${name}" has been created.`,
      recipientRole: 'ADMIN',
      relatedOrderId: null,
    });

    res.status(201).json(product);
  } catch (error) {
    console.error('❌ Error creating product:', error);
    res.status(500);
    throw new Error('Failed to create product: ' + error.message);
  }
});

export const getProducts = asyncHandler(async (req, res) => {
  console.log('🔍 Getting products - User:', req.user?.id, 'Role:', req.user?.role);
  
  try {
    // If it's a seller requesting, show ONLY their products
    if (req.user && req.user.role.toLowerCase() === 'seller') {
      console.log('📦 Fetching products for seller:', req.user.id);
      const products = await prisma.product.findMany({
        where: {
          createdById: req.user.id
        },
        include: { 
          category: true,
          createdBy: {
            select: {
              id: true,
              name: true,
              businessName: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });
      console.log('✅ Seller products found:', products.length);
      return res.json(products);
    }

    // For public/admin access - return visible products from active sellers
    console.log('🌐 Fetching public products');
    const products = await prisma.product.findMany({
      where: {
        isVisible: true,
        createdBy: {
          isActive: true
        }
      },
      include: { 
        category: true,
        createdBy: {
          select: {
            id: true,
            name: true,
            businessName: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    console.log('✅ Public products found:', products.length);
    res.json(products);
  } catch (error) {
    console.error('❌ Error fetching products:', error);
    res.status(500);
    throw new Error('Failed to fetch products');
  }
});

export const getProductById = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  console.log('🔍 getProductById called with ID:', id, 'User:', req.user?.id, 'Role:', req.user?.role);
  
  if (isNaN(id)) {
    res.status(400);
    throw new Error('Invalid product ID');
  }
  
  try {
    const product = await prisma.product.findUnique({
      where: { id },
      include: { 
        category: true,
        createdBy: {
          select: {
            id: true,
            name: true,
            businessName: true,
            sellerStatus: true,
            isActive: true
          }
        }
      },
    });

    console.log('📦 Product found:', !!product);
    if (product) {
      console.log('📋 Product details:', {
        id: product.id,
        name: product.name,
        isVisible: product.isVisible,
        createdById: product.createdById,
        sellerStatus: product.createdBy?.sellerStatus,
        sellerActive: product.createdBy?.isActive
      });
    }

    if (!product) {
      console.log('❌ Product not found in database');
      res.status(404);
      throw new Error('Product not found');
    }

    if (req.user && req.user.role.toLowerCase() === 'seller' && product.createdById === req.user.id) {
      console.log('✅ Seller accessing own product');
      return res.json(product);
    }

    if (req.user && req.user.role.toLowerCase() === 'admin') {
      console.log('✅ Admin accessing product');
      return res.json(product);
    }

    if (!product.isVisible) {
      console.log('❌ Product not visible to public');
      res.status(404);
      throw new Error('Product not available');
    }

    if (product.createdBy && (!product.createdBy.isActive || product.createdBy.sellerStatus !== 'ACTIVE')) {
      console.log('❌ Product seller not active');
      res.status(404);
      throw new Error('Product not available');
    }

    console.log('✅ Product available for public access');
    res.json(product);
  } catch (error) {
    console.error('Error fetching product by ID:', error);
    if (error.message.includes('not found') || error.message.includes('not available')) {
      res.status(404);
      throw error;
    }
    res.status(500);
    throw new Error('Failed to fetch product');
  }
});

export const updateProduct = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  
  console.log('Update Product Debug:');
  console.log('Product ID:', id);
  console.log('User ID:', req.user.id);
  console.log('User Role:', req.user.role);
  
  if (isNaN(id)) {
    res.status(400);
    throw new Error('Invalid product ID');
  }
  
  try {
    const product = await prisma.product.findUnique({ 
      where: { id },
      include: {
        createdBy: {
          select: {
            id: true,
            sellerStatus: true,
            isActive: true
          }
        }
      }
    });

    if (!product) {
      console.log('Product not found');
      res.status(404);
      throw new Error('Product not found');
    }

    console.log('Product createdById:', product.createdById);
    console.log('User owns product?', product.createdById === req.user.id);
    console.log('User is admin?', req.user.role.toLowerCase() === 'admin');

    const userOwnsProduct = product.createdById === req.user.id;
    const userIsAdmin = req.user.role.toLowerCase() === 'admin';
    
    if (!userOwnsProduct && !userIsAdmin) {
      console.log('Authorization failed - user does not own product and is not admin');
      res.status(403);
      throw new Error('Not authorized to update this product');
    }

    if (userOwnsProduct && req.user.role.toLowerCase() === 'seller') {
      if (product.createdBy?.sellerStatus !== 'ACTIVE' || !product.createdBy?.isActive) {
        res.status(403);
        throw new Error('Your seller account is not active. Cannot update products.');
      }
    }

    console.log('Authorization passed, updating product');

    const productColors = Array.isArray(req.body.colors) ? req.body.colors : (req.body.colors ? [req.body.colors] : []);
    const productSizes = Array.isArray(req.body.sizes) ? req.body.sizes : (req.body.sizes ? [req.body.sizes] : []);

    const updated = await prisma.product.update({
      where: { id },
      data: {
        name: req.body.name ? String(req.body.name) : undefined,
        description: req.body.description ? String(req.body.description) : undefined,
        price: req.body.price ? parseFloat(req.body.price) : undefined,
        stock: req.body.stock ? parseInt(req.body.stock) : undefined,
        coverImage: req.body.coverImage || undefined,
        categoryId: req.body.categoryId ? parseInt(req.body.categoryId) : undefined,
        colors: productColors,
        sizes: productSizes,
      },
      include: {
        category: true,
        createdBy: {
          select: {
            id: true,
            name: true,
            businessName: true
          }
        }
      }
    });

    await notify({
      userId: req.user.id,
      title: 'Product Updated',
      message: `Product "${updated.name}" has been updated.`,
      recipientRole: 'ADMIN',
      relatedOrderId: null,
    });

    res.json(updated);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500);
    throw new Error('Failed to update product: ' + error.message);
  }
});

export const deleteProduct = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  
  console.log('Delete Product Debug:');
  console.log('Product ID:', id);
  console.log('User ID:', req.user.id);
  console.log('User Role:', req.user.role);
  
  if (isNaN(id)) {
    res.status(400);
    throw new Error('Invalid product ID');
  }
  
  try {
    const product = await prisma.product.findUnique({ 
      where: { id },
      include: {
        createdBy: {
          select: {
            id: true,
            sellerStatus: true,
            isActive: true
          }
        }
      }
    });

    if (!product) {
      console.log('Product not found');
      res.status(404);
      throw new Error('Product not found');
    }

    console.log('Product createdById:', product.createdById);
    
    // Check if user owns the product OR is an admin
    const userOwnsProduct = product.createdById === req.user.id;
    const userIsAdmin = req.user.role.toLowerCase() === 'admin';
    
    if (!userOwnsProduct && !userIsAdmin) {
      console.log('Authorization failed - user does not own product and is not admin');
      res.status(403);
      throw new Error('Not authorized to delete this product');
    }

    console.log('Authorization passed, deleting product');

    await prisma.product.delete({ where: { id } });

    await notify({
      userId: req.user.id,
      title: 'Product Deleted',
      message: `Product "${product.name}" has been deleted.`,
      recipientRole: 'ADMIN',
      relatedOrderId: null,
    });

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500);
    throw new Error('Failed to delete product: ' + error.message);
  }
});
