import express from 'express';
import multer from 'multer';
import * as uploadController from '../controllers/upload.controller.js';
import { authenticate } from '../utils/auth.middleware.js';

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post('/upload', authenticate, upload.single('file'), uploadController.upload);

export default router;
