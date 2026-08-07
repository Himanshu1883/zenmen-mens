import {
  getInstagramCacheHealth,
  refreshInstagramReels,
} from "@/lib/instagram/cache";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET?.trim();
  const authHeader = req.headers.get("authorization");
  const bearer = authHeader?.startsWith("Bearer ")
    ? authHeader.slice(7)
    : req.headers.get("x-cron-secret");

  if (secret && bearer !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await refreshInstagramReels();
  return NextResponse.json({
    success: true,
    health: getInstagramCacheHealth(),
  });
}
