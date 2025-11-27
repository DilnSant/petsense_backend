import pkg from '@prisma/client';
const { PrismaClient } = pkg;

const prisma = new PrismaClient();

export const createService = async (providerId, data) => {
    return prisma.service.create({
        data: {
            providerId,
            ...data,
        },
    });
};

export const updateService = async (id, providerId, data) => {
    const service = await prisma.service.findUnique({ where: { id } });
    if (!service || service.providerId !== providerId) {
        throw new Error('Unauthorized or Service not found');
    }

    return prisma.service.update({
        where: { id },
        data,
    });
};

export const getServicesByProvider = async (providerId) => {
    return prisma.service.findMany({
        where: { providerId },
    });
};
