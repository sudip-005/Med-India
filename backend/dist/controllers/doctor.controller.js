"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DoctorController = void 0;
const auth_service_1 = require("../services/auth.service");
const storage_service_1 = require("../services/storage.service");
const supabase_1 = require("../config/supabase");
class DoctorController {
    /**
     * Completes or creates doctor profile details including uploading certificates.
     */
    static async createProfile(req, res, next) {
        try {
            const doctorId = req.user.id;
            const files = req.files;
            const updateData = { ...req.body };
            // Handle file uploads if present
            if (files) {
                if (files['registration_certificate'] && files['registration_certificate'][0]) {
                    const file = files['registration_certificate'][0];
                    const path = `${doctorId}/registration_certificate_${Date.now()}.${file.originalname.split('.').pop()}`;
                    const storagePath = await storage_service_1.StorageService.uploadFile('doctor-documents', path, file.buffer, file.mimetype);
                    updateData.registration_certificate_url = storagePath;
                }
                if (files['degree_certificate'] && files['degree_certificate'][0]) {
                    const file = files['degree_certificate'][0];
                    const path = `${doctorId}/degree_certificate_${Date.now()}.${file.originalname.split('.').pop()}`;
                    const storagePath = await storage_service_1.StorageService.uploadFile('doctor-documents', path, file.buffer, file.mimetype);
                    updateData.degree_certificate_url = storagePath;
                }
                if (files['profile_image'] && files['profile_image'][0]) {
                    const file = files['profile_image'][0];
                    const path = `${doctorId}/profile_${Date.now()}.${file.originalname.split('.').pop()}`;
                    const storagePath = await storage_service_1.StorageService.uploadFile('profile-images', path, file.buffer, file.mimetype);
                    updateData.profile_image_url = storage_service_1.StorageService.getPublicUrl('profile-images', storagePath);
                }
            }
            const profile = await auth_service_1.AuthService.updateProfile(doctorId, 'DOCTOR', updateData);
            return res.status(200).json({
                message: 'Doctor profile configured successfully',
                profile,
            });
        }
        catch (err) {
            return next(err);
        }
    }
    /**
     * Updates textual properties of a doctor's profile.
     */
    static async updateProfile(req, res, next) {
        try {
            const doctorId = req.user.id;
            const profile = await auth_service_1.AuthService.updateProfile(doctorId, 'DOCTOR', req.body);
            return res.status(200).json({
                message: 'Doctor profile updated successfully',
                profile,
            });
        }
        catch (err) {
            return next(err);
        }
    }
    /**
     * Retrieves doctors list with filtering options.
     */
    static async getDoctors(req, res, next) {
        try {
            const { specialization, city, experience, consultation_fee } = req.query;
            let query = supabase_1.supabaseAdmin.from('doctors').select('*').eq('is_active', true);
            if (specialization) {
                query = query.ilike('specialization', `%${specialization}%`);
            }
            if (city) {
                query = query.ilike('city', `%${city}%`);
            }
            if (experience) {
                query = query.gte('experience_years', Number(experience));
            }
            if (consultation_fee) {
                query = query.lte('consultation_fee', Number(consultation_fee));
            }
            const { data: doctors, error } = await query;
            if (error)
                throw new Error(error.message);
            // Generate signed URLs for private certificates
            const processedDoctors = await Promise.all((doctors || []).map(async (doc) => {
                let regUrl = null;
                let degUrl = null;
                if (doc.registration_certificate_url) {
                    regUrl = await storage_service_1.StorageService.getSignedUrl('doctor-documents', doc.registration_certificate_url).catch(() => null);
                }
                if (doc.degree_certificate_url) {
                    degUrl = await storage_service_1.StorageService.getSignedUrl('doctor-documents', doc.degree_certificate_url).catch(() => null);
                }
                return {
                    ...doc,
                    registration_certificate_signed_url: regUrl,
                    degree_certificate_signed_url: degUrl,
                };
            }));
            return res.status(200).json(processedDoctors);
        }
        catch (err) {
            return next(err);
        }
    }
    /**
     * Gets a specific doctor by ID.
     */
    static async getDoctorById(req, res, next) {
        try {
            const doctorId = req.params.id;
            const doctor = await auth_service_1.AuthService.getProfile(doctorId, 'DOCTOR');
            let regUrl = null;
            let degUrl = null;
            if (doctor.registration_certificate_url) {
                regUrl = await storage_service_1.StorageService.getSignedUrl('doctor-documents', doctor.registration_certificate_url).catch(() => null);
            }
            if (doctor.degree_certificate_url) {
                degUrl = await storage_service_1.StorageService.getSignedUrl('doctor-documents', doctor.degree_certificate_url).catch(() => null);
            }
            return res.status(200).json({
                ...doctor,
                registration_certificate_signed_url: regUrl,
                degree_certificate_signed_url: degUrl,
            });
        }
        catch (err) {
            return next(err);
        }
    }
    /**
     * Legacy endpoint for searching doctors. Maps to getDoctors logic.
     */
    static async searchDoctors(req, res, next) {
        return DoctorController.getDoctors(req, res, next);
    }
}
exports.DoctorController = DoctorController;
