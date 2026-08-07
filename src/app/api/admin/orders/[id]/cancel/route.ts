import { requireAdmin } from "@/lib/admin-auth";
import { fail, ok } from "@/lib/http-responses";
import {
  adminApproveCancellation,
  adminCancelOrder,
  adminRejectCancellation,
  getCancelEligibility,
} from "@/services/orderCancellationService";
import { connectDB } from "@/lib/db";
import Order from "@/models/Order";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, ctx: Ctx) {
  const admin = await requireAdmin();
  if ("error" in admin) return admin.error;
  const { id } = await ctx.params;
  await connectDB();
  const order = await Order.findById(id).lean();
  if (!order) return fail("ORDER_NOT_FOUND", "Order not found", 404);
  return ok(getCancelEligibility(order, "admin"));
}

export async function POST(req: Request, ctx: Ctx) {
  const admin = await requireAdmin();
  if ("error" in admin) return admin.error;
  const { id } = await ctx.params;
  const body = (await req.json()) as { reason?: string; note?: string };
  try {
    const order = await adminCancelOrder(id, body.reason ?? "admin", body.note);
    return ok({ order });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Cancel failed";
    return fail("NOT_ELIGIBLE", msg, 400);
  }
}
