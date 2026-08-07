import { requireAuthUser } from "@/lib/api-auth";
import { connectDB } from "@/lib/db";
import {
  amountToPaise,
  calcOrderTotals,
  generateOrderNumber,
  resolveCartItems,
} from "@/lib/orders";
import { getRazorpay, getRazorpayKeyId } from "@/lib/razorpay";
import { checkoutOnlineCreateSchema } from "@/lib/validations/checkout.schema";
import Order from "@/models/Order";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const auth = await requireAuthUser();
    if ("error" in auth) return auth.error;

    const body = await req.json();
    const parsed = checkoutOnlineCreateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid checkout data" },
        { status: 422 },
      );
    }

    const items = await resolveCartItems(parsed.data.items);
    const { subtotal, codFee, total } = calcOrderTotals(items, "online");
    const amountPaise = amountToPaise(total);

    if (amountPaise < 100) {
      return NextResponse.json(
        { error: "Order total must be at least ₹1" },
        { status: 400 },
      );
    }

    await connectDB();

    let orderNumber = generateOrderNumber();
    for (let attempt = 0; attempt < 3; attempt++) {
      const exists = await Order.findOne({ orderNumber }).lean();
      if (!exists) break;
      orderNumber = generateOrderNumber();
    }

    const order = await Order.create({
      orderNumber,
      userId: auth.userId,
      userEmail: auth.email,
      items,
      subtotal,
      codFee,
      total,
      amountPaise,
      pricing: {
        itemsTotal: subtotal,
        shipping: 0,
        codCharge: codFee,
        gstAmount: 0,
        grandTotal: total,
      },
      paymentMethod: "online",
      paymentStatus: "pending",
      status: "pending",
      orderStatus: "pending_payment",
      stockDecremented: false,
      shipping: parsed.data.shipping,
      notes: parsed.data.notes,
      payment: { method: "razorpay", status: "pending" },
    });

    try {
      const razorpay = getRazorpay();
      const rzOrder = await razorpay.orders.create({
        amount: amountPaise,
        currency: "INR",
        receipt: order.orderNumber,
        notes: {
          orderId: String(order._id),
          orderNumber: order.orderNumber,
          userEmail: auth.email,
        },
      });

      order.razorpayOrderId = rzOrder.id;
      await order.save();

      return NextResponse.json({
        orderId: String(order._id),
        orderNumber: order.orderNumber,
        razorpayOrderId: rzOrder.id,
        amount: amountPaise,
        currency: "INR",
        keyId: getRazorpayKeyId(),
      });
    } catch (rzErr) {
      await Order.updateOne(
        { _id: order._id },
        {
          $set: {
            status: "failed",
            orderStatus: "failed",
            paymentStatus: "failed",
          },
        },
      );
      throw rzErr;
    }
  } catch (err) {
    console.error("[POST /api/orders/razorpay/create]", err);
    const message =
      err instanceof Error ? err.message : "Failed to initiate payment";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
