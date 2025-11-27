import * as authService from '../services/auth.service.js';

export const register = async (req, res, next) => {
    try {
        const tokens = await authService.register(req.body);
        res.status(201).json(tokens);
    } catch (error) {
        if (error.message === 'User already exists') {
            return res.status(409).json({ error: error.message });
        }
        next(error);
    }
};

export const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const tokens = await authService.login(email, password);
        res.json(tokens);
    } catch (error) {
        if (error.message === 'Invalid credentials') {
            return res.status(401).json({ error: error.message });
        }
        next(error);
    }
};

export const refresh = async (req, res, next) => {
    try {
        const { refreshToken } = req.body;
        const tokens = await authService.refresh(refreshToken);
        res.json(tokens);
    } catch (error) {
        res.status(401).json({ error: error.message });
    }
};
