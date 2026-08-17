import { ORDER_STATUSES } from "@/config/orderStatusConfig";
import { requireAdmin } from "@/lib/admin-auth";
import { connectDB } from "@/lib/db";
import { ok } from "@/lib/http-responses";
import { serializeOrder } from "@/lib/order-display";
import { escapeRegex } from "@/lib/utils";
import Order from "@/models/Order";

const STATUS_SET = new Set<string>(ORDER_STATUSES);

function parseDayStart(value: string): Date | null {
  const d = new Date(`${value}T00:00:00`);
  return Number.isNaN(d.getTime()) ? null : d;
}

function parseDayEnd(value: string): Date | null {
  const d = new Date(`${value}T23:59:59.999`);
  return Number.isNaN(d.getTime()) ? null : d;
}

export async function GET(req: Request) {
  const admin = await requireAdmin();
  if ("error" in admin) return admin.error;

  const { searchParams } = new URL(req.url);
  const page = Math.max(1, Number(searchParams.get("page") ?? 1) || 1);
  const limit = Math.min(
    200,
    Math.max(1, Number(searchParams.get("limit") ?? 50) || 50),
  );
  const status = searchParams.get("status")?.trim() ?? "";
  const paymentMethod = searchParams.get("paymentMethod")?.trim() ?? "";
  const q = searchParams.get("q")?.trim().slice(0, 80) ?? "";
  const from = searchParams.get("from")?.trim() ?? "";
  const to = searchParams.get("to")?.trim() ?? "";

  const query: Record<string, unknown> = {};

  if (status && STATUS_SET.has(status)) {
    query.orderStatus = status;
  }

  if (paymentMethod === "cod" || paymentMethod === "online") {
    query.paymentMethod = paymentMethod;
  }

  const createdAt: Record<string, Date> = {};
  if (from) {
    const start = parseDayStart(from);
    if (start) createdAt.$gte = start;
  }
  if (to) {
    const end = parseDayEnd(to);
    if (end) createdAt.$lte = end;
  }
  if (Object.keys(createdAt).length > 0) {
    query.createdAt = createdAt;
  }

  if (q) {
    const regex = new RegExp(escapeRegex(q), "i");
    query.$or = [
      { orderNumber: regex },
      { userEmail: regex },
      { "shipping.fullName": regex },
      { "shipping.email": regex },
      { "shipping.phone": regex },
    ];
  }

  await connectDB();

  const skip = (page - 1) * limit;

  const [
    docs,
    total,
    allTotal,
    pending,
    active,
    delivered,
    cancelled,
    cancellationRequested,
  ] = await Promise.all([
    Order.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Order.countDocuments(query),
    Order.countDocuments({}),
    Order.countDocuments({
      orderStatus: { $in: ["pending", "pending_payment"] },
    }),
    Order.countDocuments({
      orderStatus: {
        $in: ["confirmed", "processing", "shipped", "out_for_delivery"],
      },
    }),
    Order.countDocuments({ orderStatus: "delivered" }),
    Order.countDocuments({ orderStatus: "cancelled" }),
    Order.countDocuments({ orderStatus: "cancellation_requested" }),
  ]);

  const orders = docs.map((d) => serializeOrder(d as Record<string, unknown>));
  const pages = Math.ceil(total / limit) || 1;

  return ok({
    orders,
    total,
    page,
    pages,
    counts: {
      total: allTotal,
      pending,
      active,
      delivered,
      cancelled,
      cancellationRequested,
    },
  });
}
