import {
  lastNMonthStarts,
  monthLabel,
  pctDelta,
  REVENUE_ORDER_STATUSES,
} from "@/lib/admin-metrics";
import { requireAdmin } from "@/lib/admin-auth";
import { connectDB } from "@/lib/db";
import { ok } from "@/lib/http-responses";
import { formatOrderStatusLabel } from "@/lib/order-display";
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
  const monthStarts = lastNMonthStarts(6);
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  const [
    totalUsers,
    usersThisMonth,
    usersLastMonth,
    totalOrders,
    ordersThisMonth,
    ordersLastMonth,
    products,
    available,
    categories,
    userGrowthDocs,
    monthlyOrderDocs,
    statusDocs,
    paymentDocs,
    collectionDocs,
    topSellerDocs,
    revenueThis,
    revenueLast,
  ] = await Promise.all([
    User.countDocuments({}),
    User.countDocuments({ createdAt: { $gte: thisMonthStart } }),
    User.countDocuments({
      createdAt: { $gte: lastMonthStart, $lt: thisMonthStart },
    }),
    Order.countDocuments({}),
    Order.countDocuments({ createdAt: { $gte: thisMonthStart } }),
    Order.countDocuments({
      createdAt: { $gte: lastMonthStart, $lt: thisMonthStart },
    }),
    Product.countDocuments({}),
    Product.countDocuments({ isAvailable: true }),
    Category.countDocuments({}),
    User.aggregate<{ _id: { y: number; m: number }; users: number }>([
      { $match: { createdAt: { $gte: monthStarts[0] } } },
      {
        $group: {
          _id: {
            y: { $year: { date: "$createdAt", timezone: "Asia/Kolkata" } },
            m: { $month: { date: "$createdAt", timezone: "Asia/Kolkata" } },
          },
          users: { $sum: 1 },
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
    Order.aggregate<{ _id: string; count: number }>([
      {
        $group: {
          _id: { $ifNull: ["$orderStatus", "$status"] },
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]),
    Order.aggregate<{ _id: string; count: number; revenue: number }>([
      {
        $group: {
          _id: { $ifNull: ["$paymentMethod", "unknown"] },
          count: { $sum: 1 },
          revenue: { $sum: "$total" },
        },
      },
    ]),
    Product.aggregate<{ _id: string; count: number; stock: number }>([
      {
        $group: {
          _id: {
            $cond: [
              { $or: [{ $eq: ["$category", ""] }, { $eq: ["$category", null] }] },
              "Uncategorized",
              "$category",
            ],
          },
          count: { $sum: 1 },
          stock: { $sum: { $ifNull: ["$stock", 0] } },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 8 },
    ]),
    Order.aggregate<{
      _id: string;
      title: string;
      units: number;
      revenue: number;
      collection: string;
    }>([
      {
        $match: {
          orderStatus: { $nin: ["failed", "cancelled"] },
        },
      },
      { $unwind: "$items" },
      {
        $lookup: {
          from: "products",
          localField: "items.slug",
          foreignField: "slug",
          as: "product",
        },
      },
      {
        $unwind: { path: "$product", preserveNullAndEmptyArrays: true },
      },
      {
        $group: {
          _id: { $ifNull: ["$items.slug", "unknown"] },
          title: { $first: "$items.title" },
          collection: {
            $first: {
              $ifNull: ["$product.category", "Uncategorized"],
            },
          },
          units: { $sum: "$items.qty" },
          revenue: {
            $sum: { $multiply: ["$items.price", "$items.qty"] },
          },
        },
      },
      { $sort: { units: -1 } },
      { $limit: 8 },
      {
        $project: {
          _id: 1,
          title: 1,
          collection: 1,
          units: 1,
          revenue: 1,
        },
      },
    ]),
    Order.aggregate<{ revenue: number; counted: number }>([
      {
        $match: {
          createdAt: { $gte: thisMonthStart },
          $or: [
            { orderStatus: { $in: [...REVENUE_ORDER_STATUSES] } },
            { paymentStatus: "paid" },
          ],
        },
      },
      {
        $group: {
          _id: null,
          revenue: { $sum: "$total" },
          counted: { $sum: 1 },
        },
      },
    ]),
    Order.aggregate<{ revenue: number; counted: number }>([
      {
        $match: {
          createdAt: { $gte: lastMonthStart, $lt: thisMonthStart },
          $or: [
            { orderStatus: { $in: [...REVENUE_ORDER_STATUSES] } },
            { paymentStatus: "paid" },
          ],
        },
      },
      {
        $group: {
          _id: null,
          revenue: { $sum: "$total" },
          counted: { $sum: 1 },
        },
      },
    ]),
  ]);

  const userLookup = new Map(
    userGrowthDocs.map((r) => [`${r._id.y}-${r._id.m}`, r.users]),
  );
  const orderLookup = new Map(
    monthlyOrderDocs.map((r) => [`${r._id.y}-${r._id.m}`, r]),
  );

  let runningUsers = Math.max(0, totalUsers - userGrowthDocs.reduce((s, r) => s + r.users, 0));
  const userGrowth = monthStarts.map((d, i) => {
    const added = userLookup.get(`${d.getFullYear()}-${d.getMonth() + 1}`) ?? 0;
    runningUsers += added;
    return {
      id: `ug-${i}`,
      month: monthLabel(d),
      users: runningUsers,
      newUsers: added,
    };
  });

  const monthlyOrders = monthStarts.map((d, i) => {
    const row = orderLookup.get(`${d.getFullYear()}-${d.getMonth() + 1}`);
    return {
      id: `mo-${i}`,
      month: monthLabel(d),
      orders: row?.orders ?? 0,
      revenue: Math.round(row?.revenue ?? 0),
    };
  });

  const statusUsage = statusDocs.map((s, i) => ({
    id: `st-${i}`,
    section: formatOrderStatusLabel(String(s._id || "unknown")),
    views: s.count,
  }));

  const paymentSplit = paymentDocs.map((p, i) => ({
    id: `pay-${i}`,
    name: p._id === "cod" ? "Cash on delivery" : p._id === "online" ? "Online" : p._id,
    value: p.count,
    revenue: Math.round(p.revenue),
  }));

  const collectionMix = collectionDocs.map((c, i) => ({
    id: `col-${i}`,
    name: c._id,
    value: c.count,
    stock: c.stock,
  }));

  const topSellers = topSellerDocs.map((t) => ({
    slug: t._id,
    title: t.title || t._id,
    collection: t.collection,
    units: t.units,
    revenue: Math.round(t.revenue),
  }));

  const collectionSales = new Map<string, { units: number; revenue: number }>();
  for (const t of topSellers) {
    const cur = collectionSales.get(t.collection) ?? { units: 0, revenue: 0 };
    cur.units += t.units;
    cur.revenue += t.revenue;
    collectionSales.set(t.collection, cur);
  }
  const topCollection =
    [...collectionSales.entries()].sort((a, b) => b[1].units - a[1].units)[0] ??
    null;

  const revenueThisMonth = Math.round(revenueThis[0]?.revenue ?? 0);
  const revenueLastMonth = Math.round(revenueLast[0]?.revenue ?? 0);
  const countedThis = revenueThis[0]?.counted ?? 0;
  const countedLast = revenueLast[0]?.counted ?? 0;
  const avgThis = countedThis > 0 ? Math.round(revenueThisMonth / countedThis) : 0;
  const avgLast = countedLast > 0 ? Math.round(revenueLastMonth / countedLast) : 0;
  const lifetimeAov =
    countedThis + countedLast > 0
      ? avgThis
      : totalOrders > 0
        ? Math.round(revenueThisMonth / Math.max(1, ordersThisMonth))
        : 0;

  const confirmedLifetime = await Order.aggregate<{ revenue: number; counted: number }>([
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
        revenue: { $sum: "$total" },
        counted: { $sum: 1 },
      },
    },
  ]);

  const lifetimeRevenue = Math.round(confirmedLifetime[0]?.revenue ?? 0);
  const lifetimeCounted = confirmedLifetime[0]?.counted ?? 0;
  const avgOrderValue =
    lifetimeCounted > 0 ? Math.round(lifetimeRevenue / lifetimeCounted) : lifetimeAov;

  const inStockPct = products > 0 ? Math.round((available / products) * 1000) / 10 : 0;

  return ok({
    generatedAt: now.toISOString(),
    kpis: {
      totalUsers,
      usersThisMonth,
      userDeltaPct: pctDelta(usersThisMonth, usersLastMonth),
      totalOrders,
      ordersThisMonth,
      orderDeltaPct: pctDelta(ordersThisMonth, ordersLastMonth),
      catalogProducts: products,
      inStockPct,
      avgOrderValue,
      aovDeltaPct: pctDelta(avgThis, avgLast),
      revenueThisMonth,
      revenueDeltaPct: pctDelta(revenueThisMonth, revenueLastMonth),
      confirmedThisMonth: countedThis,
    },
    userGrowth,
    monthlyOrders,
    statusUsage,
    paymentSplit,
    collectionMix,
    topSellers,
    summary: {
      topCollection: topCollection
        ? {
            name: topCollection[0],
            units: topCollection[1].units,
            revenue: topCollection[1].revenue,
          }
        : null,
      topProduct: topSellers[0]
        ? {
            name: topSellers[0].title,
            units: topSellers[0].units,
            collection: topSellers[0].collection,
          }
        : null,
      avgOrderValue,
      categories,
    },
  });
}
