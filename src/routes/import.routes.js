import express from 'express';
import multer from 'multer';
import * as importController from '../controllers/import.controller.js';
import { authenticate, authorize } from '../utils/auth.middleware.js';

const router = express.Router();
const upload = multer({ dest: 'uploads/' }); // Use disk storage for large CSVs

router.post('/csv', authenticate, authorize('ADMIN'), upload.single('file'), importController.triggerImport);

export default router;
