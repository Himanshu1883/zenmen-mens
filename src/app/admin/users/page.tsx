import Users from "@/app/components/adminComponents/pages/Users";
import { resolveAccountContact } from "@/lib/auth-contact";
import { connectDB } from "@/lib/db";
import { escapeRegex } from "@/lib/utils";
import User from "@/models/User";
import type { Types } from "mongoose";

type SearchParams = Promise<{
  page?: string;
  q?: string;
  role?: string;
  from?: string;
  to?: string;
}>;
type UserRow = {
  id: string;
  name: string;
  email: string;
  role: "Admin" | "User";
  joinedDate: string;
  status: "Active";
  orders: number;
};
type DbUser = {
  _id: Types.ObjectId;
  name?: string;
  email?: string;
  phone?: string;
  role?: "user" | "admin";
  createdAt: Date | string;
};

function formatDate(input: Date | string) {
  const d = new Date(input);
  if (Number.isNaN(d.getTime())) return "N/A";
  return d.toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function parseDayStart(value: string): Date | null {
  const d = new Date(`${value}T00:00:00`);
  return Number.isNaN(d.getTime()) ? null : d;
}

function parseDayEnd(value: string): Date | null {
  const d = new Date(`${value}T23:59:59.999`);
  return Number.isNaN(d.getTime()) ? null : d;
}

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page ?? "1") || 1);
  const q = (params.q ?? "").trim().slice(0, 80);
  const roleParam = (params.role ?? "").trim();
  const role =
    roleParam === "admin" || roleParam === "user" ? roleParam : "";
  const from = (params.from ?? "").trim();
  const to = (params.to ?? "").trim();
  const pageSize = 10;
  const skip = (page - 1) * pageSize;

  const query: Record<string, unknown> = {};

  if (q) {
    const regex = new RegExp(escapeRegex(q), "i");
    query.$or = [{ name: regex }, { email: regex }, { phone: regex }];
  }
  if (role) {
    query.role = role;
  }

  const createdAt: Record<string, Date> = {};
  if (from) {
    const start = parseDayStart(from);
    if (start) createdAt.$gte = start;
  }
  if (to) {
    const end = parseDayEnd(to);
    if (end) createdAt.$lte = end;
  }
  if (Object.keys(createdAt).length > 0) {
    query.createdAt = createdAt;
  }

  await connectDB();

  const [rows, total, totalUsers, totalAdmins, thisMonthUsers] =
    await Promise.all([
      User.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pageSize)
        .select("name email phone role createdAt")
        .lean(),
      User.countDocuments(query),
      User.countDocuments({}),
      User.countDocuments({ role: "admin" }),
      User.countDocuments({
        createdAt: {
          $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        },
      }),
    ]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const users: UserRow[] = (rows as DbUser[]).map((u) => ({
    id: String(u._id),
    name: u.name ?? "Unknown User",
    email: resolveAccountContact({ email: u.email, phone: u.phone })
      .displayContact,
    role: u.role === "admin" ? "Admin" : "User",
    joinedDate: formatDate(u.createdAt),
    status: "Active" as const,
    orders: 0,
  }));

  return (
    <Users
      users={users}
      pagination={{ page, pageSize, total, totalPages }}
      filters={{ q, role, from, to }}
      stats={{
        totalUsers,
        activeUsers: totalUsers,
        admins: totalAdmins,
        newThisMonth: thisMonthUsers,
      }}
    />
  );
}
