import { requireAuthUser } from "@/lib/api-auth";
import { connectDB } from "@/lib/db";
import { ok } from "@/lib/http-responses";
import UserNotification from "@/models/UserNotification";

export async function GET() {
  const auth = await requireAuthUser();
  if ("error" in auth) return auth.error;

  await connectDB();
  const count = await UserNotification.countDocuments({
    userId: auth.userId,
    read: false,
  });

  return ok({ count });
}
