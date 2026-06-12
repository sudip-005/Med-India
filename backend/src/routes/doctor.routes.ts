import { Router } from 'express';
import multer from 'multer';
import { DoctorController } from '../controllers/doctor.controller';
import { requireAuth } from '../middleware/auth';
import { requireRole } from '../middleware/roles';
import { validate } from '../middleware/validate';
import {
  doctorSearchSchema,
  getDoctorParamSchema,
} from '../schemas/marketplace.schema';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// Public endpoints to search and view doctor profiles (no auth required)
router.get('/', validate(doctorSearchSchema), DoctorController.getDoctors);
router.get('/search', validate(doctorSearchSchema), DoctorController.searchDoctors);
router.get('/:id', validate(getDoctorParamSchema), DoctorController.getDoctorById);

// Protected endpoints for managing own profile details (requires DOCTOR role)
router.post(
  '/profile',
  requireAuth,
  requireRole(['DOCTOR']),
  upload.fields([
    { name: 'registration_certificate', maxCount: 1 },
    { name: 'degree_certificate', maxCount: 1 },
    { name: 'profile_image', maxCount: 1 },
  ]),
  DoctorController.createProfile
);

router.put(
  '/profile',
  requireAuth,
  requireRole(['DOCTOR']),
  DoctorController.updateProfile
);

export default router;
