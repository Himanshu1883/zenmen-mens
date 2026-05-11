import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Ban, Calendar, Eye, Mail } from "lucide-react";
import { GlassCard } from "../dashboard/GlassCard";

interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: "Admin" | "User";
  joinedDate: string;
  status: "Active" | "Blocked";
  orders: number;
}

const mockUsers: User[] = [
  {
    id: "1",
    name: "Emma Watson",
    email: "emma.watson@example.com",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
    role: "User",
    joinedDate: "Jan 15, 2026",
    status: "Active",
    orders: 12,
  },
  {
    id: "2",
    name: "James Anderson",
    email: "james.anderson@example.com",
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop",
    role: "User",
    joinedDate: "Feb 3, 2026",
    status: "Active",
    orders: 8,
  },
  {
    id: "3",
    name: "Sarah Mitchell",
    email: "sarah.mitchell@example.com",
    avatar:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
    role: "Admin",
    joinedDate: "Dec 1, 2025",
    status: "Active",
    orders: 24,
  },
  {
    id: "4",
    name: "Michael Chen",
    email: "michael.chen@example.com",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
    role: "User",
    joinedDate: "Mar 10, 2026",
    status: "Active",
    orders: 5,
  },
  {
    id: "5",
    name: "Olivia Brown",
    email: "olivia.brown@example.com",
    avatar:
      "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=100&h=100&fit=crop",
    role: "User",
    joinedDate: "Jan 28, 2026",
    status: "Active",
    orders: 15,
  },
  {
    id: "6",
    name: "David Wilson",
    email: "david.wilson@example.com",
    avatar:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop",
    role: "User",
    joinedDate: "Feb 14, 2026",
    status: "Blocked",
    orders: 2,
  },
];

export default function Users() {
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
          <p className="text-2xl font-semibold text-white">1,284</p>
        </GlassCard>
        <GlassCard className="p-4">
          <p className="text-gray-400 text-sm mb-1">Active Users</p>
          <p className="text-2xl font-semibold text-green-400">1,201</p>
        </GlassCard>
        <GlassCard className="p-4">
          <p className="text-gray-400 text-sm mb-1">Admins</p>
          <p className="text-2xl font-semibold text-[#C8A96E]">8</p>
        </GlassCard>
        <GlassCard className="p-4">
          <p className="text-gray-400 text-sm mb-1">New This Month</p>
          <p className="text-2xl font-semibold text-white">147</p>
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
              {mockUsers.map((user) => (
                <tr
                  key={user.id}
                  className="border-b border-white/5 hover:bg-white/5 transition-colors"
                >
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10 border border-[#C8A96E]/30">
                        <AvatarImage src={user.avatar} />
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
                      className={
                        user.status === "Active"
                          ? "border-green-500/30 text-green-400 bg-green-500/10"
                          : "border-red-500/30 text-red-400 bg-red-500/10"
                      }
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
                        className={`h-8 w-8 p-0 ${
                          user.status === "Active"
                            ? "text-gray-400 hover:text-red-400"
                            : "text-gray-400 hover:text-green-400"
                        } hover:bg-white/5`}
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
          <p className="text-sm text-gray-400">Showing 1-6 of 1,284 users</p>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              className="border-white/10 text-gray-300"
              disabled
            >
              Previous
            </Button>
            <Button
              size="sm"
              className="bg-[#C8A96E] hover:bg-[#C8A96E]/90 text-white"
            >
              Next
            </Button>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
