"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrescriptionService = void 0;
const supabase_1 = require("../config/supabase");
const storage_service_1 = require("./storage.service");
/**
 * Service to manage patient Prescriptions.
 * Uploads prescription documents securely and links them to database profiles.
 */
class PrescriptionService {
    /**
     * Uploads prescription file to private storage bucket and saves details to DB.
     */
    static async uploadPrescription(patientId, file, metadata) {
        const fileExt = file.originalname.split('.').pop();
        const fileName = `${patientId}/${Date.now()}.${fileExt}`;
        // Upload to private storage
        const storagePath = await storage_service_1.StorageService.uploadFile('prescriptions', fileName, file.buffer, file.mimetype);
        // Save metadata in Postgres
        const { data, error } = await supabase_1.supabaseAdmin
            .from('prescriptions')
            .insert({
            patient_id: patientId,
            file_url: storagePath,
            diagnosis: metadata.diagnosis || null,
            notes: metadata.notes || null,
            doctor_name: metadata.doctor_name || null,
            doctor_id: metadata.doctor_id || null,
        })
            .select()
            .single();
        if (error) {
            // Clean up uploaded file if database record insert fails
            await storage_service_1.StorageService.deleteFile('prescriptions', storagePath).catch(console.error);
            throw new Error(`Failed to register prescription in database: ${error.message}`);
        }
        return data;
    }
    /**
     * Retrieves all prescriptions for a patient and appends temporary signed URLs.
     */
    static async getPrescriptions(patientId) {
        const { data, error } = await supabase_1.supabaseAdmin
            .from('prescriptions')
            .select('*')
            .eq('patient_id', patientId)
            .order('created_at', { ascending: false });
        if (error) {
            throw new Error(`Failed to retrieve prescriptions list: ${error.message}`);
        }
        // Append a signed access URL to each prescription record (valid for 1 hour)
        const processedList = await Promise.all(data.map(async (prescription) => {
            try {
                const signedUrl = await storage_service_1.StorageService.getSignedUrl('prescriptions', prescription.file_url);
                return { ...prescription, signed_url: signedUrl };
            }
            catch (err) {
                console.error(`Failed to sign URL for file ${prescription.file_url}:`, err);
                return { ...prescription, signed_url: null };
            }
        }));
        return processedList;
    }
    /**
     * Deletes a prescription record and its corresponding storage file.
     */
    static async deletePrescription(patientId, prescriptionId) {
        // Retrieve record first to find storage file path
        const { data, error: fetchError } = await supabase_1.supabaseAdmin
            .from('prescriptions')
            .select('file_url')
            .eq('prescription_id', prescriptionId)
            .eq('patient_id', patientId)
            .maybeSingle();
        if (fetchError || !data) {
            throw new Error('Prescription not found');
        }
        // Delete record from PostgreSQL
        const { error: deleteDbError } = await supabase_1.supabaseAdmin
            .from('prescriptions')
            .delete()
            .eq('prescription_id', prescriptionId);
        if (deleteDbError) {
            throw new Error(`Failed to delete prescription from database: ${deleteDbError.message}`);
        }
        // Delete file from private storage
        await storage_service_1.StorageService.deleteFile('prescriptions', data.file_url).catch(console.error);
    }
}
exports.PrescriptionService = PrescriptionService;
