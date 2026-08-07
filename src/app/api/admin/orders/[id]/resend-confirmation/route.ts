import { requireAdmin } from "@/lib/admin-auth";
import { connectDB } from "@/lib/db";
import { fail, ok } from "@/lib/http-responses";
import Order from "@/models/Order";
import { sendOrderConfirmationEmail } from "@/services/orderEmailService";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(_req: Request, ctx: Ctx) {
  const admin = await requireAdmin();
  if ("error" in admin) return admin.error;
  const { id } = await ctx.params;

  await connectDB();
  const order = await Order.findById(id);
  if (!order) return fail("ORDER_NOT_FOUND", "Order not found", 404);

  const count = order.emailLog?.resendCount ?? 0;
  if (count >= 3) {
    return fail("RATE_LIMIT", "Max 3 resends per 24h", 429);
  }

  const result = await sendOrderConfirmationEmail(order, { forceResend: true });
  order.emailLog = order.emailLog ?? {};
  order.emailLog.resendCount = count + 1;
  order.emailLog.lastResentAt = new Date();
  if (!result.sent && "error" in result) {
    order.emailLog.lastError = result.error;
  }
  await order.save();

  return ok({ sent: result.sent });
}
