import { requireAdmin } from "@/lib/admin-auth";
import { connectDB } from "@/lib/db";
import { ok } from "@/lib/http-responses";
import { serializeOrder } from "@/lib/order-display";
import Order from "@/models/Order";

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

export async function GET() {
  const admin = await requireAdmin();
  if ("error" in admin) return admin.error;

  await connectDB();
  const all = await Order.find({}).sort({ createdAt: -1 }).lean();

  const now = new Date();
  const weekStart = startOfDay(new Date(now.getTime() - 6 * 86400000));
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const weeklyMap = new Map<string, { orders: number; revenue: number }>();
  for (let i = 0; i < 7; i++) {
    const d = new Date(weekStart.getTime() + i * 86400000);
    weeklyMap.set(dayNames[d.getDay()]!, { orders: 0, revenue: 0 });
  }

  const monthMap = new Map<string, { revenue: number; orders: number }>();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = d.toLocaleDateString("en-IN", { month: "short" });
    monthMap.set(key, { revenue: 0, orders: 0 });
  }

  let totalRevenue = 0;
  const terminalRevenue = new Set([
    "confirmed",
    "processing",
    "shipped",
    "out_for_delivery",
    "delivered",
  ]);

  for (const doc of all) {
    const total = Number(doc.total ?? 0);
    const status = String(doc.orderStatus ?? doc.status ?? "");
    if (terminalRevenue.has(status) || doc.paymentStatus === "paid") {
      totalRevenue += total;
    }

    const created = doc.createdAt ? new Date(doc.createdAt) : null;
    if (created && created >= weekStart) {
      const day = dayNames[created.getDay()]!;
      const bucket = weeklyMap.get(day);
      if (bucket) {
        bucket.orders += 1;
        bucket.revenue += total;
      }
    }

    if (created) {
      const key = created.toLocaleDateString("en-IN", { month: "short" });
      if (monthMap.has(key)) {
        const m = monthMap.get(key)!;
        m.orders += 1;
        m.revenue += total;
      }
    }
  }

  const weeklyData = Array.from(weeklyMap.entries()).map(([day, v]) => ({
    day,
    orders: v.orders,
    revenue: v.revenue,
  }));

  const revenueData = Array.from(monthMap.entries()).map(([month, v], i) => ({
    id: `rev-${i}`,
    month,
    revenue: Math.round(v.revenue),
    orders: v.orders,
  }));

  const recentOrders = all.slice(0, 5).map((d) => {
    const s = serializeOrder(d as Record<string, unknown>);
    return {
      id: s.orderNumber,
      client: s.customerName,
      item: s.itemSummary,
      status: s.orderStatus,
      value: s.total,
      time: s.createdAt,
    };
  });

  const counts = {
    totalOrders: all.length,
    pending: all.filter((o) =>
      ["pending", "pending_payment"].includes(
        String(o.orderStatus ?? o.status),
      ),
    ).length,
    inFulfillment: all.filter((o) =>
      ["confirmed", "processing", "shipped", "out_for_delivery"].includes(
        String(o.orderStatus ?? o.status),
      ),
    ).length,
    delivered: all.filter(
      (o) => String(o.orderStatus ?? o.status) === "delivered",
    ).length,
    cancellationRequested: all.filter(
      (o) => String(o.orderStatus ?? o.status) === "cancellation_requested",
    ).length,
    totalRevenue: Math.round(totalRevenue),
  };

  return ok({
    counts,
    weeklyData,
    revenueData,
    recentOrders,
    hasRealData: all.length > 0,
  });
}
