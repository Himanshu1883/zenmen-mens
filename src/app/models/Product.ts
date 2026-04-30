import mongoose from "mongoose";

const ImageSchema = new mongoose.Schema({
  url: { type: String, required: true },
  alt: String,
  isPrimary: { type: Boolean, default: false },
  order: { type: Number, default: 0 },
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

const SpecSchema = new mongoose.Schema({
  label: String,
  value: String,
});

const ProductSchema = new mongoose.Schema(
  {
    // 🔥 BASIC
    title: { type: String, required: true },
    slug: { type: String, unique: true },
    tagline: String,
    description: String,

    // 🔥 CATEGORY
    category: String,
    subCategory: String,

    // 🔥 PRICING
    price: { type: Number, required: true },
    comparePrice: Number,
    discount: Number,

    // 🔥 MEDIA (YOUR UI USES THIS)
    // images: {
    //   type: [ImageSchema],
    //   validate: [(arr: any[]) => arr.length > 0, "Image required"],
    // },

    images: {
      type: [ImageSchema],
      validate: [
        (arr: { url: string }[]) => arr.length > 0,
        "At least one image required",
      ],
    },

    // 🔥 UI TABS
    details: [String], // bullet list
    specifications: [SpecSchema], // specs table
    care: String, // care tab

    // 🔥 OPTIONS
    colors: [String],
    sizes: [String],

    // 🔥 INVENTORY
    stock: Number,
    isAvailable: { type: Boolean, default: true },

    // 🔥 REVIEWS (for stars UI)
    reviews: [ReviewSchema],
    rating: { type: Number, default: 0 },
    numReviews: { type: Number, default: 0 },

    // 🔥 UI FLAGS
    badge: String,
    isFeatured: { type: Boolean, default: false },

    // 🔥 ACCORDION (shipping, returns etc.)
    accordion: [
      {
        title: String,
        content: String,
      },
    ],

    // 🔥 SEO
    seoTitle: String,
    seoDescription: String,
  },
  { timestamps: true },
);

export default mongoose.models.Product ||
  mongoose.model("Product", ProductSchema);
