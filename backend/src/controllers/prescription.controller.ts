import { Request, Response, NextFunction } from 'express';
import { PrescriptionService } from '../services/prescription.service';

export class PrescriptionController {
  /**
   * Uploads a prescription file and saves details.
   */
  static async upload(req: Request, res: Response, next: NextFunction) {
    try {
      const patientId = req.user!.id;
      const file = req.file;

      if (!file) {
        return res.status(400).json({ error: 'No prescription file provided' });
      }

      const prescription = await PrescriptionService.uploadPrescription(patientId, file, req.body);
      return res.status(201).json({
        message: 'Prescription uploaded and saved successfully',
        prescription,
      });
    } catch (err) {
      return next(err);
    }
  }

  /**
   * Lists all prescriptions for the logged-in patient.
   */
  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const patientId = req.user!.id;
      const prescriptions = await PrescriptionService.getPrescriptions(patientId);
      return res.status(200).json(prescriptions);
    } catch (err) {
      return next(err);
    }
  }

  /**
   * Deletes a prescription record and its storage file.
   */
  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const patientId = req.user!.id;
      const prescriptionId = req.params.id;
      await PrescriptionService.deletePrescription(patientId, prescriptionId);
      return res.status(200).json({
        message: 'Prescription deleted successfully',
      });
    } catch (err) {
      return next(err);
    }
  }
}
