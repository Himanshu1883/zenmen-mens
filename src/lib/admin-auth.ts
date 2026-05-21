import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function requireAdmin() {
  const session = await getServerSession(authOptions);
  const role = (session?.user as { role?: string } | undefined)?.role;

  if (role !== "admin") {
    return {
      error: NextResponse.json({ error: "Admin access required" }, { status: 401 }),
    } as const;
  }

  return { session } as const;
}
