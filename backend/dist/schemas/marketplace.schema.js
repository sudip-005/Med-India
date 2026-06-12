"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.doctorSearchSchema = exports.getRetailerParamSchema = exports.getDoctorParamSchema = exports.prescriptionUploadSchema = exports.getOrderParamSchema = exports.checkoutSchema = exports.cartItemParamSchema = exports.addToCartSchema = exports.addressSchema = void 0;
const zod_1 = require("zod");
exports.addressSchema = zod_1.z.object({
    body: zod_1.z.object({
        address_line_1: zod_1.z.string().min(1, 'Address line 1 is required'),
        address_line_2: zod_1.z.string().optional(),
        city: zod_1.z.string().min(1, 'City is required'),
        state: zod_1.z.string().min(1, 'State is required'),
        country: zod_1.z.string().min(1, 'Country is required').default('India'),
        pincode: zod_1.z.string().min(1, 'Pincode is required'),
        address_type: zod_1.z.string().default('Home'), // 'Home', 'Office', 'Clinic'
        is_default: zod_1.z.boolean().optional().default(false),
    }),
});
exports.addToCartSchema = zod_1.z.object({
    body: zod_1.z.object({
        product_name: zod_1.z.string().min(1, 'Product name is required'),
        quantity: zod_1.z.coerce.number().int().positive('Quantity must be greater than 0'),
        price: zod_1.z.coerce.number().positive('Price must be greater than 0'),
        retailer_id: zod_1.z.string().uuid('Invalid retailer ID').optional(),
    }),
});
exports.cartItemParamSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().uuid('Invalid cart item ID'),
    }),
});
exports.checkoutSchema = zod_1.z.object({
    body: zod_1.z.object({
        address_id: zod_1.z.string().uuid('Invalid address ID'),
        prescription_id: zod_1.z.string().uuid('Invalid prescription ID').optional(),
    }),
});
exports.getOrderParamSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().uuid('Invalid order ID'),
    }),
});
exports.prescriptionUploadSchema = zod_1.z.object({
    body: zod_1.z.object({
        diagnosis: zod_1.z.string().optional(),
        notes: zod_1.z.string().optional(),
        doctor_name: zod_1.z.string().optional(),
        doctor_id: zod_1.z.string().uuid().optional(),
    }),
});
exports.getDoctorParamSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().uuid('Invalid doctor ID'),
    }),
});
exports.getRetailerParamSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().uuid('Invalid retailer ID'),
    }),
});
exports.doctorSearchSchema = zod_1.z.object({
    query: zod_1.z.object({
        specialization: zod_1.z.string().optional(),
        city: zod_1.z.string().optional(),
        experience: zod_1.z.coerce.number().int().nonnegative().optional(),
        consultation_fee: zod_1.z.coerce.number().nonnegative().optional(),
    }),
});
