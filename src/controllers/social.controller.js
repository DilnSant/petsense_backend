import * as socialService from '../services/social.service.js';

// Reviews
export const createReview = async (req, res, next) => {
    try {
        const review = await socialService.createReview(req.user.id, req.body);
        res.status(201).json(review);
    } catch (error) {
        next(error);
    }
};

export const getReviews = async (req, res, next) => {
    try {
        const reviews = await socialService.getReviews(req.params.providerId);
        res.json(reviews);
    } catch (error) {
        next(error);
    }
};

// Favorites
export const addFavorite = async (req, res, next) => {
    try {
        const favorite = await socialService.addFavorite(req.user.id, req.body.providerId);
        res.status(201).json(favorite);
    } catch (error) {
        next(error);
    }
};

export const getFavorites = async (req, res, next) => {
    try {
        const favorites = await socialService.getFavorites(req.params.userId); // Or req.user.id if self
        res.json(favorites);
    } catch (error) {
        next(error);
    }
};

export const removeFavorite = async (req, res, next) => {
    try {
        await socialService.removeFavorite(req.user.id, req.params.providerId);
        res.status(204).send();
    } catch (error) {
        next(error);
    }
};
