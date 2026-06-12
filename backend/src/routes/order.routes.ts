import { Router } from 'express';
import { OrderController } from '../controllers/order.controller';
import { requireAuth } from '../middleware/auth';
import { requireRole } from '../middleware/roles';
import { validate } from '../middleware/validate';
import {
  checkoutSchema,
  getOrderParamSchema,
} from '../schemas/marketplace.schema';

const router = Router();

// All order routes require authentication
router.use(requireAuth);

router.post('/checkout', requireRole(['PATIENT']), validate(checkoutSchema), OrderController.checkout);
router.get('/', requireRole(['PATIENT', 'RETAILER']), OrderController.list);
router.get('/:id', requireRole(['PATIENT', 'RETAILER']), validate(getOrderParamSchema), OrderController.getById);

export default router;
