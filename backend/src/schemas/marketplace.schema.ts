import { z } from 'zod';

export const addressSchema = z.object({
  body: z.object({
    address_line_1: z.string().min(1, 'Address line 1 is required'),
    address_line_2: z.string().optional(),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(1, 'State is required'),
    country: z.string().min(1, 'Country is required').default('India'),
    pincode: z.string().min(1, 'Pincode is required'),
    address_type: z.string().default('Home'), // 'Home', 'Office', 'Clinic'
    is_default: z.boolean().optional().default(false),
  }),
});

export const addToCartSchema = z.object({
  body: z.object({
    product_name: z.string().min(1, 'Product name is required'),
    quantity: z.coerce.number().int().positive('Quantity must be greater than 0'),
    price: z.coerce.number().positive('Price must be greater than 0'),
    retailer_id: z.string().uuid('Invalid retailer ID').optional(),
  }),
});

export const cartItemParamSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid cart item ID'),
  }),
});

export const checkoutSchema = z.object({
  body: z.object({
    address_id: z.string().uuid('Invalid address ID'),
    prescription_id: z.string().uuid('Invalid prescription ID').optional(),
  }),
});

export const getOrderParamSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid order ID'),
  }),
});

export const prescriptionUploadSchema = z.object({
  body: z.object({
    diagnosis: z.string().optional(),
    notes: z.string().optional(),
    doctor_name: z.string().optional(),
    doctor_id: z.string().uuid().optional(),
  }),
});

export const getDoctorParamSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid doctor ID'),
  }),
});

export const getRetailerParamSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid retailer ID'),
  }),
});

export const doctorSearchSchema = z.object({
  query: z.object({
    specialization: z.string().optional(),
    city: z.string().optional(),
    experience: z.coerce.number().int().nonnegative().optional(),
    consultation_fee: z.coerce.number().nonnegative().optional(),
  }),
});
