import { connectDB } from "@/lib/db";
import User from "@/models/User";
import mongoose from "mongoose";

/** True only for a 24-char hex MongoDB ObjectId string */
export function isMongoObjectId(value: string): boolean {
  return /^[a-f\d]{24}$/i.test(value);
}

/** Resolve the canonical MongoDB user id (Google OAuth ids are not valid). */
export async function resolveMongoUserId(
  email: string,
  sessionUserId?: string | null,
): Promise<string | null> {
  if (sessionUserId && isMongoObjectId(sessionUserId)) {
    return sessionUserId;
  }

  await connectDB();
  const dbUser = await User.findOne({
    email: email.trim().toLowerCase(),
  })
    .select("_id")
    .lean();

  if (!dbUser?._id) return null;
  return String(dbUser._id);
}

export function assertMongoUserId(userId: string): void {
  if (!mongoose.Types.ObjectId.isValid(userId) || !isMongoObjectId(userId)) {
    throw new Error("Invalid user account reference");
  }
}
