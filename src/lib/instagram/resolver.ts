import { getCachedReels, refreshInstagramReels } from "@/lib/instagram/cache";

const INSTAGRAM_URL_RE =
  /^https?:\/\/(www\.)?instagram\.com\/(reel|reels|p)\/[A-Za-z0-9_-]+\/?/i;

export function normalizeInstagramReelUrl(url: string): string {
  return url.trim().replace(/\/+$/, "");
}

export function extractShortcode(url: string): string | null {
  const match = url.match(/instagram\.com\/(?:reel|reels|p)\/([A-Za-z0-9_-]+)/i);
  return match?.[1] ?? null;
}

export function isValidInstagramReelUrl(url: string): boolean {
  return INSTAGRAM_URL_RE.test(url);
}

export async function resolveInstagramReelUrl(reelUrl: string) {
  const normalized = normalizeInstagramReelUrl(reelUrl);
  const shortcode = extractShortcode(normalized);
  const embedUrl = shortcode
    ? `https://www.instagram.com/reel/${shortcode}/embed`
    : undefined;

  let cached = getCachedReels();
  let hit = cached.find((r) =>
    r.permalink?.includes(shortcode ?? "__none__"),
  );

  if (!hit && process.env.INSTAGRAM_ACCESS_TOKEN) {
    await refreshInstagramReels();
    cached = getCachedReels();
    hit = cached.find((r) => r.permalink?.includes(shortcode ?? "__none__"));
  }

  if (hit) {
    return {
      videoUrl: hit.media_url ?? "",
      thumbnailUrl: hit.thumbnail_url ?? hit.media_url ?? "",
      videoId: hit.id,
      caption: hit.caption?.slice(0, 120) ?? "",
      embedUrl,
    };
  }

  let thumbnailUrl = "";
  try {
    const pageRes = await fetch(normalized, {
      headers: { "User-Agent": "facebookexternalhit/1.1" },
    });
    const html = await pageRes.text();
    const og = html.match(/property="og:image" content="([^"]+)"/i);
    if (og?.[1]) thumbnailUrl = og[1].replace(/&amp;/g, "&");
  } catch {
    /* ignore */
  }

  return {
    videoUrl: "",
    thumbnailUrl,
    videoId: shortcode ?? "",
    caption: "",
    embedUrl,
  };
}
