import mongoose from "mongoose";

const ReelItemSchema = new mongoose.Schema(
  {
    videoId: String,
    reelUrl: String,
    videoUrl: String,
    thumbnailUrl: String,
    title: String,
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
    sourceType: {
      type: String,
      enum: ["instagram_url", "upload"],
      required: true,
    },
  },
  { _id: true },
);

const AdminInstagramReelsConfigSchema = new mongoose.Schema(
  {
    reels: { type: [ReelItemSchema], default: [] },
  },
  { timestamps: true },
);

export default mongoose.models.AdminInstagramReelsConfig ||
  mongoose.model("AdminInstagramReelsConfig", AdminInstagramReelsConfigSchema);
