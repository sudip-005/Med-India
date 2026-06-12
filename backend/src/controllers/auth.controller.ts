import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';

export class AuthController {
  static async signupPatient(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password, ...profileData } = req.body;
      const result = await AuthService.signupPatient(email, password, profileData);
      return res.status(201).json({
        message: 'Patient registered successfully. You can now log in.',
        user: result.user,
      });
    } catch (err) {
      return next(err);
    }
  }

  static async signupDoctor(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password, ...profileData } = req.body;
      const result = await AuthService.signupDoctor(email, password, profileData);
      return res.status(201).json({
        message: 'Doctor registered successfully. You can now log in.',
        user: result.user,
      });
    } catch (err) {
      return next(err);
    }
  }

  static async signupRetailer(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password, ...profileData } = req.body;
      const result = await AuthService.signupRetailer(email, password, profileData);
      return res.status(201).json({
        message: 'Retailer registered successfully. You can now log in.',
        user: result.user,
      });
    } catch (err) {
      return next(err);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      const result = await AuthService.login(email, password);
      return res.status(200).json({
        message: 'Login successful',
        session: result.session,
        user: result.user,
      });
    } catch (err: any) {
      return res.status(401).json({ error: err.message || 'Login failed' });
    }
  }

  static async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        return res.status(400).json({ error: 'Auth header missing' });
      }
      const token = authHeader.split(' ')[1];
      await AuthService.logout(token);
      return res.status(200).json({ message: 'Logged out successfully' });
    } catch (err) {
      return next(err);
    }
  }

  static async me(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      const profile = await AuthService.getProfile(req.user.id, req.user.role);
      return res.status(200).json({
        user: req.user,
        profile,
      });
    } catch (err) {
      return next(err);
    }
  }
}
