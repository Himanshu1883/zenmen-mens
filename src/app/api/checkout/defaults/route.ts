import { requireAuthUser } from "@/lib/api-auth";
import {
  formatPhoneDisplay,
  getPublicEmail,
  normalizePhone,
  resolveAccountContact,
} from "@/lib/auth-contact";
import { connectDB } from "@/lib/db";
import { fail, ok } from "@/lib/http-responses";
import Order from "@/models/Order";
import User from "@/models/User";
import mongoose from "mongoose";

export type CheckoutShippingDefaults = {
  fullName: string;
  email: string;
  phone: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  source: "last_order" | "profile" | "mixed";
};

/**
 * Last successful order shipping + profile contact for reorder autofill.
 * Own user only — never accepts client userId.
 */
export async function GET() {
  const auth = await requireAuthUser();
  if ("error" in auth) return auth.error;

  await connectDB();

  const user = await User.findById(auth.userId)
    .select("name email phone")
    .lean();

  if (!user) {
    return fail("NOT_FOUND", "Account not found", 404);
  }

  const contact = resolveAccountContact({
    email: user.email,
    phone: user.phone,
  });

  const lastOrder = await Order.findOne({
    userId: new mongoose.Types.ObjectId(auth.userId),
    orderStatus: {
      $nin: ["failed", "cancelled", "pending_payment", "pending"],
    },
  })
    .sort({ createdAt: -1 })
    .select("shipping")
    .lean();

  const ship = lastOrder?.shipping as
    | {
        fullName?: string;
        email?: string;
        phone?: string;
        addressLine1?: string;
        addressLine2?: string;
        city?: string;
        state?: string;
        pincode?: string;
        country?: string;
      }
    | undefined;

  const phoneFromOrder = ship?.phone
    ? normalizePhone(ship.phone)
    : null;
  const phone =
    (phoneFromOrder && phoneFromOrder.length === 10
      ? phoneFromOrder
      : null) ??
    contact.phone ??
    "";

  const email =
    getPublicEmail(ship?.email) ??
    contact.publicEmail ??
    "";

  const defaults: CheckoutShippingDefaults = {
    fullName: (ship?.fullName || user.name || auth.name || "").trim(),
    email,
    phone,
    addressLine1: (ship?.addressLine1 || "").trim(),
    addressLine2: (ship?.addressLine2 || "").trim(),
    city: (ship?.city || "").trim(),
    state: (ship?.state || "").trim(),
    pincode: (ship?.pincode || "").trim(),
    country: (ship?.country || "India").trim() || "India",
    source: ship ? (contact.publicEmail || contact.phone ? "mixed" : "last_order") : "profile",
  };

  return ok({
    shipping: defaults,
    phoneDisplay: phone ? formatPhoneDisplay(phone) : null,
  });
}
