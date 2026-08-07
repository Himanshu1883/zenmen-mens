import { orderItemsFingerprint } from "@/lib/customer-orders";
import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import mongoose from "mongoose";

const RETRY_WINDOW_MS = 30 * 60 * 1000; // 30 minutes

/**
 * Collapse COD retry storms: same cart fingerprint within 30 minutes →
 * keep the newest successful order, mark older clones as failed.
 * Safe to call on profile load (idempotent).
 */
export async function collapseCodRetryDuplicates(
  userId: string | mongoose.Types.ObjectId,
): Promise<number> {
  await connectDB();
  const uid = new mongoose.Types.ObjectId(String(userId));

  const orders = await Order.find({
    userId: uid,
    paymentMethod: "cod",
    orderStatus: { $nin: ["failed", "cancelled"] },
  })
    .sort({ createdAt: 1 })
    .select("_id items total createdAt orderStatus stockDecremented")
    .lean();

  if (orders.length < 2) return 0;

  type Row = (typeof orders)[number];
  const groups = new Map<string, Row[]>();

  for (const o of orders) {
    const fp = orderItemsFingerprint(
      (o.items as { productId?: string; qty?: number }[]) ?? [],
      Number(o.total ?? 0),
    );
    const list = groups.get(fp) ?? [];
    list.push(o);
    groups.set(fp, list);
  }

  const toFail: mongoose.Types.ObjectId[] = [];

  for (const list of groups.values()) {
    if (list.length < 2) continue;

    // Cluster by time proximity, keep newest in each cluster
    const clusters: Row[][] = [];
    let current: Row[] = [];

    for (const o of list) {
      const t = new Date(o.createdAt as Date).getTime();
      if (current.length === 0) {
        current = [o];
        continue;
      }
      const prevT = new Date(
        current[current.length - 1]!.createdAt as Date,
      ).getTime();
      if (t - prevT <= RETRY_WINDOW_MS) {
        current.push(o);
      } else {
        clusters.push(current);
        current = [o];
      }
    }
    if (current.length) clusters.push(current);

    for (const cluster of clusters) {
      if (cluster.length < 2) continue;
      // Entire retry storm was almost certainly failed checkouts —
      // hide all clones (customer can place one clean order).
      for (const o of cluster) {
        toFail.push(o._id as mongoose.Types.ObjectId);
      }
    }
  }

  if (toFail.length === 0) return 0;

  await Order.updateMany(
    { _id: { $in: toFail }, userId: uid },
    {
      $set: {
        status: "failed",
        orderStatus: "failed",
      },
      $push: {
        statusHistory: {
          status: "failed",
          changedAt: new Date(),
          changedBy: "system",
          note: "Duplicate COD checkout retry collapsed",
        },
      },
    },
  );

  return toFail.length;
}
