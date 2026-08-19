import { requireAdmin } from "@/lib/admin-auth";
import { connectDB } from "@/lib/db";
import { fail, ok } from "@/lib/http-responses";
import {
  canTransitionStatus,
  STATUS_NOTIFY_TYPES,
  type OrderStatus,
} from "@/config/orderStatusConfig";
import Order from "@/models/Order";
import { sendOrderStatusEmail } from "@/services/orderEmailService";
import { createUserNotification } from "@/services/orderNotifyService";
import { restoreStockForOrder } from "@/services/stockService";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, ctx: Ctx) {
  const admin = await requireAdmin();
  if ("error" in admin) return admin.error;

  const { id } = await ctx.params;
  const body = (await req.json()) as { orderStatus?: OrderStatus };
  const next = body.orderStatus;
  if (!next) {
    return fail("MISSING_STATUS", "orderStatus is required", 422);
  }

  await connectDB();
  const order = await Order.findById(id);
  if (!order) return fail("ORDER_NOT_FOUND", "Order not found", 404);

  const current = order.orderStatus ?? order.status;
  if (!canTransitionStatus(current, next)) {
    return fail(
      "INVALID_TRANSITION",
      `Cannot change status from ${current} to ${next}`,
      400,
    );
  }

  order.orderStatus = next;
  order.status = next;
  order.statusHistory = order.statusHistory ?? [];
  order.statusHistory.push({
    status: next,
    changedAt: new Date(),
    changedBy: "admin",
  });

  if (next === "delivered" && order.paymentMethod === "cod") {
    order.paymentStatus = "paid";
    if (order.payment) order.payment.status = "paid";
  }

  // Delivered never touches stock — it was taken at paid/COD finalize.
  if (next === "cancelled" && order.stockDecremented) {
    await restoreStockForOrder(
      order.items.map((i: { productId: string; qty: number }) => ({
        productId: i.productId,
        qty: i.qty,
      })),
      {
        reason: "order_cancel_restock",
        orderId: String(order._id),
        note: "Admin status set to cancelled",
      },
    );
    order.stockDecremented = false;
  }

  await order.save();

  const notifyType = STATUS_NOTIFY_TYPES[next];
  if (notifyType) {
    const labels: Record<string, { title: string; message: string; email: string }> = {
      shipped: {
        title: "Order shipped",
        message: `Order ${order.orderNumber} has been shipped.`,
        email: "Your order is on the way",
      },
      out_for_delivery: {
        title: "Out for delivery",
        message: `Order ${order.orderNumber} is out for delivery.`,
        email: "Your order is out for delivery",
      },
      delivered: {
        title: "Delivered",
        message: `Order ${order.orderNumber} was delivered.`,
        email: "Your order was delivered",
      },
    };
    const copy = labels[next];
    await createUserNotification({
      userId: order.userId,
      type: notifyType,
      title: copy.title,
      message: copy.message,
      orderId: order._id,
    });
    await sendOrderStatusEmail(order, copy.email, copy.message);
  }

  return ok({ order });
}
