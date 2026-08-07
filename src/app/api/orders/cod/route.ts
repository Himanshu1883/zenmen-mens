import { requireAuthUser } from "@/lib/api-auth";
import { connectDB } from "@/lib/db";
import {
  calcOrderTotals,
  generateOrderNumber,
  resolveCartItems,
} from "@/lib/orders";
import { checkoutCodSchema } from "@/lib/validations/checkout.schema";
import Order from "@/models/Order";
import {
  finalizeCodOrder,
  markOrderFailed,
} from "@/services/orderFinalizeService";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  let createdOrderId: string | null = null;

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

    // Pending until stock finalize succeeds — never insert as confirmed first
    const order = await Order.create({
      orderNumber,
      userId: auth.userId,
      userEmail: auth.email,
      items,
      subtotal,
      codFee,
      total,
      amountPaise: Math.round(total * 100),
      pricing: {
        itemsTotal: subtotal,
        shipping: 0,
        codCharge: codFee,
        gstAmount: 0,
        grandTotal: total,
      },
      paymentMethod: "cod",
      paymentStatus: "pending",
      status: "pending",
      orderStatus: "pending",
      stockDecremented: false,
      shipping: parsed.data.shipping,
      notes: parsed.data.notes,
      payment: { method: "cod", status: "pending" },
      statusHistory: [
        {
          status: "pending",
          changedAt: new Date(),
          changedBy: "user",
          note: "COD checkout started",
        },
      ],
    });

    createdOrderId = String(order._id);

    await finalizeCodOrder(createdOrderId);

    const confirmed = await Order.findById(createdOrderId)
      .select("orderNumber total orderStatus")
      .lean();

    if (!confirmed || confirmed.orderStatus === "failed") {
      return NextResponse.json(
        { error: "Could not confirm COD order. Please try again." },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      orderId: createdOrderId,
      orderNumber: confirmed.orderNumber,
      total: confirmed.total ?? total,
      paymentMethod: "cod",
    });
  } catch (err) {
    console.error("[POST /api/orders/cod]", err);

    if (createdOrderId) {
      try {
        await markOrderFailed(
          createdOrderId,
          err instanceof Error ? err.message : "COD finalize failed",
        );
      } catch (markErr) {
        console.error("[POST /api/orders/cod] mark failed", markErr);
      }
    }

    const message =
      err instanceof Error ? err.message : "Failed to place COD order";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
