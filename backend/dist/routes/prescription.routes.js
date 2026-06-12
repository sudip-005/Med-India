"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const prescription_controller_1 = require("../controllers/prescription.controller");
const auth_1 = require("../middleware/auth");
const roles_1 = require("../middleware/roles");
const validate_1 = require("../middleware/validate");
const marketplace_schema_1 = require("../schemas/marketplace.schema");
const router = (0, express_1.Router)();
const upload = (0, multer_1.default)({ storage: multer_1.default.memoryStorage() });
// All prescription routes require authentication and the PATIENT role
router.use(auth_1.requireAuth);
router.use((0, roles_1.requireRole)(['PATIENT']));
router.post('/upload', upload.single('file'), (0, validate_1.validate)(marketplace_schema_1.prescriptionUploadSchema), prescription_controller_1.PrescriptionController.upload);
router.get('/', prescription_controller_1.PrescriptionController.list);
router.delete('/:id', prescription_controller_1.PrescriptionController.delete);
exports.default = router;
