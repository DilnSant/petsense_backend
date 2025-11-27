import * as uploadService from '../services/upload.service.js';

export const upload = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const file = await uploadService.uploadFile(req.file);
        res.status(201).json(file);
    } catch (error) {
        next(error);
    }
};
