"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const doctor_controller_1 = require("../controllers/doctor.controller");
const auth_1 = require("../middleware/auth");
const roles_1 = require("../middleware/roles");
const validate_1 = require("../middleware/validate");
const marketplace_schema_1 = require("../schemas/marketplace.schema");
const router = (0, express_1.Router)();
const upload = (0, multer_1.default)({ storage: multer_1.default.memoryStorage() });
// Public endpoints to search and view doctor profiles (no auth required)
router.get('/', (0, validate_1.validate)(marketplace_schema_1.doctorSearchSchema), doctor_controller_1.DoctorController.getDoctors);
router.get('/search', (0, validate_1.validate)(marketplace_schema_1.doctorSearchSchema), doctor_controller_1.DoctorController.searchDoctors);
router.get('/:id', (0, validate_1.validate)(marketplace_schema_1.getDoctorParamSchema), doctor_controller_1.DoctorController.getDoctorById);
// Protected endpoints for managing own profile details (requires DOCTOR role)
router.post('/profile', auth_1.requireAuth, (0, roles_1.requireRole)(['DOCTOR']), upload.fields([
    { name: 'registration_certificate', maxCount: 1 },
    { name: 'degree_certificate', maxCount: 1 },
    { name: 'profile_image', maxCount: 1 },
]), doctor_controller_1.DoctorController.createProfile);
router.put('/profile', auth_1.requireAuth, (0, roles_1.requireRole)(['DOCTOR']), doctor_controller_1.DoctorController.updateProfile);
exports.default = router;
