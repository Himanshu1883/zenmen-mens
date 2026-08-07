import { extractShortcode, isValidInstagramReelUrl } from "@/lib/instagram/resolver";
import { NextResponse } from "next/server";

const thumbCache = new Map<string, { url: string; expires: number }>();
const TTL_MS = 24 * 60 * 60 * 1000;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const url = searchParams.get("url")?.trim();
  if (!url || !isValidInstagramReelUrl(url)) {
    return NextResponse.json({ success: false, message: "Invalid URL" }, { status: 400 });
  }

  const shortcode = extractShortcode(url);
  const cacheKey = shortcode ?? url;
  const hit = thumbCache.get(cacheKey);
  if (hit && hit.expires > Date.now()) {
    return NextResponse.redirect(hit.url, 302);
  }

  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "facebookexternalhit/1.1" },
    });
    const html = await res.text();
    const og = html.match(/property="og:image" content="([^"]+)"/i);
    if (!og?.[1]) {
      return NextResponse.json({ success: false, message: "Not found" }, { status: 404 });
    }
    const imageUrl = og[1].replace(/&amp;/g, "&");
    thumbCache.set(cacheKey, { url: imageUrl, expires: Date.now() + TTL_MS });
    return NextResponse.redirect(imageUrl, 302);
  } catch {
    return NextResponse.json({ success: false, message: "Not found" }, { status: 404 });
  }
}
