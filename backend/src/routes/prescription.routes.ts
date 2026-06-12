import { Router } from 'express';
import multer from 'multer';
import { PrescriptionController } from '../controllers/prescription.controller';
import { requireAuth } from '../middleware/auth';
import { requireRole } from '../middleware/roles';
import { validate } from '../middleware/validate';
import { prescriptionUploadSchema } from '../schemas/marketplace.schema';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// All prescription routes require authentication and the PATIENT role
router.use(requireAuth);
router.use(requireRole(['PATIENT']));

router.post(
  '/upload',
  upload.single('file'),
  validate(prescriptionUploadSchema),
  PrescriptionController.upload
);

router.get('/', PrescriptionController.list);
router.delete('/:id', PrescriptionController.delete);

export default router;
