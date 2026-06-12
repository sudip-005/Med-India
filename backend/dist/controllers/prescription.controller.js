"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrescriptionController = void 0;
const prescription_service_1 = require("../services/prescription.service");
class PrescriptionController {
    /**
     * Uploads a prescription file and saves details.
     */
    static async upload(req, res, next) {
        try {
            const patientId = req.user.id;
            const file = req.file;
            if (!file) {
                return res.status(400).json({ error: 'No prescription file provided' });
            }
            const prescription = await prescription_service_1.PrescriptionService.uploadPrescription(patientId, file, req.body);
            return res.status(201).json({
                message: 'Prescription uploaded and saved successfully',
                prescription,
            });
        }
        catch (err) {
            return next(err);
        }
    }
    /**
     * Lists all prescriptions for the logged-in patient.
     */
    static async list(req, res, next) {
        try {
            const patientId = req.user.id;
            const prescriptions = await prescription_service_1.PrescriptionService.getPrescriptions(patientId);
            return res.status(200).json(prescriptions);
        }
        catch (err) {
            return next(err);
        }
    }
    /**
     * Deletes a prescription record and its storage file.
     */
    static async delete(req, res, next) {
        try {
            const patientId = req.user.id;
            const prescriptionId = req.params.id;
            await prescription_service_1.PrescriptionService.deletePrescription(patientId, prescriptionId);
            return res.status(200).json({
                message: 'Prescription deleted successfully',
            });
        }
        catch (err) {
            return next(err);
        }
    }
}
exports.PrescriptionController = PrescriptionController;
