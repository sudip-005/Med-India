import { z } from 'zod';

export const patientSignupSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    first_name: z.string().min(1, 'First name is required'),
    last_name: z.string().min(1, 'Last name is required'),
    gender: z.string().optional(),
    date_of_birth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date of birth must be YYYY-MM-DD').optional(),
    blood_group: z.string().optional(),
    phone: z.string().optional(),
    emergency_contact_name: z.string().optional(),
    emergency_contact_phone: z.string().optional(),
    allergies: z.array(z.string()).optional().default([]),
    medical_history: z.string().optional(),
    insurance_provider: z.string().optional(),
    insurance_policy_number: z.string().optional(),
  }),
});

export const doctorSignupSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    first_name: z.string().min(1, 'First name is required'),
    last_name: z.string().min(1, 'Last name is required'),
    gender: z.string().optional(),
    date_of_birth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date of birth must be YYYY-MM-DD').optional(),
    specialization: z.string().min(1, 'Specialization is required'),
    qualification: z.string().optional(),
    registration_number: z.string().min(1, 'Medical registration number is required'),
    experience_years: z.coerce.number().int().nonnegative().optional().default(0),
    phone: z.string().optional(),
    clinic_name: z.string().optional(),
    clinic_address: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    country: z.string().optional(),
    consultation_fee: z.coerce.number().nonnegative().optional(),
    available_days: z.array(z.string()).optional().default([]),
    available_time_start: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/, 'Must be in HH:MM:SS or HH:MM format').optional(),
    available_time_end: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/, 'Must be in HH:MM:SS or HH:MM format').optional(),
    bio: z.string().optional(),
  }),
});

export const retailerSignupSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    shop_name: z.string().min(1, 'Shop name is required'),
    owner_name: z.string().min(1, 'Owner name is required'),
    phone: z.string().min(1, 'Phone is required'),
    business_id: z.string().min(1, 'Business registration ID is required'),
    medical_license_id: z.string().min(1, 'Medical license ID is required'),
    shop_address: z.string().min(1, 'Shop address is required'),
    city: z.string().optional(),
    state: z.string().optional(),
    pincode: z.string().optional(),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
  }),
});

export const requestOtpSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
  }),
});
