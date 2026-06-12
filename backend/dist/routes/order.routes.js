"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const order_controller_1 = require("../controllers/order.controller");
const auth_1 = require("../middleware/auth");
const roles_1 = require("../middleware/roles");
const validate_1 = require("../middleware/validate");
const marketplace_schema_1 = require("../schemas/marketplace.schema");
const router = (0, express_1.Router)();
// All order routes require authentication
router.use(auth_1.requireAuth);
router.post('/checkout', (0, roles_1.requireRole)(['PATIENT']), (0, validate_1.validate)(marketplace_schema_1.checkoutSchema), order_controller_1.OrderController.checkout);
router.get('/', (0, roles_1.requireRole)(['PATIENT', 'RETAILER']), order_controller_1.OrderController.list);
router.get('/:id', (0, roles_1.requireRole)(['PATIENT', 'RETAILER']), (0, validate_1.validate)(marketplace_schema_1.getOrderParamSchema), order_controller_1.OrderController.getById);
exports.default = router;
