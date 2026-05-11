// src/app/api/contact/route.ts
import { contactSchema } from "@/lib/validations/contact.schema";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const parsed = contactSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 422 },
      );
    }

    const { name, email, phone, message } = parsed.data;

    // ── Option A: Resend (recommended) ──────────────────────────
    // import { Resend } from "resend";
    // const resend = new Resend(process.env.RESEND_API_KEY);
    // await resend.emails.send({
    //   from: "ZENmen <noreply@yourdomain.com>",
    //   to: process.env.CONTACT_EMAIL!,
    //   subject: `New enquiry from ${name}`,
    //   html: `<p><b>Name:</b> ${name}</p><p><b>Email:</b> ${email}</p><p><b>Phone:</b> ${phone ?? "—"}</p><p><b>Message:</b></p><p>${message}</p>`,
    // });

    // ── Option B: Log for now (replace with Resend/Nodemailer) ──
    console.log("[contact]", { name, email, phone, message });

    return NextResponse.json(
      { message: "Message received. We will be in touch soon." },
      { status: 200 },
    );
  } catch (err) {
    console.error("[POST /api/contact]", err);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 },
    );
  }
}
