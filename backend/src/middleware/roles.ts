import { Request, Response, NextFunction } from 'express';
import { UserRole } from '../types';

/**
 * Middleware to restrict endpoints to specific user roles.
 * Must be placed after requireAuth middleware.
 */
export function requireRole(allowedRoles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized. Authentication required.' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Forbidden. Access is restricted to: [${allowedRoles.join(', ')}]. Your role is: ${req.user.role}`,
      });
    }

    return next();
  };
}
