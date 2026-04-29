import mongoose from "mongoose";

const ImageSchema = new mongoose.Schema({
  url: { type: String, required: true },
  alt: String,

  // 🔥 important fields
  isPrimary: { type: Boolean, default: false }, // main image
  order: { type: Number, default: 0 }, // sorting
});

const ReviewSchema = new mongoose.Schema(
  {
    userId: String,
    name: String,
    rating: Number,
    comment: String,
  },
  { timestamps: true },
);

const VariantSchema = new mongoose.Schema({
  color: String,
  images: [ImageSchema],
  sizes: [
    {
      size: String,
      stock: Number,
      sku: String,
    },
  ],
});

const ProductSchema = new mongoose.Schema(
  {
    // 🔹 BASIC INFO
    title: { type: String, required: true },
    slug: { type: String, unique: true },
    tagline: String,
    description: String,

    // 🔹 PRICING
    price: { type: Number, required: true },
    comparePrice: Number, // original price (for discount)
    discount: Number,

    // 🔹 CATEGORY
    category: String,
    subCategory: String,
    tags: [String],

    // 🔹 MEDIA
    images: {
      type: [ImageSchema],
      validate: [
        (arr: { url: string }[]) => arr.length > 0,
        "At least one image required",
      ],
    },

    // 🔹 VARIANTS (IMPORTANT)
    variants: [VariantSchema],

    // 🔹 OPTIONS
    colors: [String],
    sizes: [String],

    // 🔹 DETAILS (for your tabs)
    details: [String],
    specifications: [
      {
        label: String,
        value: String,
      },
    ],

    // 🔹 INVENTORY
    stock: Number,
    isAvailable: { type: Boolean, default: true },

    // 🔹 REVIEWS
    reviews: [ReviewSchema],
    rating: { type: Number, default: 0 },
    numReviews: { type: Number, default: 0 },

    // 🔹 FLAGS
    badge: String, // "New", "Best Seller"
    isFeatured: { type: Boolean, default: false },

    // 🔹 SEO
    seoTitle: String,
    seoDescription: String,
  },
  { timestamps: true },
);

export default mongoose.models.Product ||
  mongoose.model("Product", ProductSchema);
