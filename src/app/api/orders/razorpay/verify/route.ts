import { requireAuthUser } from "@/lib/api-auth";
import { connectDB } from "@/lib/db";
import { getRazorpayKeySecret } from "@/lib/razorpay";
import { checkoutVerifySchema } from "@/lib/validations/checkout.schema";
import Order from "@/models/Order";
import crypto from "crypto";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const auth = await requireAuthUser();
    if ("error" in auth) return auth.error;

    const body = await req.json();
    const parsed = checkoutVerifySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid payment data" },
        { status: 422 },
      );
    }

    const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } =
      parsed.data;

    const expected = crypto
      .createHmac("sha256", getRazorpayKeySecret())
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest("hex");

    if (expected !== razorpaySignature) {
      return NextResponse.json(
        { error: "Payment verification failed" },
        { status: 400 },
      );
    }

    await connectDB();

    const order = await Order.findOne({
      _id: orderId,
      userId: auth.userId,
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.razorpayOrderId !== razorpayOrderId) {
      return NextResponse.json(
        { error: "Payment does not match this order" },
        { status: 400 },
      );
    }

    if (order.paymentStatus === "paid") {
      return NextResponse.json({
        orderId: String(order._id),
        orderNumber: order.orderNumber,
        alreadyPaid: true,
      });
    }

    order.paymentStatus = "paid";
    order.status = "confirmed";
    order.razorpayPaymentId = razorpayPaymentId;
    order.razorpaySignature = razorpaySignature;
    await order.save();

    return NextResponse.json({
      orderId: String(order._id),
      orderNumber: order.orderNumber,
    });
  } catch (err) {
    console.error("[POST /api/orders/razorpay/verify]", err);
    return NextResponse.json(
      { error: "Payment verification failed" },
      { status: 500 },
    );
  }
}
