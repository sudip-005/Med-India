"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestOtpSchema = exports.loginSchema = exports.retailerSignupSchema = exports.doctorSignupSchema = exports.patientSignupSchema = void 0;
const zod_1 = require("zod");
exports.patientSignupSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z.string().email('Invalid email address'),
        password: zod_1.z.string().min(6, 'Password must be at least 6 characters'),
        first_name: zod_1.z.string().min(1, 'First name is required'),
        last_name: zod_1.z.string().min(1, 'Last name is required'),
        gender: zod_1.z.string().optional(),
        date_of_birth: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date of birth must be YYYY-MM-DD').optional(),
        blood_group: zod_1.z.string().optional(),
        phone: zod_1.z.string().optional(),
        emergency_contact_name: zod_1.z.string().optional(),
        emergency_contact_phone: zod_1.z.string().optional(),
        allergies: zod_1.z.array(zod_1.z.string()).optional().default([]),
        medical_history: zod_1.z.string().optional(),
        insurance_provider: zod_1.z.string().optional(),
        insurance_policy_number: zod_1.z.string().optional(),
    }),
});
exports.doctorSignupSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z.string().email('Invalid email address'),
        password: zod_1.z.string().min(6, 'Password must be at least 6 characters'),
        first_name: zod_1.z.string().min(1, 'First name is required'),
        last_name: zod_1.z.string().min(1, 'Last name is required'),
        gender: zod_1.z.string().optional(),
        date_of_birth: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date of birth must be YYYY-MM-DD').optional(),
        specialization: zod_1.z.string().min(1, 'Specialization is required'),
        qualification: zod_1.z.string().optional(),
        registration_number: zod_1.z.string().min(1, 'Medical registration number is required'),
        experience_years: zod_1.z.coerce.number().int().nonnegative().optional().default(0),
        phone: zod_1.z.string().optional(),
        clinic_name: zod_1.z.string().optional(),
        clinic_address: zod_1.z.string().optional(),
        city: zod_1.z.string().optional(),
        state: zod_1.z.string().optional(),
        country: zod_1.z.string().optional(),
        consultation_fee: zod_1.z.coerce.number().nonnegative().optional(),
        available_days: zod_1.z.array(zod_1.z.string()).optional().default([]),
        available_time_start: zod_1.z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/, 'Must be in HH:MM:SS or HH:MM format').optional(),
        available_time_end: zod_1.z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/, 'Must be in HH:MM:SS or HH:MM format').optional(),
        bio: zod_1.z.string().optional(),
    }),
});
exports.retailerSignupSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z.string().email('Invalid email address'),
        password: zod_1.z.string().min(6, 'Password must be at least 6 characters'),
        shop_name: zod_1.z.string().min(1, 'Shop name is required'),
        owner_name: zod_1.z.string().min(1, 'Owner name is required'),
        phone: zod_1.z.string().min(1, 'Phone is required'),
        business_id: zod_1.z.string().min(1, 'Business registration ID is required'),
        medical_license_id: zod_1.z.string().min(1, 'Medical license ID is required'),
        shop_address: zod_1.z.string().min(1, 'Shop address is required'),
        city: zod_1.z.string().optional(),
        state: zod_1.z.string().optional(),
        pincode: zod_1.z.string().optional(),
    }),
});
exports.loginSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z.string().email('Invalid email address'),
        password: zod_1.z.string().min(1, 'Password is required'),
    }),
});
exports.requestOtpSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z.string().email('Invalid email address'),
    }),
});
