import mongoose from "mongoose";

const CategorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: {
      type: String,
      unique: true,
      required: true,
      lowercase: true,
      trim: true,
    },
    filterType: {
      type: String,
      enum: ["search", "category"],
      default: "search",
    },
    filterValue: { type: String, required: true, trim: true },
    featured: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true, index: true },
    showInNav: { type: Boolean, default: true, index: true },
    order: { type: Number, default: 0 },
    imageUrl: { type: String, default: "" },
    description: { type: String, default: "" },
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      default: null,
      index: true,
    },
  },
  { timestamps: true },
);

CategorySchema.index({ order: 1, name: 1 });
CategorySchema.index({ parentId: 1, order: 1 });

const Category =
  mongoose.models.Category || mongoose.model("Category", CategorySchema);

export default Category;
