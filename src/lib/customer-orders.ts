import mongoose from "mongoose";

/**
 * Customer-facing order list: own orders only (never match by email —
 * that can leak/attach orders across accounts).
 * Hide failed / aborted checkouts so ghost retries never appear.
 */
export function customerOrdersQuery(userId: string | mongoose.Types.ObjectId) {
  return {
    userId: new mongoose.Types.ObjectId(String(userId)),
    orderStatus: { $nin: ["failed"] },
    // COD must have completed stock finalize; online may sit in pending_payment
    $or: [
      { paymentMethod: "online" },
      { paymentMethod: "cod", stockDecremented: true },
    ],
  };
}

export function orderItemsFingerprint(
  items: { productId?: string; qty?: number }[],
  total: number,
): string {
  const lines = items
    .map((i) => `${String(i.productId ?? "")}:${Number(i.qty ?? 0)}`)
    .sort()
    .join("|");
  return `${Number(total)}::${lines}`;
}
