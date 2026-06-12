"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const cart_controller_1 = require("../controllers/cart.controller");
const auth_1 = require("../middleware/auth");
const roles_1 = require("../middleware/roles");
const validate_1 = require("../middleware/validate");
const marketplace_schema_1 = require("../schemas/marketplace.schema");
const router = (0, express_1.Router)();
// All cart operations require authentication and the PATIENT role
router.use(auth_1.requireAuth);
router.use((0, roles_1.requireRole)(['PATIENT']));
router.get('/', cart_controller_1.CartController.getCart);
router.post('/', (0, validate_1.validate)(marketplace_schema_1.addToCartSchema), cart_controller_1.CartController.addItem);
router.post('/items', (0, validate_1.validate)(marketplace_schema_1.addToCartSchema), cart_controller_1.CartController.addItem);
router.delete('/items/:id', (0, validate_1.validate)(marketplace_schema_1.cartItemParamSchema), cart_controller_1.CartController.removeItem);
exports.default = router;
