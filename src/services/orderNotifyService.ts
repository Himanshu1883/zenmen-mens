import { connectDB } from "@/lib/db";
import UserNotification from "@/models/UserNotification";
import type mongoose from "mongoose";

export async function createUserNotification(input: {
  userId: mongoose.Types.ObjectId;
  type:
    | "order_shipped"
    | "order_out_for_delivery"
    | "order_delivered"
    | "cancellation_requested"
    | "order_cancelled"
    | "cancellation_rejected";
  title: string;
  message: string;
  orderId?: mongoose.Types.ObjectId;
}) {
  await connectDB();
  return UserNotification.create(input);
}
