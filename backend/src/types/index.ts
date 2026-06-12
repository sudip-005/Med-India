import { User } from '@supabase/supabase-js';

export type UserRole = 'PATIENT' | 'DOCTOR' | 'RETAILER';

export interface AuthenticatedUser extends User {
  role: UserRole;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}
