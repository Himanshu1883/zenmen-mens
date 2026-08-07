import {
  ADMIN_CANCEL_STATUSES,
  CANCEL_REASONS,
  CANCEL_USER_WINDOW_MINUTES,
  NON_CANCELLABLE,
  SHIPPED_BLOCK,
  type CancelReason,
} from "@/config/cancellationConfig";
import { connectDB } from "@/lib/db";
import { amountToPaise } from "@/lib/orders";
import { initiateRefund } from "@/lib/razorpay";
import Order from "@/models/Order";
import {
  sendCancellationEmail,
} from "@/services/orderEmailService";
import { createUserNotification } from "@/services/orderNotifyService";
import { restoreStockForOrder } from "@/services/stockService";
import mongoose from "mongoose";

type OrderLean = {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  orderNumber: string;
  userEmail: string;
  total: number;
  subtotal: number;
  codFee?: number;
  items: { productId: string; title: string; qty: number; price: number }[];
  shipping: Record<string, string>;
  paymentMethod: "cod" | "online";
  paymentStatus: string;
  status: string;
  orderStatus?: string;
  stockDecremented?: boolean;
  razorpayPaymentId?: string;
  amountPaise?: number;
  createdAt?: Date;
  cancellation?: {
    status?: string;
  };
};

function effectiveStatus(order: OrderLean) {
  return order.orderStatus ?? order.status;
}

function minutesSinceCreated(order: OrderLean) {
  const created = order.createdAt ? new Date(order.createdAt).getTime() : Date.now();
  return Math.floor((Date.now() - created) / 60000);
}

export function getCancelEligibility(order: OrderLean, role: "user" | "admin") {
  const status = effectiveStatus(order);
  const blocked = [...NON_CANCELLABLE, ...SHIPPED_BLOCK];
  if ((blocked as readonly string[]).includes(status)) {
    return {
      canCancel: false,
      mode: null as null,
      reason: "This order can no longer be cancelled online.",
      windowMinutes: CANCEL_USER_WINDOW_MINUTES,
      minutesElapsed: minutesSinceCreated(order),
    };
  }

  if (role === "admin") {
    const can = (ADMIN_CANCEL_STATUSES as readonly string[]).includes(status);
    return {
      canCancel: can,
      mode: can ? ("instant" as const) : null,
      reason: can ? undefined : "Order status does not allow admin cancel.",
      windowMinutes: CANCEL_USER_WINDOW_MINUTES,
      minutesElapsed: minutesSinceCreated(order),
    };
  }

  if (status === "cancellation_requested") {
    return {
      canCancel: false,
      mode: null,
      reason: "Cancellation already requested — awaiting admin review.",
      windowMinutes: CANCEL_USER_WINDOW_MINUTES,
      minutesElapsed: minutesSinceCreated(order),
    };
  }

  const elapsed = minutesSinceCreated(order);
  const instant =
    elapsed <= CANCEL_USER_WINDOW_MINUTES &&
    ["created", "confirmed", "pending"].includes(status);

  if (instant) {
    return {
      canCancel: true,
      mode: "instant" as const,
      windowMinutes: CANCEL_USER_WINDOW_MINUTES,
      minutesElapsed: elapsed,
    };
  }

  if (["created", "confirmed", "pending"].includes(status)) {
    return {
      canCancel: true,
      mode: "request" as const,
      windowMinutes: CANCEL_USER_WINDOW_MINUTES,
      minutesElapsed: elapsed,
    };
  }

  return {
    canCancel: false,
    mode: null,
    reason: "Order cannot be cancelled.",
    windowMinutes: CANCEL_USER_WINDOW_MINUTES,
    minutesElapsed: elapsed,
  };
}

async function applyRefund(order: OrderLean) {
  if (order.paymentMethod !== "online" || order.paymentStatus !== "paid") {
    return { refundStatus: "not_applicable" as const };
  }
  if (!order.razorpayPaymentId) {
    return { refundStatus: "failed" as const, error: "Missing payment id" };
  }
  const amountPaise = order.amountPaise ?? amountToPaise(order.total);
  try {
    const refund = await initiateRefund(order.razorpayPaymentId, amountPaise, {
      orderNumber: order.orderNumber,
    });
    const refundId =
      (refund as { id?: string }).id ?? String((refund as { id?: string }).id);
    return {
      refundStatus: "initiated" as const,
      refundId,
      refundAmount: amountPaise,
    };
  } catch (e) {
    console.error("[cancel] refund failed", e);
    return { refundStatus: "failed" as const };
  }
}

async function cancelOrderCore(
  order: OrderLean,
  meta: {
    requestedBy: "user" | "admin";
    reason: string;
    note?: string;
    adminNote?: string;
  },
) {
  const refund = await applyRefund(order);

  await Order.updateOne(
    { _id: order._id },
    {
      $set: {
        status: "cancelled",
        orderStatus: "cancelled",
        ...(order.paymentMethod === "cod"
          ? { "payment.status": "cancelled" }
          : {}),
        "cancellation.status": "cancelled",
        "cancellation.requestedBy": meta.requestedBy,
        "cancellation.reason": meta.reason,
        "cancellation.note": meta.note,
        "cancellation.adminNote": meta.adminNote,
        "cancellation.resolvedAt": new Date(),
        "cancellation.refundStatus": refund.refundStatus,
        "cancellation.refundAmount": refund.refundAmount,
        "cancellation.refundId": refund.refundId,
        "cancellation.refundInitiatedAt":
          refund.refundStatus === "initiated" ? new Date() : undefined,
      },
      $push: {
        statusHistory: {
          status: "cancelled",
          changedAt: new Date(),
          changedBy: meta.requestedBy,
          note: meta.note,
        },
      },
    },
  );

  if (order.stockDecremented) {
    await restoreStockForOrder(
      order.items.map((i) => ({ productId: i.productId, qty: i.qty })),
    );
  }

  await createUserNotification({
    userId: order.userId,
    type: "order_cancelled",
    title: "Order cancelled",
    message: `Order ${order.orderNumber} has been cancelled.`,
    orderId: order._id,
  });

  await sendCancellationEmail(
    order as unknown as Parameters<typeof sendCancellationEmail>[0],
    "Order cancelled",
    `Your order ${order.orderNumber} has been cancelled.`,
  );

  return refund;
}

export async function cancelOrderAsUser(
  orderId: string,
  userId: string,
  reason: CancelReason,
  note?: string,
) {
  if (!CANCEL_REASONS.includes(reason)) {
    throw new Error("INVALID_REASON");
  }

  await connectDB();
  const order = (await Order.findOne({
    _id: orderId,
    userId,
  }).lean()) as OrderLean | null;

  if (!order) throw new Error("ORDER_NOT_FOUND");

  const eligibility = getCancelEligibility(order, "user");
  if (!eligibility.canCancel || !eligibility.mode) {
    throw new Error(eligibility.reason ?? "NOT_ELIGIBLE");
  }

  if (eligibility.mode === "instant") {
    await cancelOrderCore(order, { requestedBy: "user", reason, note });
    const updated = await Order.findById(orderId);
    return { mode: "cancelled" as const, order: updated };
  }

  await Order.updateOne(
    { _id: orderId },
    {
      $set: {
        orderStatus: "cancellation_requested",
        status: "cancellation_requested",
        "cancellation.status": "requested",
        "cancellation.requestedBy": "user",
        "cancellation.reason": reason,
        "cancellation.note": note,
        "cancellation.requestedAt": new Date(),
      },
      $push: {
        statusHistory: {
          status: "cancellation_requested",
          changedAt: new Date(),
          changedBy: "user",
        },
      },
    },
  );

  await createUserNotification({
    userId: new mongoose.Types.ObjectId(userId),
    type: "cancellation_requested",
    title: "Cancellation requested",
    message: `We received your cancellation request for ${order.orderNumber}.`,
    orderId: order._id,
  });

  await sendCancellationEmail(
    order as unknown as Parameters<typeof sendCancellationEmail>[0],
    "Cancellation requested",
    `We received your cancellation request for order ${order.orderNumber}.`,
  );

  const updated = await Order.findById(orderId);
  return { mode: "requested" as const, order: updated };
}

export async function adminCancelOrder(
  orderId: string,
  reason: string,
  note?: string,
) {
  await connectDB();
  const order = (await Order.findById(orderId).lean()) as OrderLean | null;
  if (!order) throw new Error("ORDER_NOT_FOUND");

  const eligibility = getCancelEligibility(order, "admin");
  if (!eligibility.canCancel) throw new Error("NOT_ELIGIBLE");

  await cancelOrderCore(order, {
    requestedBy: "admin",
    reason,
    note,
    adminNote: note,
  });

  return Order.findById(orderId);
}

export async function adminApproveCancellation(orderId: string, adminNote?: string) {
  await connectDB();
  const order = (await Order.findById(orderId).lean()) as OrderLean | null;
  if (!order || effectiveStatus(order) !== "cancellation_requested") {
    throw new Error("NOT_ELIGIBLE");
  }

  await cancelOrderCore(order, {
    requestedBy: "admin",
    reason: order.cancellation?.status ?? "approved",
    adminNote,
  });

  return Order.findById(orderId);
}

export async function adminRejectCancellation(orderId: string, adminNote?: string) {
  await connectDB();
  const order = await Order.findById(orderId);
  if (!order || effectiveStatus(order) !== "cancellation_requested") {
    throw new Error("NOT_ELIGIBLE");
  }

  order.orderStatus = "confirmed";
  order.status = "confirmed";
  order.cancellation = {
    ...order.cancellation,
    status: "rejected",
    adminNote,
    resolvedAt: new Date(),
  };
  order.statusHistory.push({
    status: "confirmed",
    changedAt: new Date(),
    changedBy: "admin",
    note: adminNote,
  });
  await order.save();

  await createUserNotification({
    userId: order.userId,
    type: "cancellation_rejected",
    title: "Cancellation declined",
    message: `Your cancellation request for ${order.orderNumber} was declined.`,
    orderId: order._id,
  });

  await sendCancellationEmail(
    order,
    "Cancellation request declined",
    `We could not cancel order ${order.orderNumber}. It remains confirmed.`,
  );

  return order;
}
