import express from 'express';
import * as socialController from '../controllers/social.controller.js';
import { authenticate } from '../utils/auth.middleware.js';

const router = express.Router();

// Reviews
router.post('/reviews', authenticate, socialController.createReview);
router.get('/providers/:providerId/reviews', socialController.getReviews);

// Favorites
router.post('/users/:id/favorites', authenticate, socialController.addFavorite);
router.get('/users/:id/favorites', authenticate, socialController.getFavorites);
router.delete('/users/:id/favorites/:providerId', authenticate, socialController.removeFavorite);

export default router;
