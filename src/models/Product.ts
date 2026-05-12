// src/models/Product.ts
import mongoose from "mongoose";

const ImageSchema = new mongoose.Schema({
  url: { type: String, required: true },
  alt: { type: String, default: "" },
  isPrimary: { type: Boolean, default: false },
  order: { type: Number, default: 0 },
  public_id: {
    type: String,
    required: true,
  },
});

const ReviewSchema = new mongoose.Schema(
  {
    userId: String,
    name: String,
    rating: { type: Number, min: 1, max: 5 },
    comment: String,
  },
  { timestamps: true },
);

const SpecSchema = new mongoose.Schema({
  label: String,
  value: String,
});

const ProductSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: {
      type: String,
      unique: true,
      required: true,
      lowercase: true,
      trim: true,
    },
    tagline: String,
    description: String,

    category: { type: String, index: true },
    subCategory: String,

    price: { type: Number, required: true, min: 0 },
    comparePrice: Number,
    discount: Number,

    images: {
      type: [ImageSchema],
      validate: [
        (arr: { url: string }[]) => arr.length > 0,
        "At least one image required",
      ],
    },

    details: [String],
    specifications: [SpecSchema],
    care: String,

    colors: [String],
    sizes: [String],

    stock: { type: Number, default: 0, min: 0 },
    isAvailable: { type: Boolean, default: true },

    reviews: [ReviewSchema],
    rating: { type: Number, default: 0, min: 0, max: 5 },
    numReviews: { type: Number, default: 0 },

    badge: String,
    isFeatured: { type: Boolean, default: false, index: true },

    accordion: [{ title: String, content: String }],

    seoTitle: String,
    seoDescription: String,
  },
  { timestamps: true },
);

// Compound index for collection filtering
ProductSchema.index({ category: 1, isAvailable: 1 });
ProductSchema.index({ isFeatured: 1, isAvailable: 1 });

export default mongoose.models.Product ||
  mongoose.model("Product", ProductSchema);
