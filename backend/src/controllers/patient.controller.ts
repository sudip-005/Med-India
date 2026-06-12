import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { PatientService } from '../services/patient.service';

export class PatientController {
  static async getMe(req: Request, res: Response, next: NextFunction) {
    try {
      const patientId = req.user!.id;
      const profile = await AuthService.getProfile(patientId, 'PATIENT');
      return res.status(200).json(profile);
    } catch (err) {
      return next(err);
    }
  }

  static async updateMe(req: Request, res: Response, next: NextFunction) {
    try {
      const patientId = req.user!.id;
      const profile = await AuthService.updateProfile(patientId, 'PATIENT', req.body);
      return res.status(200).json({
        message: 'Patient profile updated successfully',
        profile,
      });
    } catch (err) {
      return next(err);
    }
  }

  static async deleteMe(req: Request, res: Response, next: NextFunction) {
    try {
      const patientId = req.user!.id;
      await PatientService.deletePatient(patientId);
      return res.status(200).json({
        message: 'Patient account deleted successfully',
      });
    } catch (err) {
      return next(err);
    }
  }

  static async listAddresses(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const addresses = await PatientService.getAddresses(userId);
      return res.status(200).json(addresses);
    } catch (err) {
      return next(err);
    }
  }

  static async addAddress(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const address = await PatientService.addAddress(userId, req.body);
      return res.status(201).json({
        message: 'Address added successfully',
        address,
      });
    } catch (err) {
      return next(err);
    }
  }

  static async deleteAddress(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const addressId = req.params.id;
      await PatientService.deleteAddress(userId, addressId);
      return res.status(200).json({
        message: 'Address deleted successfully',
      });
    } catch (err) {
      return next(err);
    }
  }
}
