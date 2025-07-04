// Category Routes
import express from 'express';
import {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
  getProductsByCategory
} from '../controllers/categoryController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const categoryRouter = express.Router();
categoryRouter.route('/')
  .post(protect, authorizeRoles('admin','seller'), createCategory)
  .get(getAllCategories);
categoryRouter.route('/:id')
  .get(getCategoryById)
  .put(protect, authorizeRoles('admin','seller'), updateCategory)
  .delete(protect, authorizeRoles('admin','seller'), deleteCategory);
categoryRouter.route('/:id/products')
  .get(getProductsByCategory);
export default categoryRouter;