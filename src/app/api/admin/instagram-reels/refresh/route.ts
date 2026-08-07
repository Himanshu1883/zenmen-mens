import { requireAdmin } from "@/lib/admin-auth";
import {
  getInstagramCacheHealth,
  refreshInstagramReels,
} from "@/lib/instagram/cache";
import { NextResponse } from "next/server";

export async function POST() {
  const admin = await requireAdmin();
  if ("error" in admin) return admin.error;

  await refreshInstagramReels();
  return NextResponse.json({
    success: true,
    health: getInstagramCacheHealth(),
  });
}
