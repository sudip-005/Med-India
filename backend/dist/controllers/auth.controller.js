"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const auth_service_1 = require("../services/auth.service");
class AuthController {
    static async signupPatient(req, res, next) {
        try {
            const { email, password, ...profileData } = req.body;
            const result = await auth_service_1.AuthService.signupPatient(email, password, profileData);
            return res.status(201).json({
                message: 'Patient registered successfully. Verification email sent.',
                user: result.user,
            });
        }
        catch (err) {
            return next(err);
        }
    }
    static async signupDoctor(req, res, next) {
        try {
            const { email, password, ...profileData } = req.body;
            const result = await auth_service_1.AuthService.signupDoctor(email, password, profileData);
            return res.status(201).json({
                message: 'Doctor registered successfully. Verification email sent.',
                user: result.user,
            });
        }
        catch (err) {
            return next(err);
        }
    }
    static async signupRetailer(req, res, next) {
        try {
            const { email, password, ...profileData } = req.body;
            const result = await auth_service_1.AuthService.signupRetailer(email, password, profileData);
            return res.status(201).json({
                message: 'Retailer registered successfully. Verification email sent.',
                user: result.user,
            });
        }
        catch (err) {
            return next(err);
        }
    }
    static async login(req, res, next) {
        try {
            const { email, password } = req.body;
            const result = await auth_service_1.AuthService.login(email, password);
            return res.status(200).json({
                message: 'Login successful',
                session: result.session,
                user: result.user,
            });
        }
        catch (err) {
            return res.status(401).json({ error: err.message || 'Login failed' });
        }
    }
    static async logout(req, res, next) {
        try {
            const authHeader = req.headers.authorization;
            if (!authHeader) {
                return res.status(400).json({ error: 'Auth header missing' });
            }
            const token = authHeader.split(' ')[1];
            await auth_service_1.AuthService.logout(token);
            return res.status(200).json({ message: 'Logged out successfully' });
        }
        catch (err) {
            return next(err);
        }
    }
    static async me(req, res, next) {
        try {
            if (!req.user) {
                return res.status(401).json({ error: 'Unauthorized' });
            }
            const profile = await auth_service_1.AuthService.getProfile(req.user.id, req.user.role);
            return res.status(200).json({
                user: req.user,
                profile,
            });
        }
        catch (err) {
            return next(err);
        }
    }
}
exports.AuthController = AuthController;
