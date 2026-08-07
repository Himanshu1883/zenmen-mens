import { requireAuthUser } from "@/lib/api-auth";
import {
  formatPhoneDisplay,
  INTERNAL_MOBILE_EMAIL_DOMAIN,
  isInternalMobileEmail,
  resolveAccountContact,
} from "@/lib/auth-contact";
import { connectDB } from "@/lib/db";
import { fail, ok } from "@/lib/http-responses";
import {
  normalizeProfilePhone,
  profileUpdateSchema,
} from "@/lib/validations/profile.schema";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";

function publicProfile(user: {
  name?: string;
  email?: string;
  phone?: string;
  updatedAt?: Date;
}) {
  const contact = resolveAccountContact(user);
  return {
    name: user.name ?? "",
    email: contact.publicEmail,
    phone: contact.phone,
    phoneDisplay: contact.phone ? formatPhoneDisplay(contact.phone) : null,
    updatedAt: user.updatedAt
      ? new Date(user.updatedAt).toISOString()
      : null,
  };
}

export async function GET() {
  const auth = await requireAuthUser();
  if ("error" in auth) return auth.error;

  await connectDB();
  const user = await User.findById(auth.userId)
    .select("name email phone password updatedAt")
    .lean();

  if (!user) {
    return fail("NOT_FOUND", "Account not found", 404);
  }

  return ok({
    profile: {
      ...publicProfile(user),
      hasPassword: Boolean(user.password && String(user.password).length > 0),
    },
  });
}

export async function PATCH(req: Request) {
  const auth = await requireAuthUser();
  if ("error" in auth) return auth.error;

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return fail("INVALID_JSON", "Invalid request body", 400);
  }

  if (raw === null || typeof raw !== "object" || Array.isArray(raw)) {
    return fail("INVALID_BODY", "Invalid request body", 400);
  }

  const forbidden = [
    "id",
    "_id",
    "userId",
    "role",
    "password",
    "emailVerified",
  ];
  for (const key of forbidden) {
    if (Object.prototype.hasOwnProperty.call(raw, key)) {
      return fail("FORBIDDEN_FIELD", "Request contains disallowed fields", 400);
    }
  }

  const parsed = profileUpdateSchema.safeParse(raw);
  if (!parsed.success) {
    return fail(
      "VALIDATION",
      parsed.error.issues[0]?.message ?? "Invalid input",
      422,
    );
  }

  const data = parsed.data;
  await connectDB();

  const user = await User.findById(auth.userId);
  if (!user) {
    return fail("NOT_FOUND", "Account not found", 404);
  }

  if (String(user._id) !== auth.userId) {
    return fail("FORBIDDEN", "Not allowed", 403);
  }

  const previousEmail = user.email;
  const hasPassword = Boolean(user.password && user.password.length > 0);

  if (data.newPassword) {
    if (hasPassword) {
      if (!data.currentPassword) {
        return fail(
          "PASSWORD_REQUIRED",
          "Enter your current password to set a new one",
          422,
        );
      }
      const valid = await bcrypt.compare(data.currentPassword, user.password);
      if (!valid) {
        return fail("BAD_PASSWORD", "Current password is incorrect", 403);
      }
    }
    user.password = await bcrypt.hash(data.newPassword, 12);
  }

  user.name = data.name;

  const nextPhone = data.phone ? normalizeProfilePhone(data.phone) : undefined;
  const nextPublicEmail = data.email ? data.email.toLowerCase() : undefined;

  if (nextPhone) {
    const taken = await User.findOne({
      phone: nextPhone,
      _id: { $ne: new mongoose.Types.ObjectId(auth.userId) },
    })
      .select("_id")
      .lean();
    if (taken) {
      return fail("PHONE_TAKEN", "This mobile number is already in use", 409);
    }
    user.phone = nextPhone;
  } else {
    user.phone = undefined;
    user.set("phone", undefined);
  }

  if (nextPublicEmail) {
    const taken = await User.findOne({
      email: nextPublicEmail,
      _id: { $ne: new mongoose.Types.ObjectId(auth.userId) },
    })
      .select("_id")
      .lean();
    if (taken) {
      return fail("EMAIL_TAKEN", "This email is already in use", 409);
    }
    user.email = nextPublicEmail;
  } else if (nextPhone) {
    user.email = `${nextPhone}@${INTERNAL_MOBILE_EMAIL_DOMAIN}`;
  } else {
    return fail(
      "CONTACT_REQUIRED",
      "Keep at least an email or mobile number on your account",
      422,
    );
  }

  const after = resolveAccountContact({
    email: user.email,
    phone: user.phone,
  });
  if (!after.publicEmail && !after.phone) {
    return fail(
      "CONTACT_REQUIRED",
      "Keep at least an email or mobile number on your account",
      422,
    );
  }

  await user.save();

  const loginEmailChanged =
    previousEmail !== user.email &&
    !isInternalMobileEmail(previousEmail) &&
    !isInternalMobileEmail(user.email);

  return ok({
    profile: {
      ...publicProfile({
        name: user.name,
        email: user.email,
        phone: user.phone,
        updatedAt: user.updatedAt,
      }),
      hasPassword: Boolean(user.password && user.password.length > 0),
      loginEmailChanged,
      sessionMayNeedRefresh:
        previousEmail !== user.email || Boolean(data.newPassword),
    },
  });
}
