import { z } from "zod";

export const COD_FEE_INR = 200;

const cartLineSchema = z.object({
  _id: z.string().min(1),
  title: z.string().min(1),
  slug: z.string().min(1),
  price: z.number().positive(),
  qty: z.number().int().min(1).max(10),
  selectedColor: z.string().optional(),
  selectedSize: z.string().optional(),
  image: z
    .object({
      url: z.string().optional(),
    })
    .optional(),
});

export const shippingSchema = z.object({
  fullName: z.string().trim().min(2, "Enter your full name"),
  email: z.string().trim().email("Enter a valid email"),
  phone: z
    .string()
    .trim()
    .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number"),
  addressLine1: z.string().trim().min(5, "Enter your street address"),
  addressLine2: z.string().trim().optional(),
  city: z.string().trim().min(2, "Enter your city"),
  state: z.string().trim().min(2, "Enter your state"),
  pincode: z.string().trim().regex(/^\d{6}$/, "Enter a valid 6-digit PIN code"),
  country: z.string().trim().default("India"),
});

export const checkoutCodSchema = z.object({
  items: z.array(cartLineSchema).min(1, "Your cart is empty"),
  shipping: shippingSchema,
  notes: z.string().trim().max(500).optional(),
});

export const checkoutOnlineCreateSchema = z.object({
  items: z.array(cartLineSchema).min(1, "Your cart is empty"),
  shipping: shippingSchema,
  notes: z.string().trim().max(500).optional(),
});

export const checkoutVerifySchema = z.object({
  orderId: z.string().min(1),
  razorpayOrderId: z.string().min(1),
  razorpayPaymentId: z.string().min(1),
  razorpaySignature: z.string().min(1),
});

export type ShippingInput = z.infer<typeof shippingSchema>;
export type CartLineInput = z.infer<typeof cartLineSchema>;
