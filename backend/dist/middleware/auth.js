"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = requireAuth;
const supabase_1 = require("../config/supabase");
/**
 * Middleware to authenticate requests using Supabase Access Token (JWT).
 */
async function requireAuth(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Authorization header is missing or malformed' });
        }
        const token = authHeader.split(' ')[1];
        // Verify token with Supabase
        const { data: { user }, error } = await supabase_1.supabase.auth.getUser(token);
        if (error || !user) {
            return res.status(401).json({ error: 'Invalid or expired authentication token' });
        }
        // Determine the user's role by checking the tables in parallel
        const [patientCheck, doctorCheck, retailerCheck] = await Promise.all([
            supabase_1.supabaseAdmin.from('patients').select('patient_id').eq('patient_id', user.id).maybeSingle(),
            supabase_1.supabaseAdmin.from('doctors').select('doctor_id').eq('doctor_id', user.id).maybeSingle(),
            supabase_1.supabaseAdmin.from('retailers').select('retailer_id').eq('retailer_id', user.id).maybeSingle(),
        ]);
        let role = null;
        if (patientCheck.data) {
            role = 'PATIENT';
        }
        else if (doctorCheck.data) {
            role = 'DOCTOR';
        }
        else if (retailerCheck.data) {
            role = 'RETAILER';
        }
        if (!role) {
            return res.status(403).json({ error: 'User profile not found. Please complete profile registration.' });
        }
        // Attach user to request
        req.user = {
            ...user,
            role,
        };
        return next();
    }
    catch (err) {
        console.error('Auth Middleware Error:', err);
        return res.status(500).json({ error: 'Internal server error during authentication' });
    }
}
