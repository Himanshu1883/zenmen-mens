import { requireAuthUser } from "@/lib/api-auth";
import { connectDB } from "@/lib/db";
import { fail, ok } from "@/lib/http-responses";
import Order from "@/models/Order";
import {
  CANCEL_REASONS,
  type CancelReason,
} from "@/config/cancellationConfig";
import {
  cancelOrderAsUser,
} from "@/services/orderCancellationService";
import { NextResponse } from "next/server";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(req: Request, ctx: Ctx) {
  const auth = await requireAuthUser();
  if ("error" in auth) return auth.error;

  const { id } = await ctx.params;
  const body = (await req.json()) as { reason?: string; note?: string };
  const reason = body.reason as CancelReason | undefined;

  if (!reason || !CANCEL_REASONS.includes(reason)) {
    return fail("INVALID_REASON", "Please select a cancellation reason", 422);
  }

  try {
    const result = await cancelOrderAsUser(
      id,
      auth.userId,
      reason,
      body.note,
    );
    return ok({ mode: result.mode });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Cancel failed";
    if (msg === "ORDER_NOT_FOUND") {
      return fail("ORDER_NOT_FOUND", "Order not found", 404);
    }
    return fail("NOT_ELIGIBLE", msg, 400);
  }
}
