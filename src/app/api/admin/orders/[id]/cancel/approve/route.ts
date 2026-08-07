import { requireAdmin } from "@/lib/admin-auth";
import { fail, ok } from "@/lib/http-responses";
import { adminApproveCancellation } from "@/services/orderCancellationService";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(req: Request, ctx: Ctx) {
  const admin = await requireAdmin();
  if ("error" in admin) return admin.error;
  const { id } = await ctx.params;
  const body = (await req.json()) as { adminNote?: string };
  try {
    const order = await adminApproveCancellation(id, body.adminNote);
    return ok({ order });
  } catch {
    return fail("NOT_ELIGIBLE", "Cannot approve cancellation", 400);
  }
}
