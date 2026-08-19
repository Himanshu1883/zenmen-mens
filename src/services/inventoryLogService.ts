import type { InventoryReason } from "@/config/inventoryConfig";
import { connectDB } from "@/lib/db";
import InventoryLog from "@/models/InventoryLog";
import mongoose from "mongoose";

export type InventoryMovementInput = {
  productId: string;
  delta: number;
  previousStock: number;
  resultingStock: number;
  reason: InventoryReason;
  orderId?: string;
  adminUserId?: string;
  note?: string;
};

function optionalObjectId(value?: string) {
  if (!value || !mongoose.Types.ObjectId.isValid(value)) return undefined;
  return new mongoose.Types.ObjectId(value);
}

export async function recordInventoryMovement(input: InventoryMovementInput) {
  if (input.delta === 0) return;
  try {
    await connectDB();
    await InventoryLog.create({
      productId: input.productId,
      delta: input.delta,
      previousStock: Math.max(0, input.previousStock),
      resultingStock: Math.max(0, input.resultingStock),
      reason: input.reason,
      orderId: optionalObjectId(input.orderId),
      adminUserId: optionalObjectId(input.adminUserId),
      note: input.note?.trim().slice(0, 240) || undefined,
    });
  } catch (err) {
    console.error("[inventoryLog] failed to record movement", err);
  }
}

export async function listInventoryLogs(productId: string, limit = 20) {
  await connectDB();
  if (!mongoose.Types.ObjectId.isValid(productId)) return [];
  return InventoryLog.find({ productId })
    .sort({ createdAt: -1 })
    .limit(Math.min(50, Math.max(1, limit)))
    .lean();
}
