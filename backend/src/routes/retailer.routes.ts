import { Router } from 'express';
import multer from 'multer';
import { RetailerController } from '../controllers/retailer.controller';
import { requireAuth } from '../middleware/auth';
import { requireRole } from '../middleware/roles';
import { validate } from '../middleware/validate';
import { getRetailerParamSchema } from '../schemas/marketplace.schema';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// Public endpoints to retrieve retailers
router.get('/', RetailerController.getRetailers);
router.get('/:id', validate(getRetailerParamSchema), RetailerController.getRetailerById);

// Protected endpoints to configure profile details (requires RETAILER role)
router.post(
  '/profile',
  requireAuth,
  requireRole(['RETAILER']),
  upload.fields([
    { name: 'business_license', maxCount: 1 },
    { name: 'medical_license', maxCount: 1 },
    { name: 'gst_certificate', maxCount: 1 },
    { name: 'stock_file', maxCount: 1 },
    { name: 'shop_image', maxCount: 1 },
  ]),
  RetailerController.createProfile
);

router.put(
  '/profile',
  requireAuth,
  requireRole(['RETAILER']),
  RetailerController.updateProfile
);

export default router;
