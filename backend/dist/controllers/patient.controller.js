"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PatientController = void 0;
const auth_service_1 = require("../services/auth.service");
const patient_service_1 = require("../services/patient.service");
class PatientController {
    static async getMe(req, res, next) {
        try {
            const patientId = req.user.id;
            const profile = await auth_service_1.AuthService.getProfile(patientId, 'PATIENT');
            return res.status(200).json(profile);
        }
        catch (err) {
            return next(err);
        }
    }
    static async updateMe(req, res, next) {
        try {
            const patientId = req.user.id;
            const profile = await auth_service_1.AuthService.updateProfile(patientId, 'PATIENT', req.body);
            return res.status(200).json({
                message: 'Patient profile updated successfully',
                profile,
            });
        }
        catch (err) {
            return next(err);
        }
    }
    static async deleteMe(req, res, next) {
        try {
            const patientId = req.user.id;
            await patient_service_1.PatientService.deletePatient(patientId);
            return res.status(200).json({
                message: 'Patient account deleted successfully',
            });
        }
        catch (err) {
            return next(err);
        }
    }
    static async listAddresses(req, res, next) {
        try {
            const userId = req.user.id;
            const addresses = await patient_service_1.PatientService.getAddresses(userId);
            return res.status(200).json(addresses);
        }
        catch (err) {
            return next(err);
        }
    }
    static async addAddress(req, res, next) {
        try {
            const userId = req.user.id;
            const address = await patient_service_1.PatientService.addAddress(userId, req.body);
            return res.status(201).json({
                message: 'Address added successfully',
                address,
            });
        }
        catch (err) {
            return next(err);
        }
    }
    static async deleteAddress(req, res, next) {
        try {
            const userId = req.user.id;
            const addressId = req.params.id;
            await patient_service_1.PatientService.deleteAddress(userId, addressId);
            return res.status(200).json({
                message: 'Address deleted successfully',
            });
        }
        catch (err) {
            return next(err);
        }
    }
}
exports.PatientController = PatientController;
