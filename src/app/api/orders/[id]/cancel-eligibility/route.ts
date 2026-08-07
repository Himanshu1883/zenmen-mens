import { requireAuthUser } from "@/lib/api-auth";
import { connectDB } from "@/lib/db";
import { fail, ok } from "@/lib/http-responses";
import Order from "@/models/Order";
import { getCancelEligibility } from "@/services/orderCancellationService";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, ctx: Ctx) {
  const auth = await requireAuthUser();
  if ("error" in auth) return auth.error;
  const { id } = await ctx.params;

  await connectDB();
  const order = await Order.findOne({ _id: id, userId: auth.userId }).lean();
  if (!order) return fail("ORDER_NOT_FOUND", "Order not found", 404);

  const eligibility = getCancelEligibility(order, "user");
  return ok(eligibility);
}
