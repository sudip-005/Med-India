import { Request, Response, NextFunction } from 'express';
import { supabase, supabaseAdmin } from '../config/supabase';
import { UserRole, AuthenticatedUser } from '../types';

/**
 * Middleware to authenticate requests using Supabase Access Token (JWT).
 */
export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authorization header is missing or malformed' });
    }

    const token = authHeader.split(' ')[1];
    
    // Verify token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid or expired authentication token' });
    }

    // Determine the user's role by checking the tables in parallel
    const [patientCheck, doctorCheck, retailerCheck] = await Promise.all([
      supabaseAdmin.from('patients').select('patient_id').eq('patient_id', user.id).maybeSingle(),
      supabaseAdmin.from('doctors').select('doctor_id').eq('doctor_id', user.id).maybeSingle(),
      supabaseAdmin.from('retailers').select('retailer_id').eq('retailer_id', user.id).maybeSingle(),
    ]);

    let role: UserRole | null = null;
    if (patientCheck.data) {
      role = 'PATIENT';
    } else if (doctorCheck.data) {
      role = 'DOCTOR';
    } else if (retailerCheck.data) {
      role = 'RETAILER';
    }

    if (!role) {
      return res.status(403).json({ error: 'User profile not found. Please complete profile registration.' });
    }

    // Attach user to request
    req.user = {
      ...user,
      role,
    } as AuthenticatedUser;

    return next();
  } catch (err) {
    console.error('Auth Middleware Error:', err);
    return res.status(500).json({ error: 'Internal server error during authentication' });
  }
}
