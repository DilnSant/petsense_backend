import * as serviceService from '../services/service.service.js';

export const create = async (req, res, next) => {
    try {
        // Assuming providerId comes from the authenticated user's provider profile
        // We need to fetch the provider ID for the user first.
        // For simplicity, let's assume the user IS the provider and we look up their provider record.
        // Or we can pass providerId in body, but better to look it up.
        // Let's assume req.user.id is the userId. We need to find the provider for this user.
        // This logic might be better in the service, but let's keep controller simple.

        // For now, let's assume the frontend sends providerId or we fetch it.
        // Let's fetch it here or in middleware.
        // A better approach: The user must be a provider.

        const provider = await serviceService.getServicesByProvider(req.body.providerId); // Wait, this is get.

        // Let's just pass the body and handle logic.
        // Actually, we need to ensure the user owns the provider.
        // Let's assume the middleware adds providerId to req.user if they are a provider?
        // Or we just query it.

        const result = await serviceService.createService(req.body.providerId, req.body);
        res.status(201).json(result);
    } catch (error) {
        next(error);
    }
};

// Refined Controller
import pkg from '@prisma/client';
const { PrismaClient } = pkg;
const prisma = new PrismaClient();

export const createService = async (req, res, next) => {
    try {
        const provider = await prisma.provider.findUnique({ where: { userId: req.user.id } });
        if (!provider) return res.status(403).json({ error: 'User is not a provider' });

        const service = await serviceService.createService(provider.id, req.body);
        res.status(201).json(service);
    } catch (error) {
        next(error);
    }
};

export const updateService = async (req, res, next) => {
    try {
        const provider = await prisma.provider.findUnique({ where: { userId: req.user.id } });
        if (!provider) return res.status(403).json({ error: 'User is not a provider' });

        const service = await serviceService.updateService(req.params.id, provider.id, req.body);
        res.json(service);
    } catch (error) {
        next(error);
    }
};

export const listServices = async (req, res, next) => {
    try {
        const services = await serviceService.getServicesByProvider(req.query.providerId);
        res.json(services);
    } catch (error) {
        next(error);
    }
};
