"use client";
import {
  BarChart3,
  ChevronLeft,
  Globe,
  HelpCircle,
  Image as ImageIcon,
  LayoutDashboard,
  LogOut,
  Package,
  Settings,
  ShoppingCart,
  Sparkles,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/admin", badge: null },
  // { icon: Globe, label: "Website", path: "/admin/sections", badge: "7" },
  // { icon: ImageIcon, label: "Gallery", path: "/admin/images", badge: null },
  { icon: Package, label: "Products", path: "/admin/products", badge: "156" },
  { icon: Users, label: "Clients", path: "/admin/users", badge: null },
  { icon: ShoppingCart, label: "Orders", path: "/admin/orders", badge: "24" },
  {
    icon: BarChart3,
    label: "Analytics",
    path: "/admin/analytics",
    badge: null,
  },
  { icon: Settings, label: "Settings", path: "/admin/settings", badge: null },
];

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();

  const sessionUser = session?.user;
  const profileName = sessionUser?.name ?? "Sarah Anderson";
  const profileRole = (sessionUser as any)?.role ?? "Administrator";
  const profileAvatar =
    sessionUser?.image ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      profileName,
    )}&background=C8A96E&color=050a18`;

  return (
    <>
      {/* Mobile Overlay */}
      {!collapsed && (
        <div
          className="fixed inset-0 bg-black/60 z-20 md:hidden backdrop-blur-sm"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-20 h-screen transition-all duration-300 z-30 flex flex-col ${
          collapsed ? "w-20 -translate-x-full md:translate-x-0" : "w-72"
        }`}
        style={{
          background: "linear-gradient(180deg, #0A1220 0%, #050a18 100%)",
          borderRight: "1px solid rgba(200, 169, 110, 0.1)",
        }}
      >
        {/* Logo Section */}
        <div className="h-20 flex items-center justify-between px-6 relative">
          {!collapsed ? (
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-[#0A1220]"></div>
              </div>
              <div>
                <h1
                  className="text-lg font-bold tracking-tight"
                  style={{ color: "#FAF8F4" }}
                >
                  ZENmen
                </h1>
                <p className="text-xs" style={{ color: "#9AA5B8" }}>
                  Bespoke Tailoring
                </p>
              </div>
            </div>
          ) : (
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto"
              style={{
                background: "linear-gradient(135deg, #C8A96E 0%, #8B6E3A 100%)",
              }}
            >
              <Sparkles className="w-5 h-5 text-[#050a18]" />
            </div>
          )}
        </div>

        {/* Navigation Menu */}
        <nav className="sidebar-nav px-4 py-6 flex-1 overflow-y-auto">
          <ul className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.path;

              return (
                <li key={item.path}>
                  <Link
                    href={item.path}
                    className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all group relative ${
                      isActive ? "" : "hover:bg-white/5"
                    }`}
                    style={{
                      background: isActive
                        ? "linear-gradient(135deg, rgba(200, 169, 110, 0.15) 0%, rgba(200, 169, 110, 0.05) 100%)"
                        : "transparent",
                      borderLeft: isActive
                        ? "3px solid #C8A96E"
                        : "3px solid transparent",
                    }}
                  >
                    <Icon
                      className={`w-5 h-5 transition-colors ${
                        isActive
                          ? "text-[#C8A96E]"
                          : "text-[#9AA5B8] group-hover:text-[#C8A96E]"
                      }`}
                    />
                    {!collapsed && (
                      <>
                        <span
                          className={`text-sm font-medium flex-1 ${
                            isActive
                              ? "text-[#FAF8F4]"
                              : "text-[#B8C4D4] group-hover:text-[#FAF8F4]"
                          }`}
                        >
                          {item.label}
                        </span>
                        {item.badge && (
                          <span
                            className="px-2 py-0.5 rounded-full text-xs font-semibold"
                            style={{
                              background: isActive
                                ? "rgba(200, 169, 110, 0.2)"
                                : "rgba(154, 165, 184, 0.1)",
                              color: isActive ? "#C8A96E" : "#9AA5B8",
                            }}
                          >
                            {item.badge}
                          </span>
                        )}
                      </>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Bottom Section */}
        <div
          className="p-4 border-t"
          style={{ borderColor: "rgba(200, 169, 110, 0.1)" }}
        >
          {!collapsed ? (
            <div className="space-y-2">
              <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all hover:bg-white/5 group">
                <HelpCircle className="w-5 h-5 text-[#9AA5B8] group-hover:text-[#C8A96E]" />
                <span className="text-sm font-medium text-[#B8C4D4] group-hover:text-[#FAF8F4]">
                  Help & Support
                </span>
              </button>

              <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all hover:bg-white/5 group">
                <LogOut className="w-5 h-5 text-[#9AA5B8] group-hover:text-red-400" />
                <span className="text-sm font-medium text-[#B8C4D4] group-hover:text-red-400">
                  Logout
                </span>
              </button>

              {/* User Profile */}
              <div
                className="mt-4 p-4 rounded-xl"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(200, 169, 110, 0.1) 0%, rgba(200, 169, 110, 0.05) 100%)",
                  border: "1px solid rgba(200, 169, 110, 0.2)",
                }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full"
                    style={{
                      background:
                        "linear-gradient(135deg, #C8A96E 0%, #8B6E3A 100%)",
                    }}
                  >
                    <img
                      src={profileAvatar}
                      alt="Profile"
                      className="w-full h-full rounded-full"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-sm font-semibold truncate"
                      style={{ color: "#FAF8F4" }}
                    >
                      {profileName}
                    </p>
                    <p
                      className="text-xs truncate"
                      style={{ color: "#9AA5B8" }}
                    >
                      {profileRole}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <button className="w-10 h-10 rounded-lg flex items-center justify-center hover:bg-white/5 transition-all">
                <HelpCircle className="w-5 h-5 text-[#9AA5B8]" />
              </button>
              <button className="w-10 h-10 rounded-lg flex items-center justify-center hover:bg-white/5 transition-all">
                <LogOut className="w-5 h-5 text-[#9AA5B8]" />
              </button>
            </div>
          )}
        </div>

        {/* Collapse Toggle Button */}
        <button
          onClick={onToggle}
          className="absolute -right-3 top-24 w-6 h-6 rounded-full flex items-center justify-center transition-all hover:scale-110 hidden md:flex"
          style={{
            background: "linear-gradient(135deg, #C8A96E 0%, #8B6E3A 100%)",
            boxShadow: "0 2px 8px rgba(200, 169, 110, 0.3)",
          }}
        >
          <ChevronLeft
            className={`w-4 h-4 text-[#050a18] transition-transform ${
              collapsed ? "rotate-180" : ""
            }`}
          />
        </button>
      </aside>
    </>
  );
}
