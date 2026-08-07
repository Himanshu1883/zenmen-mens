import { connectDB } from "@/lib/db";
import { amountToPaise } from "@/lib/orders";
import Order from "@/models/Order";
import {
  decrementStockForOrder,
  restoreStockForOrder,
} from "@/services/stockService";
import { sendOrderConfirmationEmail } from "@/services/orderEmailService";
import mongoose from "mongoose";

type FinalizeInput = {
  orderId: string;
  paymentId: string;
  signature: string;
  actor: "user" | "webhook";
};

export async function finalizePaidOrder(input: FinalizeInput) {
  await connectDB();

  const updated = await Order.findOneAndUpdate(
    {
      _id: input.orderId,
      stockDecremented: { $ne: true },
    },
    {
      $set: {
        stockDecremented: true,
        paymentStatus: "paid",
        status: "confirmed",
        orderStatus: "confirmed",
        razorpayPaymentId: input.paymentId,
        razorpaySignature: input.signature,
        "payment.method": "razorpay",
        "payment.paymentId": input.paymentId,
        "payment.signature": input.signature,
        "payment.status": "paid",
      },
      $push: {
        statusHistory: {
          status: "confirmed",
          changedAt: new Date(),
          changedBy: input.actor,
          note: "Payment captured",
        },
      },
    },
    { new: true },
  );

  if (!updated) {
    const existing = await Order.findById(input.orderId);
    if (existing?.paymentStatus === "paid") {
      return { order: existing, alreadyFinalized: true as const };
    }
    throw new Error("Order finalize failed");
  }

  if (!updated.amountPaise) {
    await Order.updateOne(
      { _id: updated._id },
      { $set: { amountPaise: amountToPaise(updated.total) } },
    );
  }

  try {
    await decrementStockForOrder(
      updated.items.map((i: { productId: string; qty: number }) => ({
        productId: i.productId,
        qty: i.qty,
      })),
    );
  } catch (err) {
    // Roll back “confirmed” so a failed stock write never leaves a live order
    await Order.updateOne(
      { _id: updated._id },
      {
        $set: {
          stockDecremented: false,
          paymentStatus: "paid",
          status: "failed",
          orderStatus: "failed",
        },
        $push: {
          statusHistory: {
            status: "failed",
            changedAt: new Date(),
            changedBy: input.actor,
            note: "Stock update failed after payment",
          },
        },
      },
    );
    throw err;
  }

  void sendOrderConfirmationEmail(updated).then(async (result) => {
    if (result.sent) {
      await Order.updateOne(
        { _id: updated._id },
        {
          $set: {
            "emailLog.confirmationSentAt": new Date(),
          },
        },
      );
    } else if (result.reason === "send_failed" && "error" in result) {
      await Order.updateOne(
        { _id: updated._id },
        { $set: { "emailLog.lastError": result.error } },
      );
    }
  });

  return { order: updated, alreadyFinalized: false as const };
}

/**
 * Finalize COD only after stock succeeds. Never leave confirmed ghosts on failure.
 */
export async function finalizeCodOrder(orderId: string) {
  await connectDB();
  const order = await Order.findById(orderId);
  if (!order) throw new Error("Order not found");

  if (order.stockDecremented && order.orderStatus !== "failed") {
    return { order, alreadyFinalized: true as const };
  }

  const lines = order.items.map((i: { productId: string; qty: number }) => ({
    productId: i.productId,
    qty: i.qty,
  }));

  await decrementStockForOrder(lines);

  const updated = await Order.findOneAndUpdate(
    {
      _id: orderId,
      stockDecremented: { $ne: true },
    },
    {
      $set: {
        stockDecremented: true,
        paymentStatus: "pending",
        status: "confirmed",
        orderStatus: "confirmed",
        payment: { method: "cod", status: "cod" },
      },
      $push: {
        statusHistory: {
          status: "confirmed",
          changedAt: new Date(),
          changedBy: "user",
          note: "COD placed",
        },
      },
    },
    { new: true },
  );

  if (!updated) {
    // Another request won the race — put stock back
    await restoreStockForOrder(lines);
    const existing = await Order.findById(orderId);
    if (!existing) throw new Error("Order not found");
    return { order: existing, alreadyFinalized: true as const };
  }

  void sendOrderConfirmationEmail(updated).then(async (result) => {
    if (result.sent) {
      await Order.updateOne(
        { _id: updated._id },
        { $set: { "emailLog.confirmationSentAt": new Date() } },
      );
    }
  });

  return { order: updated, alreadyFinalized: false as const };
}

/** Mark a checkout attempt as failed so it never appears on the profile. */
export async function markOrderFailed(
  orderId: string,
  note = "Checkout failed",
) {
  await connectDB();
  await Order.updateOne(
    { _id: orderId, orderStatus: { $ne: "delivered" } },
    {
      $set: {
        status: "failed",
        orderStatus: "failed",
        stockDecremented: false,
      },
      $push: {
        statusHistory: {
          status: "failed",
          changedAt: new Date(),
          changedBy: "system",
          note,
        },
      },
    },
  );
}

export async function markOrderPaymentFailed(razorpayOrderId: string) {
  await connectDB();
  await Order.updateOne(
    {
      razorpayOrderId,
      paymentStatus: { $ne: "paid" },
    },
    {
      $set: {
        paymentStatus: "failed",
        status: "failed",
        orderStatus: "failed",
      },
    },
  );
}

export async function completeRefundWebhook(refundId: string) {
  await connectDB();
  await Order.updateOne(
    { "cancellation.refundId": refundId },
    {
      $set: {
        "cancellation.refundStatus": "completed",
        "cancellation.refundCompletedAt": new Date(),
        paymentStatus: "refunded",
      },
    },
  );
}

export async function failRefundWebhook(refundId: string) {
  await connectDB();
  await Order.updateOne(
    { "cancellation.refundId": refundId },
    { $set: { "cancellation.refundStatus": "failed" } },
  );
}

export function orderOwnerId(order: {
  userId: mongoose.Types.ObjectId | string;
}) {
  return String(order.userId);
}
