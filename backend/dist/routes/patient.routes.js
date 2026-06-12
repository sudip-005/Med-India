"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const patient_controller_1 = require("../controllers/patient.controller");
const auth_1 = require("../middleware/auth");
const roles_1 = require("../middleware/roles");
const validate_1 = require("../middleware/validate");
const marketplace_schema_1 = require("../schemas/marketplace.schema");
const router = (0, express_1.Router)();
// Apply auth + role verification to all patient routes
router.use(auth_1.requireAuth);
router.use((0, roles_1.requireRole)(['PATIENT']));
router.get('/me', patient_controller_1.PatientController.getMe);
router.put('/me', patient_controller_1.PatientController.updateMe);
router.delete('/me', patient_controller_1.PatientController.deleteMe);
// Address Management routes
router.get('/me/addresses', patient_controller_1.PatientController.listAddresses);
router.post('/me/addresses', (0, validate_1.validate)(marketplace_schema_1.addressSchema), patient_controller_1.PatientController.addAddress);
router.delete('/me/addresses/:id', patient_controller_1.PatientController.deleteAddress);
exports.default = router;
