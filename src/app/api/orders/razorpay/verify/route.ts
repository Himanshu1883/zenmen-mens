import { requireAuthUser } from "@/lib/api-auth";
import { connectDB } from "@/lib/db";
import { verifyPaymentSignature } from "@/lib/razorpay";
import { fail, ok } from "@/lib/http-responses";
import { checkoutVerifySchema } from "@/lib/validations/checkout.schema";
import Order from "@/models/Order";
import { finalizePaidOrder } from "@/services/orderFinalizeService";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const auth = await requireAuthUser();
    if ("error" in auth) return auth.error;

    const body = await req.json();
    const parsed = checkoutVerifySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, code: "MISSING_PAYMENT_FIELDS", message: parsed.error.issues[0]?.message ?? "Invalid payment data" },
        { status: 422 },
      );
    }

    const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } =
      parsed.data;

    if (!verifyPaymentSignature(razorpayOrderId, razorpayPaymentId, razorpaySignature)) {
      return fail("PAYMENT_SIGNATURE_MISMATCH", "Payment verification failed", 400);
    }

    await connectDB();

    const order = await Order.findOne({
      _id: orderId,
      userId: auth.userId,
    });

    if (!order) {
      return fail("ORDER_NOT_FOUND", "Order not found", 404);
    }

    if (order.razorpayOrderId !== razorpayOrderId) {
      return fail("FORBIDDEN", "Payment does not match this order", 400);
    }

    const result = await finalizePaidOrder({
      orderId: String(order._id),
      paymentId: razorpayPaymentId,
      signature: razorpaySignature,
      actor: "user",
    });

    return ok({
      orderId: String(result.order._id),
      orderNumber: result.order.orderNumber,
      alreadyFinalized: result.alreadyFinalized,
    });
  } catch (err) {
    console.error("[POST /api/orders/razorpay/verify]", err);
    return NextResponse.json(
      { success: false, code: "VERIFY_FAILED", message: "Payment verification failed" },
      { status: 500 },
    );
  }
}
