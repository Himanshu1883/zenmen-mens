import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Ban, Calendar, Eye, Mail, Search, X } from "lucide-react";
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

interface UserFilters {
  q: string;
  role: string;
  from: string;
  to: string;
}

interface UsersProps {
  users: UserRow[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
  filters: UserFilters;
  stats: {
    totalUsers: number;
    activeUsers: number;
    admins: number;
    newThisMonth: number;
  };
}

const selectClass =
  "h-9 rounded-lg border border-[#e2e8f0] bg-white px-3 text-sm text-[#0f172a] outline-none focus:border-[#7da8c7]";
const inputClass =
  "h-9 w-full rounded-lg border border-[#e2e8f0] bg-white px-3 text-sm text-[#0f172a] outline-none placeholder:text-[#94a3b8] focus:border-[#7da8c7]";

function formatNum(value: number) {
  return value.toLocaleString("en-IN");
}

function usersHref(page: number, filters: UserFilters) {
  const params = new URLSearchParams();
  if (page > 1) params.set("page", String(page));
  if (filters.q) params.set("q", filters.q);
  if (filters.role) params.set("role", filters.role);
  if (filters.from) params.set("from", filters.from);
  if (filters.to) params.set("to", filters.to);
  const qs = params.toString();
  return qs ? `/admin/users?${qs}` : "/admin/users";
}

export default function Users({
  users,
  pagination,
  filters,
  stats,
}: UsersProps) {
  const calculatedFrom = (pagination.page - 1) * pagination.pageSize + 1;
  const from =
    pagination.total === 0 || users.length === 0 ? 0 : calculatedFrom;
  const to =
    pagination.total === 0 || users.length === 0
      ? 0
      : Math.min(
          (pagination.page - 1) * pagination.pageSize + users.length,
          pagination.total,
        );
  const hasPrev = pagination.page > 1;
  const hasNext = pagination.page < pagination.totalPages;
  const hasFilters = Boolean(
    filters.q || filters.role || filters.from || filters.to,
  );

  return (
    <div className="space-y-6 mt-16">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-semibold text-[#0f172a] mb-2">Clients</h1>
          <p className="text-[#64748b]">Manage your customer base</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="border-[#e2e8f0] text-[#64748b]">
            Export
          </Button>
          <Button className="bg-[#7da8c7] hover:bg-[#5a8faf] text-white">
            Add User
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <GlassCard className="p-4">
          <p className="text-[#64748b] text-sm mb-1">Total Users</p>
          <p className="text-2xl font-semibold text-[#0f172a]">
            {formatNum(stats.totalUsers)}
          </p>
        </GlassCard>
        <GlassCard className="p-4">
          <p className="text-[#64748b] text-sm mb-1">Active Users</p>
          <p className="text-2xl font-semibold text-green-400">
            {formatNum(stats.activeUsers)}
          </p>
        </GlassCard>
        <GlassCard className="p-4">
          <p className="text-[#64748b] text-sm mb-1">Admins</p>
          <p className="text-2xl font-semibold text-[#7da8c7]">
            {formatNum(stats.admins)}
          </p>
        </GlassCard>
        <GlassCard className="p-4">
          <p className="text-[#64748b] text-sm mb-1">New This Month</p>
          <p className="text-2xl font-semibold text-[#0f172a]">
            {formatNum(stats.newThisMonth)}
          </p>
        </GlassCard>
      </div>

      <GlassCard className="p-4">
        <form method="GET" action="/admin/users" className="flex flex-wrap items-end gap-3">
          <div className="relative min-w-[220px] flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94a3b8]" />
            <input
              name="q"
              defaultValue={filters.q}
              className={`${inputClass} pl-9`}
              placeholder="Search name, email, or phone"
              aria-label="Search clients"
            />
          </div>
          <select
            name="role"
            defaultValue={filters.role}
            className={selectClass}
            aria-label="Role"
          >
            <option value="">All roles</option>
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
          <input
            type="date"
            name="from"
            defaultValue={filters.from}
            className={selectClass}
            aria-label="Joined from"
          />
          <input
            type="date"
            name="to"
            defaultValue={filters.to}
            className={selectClass}
            aria-label="Joined to"
          />
          <Button
            type="submit"
            size="sm"
            className="bg-[#7da8c7] hover:bg-[#5a8faf] text-white"
          >
            Apply
          </Button>
          {hasFilters ? (
            <Button
              asChild
              size="sm"
              variant="outline"
              className="border-[#e2e8f0] text-[#64748b]"
            >
              <Link href="/admin/users">
                <X className="mr-1 h-4 w-4" />
                Clear
              </Link>
            </Button>
          ) : null}
        </form>
      </GlassCard>

      <GlassCard className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#e2e8f0]">
                <th className="text-left p-4 text-sm font-medium text-[#64748b]">
                  User
                </th>
                <th className="text-left p-4 text-sm font-medium text-[#64748b]">
                  Role
                </th>
                <th className="text-left p-4 text-sm font-medium text-[#64748b]">
                  Joined Date
                </th>
                <th className="text-left p-4 text-sm font-medium text-[#64748b]">
                  Orders
                </th>
                <th className="text-left p-4 text-sm font-medium text-[#64748b]">
                  Status
                </th>
                <th className="text-left p-4 text-sm font-medium text-[#64748b]">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="p-12 text-center text-sm text-[#64748b]"
                  >
                    {hasFilters
                      ? "No clients match these filters."
                      : "No clients yet."}
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b border-white/5 hover:bg-[#f1f5f9] transition-colors"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10 border border-[#7da8c7]/30">
                          <AvatarFallback className="bg-[#7da8c7]/20 text-[#7da8c7]">
                            {user.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-[#0f172a] text-sm font-medium">
                            {user.name}
                          </p>
                          <p className="text-[#64748b] text-xs flex items-center gap-1">
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
                            ? "bg-[#7da8c7]/20 text-[#7da8c7] border-[#7da8c7]/30"
                            : "border-[#e2e8f0] text-[#64748b]"
                        }
                      >
                        {user.role}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <p className="text-[#64748b] text-sm flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-[#94a3b8]" />
                        {user.joinedDate}
                      </p>
                    </td>
                    <td className="p-4">
                      <p className="text-[#0f172a] text-sm font-medium">
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
                          className="h-8 w-8 p-0 text-[#64748b] hover:text-[#7da8c7] hover:bg-[#f1f5f9]"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 text-[#64748b] hover:text-red-400 hover:bg-[#f1f5f9]"
                        >
                          <Ban className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between p-4 border-t border-[#e2e8f0]">
          <p className="text-sm text-[#64748b]">
            Showing {from}-{to} of {formatNum(pagination.total)} users
          </p>
          <div className="flex gap-2">
            {hasPrev ? (
              <Button
                asChild
                size="sm"
                variant="outline"
                className="border-[#e2e8f0] text-[#64748b]"
              >
                <Link href={usersHref(pagination.page - 1, filters)}>
                  Previous
                </Link>
              </Button>
            ) : (
              <Button
                size="sm"
                variant="outline"
                className="border-[#e2e8f0] text-[#64748b]"
                disabled
              >
                Previous
              </Button>
            )}
            {hasNext ? (
              <Button
                asChild
                size="sm"
                className="bg-[#7da8c7] hover:bg-[#5a8faf] text-white"
              >
                <Link href={usersHref(pagination.page + 1, filters)}>Next</Link>
              </Button>
            ) : (
              <Button
                size="sm"
                className="bg-[#7da8c7] hover:bg-[#5a8faf] text-white"
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
