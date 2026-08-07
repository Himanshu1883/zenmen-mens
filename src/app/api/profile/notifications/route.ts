import { requireAuthUser } from "@/lib/api-auth";
import { connectDB } from "@/lib/db";
import { ok } from "@/lib/http-responses";
import UserNotification from "@/models/UserNotification";

export async function GET() {
  const auth = await requireAuthUser();
  if ("error" in auth) return auth.error;

  await connectDB();
  const notifications = await UserNotification.find({ userId: auth.userId })
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();

  return ok({ notifications });
}
