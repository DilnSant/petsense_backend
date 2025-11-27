import pkg from '@prisma/client';
const { PrismaClient } = pkg;

const prisma = new PrismaClient();

export const createProvider = async (userId, data) => {
    const { type, name, description, phone, latitude, longitude } = data;

    // Create provider
    const provider = await prisma.provider.create({
        data: {
            userId,
            type,
            name,
            description,
            phone,
            latitude,
            longitude,
        },
    });

    // Update PostGIS location
    if (latitude && longitude) {
        await prisma.$executeRaw`
      UPDATE "Provider"
      SET location = ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)
      WHERE id = ${provider.id}
    `;
    }

    return provider;
};

export const getProviderById = async (id) => {
    return prisma.provider.findUnique({
        where: { id },
        include: {
            services: true,
            reviews: {
                take: 5,
                orderBy: { createdAt: 'desc' },
            },
        },
    });
};

export const updateProvider = async (id, userId, data) => {
    const provider = await prisma.provider.findUnique({ where: { id } });

    if (!provider) {
        throw new Error('Provider not found');
    }

    if (provider.userId !== userId) {
        throw new Error('Unauthorized');
    }

    const { latitude, longitude, ...rest } = data;

    const updatedProvider = await prisma.provider.update({
        where: { id },
        data: {
            ...rest,
            latitude,
            longitude,
        },
    });

    if (latitude && longitude) {
        await prisma.$executeRaw`
      UPDATE "Provider"
      SET location = ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)
      WHERE id = ${id}
    `;
    }

    return updatedProvider;
};

export const findProviders = async (filters) => {
    const { type, lat, lng, radius = 5000 } = filters;

    if (lat && lng) {
        // PostGIS query
        // Note: Prisma doesn't support PostGIS directly in findMany, so we use raw query or just fetch all and filter (bad for perf)
        // or use raw query to get IDs and then fetch.
        // Let's use raw query to get providers within radius.

        const providers = await prisma.$queryRaw`
      SELECT id, "userId", type, name, description, phone, latitude, longitude, rating, "reviewCount", "isVerified",
             ST_Distance(location, ST_SetSRID(ST_MakePoint(${parseFloat(lng)}, ${parseFloat(lat)}), 4326)) as distance
      FROM "Provider"
      WHERE ST_DWithin(location, ST_SetSRID(ST_MakePoint(${parseFloat(lng)}, ${parseFloat(lat)}), 4326), ${parseFloat(radius)})
      ${type ? Prisma.sql`AND type = ${type}::"ProviderType"` : Prisma.empty}
      ORDER BY distance ASC
    `;

        return providers;
    }

    // Standard filter
    return prisma.provider.findMany({
        where: {
            type: type ? type : undefined,
        },
    });
};
