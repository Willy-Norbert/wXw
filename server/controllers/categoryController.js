import asyncHandler from 'express-async-handler';
import prisma from '../prismaClient.js'; // your PrismaClient instance
import generateToken from '../utils/generateToken.js';
import bcrypt from 'bcryptjs';

// Create Category
export const createCategory = asyncHandler(async (req, res) => {
  const { name, description } = req.body;

  const existing = await prisma.category.findUnique({ where: { name } });
  if (existing) {
    res.status(400);
    throw new Error('Category already exists');
  }

  const category = await prisma.category.create({ data: { name, description } });
  res.status(201).json(category);
});

// Get All Categories
export const getAllCategories = asyncHandler(async (req, res) => {
  const categories = await prisma.category.findMany();
  res.json(categories);
});

// Get Category By ID
export const getCategoryById = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const category = await prisma.category.findUnique({ where: { id } });
  if (!category) {
    res.status(404);
    throw new Error('Category not found');
  }
  res.json(category);
});

// Update Category
export const updateCategory = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const { name, description } = req.body;

  const category = await prisma.category.update({
    where: { id },
    data: { name, description }
  }).catch(() => null);

  if (!category) {
    res.status(404);
    throw new Error('Category not found');
  }

  res.json(category);
});

// Delete Category
export const deleteCategory = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);

  // Check if category exists
  const category = await prisma.category.findUnique({ where: { id } });
  if (!category) {
    res.status(404);
    throw new Error('Category not found');
  }

  // Check if products use this category
  const products = await prisma.product.findMany({ where: { categoryId: id } });
  if (products.length > 0) {
    res.status(400);
    throw new Error('Cannot delete category with assigned products');
  }

  await prisma.category.delete({ where: { id } });
  res.json({ message: 'Category deleted' });
});

// Get Products by Category ID
export const getProductsByCategory = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);

  const products = await prisma.product.findMany({
    where: { categoryId: id },
    include: { category: true }
  });

  res.json(products);
});
