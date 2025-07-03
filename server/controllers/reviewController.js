
import asyncHandler from 'express-async-handler';
import prisma from '../prismaClient.js';
import { notify } from '../utils/notify.js';

export const createReview = asyncHandler(async (req, res) => {
  const productId = Number(req.params.productId);
  const { rating, comment } = req.body;

  console.log('Creating review for product:', productId, 'by user:', req.user.id);

  // Check if product exists
  const product = await prisma.product.findUnique({
    where: { id: productId }
  });

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  // Check if user already reviewed this product
  const existing = await prisma.review.findFirst({
    where: {
      productId,
      userId: req.user.id,
    },
  });

  if (existing) {
    res.status(400);
    throw new Error('You have already reviewed this product');
  }

  // Create review
  const review = await prisma.review.create({
    data: {
      rating: Number(rating),
      comment,
      productId,
      userId: req.user.id,
    },
    include: {
      user: { select: { name: true } }
    }
  });

  // Update product average rating and review count
  const reviews = await prisma.review.findMany({ where: { productId } });
  const average = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

  await prisma.product.update({
    where: { id: productId },
    data: {
      averageRating: average,
      numReviews: reviews.length,
    },
  });

  console.log('Review created successfully:', review.id);

  // Notify admin of new review
  await notify({
    userId: req.user.id,
    message: `New review added to product "${product.name}" by ${req.user.name}.`,
    recipientRole: 'ADMIN',
    relatedOrderId: null,
  });

  res.status(201).json(review);
});

export const getReviews = asyncHandler(async (req, res) => {
  const productId = Number(req.params.productId);
  
  console.log('Getting reviews for product:', productId);
  
  const reviews = await prisma.review.findMany({
    where: { productId },
    include: { user: { select: { name: true } } },
    orderBy: { createdAt: 'desc' }
  });
  
  console.log('Reviews found:', reviews.length);
  res.json(reviews);
});

export const updateReview = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const { rating, comment } = req.body;

  console.log('Updating review:', id);

  const review = await prisma.review.findUnique({ 
    where: { id },
    include: { product: true }
  });

  if (!review || review.userId !== req.user.id) {
    res.status(403);
    throw new Error('Not authorized or review not found');
  }

  const updated = await prisma.review.update({
    where: { id },
    data: { 
      rating: Number(rating), 
      comment 
    },
    include: {
      user: { select: { name: true } }
    }
  });

  // Update product average rating
  const reviews = await prisma.review.findMany({ where: { productId: review.productId } });
  const average = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

  await prisma.product.update({
    where: { id: review.productId },
    data: {
      averageRating: average,
      numReviews: reviews.length,
    },
  });

  console.log('Review updated successfully');

  // Notify admin of review update
  await notify({
    userId: req.user.id,
    message: `Review updated on product "${review.product.name}" by ${req.user.name}.`,
    recipientRole: 'ADMIN',
    relatedOrderId: null,
  });

  res.json(updated);
});

export const deleteReview = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  
  console.log('Deleting review:', id);
  
  const review = await prisma.review.findUnique({ 
    where: { id },
    include: { product: true }
  });

  if (!review || review.userId !== req.user.id) {
    res.status(403);
    throw new Error('Not authorized or review not found');
  }

  await prisma.review.delete({ where: { id } });

  // Update product average rating
  const reviews = await prisma.review.findMany({ where: { productId: review.productId } });
  const average = reviews.length
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  await prisma.product.update({
    where: { id: review.productId },
    data: {
      averageRating: average,
      numReviews: reviews.length,
    },
  });

  console.log('Review deleted successfully');

  // Notify admin of review deletion
  await notify({
    userId: req.user.id,
    message: `Review deleted from product "${review.product.name}" by ${req.user.name}.`,
    recipientRole: 'ADMIN',
    relatedOrderId: null,
  });

  res.json({ message: 'Review deleted' });
});

// Get all reviews for admin dashboard
export const getAllReviews = asyncHandler(async (req, res) => {
  console.log('Getting all reviews for admin dashboard');
  
  const reviews = await prisma.review.findMany({
    include: { 
      user: { select: { name: true } },
      product: { select: { name: true } }
    },
    orderBy: { createdAt: 'desc' }
  });
  
  console.log('All reviews found:', reviews.length);
  res.json(reviews);
});
