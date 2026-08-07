import { connectDB } from "@/lib/db";
import { DEFAULT_ZENMEN_REELS } from "@/lib/instagram/default-reels";
import {
  getCachedReels,
  getInstagramCacheHealth,
} from "@/lib/instagram/cache";
import AdminInstagramReelsConfig from "@/models/AdminInstagramReelsConfig";
import { extractShortcode } from "@/lib/instagram/resolver";
import { NextResponse } from "next/server";

function mapAdminReels(
  reels: {
    _id?: { toString(): string };
    videoId?: string;
    reelUrl?: string;
    videoUrl?: string;
    thumbnailUrl?: string;
    title?: string;
    isActive?: boolean;
    order?: number;
    sourceType?: string;
  }[],
) {
  return reels
    .filter((r) => r.isActive !== false)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .map((r) => {
      const shortcode = r.reelUrl ? extractShortcode(r.reelUrl) : null;
      const id = r._id?.toString() ?? r.videoId ?? r.reelUrl ?? "reel";
      return {
        id,
        caption: r.title ?? "",
        media_type: "VIDEO",
        source_type: r.sourceType ?? "upload",
        media_url: r.videoUrl ?? r.reelUrl ?? "",
        thumbnail_url: r.thumbnailUrl ?? r.videoUrl ?? "",
        embed_url: shortcode
          ? `https://www.instagram.com/reel/${shortcode}/embed`
          : undefined,
        permalink: r.reelUrl ?? "https://www.instagram.com/_zenmen/",
        timestamp: "1970-01-01T00:00:00.000Z",
      };
    });
}

export async function GET() {
  const health = getInstagramCacheHealth();
  const cached = getCachedReels();

  if (cached.length > 0) {
    return NextResponse.json({
      success: true,
      source: "api",
      health,
      reels: cached,
    });
  }

  await connectDB();
  const config = await AdminInstagramReelsConfig.findOne({}).lean();
  const adminReels = config?.reels?.length
    ? mapAdminReels(config.reels as Parameters<typeof mapAdminReels>[0])
    : [];

  const reels =
    adminReels.length > 0 ? adminReels : DEFAULT_ZENMEN_REELS;

  return NextResponse.json({
    success: true,
    source: adminReels.length > 0 ? "admin_fallback" : "default_assets",
    health,
    reels,
  });
}
