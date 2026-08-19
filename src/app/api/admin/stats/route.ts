import {
  clampPct,
  lastNMonthStarts,
  monthLabel,
  REVENUE_ORDER_STATUSES,
  startOfDay,
} from "@/lib/admin-metrics";
import { requireAdmin } from "@/lib/admin-auth";
import { connectDB } from "@/lib/db";
import { ok } from "@/lib/http-responses";
import { serializeOrder } from "@/lib/order-display";
import Category from "@/models/Category";
import Order from "@/models/Order";
import Product from "@/models/Product";
import User from "@/models/User";

export const dynamic = "force-dynamic";

export async function GET() {
  const admin = await requireAdmin();
  if ("error" in admin) return admin.error;

  await connectDB();

  const now = new Date();
  const todayStart = startOfDay(now);
  const weekStart = startOfDay(new Date(now.getTime() - 6 * 86400000));
  const monthStarts = lastNMonthStarts(6);
  const monthStart = monthStarts[monthStarts.length - 1]!;
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const [
    statusCounts,
    revenueAgg,
    weeklyDocs,
    monthDocs,
    todayAgg,
    recentDocs,
    catalog,
  ] = await Promise.all([
    Order.aggregate<{ _id: string; count: number }>([
      { $group: { _id: { $ifNull: ["$orderStatus", "$status"] }, count: { $sum: 1 } } },
    ]),
    Order.aggregate<{ totalRevenue: number; counted: number }>([
      {
        $match: {
          $or: [
            { orderStatus: { $in: [...REVENUE_ORDER_STATUSES] } },
            { paymentStatus: "paid" },
          ],
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$total" },
          counted: { $sum: 1 },
        },
      },
    ]),
    Order.aggregate<{ _id: number; orders: number; revenue: number }>([
      { $match: { createdAt: { $gte: weekStart } } },
      {
        $group: {
          _id: {
            $dayOfWeek: {
              date: "$createdAt",
              timezone: "Asia/Kolkata",
            },
          },
          orders: { $sum: 1 },
          revenue: { $sum: "$total" },
        },
      },
    ]),
    Order.aggregate<{ _id: { y: number; m: number }; orders: number; revenue: number }>([
      { $match: { createdAt: { $gte: monthStarts[0] } } },
      {
        $group: {
          _id: {
            y: { $year: { date: "$createdAt", timezone: "Asia/Kolkata" } },
            m: { $month: { date: "$createdAt", timezone: "Asia/Kolkata" } },
          },
          orders: { $sum: 1 },
          revenue: { $sum: "$total" },
        },
      },
    ]),
    Order.aggregate<{ orders: number; revenue: number }>([
      { $match: { createdAt: { $gte: todayStart } } },
      {
        $group: {
          _id: null,
          orders: { $sum: 1 },
          revenue: { $sum: "$total" },
        },
      },
    ]),
    Order.find({})
      .sort({ createdAt: -1 })
      .limit(6)
      .lean(),
    Promise.all([
      Order.countDocuments({}),
      User.countDocuments({}),
      Product.countDocuments({}),
      Category.countDocuments({}),
      Product.countDocuments({ isAvailable: true }),
      Product.countDocuments({ stock: { $lte: 5 } }),
      Product.countDocuments({ isFeatured: true }),
    ]),
  ]);

  const statusMap = new Map(statusCounts.map((s) => [String(s._id ?? ""), s.count]));
  const pick = (...keys: string[]) =>
    keys.reduce((sum, k) => sum + (statusMap.get(k) ?? 0), 0);

  const [
    totalOrders,
    userCount,
    productCount,
    categoryCount,
    availableProducts,
    lowStock,
    featured,
  ] = catalog;

  const totalRevenue = Math.round(revenueAgg[0]?.totalRevenue ?? 0);
  const revenueOrderCount = revenueAgg[0]?.counted ?? 0;

  const weeklyMap = new Map<string, { orders: number; revenue: number }>();
  for (let i = 0; i < 7; i++) {
    const d = new Date(weekStart.getTime() + i * 86400000);
    weeklyMap.set(dayNames[d.getDay()]!, { orders: 0, revenue: 0 });
  }
  for (const row of weeklyDocs) {
    const day = dayNames[(row._id - 1 + 7) % 7];
    if (!day) continue;
    const bucket = weeklyMap.get(day);
    if (bucket) {
      bucket.orders = row.orders;
      bucket.revenue = Math.round(row.revenue);
    }
  }

  const monthKey = (y: number, m: number) =>
    monthLabel(new Date(y, m - 1, 1));
  const monthLookup = new Map(
    monthDocs.map((r) => [`${r._id.y}-${r._id.m}`, r]),
  );

  const revenueData = monthStarts.map((d, i) => {
    const row = monthLookup.get(`${d.getFullYear()}-${d.getMonth() + 1}`);
    return {
      id: `rev-${i}`,
      month: monthLabel(d),
      revenue: Math.round(row?.revenue ?? 0),
      orders: row?.orders ?? 0,
    };
  });

  const weeklyData = Array.from(weeklyMap.entries()).map(([day, v]) => ({
    day,
    orders: v.orders,
    revenue: v.revenue,
  }));

  const recentOrders = recentDocs.map((d) => {
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

  const inFulfillment = pick(
    "confirmed",
    "processing",
    "shipped",
    "out_for_delivery",
  );
  const delivered = pick("delivered");
  const pending = pick("pending", "pending_payment");
  const cancellationRequested = pick("cancellation_requested");

  const counts = {
    totalOrders,
    pending,
    inFulfillment,
    delivered,
    cancellationRequested,
    totalRevenue,
    users: userCount,
    products: productCount,
    categories: categoryCount,
    todayOrders: todayAgg[0]?.orders ?? 0,
    todayRevenue: Math.round(todayAgg[0]?.revenue ?? 0),
    revenueOrders: revenueOrderCount,
  };

  const health = [
    {
      metric: "Fulfillment",
      value: clampPct(totalOrders ? ((inFulfillment + delivered) / totalOrders) * 100 : 0),
    },
    {
      metric: "Confirmed",
      value: clampPct(totalOrders ? (revenueOrderCount / totalOrders) * 100 : 0),
    },
    {
      metric: "In stock",
      value: clampPct(productCount ? (availableProducts / productCount) * 100 : 0),
    },
    {
      metric: "Catalog",
      value: clampPct(productCount ? ((productCount - lowStock) / productCount) * 100 : 0),
    },
    {
      metric: "Featured",
      value: clampPct(productCount ? (featured / productCount) * 100 : 0),
    },
  ];

  return ok({
    counts,
    catalog: {
      products: productCount,
      available: availableProducts,
      lowStock,
      featured,
      users: userCount,
      categories: categoryCount,
    },
    weeklyData,
    revenueData,
    recentOrders,
    health,
    generatedAt: now.toISOString(),
    monthStart: monthStart.toISOString(),
    hasRealData: totalOrders > 0,
  });
}
