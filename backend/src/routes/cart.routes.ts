import { Router } from 'express';
import { CartController } from '../controllers/cart.controller';
import { requireAuth } from '../middleware/auth';
import { requireRole } from '../middleware/roles';
import { validate } from '../middleware/validate';
import {
  addToCartSchema,
  cartItemParamSchema,
} from '../schemas/marketplace.schema';

const router = Router();

// All cart operations require authentication and the PATIENT role
router.use(requireAuth);
router.use(requireRole(['PATIENT']));

router.get('/', CartController.getCart);
router.post('/', validate(addToCartSchema), CartController.addItem);
router.post('/items', validate(addToCartSchema), CartController.addItem);
router.delete('/items/:id', validate(cartItemParamSchema), CartController.removeItem);

export default router;
