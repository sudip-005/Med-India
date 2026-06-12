"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const retailer_controller_1 = require("../controllers/retailer.controller");
const auth_1 = require("../middleware/auth");
const roles_1 = require("../middleware/roles");
const validate_1 = require("../middleware/validate");
const marketplace_schema_1 = require("../schemas/marketplace.schema");
const router = (0, express_1.Router)();
const upload = (0, multer_1.default)({ storage: multer_1.default.memoryStorage() });
// Public endpoints to retrieve retailers
router.get('/', retailer_controller_1.RetailerController.getRetailers);
router.get('/:id', (0, validate_1.validate)(marketplace_schema_1.getRetailerParamSchema), retailer_controller_1.RetailerController.getRetailerById);
// Protected endpoints to configure profile details (requires RETAILER role)
router.post('/profile', auth_1.requireAuth, (0, roles_1.requireRole)(['RETAILER']), upload.fields([
    { name: 'business_license', maxCount: 1 },
    { name: 'medical_license', maxCount: 1 },
    { name: 'gst_certificate', maxCount: 1 },
    { name: 'stock_file', maxCount: 1 },
    { name: 'shop_image', maxCount: 1 },
]), retailer_controller_1.RetailerController.createProfile);
router.put('/profile', auth_1.requireAuth, (0, roles_1.requireRole)(['RETAILER']), retailer_controller_1.RetailerController.updateProfile);
exports.default = router;
