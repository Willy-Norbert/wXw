
import express from 'express';
import {
  createReview,
  getReviews,
  updateReview,
  deleteReview,
  getAllReviews
} from '../controllers/reviewController.js';
import { protect } from '../middleware/authMiddleware.js';

const reviewRouter = express.Router({ mergeParams: true });

// Routes for specific product reviews
reviewRouter.route('/')
  .get(getReviews)
  .post(protect, createReview);

reviewRouter.route('/:id')
  .put(protect, updateReview)
  .delete(protect, deleteReview);

// Route for getting all reviews (for admin dashboard)
reviewRouter.get('/all', getAllReviews);

export default reviewRouter;
