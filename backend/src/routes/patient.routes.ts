import { Router } from 'express';
import { PatientController } from '../controllers/patient.controller';
import { requireAuth } from '../middleware/auth';
import { requireRole } from '../middleware/roles';
import { validate } from '../middleware/validate';
import { addressSchema } from '../schemas/marketplace.schema';

const router = Router();

// Apply auth + role verification to all patient routes
router.use(requireAuth);
router.use(requireRole(['PATIENT']));

router.get('/me', PatientController.getMe);
router.put('/me', PatientController.updateMe);
router.delete('/me', PatientController.deleteMe);

// Address Management routes
router.get('/me/addresses', PatientController.listAddresses);
router.post('/me/addresses', validate(addressSchema), PatientController.addAddress);
router.delete('/me/addresses/:id', PatientController.deleteAddress);

export default router;
