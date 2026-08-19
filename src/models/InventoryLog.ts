import mongoose from "mongoose";
import { INVENTORY_REASONS } from "@/config/inventoryConfig";

const InventoryLogSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      index: true,
    },
    delta: { type: Number, required: true },
    previousStock: { type: Number, required: true, min: 0 },
    resultingStock: { type: Number, required: true, min: 0 },
    reason: {
      type: String,
      enum: [...INVENTORY_REASONS],
      required: true,
      index: true,
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
    },
    adminUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    note: { type: String, trim: true, maxlength: 240 },
  },
  { timestamps: true },
);

InventoryLogSchema.index({ productId: 1, createdAt: -1 });
InventoryLogSchema.index({ createdAt: -1 });

export default mongoose.models.InventoryLog ||
  mongoose.model("InventoryLog", InventoryLogSchema);
