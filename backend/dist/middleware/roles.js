"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireRole = requireRole;
/**
 * Middleware to restrict endpoints to specific user roles.
 * Must be placed after requireAuth middleware.
 */
function requireRole(allowedRoles) {
    return (req, res, next) => {
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
