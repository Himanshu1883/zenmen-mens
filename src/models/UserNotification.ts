import mongoose from "mongoose";

const UserNotificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: [
        "order_shipped",
        "order_out_for_delivery",
        "order_delivered",
        "cancellation_requested",
        "order_cancelled",
        "cancellation_rejected",
      ],
      required: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
    read: { type: Boolean, default: false },
  },
  { timestamps: true },
);

UserNotificationSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.models.UserNotification ||
  mongoose.model("UserNotification", UserNotificationSchema);
