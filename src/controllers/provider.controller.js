import * as providerService from '../services/provider.service.js';

export const create = async (req, res, next) => {
    try {
        const provider = await providerService.createProvider(req.user.id, req.body);
        res.status(201).json(provider);
    } catch (error) {
        next(error);
    }
};

export const getById = async (req, res, next) => {
    try {
        const provider = await providerService.getProviderById(req.params.id);
        if (!provider) {
            return res.status(404).json({ error: 'Provider not found' });
        }
        res.json(provider);
    } catch (error) {
        next(error);
    }
};

export const update = async (req, res, next) => {
    try {
        const provider = await providerService.updateProvider(req.params.id, req.user.id, req.body);
        res.json(provider);
    } catch (error) {
        if (error.message === 'Unauthorized') {
            return res.status(403).json({ error: error.message });
        }
        next(error);
    }
};

export const list = async (req, res, next) => {
    try {
        const providers = await providerService.findProviders(req.query);
        res.json(providers);
    } catch (error) {
        next(error);
    }
};
