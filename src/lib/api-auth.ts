import { authOptions } from "@/lib/auth";
import { resolveMongoUserId } from "@/lib/user-id";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function requireAuthUser() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return {
      error: NextResponse.json({ error: "Sign in to continue checkout" }, { status: 401 }),
    } as const;
  }

  const userId = await resolveMongoUserId(
    session.user.email,
    session.user.id,
  );

  if (!userId) {
    return {
      error: NextResponse.json(
        { error: "Account not found. Please sign out and sign in again." },
        { status: 401 },
      ),
    } as const;
  }

  return {
    session,
    userId,
    email: session.user.email,
    name: session.user.name ?? "",
  } as const;
}
