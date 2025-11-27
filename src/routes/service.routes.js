import express from 'express';
import * as serviceController from '../controllers/service.controller.js';
import { authenticate, authorize } from '../utils/auth.middleware.js';

const router = express.Router();

router.get('/', serviceController.listServices);
router.post('/', authenticate, authorize(['PROVIDER', 'ADMIN']), serviceController.createService);
router.put('/:id', authenticate, authorize(['PROVIDER', 'ADMIN']), serviceController.updateService);

export default router;
