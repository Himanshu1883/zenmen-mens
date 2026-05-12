import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Ban, Calendar, Eye, Mail } from "lucide-react";
import Link from "next/link";
import { GlassCard } from "../dashboard/GlassCard";

interface UserRow {
  id: string;
  name: string;
  email: string;
  role: "Admin" | "User";
  joinedDate: string;
  status: "Active";
  orders: number;
}

interface UsersProps {
  users: UserRow[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
  stats: {
    totalUsers: number;
    activeUsers: number;
    admins: number;
    newThisMonth: number;
  };
}

function formatNum(value: number) {
  return value.toLocaleString("en-IN");
}

export default function Users({ users, pagination, stats }: UsersProps) {
  const calculatedFrom = (pagination.page - 1) * pagination.pageSize + 1;
  const from = pagination.total === 0 || users.length === 0 ? 0 : calculatedFrom;
  const to =
    pagination.total === 0 || users.length === 0
      ? 0
      : Math.min((pagination.page - 1) * pagination.pageSize + users.length, pagination.total);
  const hasPrev = pagination.page > 1;
  const hasNext = pagination.page < pagination.totalPages;

  return (
    <div className="space-y-6 mt-16">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-semibold text-white mb-2">Users</h1>
          <p className="text-gray-400">Manage your customer base</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="border-white/10 text-gray-300">
            Export
          </Button>
          <Button className="bg-[#C8A96E] hover:bg-[#C8A96E]/90 text-white">
            Add User
          </Button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <GlassCard className="p-4">
          <p className="text-gray-400 text-sm mb-1">Total Users</p>
          <p className="text-2xl font-semibold text-white">
            {formatNum(stats.totalUsers)}
          </p>
        </GlassCard>
        <GlassCard className="p-4">
          <p className="text-gray-400 text-sm mb-1">Active Users</p>
          <p className="text-2xl font-semibold text-green-400">
            {formatNum(stats.activeUsers)}
          </p>
        </GlassCard>
        <GlassCard className="p-4">
          <p className="text-gray-400 text-sm mb-1">Admins</p>
          <p className="text-2xl font-semibold text-[#C8A96E]">
            {formatNum(stats.admins)}
          </p>
        </GlassCard>
        <GlassCard className="p-4">
          <p className="text-gray-400 text-sm mb-1">New This Month</p>
          <p className="text-2xl font-semibold text-white">
            {formatNum(stats.newThisMonth)}
          </p>
        </GlassCard>
      </div>

      {/* Users Table */}
      <GlassCard className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left p-4 text-sm font-medium text-gray-400">
                  User
                </th>
                <th className="text-left p-4 text-sm font-medium text-gray-400">
                  Role
                </th>
                <th className="text-left p-4 text-sm font-medium text-gray-400">
                  Joined Date
                </th>
                <th className="text-left p-4 text-sm font-medium text-gray-400">
                  Orders
                </th>
                <th className="text-left p-4 text-sm font-medium text-gray-400">
                  Status
                </th>
                <th className="text-left p-4 text-sm font-medium text-gray-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr
                  key={user.id}
                  className="border-b border-white/5 hover:bg-white/5 transition-colors"
                >
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10 border border-[#C8A96E]/30">
                        <AvatarFallback className="bg-[#C8A96E]/20 text-[#C8A96E]">
                          {user.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-white text-sm font-medium">
                          {user.name}
                        </p>
                        <p className="text-gray-400 text-xs flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {user.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <Badge
                      variant={user.role === "Admin" ? "default" : "outline"}
                      className={
                        user.role === "Admin"
                          ? "bg-[#C8A96E]/20 text-[#C8A96E] border-[#C8A96E]/30"
                          : "border-white/10 text-gray-400"
                      }
                    >
                      {user.role}
                    </Badge>
                  </td>
                  <td className="p-4">
                    <p className="text-gray-300 text-sm flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      {user.joinedDate}
                    </p>
                  </td>
                  <td className="p-4">
                    <p className="text-white text-sm font-medium">
                      {user.orders}
                    </p>
                  </td>
                  <td className="p-4">
                    <Badge
                      variant="outline"
                      className="border-green-500/30 text-green-400 bg-green-500/10"
                    >
                      {user.status}
                    </Badge>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 text-gray-400 hover:text-[#C8A96E] hover:bg-white/5"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 text-gray-400 hover:text-red-400 hover:bg-white/5"
                      >
                        <Ban className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between p-4 border-t border-white/10">
          <p className="text-sm text-gray-400">
            Showing {from}-{to} of {formatNum(pagination.total)} users
          </p>
          <div className="flex gap-2">
            {hasPrev ? (
              <Button
                asChild
                size="sm"
                variant="outline"
                className="border-white/10 text-gray-300"
              >
                <Link href={`/admin/users?page=${pagination.page - 1}`}>
                  Previous
                </Link>
              </Button>
            ) : (
              <Button
                size="sm"
                variant="outline"
                className="border-white/10 text-gray-300"
                disabled
              >
                Previous
              </Button>
            )}
            {hasNext ? (
              <Button
                asChild
                size="sm"
                className="bg-[#C8A96E] hover:bg-[#C8A96E]/90 text-white"
              >
                <Link href={`/admin/users?page=${pagination.page + 1}`}>Next</Link>
              </Button>
            ) : (
              <Button
                size="sm"
                className="bg-[#C8A96E] hover:bg-[#C8A96E]/90 text-white"
                disabled
              >
                Next
              </Button>
            )}
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
