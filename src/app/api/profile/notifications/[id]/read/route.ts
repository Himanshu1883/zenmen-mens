import { requireAuthUser } from "@/lib/api-auth";
import { connectDB } from "@/lib/db";
import { fail, ok } from "@/lib/http-responses";
import UserNotification from "@/models/UserNotification";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(_req: Request, ctx: Ctx) {
  const auth = await requireAuthUser();
  if ("error" in auth) return auth.error;
  const { id } = await ctx.params;

  await connectDB();
  const updated = await UserNotification.findOneAndUpdate(
    { _id: id, userId: auth.userId },
    { read: true },
    { new: true },
  );
  if (!updated) return fail("NOT_FOUND", "Notification not found", 404);
  return ok({ notification: updated });
}
