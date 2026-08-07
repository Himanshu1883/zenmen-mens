// src/app/api/auth/register/route.ts
import { parseContact } from "@/lib/auth-contact";
import { connectDB } from "@/lib/db";
import { registerSchema } from "@/lib/validations/auth.schema";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      const message = parsed.error.issues?.[0]?.message ?? "Invalid input";
      return NextResponse.json({ error: message }, { status: 422 });
    }

    const { name, email: contactRaw, password } = parsed.data;
    const contact = parseContact(contactRaw);
    if (!contact?.email) {
      return NextResponse.json(
        { error: "Enter a valid email or mobile number" },
        { status: 422 },
      );
    }

    await connectDB();

    const existingQuery =
      contact.kind === "phone" && contact.phone
        ? {
            $or: [{ email: contact.email }, { phone: contact.phone }],
          }
        : { email: contact.email };

    const existing = await User.findOne(existingQuery);
    if (existing) {
      return NextResponse.json(
        {
          error:
            contact.kind === "phone"
              ? "Mobile number already registered"
              : "Email already registered",
        },
        { status: 409 },
      );
    }

    const hashed = await bcrypt.hash(password, 12);

    await User.create({
      name,
      email: contact.email,
      phone: contact.phone,
      password: hashed,
      role: "user",
    });

    return NextResponse.json(
      { message: "Account created successfully" },
      { status: 201 },
    );
  } catch (err) {
    console.error("[register]", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
