// src/app/api/auth/register/route.ts
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { registerSchema } from "@/lib/validations/auth.schema";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      // ZodError uses `issues` for individual error details
      const message = parsed.error.issues?.[0]?.message ?? "Invalid input";
      return NextResponse.json(
        { error: message },
        { status: 422 },
      );
    }

    const { name, email, password } = parsed.data;

    await connectDB();

    const existing = await User.findOne({ email });
    if (existing) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 409 },
      );
    }

    const hashed = await bcrypt.hash(password, 12);

    await User.create({ name, email, password: hashed, role: "user" });

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
