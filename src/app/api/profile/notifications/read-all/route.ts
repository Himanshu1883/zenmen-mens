import { requireAuthUser } from "@/lib/api-auth";
import { connectDB } from "@/lib/db";
import { ok } from "@/lib/http-responses";
import UserNotification from "@/models/UserNotification";

export async function POST() {
  const auth = await requireAuthUser();
  if ("error" in auth) return auth.error;

  await connectDB();
  await UserNotification.updateMany(
    { userId: auth.userId, read: false },
    { read: true },
  );

  return ok({});
}
