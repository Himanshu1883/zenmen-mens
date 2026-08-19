import type { InventoryReason } from "@/config/inventoryConfig";
import { availabilityForStock } from "@/lib/inventory";
import { connectDB } from "@/lib/db";
import Product from "@/models/Product";
import { recordInventoryMovement } from "@/services/inventoryLogService";
import mongoose from "mongoose";

type OrderLine = {
  productId: string;
  qty: number;
};

export type StockMovementContext = {
  reason: Extract<InventoryReason, "order_sold" | "order_cancel_restock">;
  orderId?: string;
  note?: string;
};

/**
 * Atomic stock updates via updateOne operators — avoids full-document
 * validate/save (legacy images may lack Cloudinary `public_id`).
 */
export async function decrementStockForOrder(
  items: OrderLine[],
  ctx?: StockMovementContext,
) {
  await connectDB();
  for (const line of items) {
    if (!mongoose.Types.ObjectId.isValid(line.productId) || line.qty < 1) {
      continue;
    }

    const updated = await Product.findOneAndUpdate(
      { _id: line.productId, stock: { $gte: line.qty } },
      {
        $inc: { stock: -line.qty },
      },
      { new: true },
    );

    if (updated) {
      const previous = Number(updated.stock) + line.qty;
      let resulting = Number(updated.stock);
      if (resulting <= 0) {
        resulting = 0;
        await Product.updateOne(
          { _id: line.productId },
          { $set: { stock: 0, isAvailable: false } },
        );
      }
      await recordInventoryMovement({
        productId: line.productId,
        delta: resulting - previous,
        previousStock: previous,
        resultingStock: resulting,
        reason: ctx?.reason ?? "order_sold",
        orderId: ctx?.orderId,
        note: ctx?.note,
      });
      continue;
    }

    // Insufficient / missing stock: clamp to zero without re-validating images
    const current = await Product.findById(line.productId)
      .select("stock")
      .lean();
    if (!current) continue;

    const previous = Math.max(0, Number(current.stock ?? 0));
    const next = Math.max(0, previous - line.qty);
    await Product.updateOne(
      { _id: line.productId },
      { $set: { stock: next, isAvailable: next > 0 } },
    );
    await recordInventoryMovement({
      productId: line.productId,
      delta: next - previous,
      previousStock: previous,
      resultingStock: next,
      reason: ctx?.reason ?? "order_sold",
      orderId: ctx?.orderId,
      note: ctx?.note,
    });
  }
}

export async function restoreStockForOrder(
  items: OrderLine[],
  ctx?: StockMovementContext,
) {
  await connectDB();
  for (const line of items) {
    if (!mongoose.Types.ObjectId.isValid(line.productId) || line.qty < 1) {
      continue;
    }

    const updated = await Product.findOneAndUpdate(
      { _id: line.productId },
      { $inc: { stock: line.qty }, $set: { isAvailable: true } },
      { new: true },
    );

    if (!updated) continue;

    let resulting = Number(updated.stock);
    const previous = resulting - line.qty;
    if (resulting <= 0) {
      resulting = Math.max(0, resulting);
      await Product.updateOne(
        { _id: line.productId },
        { $set: { stock: resulting, isAvailable: false } },
      );
    }

    await recordInventoryMovement({
      productId: line.productId,
      delta: resulting - Math.max(0, previous),
      previousStock: Math.max(0, previous),
      resultingStock: resulting,
      reason: ctx?.reason ?? "order_cancel_restock",
      orderId: ctx?.orderId,
      note: ctx?.note,
    });
  }
}

export async function applyManualStockChange(input: {
  productId: string;
  mode: "set" | "adjust";
  stock?: number;
  delta?: number;
  note?: string;
  adminUserId?: string;
}) {
  await connectDB();
  if (!mongoose.Types.ObjectId.isValid(input.productId)) {
    return { error: "INVALID_ID" as const, message: "Invalid product id" };
  }

  const current = await Product.findById(input.productId).select(
    "stock isAvailable title slug category subCategory images updatedAt",
  );
  if (!current) {
    return { error: "NOT_FOUND" as const, message: "Product not found" };
  }

  const previous = Math.max(0, Number(current.stock ?? 0));
  let next = previous;
  let reason: Extract<InventoryReason, "manual_set" | "manual_adjust"> =
    "manual_set";

  if (input.mode === "set") {
    if (
      typeof input.stock !== "number" ||
      !Number.isFinite(input.stock) ||
      !Number.isInteger(input.stock) ||
      input.stock < 0
    ) {
      return {
        error: "INVALID_STOCK" as const,
        message: "Stock must be a whole number of 0 or more",
      };
    }
    next = input.stock;
    reason = "manual_set";
  } else {
    if (
      typeof input.delta !== "number" ||
      !Number.isFinite(input.delta) ||
      !Number.isInteger(input.delta) ||
      input.delta === 0
    ) {
      return {
        error: "INVALID_DELTA" as const,
        message: "Delta must be a non-zero whole number",
      };
    }
    next = previous + input.delta;
    if (next < 0) {
      return {
        error: "INSUFFICIENT_STOCK" as const,
        message: `Cannot reduce stock below 0 (current ${previous})`,
      };
    }
    reason = "manual_adjust";
  }

  if (next === previous) {
    return {
      product: current,
      previousStock: previous,
      stock: previous,
      unchanged: true as const,
    };
  }

  const updated = await Product.findOneAndUpdate(
    { _id: input.productId, stock: previous },
    { $set: { stock: next, isAvailable: availabilityForStock(next) } },
    { new: true },
  );

  if (!updated) {
    return {
      error: "CONFLICT" as const,
      message: "Stock changed in another request — refresh and try again",
    };
  }

  await recordInventoryMovement({
    productId: input.productId,
    delta: next - previous,
    previousStock: previous,
    resultingStock: next,
    reason,
    adminUserId: input.adminUserId,
    note: input.note,
  });

  return {
    product: updated,
    previousStock: previous,
    stock: next,
    unchanged: false as const,
  };
}
