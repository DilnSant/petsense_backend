import pkg from '@prisma/client';
const { PrismaClient } = pkg;
const prisma = new PrismaClient();

// Reviews
export const createReview = async (userId, data) => {
    const { providerId, rating, comment } = data;

    const review = await prisma.review.create({
        data: {
            userId,
            providerId,
            rating,
            comment,
        },
    });

    // Update provider rating
    const aggregates = await prisma.review.aggregate({
        where: { providerId },
        _avg: { rating: true },
        _count: { rating: true },
    });

    await prisma.provider.update({
        where: { id: providerId },
        data: {
            rating: aggregates._avg.rating || 0,
            reviewCount: aggregates._count.rating || 0,
        },
    });

    return review;
};

export const getReviews = async (providerId) => {
    return prisma.review.findMany({
        where: { providerId },
        include: { user: { select: { profile: { select: { name: true, avatarUrl: true } } } } },
        orderBy: { createdAt: 'desc' },
    });
};

// Favorites
export const addFavorite = async (userId, providerId) => {
    return prisma.favorite.create({
        data: { userId, providerId },
    });
};

export const getFavorites = async (userId) => {
    return prisma.favorite.findMany({
        where: { userId },
        include: { provider: true },
    });
};

export const removeFavorite = async (userId, providerId) => {
    // We need to find the favorite entry first or deleteMany
    return prisma.favorite.deleteMany({
        where: { userId, providerId },
    });
};
