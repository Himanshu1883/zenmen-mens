import { requireAuthUser } from "@/lib/api-auth";
import { connectDB } from "@/lib/db";
import {
  calcOrderTotals,
  generateOrderNumber,
  resolveCartItems,
} from "@/lib/orders";
import { checkoutCodSchema } from "@/lib/validations/checkout.schema";
import Order from "@/models/Order";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const auth = await requireAuthUser();
    if ("error" in auth) return auth.error;

    const body = await req.json();
    const parsed = checkoutCodSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid checkout data" },
        { status: 422 },
      );
    }

    const items = await resolveCartItems(parsed.data.items);
    const { subtotal, codFee, total } = calcOrderTotals(items, "cod");

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
      paymentMethod: "cod",
      paymentStatus: "pending",
      status: "confirmed",
      shipping: parsed.data.shipping,
      notes: parsed.data.notes,
    });

    return NextResponse.json({
      orderId: String(order._id),
      orderNumber: order.orderNumber,
      total,
      paymentMethod: "cod",
    });
  } catch (err) {
    console.error("[POST /api/orders/cod]", err);
    const message =
      err instanceof Error ? err.message : "Failed to place COD order";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
