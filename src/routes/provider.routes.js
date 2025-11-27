import express from 'express';
import * as providerController from '../controllers/provider.controller.js';
import { authenticate, authorize } from '../utils/auth.middleware.js';

const router = express.Router();

router.get('/', providerController.list);
router.get('/:id', providerController.getById);
router.post('/', authenticate, authorize(['PROVIDER', 'ADMIN']), providerController.create);
router.put('/:id', authenticate, authorize(['PROVIDER', 'ADMIN']), providerController.update);

export default router;
