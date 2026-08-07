import { verifyWebhookSignature } from "@/lib/razorpay";
import {
  completeRefundWebhook,
  failRefundWebhook,
  finalizePaidOrder,
  markOrderPaymentFailed,
} from "@/services/orderFinalizeService";
import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-razorpay-signature") ?? "";

  if (!verifyWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  let event: {
    event?: string;
    payload?: {
      payment?: { entity?: { order_id?: string; id?: string } };
      refund?: { entity?: { id?: string; payment_id?: string } };
    };
  };

  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ received: true });
  }

  try {
    const name = event.event ?? "";

    if (name === "payment.captured") {
      const payment = event.payload?.payment?.entity;
      const orderId = payment?.order_id;
      const paymentId = payment?.id;
      if (orderId && paymentId) {
        await connectDB();
        const order = await Order.findOne({ razorpayOrderId: orderId });
        if (order) {
          await finalizePaidOrder({
            orderId: String(order._id),
            paymentId,
            signature: "webhook",
            actor: "webhook",
          });
        }
      }
    } else if (name === "payment.failed") {
      const orderId = event.payload?.payment?.entity?.order_id;
      if (orderId) await markOrderPaymentFailed(orderId);
    } else if (name === "refund.processed") {
      const refundId = event.payload?.refund?.entity?.id;
      if (refundId) await completeRefundWebhook(refundId);
    } else if (name === "refund.failed") {
      const refundId = event.payload?.refund?.entity?.id;
      if (refundId) await failRefundWebhook(refundId);
    }
  } catch (err) {
    console.error("[webhook razorpay]", err);
  }

  return NextResponse.json({ received: true });
}
