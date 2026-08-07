import { requireAuthUser } from "@/lib/api-auth";
import { connectDB } from "@/lib/db";
import { fail } from "@/lib/http-responses";
import Order from "@/models/Order";
import { generateInvoiceBuffer } from "@/utils/generateInvoiceBuffer";
import { NextResponse } from "next/server";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, ctx: Ctx) {
  const auth = await requireAuthUser();
  if ("error" in auth) return auth.error;
  const { id } = await ctx.params;

  await connectDB();
  const order = await Order.findOne({ _id: id, userId: auth.userId }).lean();
  if (!order) return fail("ORDER_NOT_FOUND", "Order not found", 404);

  const pdf = await generateInvoiceBuffer(order);
  return new NextResponse(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="invoice-${order.orderNumber}.pdf"`,
    },
  });
}
