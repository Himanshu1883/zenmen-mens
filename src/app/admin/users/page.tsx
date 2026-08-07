import Users from "@/app/components/adminComponents/pages/Users";
import { resolveAccountContact } from "@/lib/auth-contact";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import type { Types } from "mongoose";

type SearchParams = Promise<{ page?: string }>;
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

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page ?? "1") || 1);
  const pageSize = 10;
  const skip = (page - 1) * pageSize;

  await connectDB();

  const [rows, total, totalAdmins, thisMonthUsers] = await Promise.all([
    User.find({})
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pageSize)
      .select("name email phone role createdAt")
      .lean(),
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
      stats={{
        totalUsers: total,
        activeUsers: total,
        admins: totalAdmins,
        newThisMonth: thisMonthUsers,
      }}
    />
  );
}
