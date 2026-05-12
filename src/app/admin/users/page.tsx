import Users from "@/app/components/adminComponents/pages/Users";
import { connectDB } from "@/lib/db";
import User from "@/models/User";

type SearchParams = Promise<{ page?: string }>;

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
      .select("name email role createdAt")
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

  const users = rows.map((u: any) => ({
    id: String(u._id),
    name: u.name ?? "Unknown User",
    email: u.email ?? "N/A",
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
