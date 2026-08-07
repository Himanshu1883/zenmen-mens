import { requireAdmin } from "@/lib/admin-auth";
import { connectDB } from "@/lib/db";
import { ok } from "@/lib/http-responses";
import { serializeOrder } from "@/lib/order-display";
import Order from "@/models/Order";

export async function GET(req: Request) {
  const admin = await requireAdmin();
  if ("error" in admin) return admin.error;

  const { searchParams } = new URL(req.url);
  const limit = Math.min(200, Math.max(1, Number(searchParams.get("limit") ?? 50)));

  await connectDB();
  const docs = await Order.find({})
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();

  const orders = docs.map((d) => serializeOrder(d as Record<string, unknown>));

  const counts = {
    total: orders.length,
    pending: orders.filter((o) =>
      ["pending", "pending_payment"].includes(o.orderStatus),
    ).length,
    active: orders.filter((o) =>
      ["confirmed", "processing", "shipped", "out_for_delivery"].includes(
        o.orderStatus,
      ),
    ).length,
    delivered: orders.filter((o) => o.orderStatus === "delivered").length,
    cancelled: orders.filter((o) => o.orderStatus === "cancelled").length,
    cancellationRequested: orders.filter(
      (o) => o.orderStatus === "cancellation_requested",
    ).length,
  };

  return ok({ orders, counts });
}
