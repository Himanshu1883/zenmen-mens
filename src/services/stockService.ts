import { connectDB } from "@/lib/db";
import Product from "@/models/Product";
import mongoose from "mongoose";

type OrderLine = {
  productId: string;
  qty: number;
};

/**
 * Atomic stock updates via updateOne operators — avoids full-document
 * validate/save (legacy images may lack Cloudinary `public_id`).
 */
export async function decrementStockForOrder(items: OrderLine[]) {
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
      if (updated.stock <= 0) {
        await Product.updateOne(
          { _id: line.productId },
          { $set: { stock: 0, isAvailable: false } },
        );
      }
      continue;
    }

    // Insufficient / missing stock: clamp to zero without re-validating images
    const current = await Product.findById(line.productId)
      .select("stock")
      .lean();
    if (!current) continue;

    const next = Math.max(0, Number(current.stock ?? 0) - line.qty);
    await Product.updateOne(
      { _id: line.productId },
      { $set: { stock: next, isAvailable: next > 0 } },
    );
  }
}

export async function restoreStockForOrder(items: OrderLine[]) {
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

    if (updated && updated.stock <= 0) {
      await Product.updateOne(
        { _id: line.productId },
        { $set: { stock: Math.max(0, updated.stock), isAvailable: false } },
      );
    }
  }
}
