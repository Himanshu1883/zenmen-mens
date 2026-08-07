import { requireAdmin } from "@/lib/admin-auth";
import { connectDB } from "@/lib/db";
import {
  isValidInstagramReelUrl,
  resolveInstagramReelUrl,
} from "@/lib/instagram/resolver";
import AdminInstagramReelsConfig from "@/models/AdminInstagramReelsConfig";
import { NextResponse } from "next/server";

export async function GET() {
  const admin = await requireAdmin();
  if ("error" in admin) return admin.error;

  await connectDB();
  const config = await AdminInstagramReelsConfig.findOne({}).lean();
  return NextResponse.json({
    success: true,
    config: { reels: config?.reels ?? [] },
  });
}

type ReelInput = {
  reelUrl?: string;
  videoUrl?: string;
  thumbnailUrl?: string;
  title?: string;
  isActive?: boolean;
  order?: number;
  sourceType: "instagram_url" | "upload";
};

export async function PUT(req: Request) {
  const admin = await requireAdmin();
  if ("error" in admin) return admin.error;

  const body = (await req.json()) as { reels?: ReelInput[] };
  const reels = body.reels ?? [];

  for (const reel of reels) {
    if (reel.sourceType !== "instagram_url" && reel.sourceType !== "upload") {
      return NextResponse.json(
        { success: false, message: "Invalid sourceType" },
        { status: 422 },
      );
    }
    if (reel.sourceType === "instagram_url") {
      if (!reel.reelUrl || !isValidInstagramReelUrl(reel.reelUrl)) {
        return NextResponse.json(
          { success: false, message: "Invalid Instagram reel URL" },
          { status: 422 },
        );
      }
    } else if (!reel.videoUrl) {
      return NextResponse.json(
        { success: false, message: "videoUrl required for upload" },
        { status: 422 },
      );
    }
  }

  const enriched = await Promise.all(
    reels.map(async (reel, index) => {
      if (reel.sourceType === "upload") {
        return {
          videoUrl: reel.videoUrl,
          thumbnailUrl: reel.thumbnailUrl ?? reel.videoUrl,
          title: reel.title?.slice(0, 120) ?? "Upload",
          isActive: reel.isActive ?? true,
          order: reel.order ?? index + 1,
          sourceType: "upload" as const,
        };
      }
      const resolved = await resolveInstagramReelUrl(reel.reelUrl!);
      return {
        reelUrl: reel.reelUrl,
        videoId: resolved.videoId,
        videoUrl: resolved.videoUrl || reel.reelUrl,
        thumbnailUrl: resolved.thumbnailUrl,
        title: (reel.title || resolved.caption || "Reel").slice(0, 120),
        isActive: reel.isActive ?? true,
        order: reel.order ?? index + 1,
        sourceType: "instagram_url" as const,
      };
    }),
  );

  await connectDB();
  const config = await AdminInstagramReelsConfig.findOneAndUpdate(
    {},
    { reels: enriched },
    { upsert: true, new: true },
  );

  return NextResponse.json({ success: true, config: { reels: config.reels } });
}
