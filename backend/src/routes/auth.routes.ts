import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { validate } from '../middleware/validate';
import { requireAuth } from '../middleware/auth';
import {
  patientSignupSchema,
  doctorSignupSchema,
  retailerSignupSchema,
  loginSchema,
} from '../schemas/auth.schema';

const router = Router();

router.post('/signup/patient', validate(patientSignupSchema), AuthController.signupPatient);
router.post('/signup/doctor', validate(doctorSignupSchema), AuthController.signupDoctor);
router.post('/signup/retailer', validate(retailerSignupSchema), AuthController.signupRetailer);

router.post('/login', validate(loginSchema), AuthController.login);
router.post('/logout', requireAuth, AuthController.logout);
router.get('/me', requireAuth, AuthController.me);

export default router;
