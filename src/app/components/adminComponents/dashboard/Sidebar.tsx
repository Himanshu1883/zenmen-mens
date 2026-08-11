"use client";

import { ZenIcon, type ZenIconName } from "@/components/icons";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const menuItems: {
  icon: ZenIconName;
  label: string;
  path: string;
  badge: string | null;
}[] = [
  { icon: "dashboard", label: "Dashboard", path: "/admin", badge: null },
  { icon: "box", label: "Products", path: "/admin/products", badge: "156" },
  { icon: "sparkles", label: "Categories", path: "/admin/categories", badge: null },
  { icon: "users", label: "Clients", path: "/admin/users", badge: null },
  { icon: "shopping-cart", label: "Orders", path: "/admin/orders", badge: "24" },
  { icon: "chart-bar", label: "Analytics", path: "/admin/analytics", badge: null },
  { icon: "cog", label: "Settings", path: "/admin/settings", badge: null },
];

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {!collapsed && (
        <div
          className="fixed inset-0 bg-[#0f172a]/20 z-20 md:hidden backdrop-blur-sm"
          onClick={onToggle}
        />
      )}

      <aside
        className={`fixed left-0 top-20 h-screen transition-all duration-300 z-30 flex flex-col bg-white border-r border-[#e2e8f0] shadow-sm ${
          collapsed ? "w-20 -translate-x-full md:translate-x-0" : "w-72"
        }`}
      >
        <div className="h-20 flex items-center justify-between px-6 relative border-b border-[#e2e8f0]">
          {!collapsed ? (
            <div className="flex items-center gap-3">
              <img
                src="/logo_zenmen.png"
                alt="ZENmen"
                className="h-9 w-auto object-contain rounded-full"
              />
              <div>
                <h1 className="text-lg font-bold tracking-tight text-[#0f172a]">
                  ZENMEN
                </h1>
                <p className="text-xs text-[#64748b]">Admin</p>
              </div>
            </div>
          ) : (
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto bg-[#7da8c7]">
              <ZenIcon name="sparkles" className="w-5 h-5 text-white" />
            </div>
          )}
        </div>

        <nav className="sidebar-nav px-4 py-6 flex-1 overflow-y-auto">
          <ul className="space-y-1">
            {menuItems.map((item) => {
              const isActive = pathname === item.path;

              return (
                <li key={item.path}>
                  <Link
                    href={item.path}
                    className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all group relative border-l-[3px] ${
                      isActive
                        ? "bg-[#f0f6fb] border-[#7da8c7] text-[#0f172a]"
                        : "border-transparent hover:bg-[#f8fafc] text-[#64748b] hover:text-[#0f172a]"
                    }`}
                  >
                    <ZenIcon
                      name={item.icon}
                      className={`w-5 h-5 transition-colors ${
                        isActive
                          ? "text-[#7da8c7]"
                          : "text-[#94a3b8] group-hover:text-[#7da8c7]"
                      }`}
                    />
                    {!collapsed && (
                      <>
                        <span className="text-sm font-medium flex-1">
                          {item.label}
                        </span>
                        {item.badge && (
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                              isActive
                                ? "bg-[#7da8c7]/15 text-[#5a8faf]"
                                : "bg-[#f1f5f9] text-[#64748b]"
                            }`}
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

        <div className="mb-20 p-4 border-t border-[#e2e8f0]">
          {!collapsed ? (
            <div className="space-y-2">
              <button
                type="button"
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all hover:bg-[#f8fafc] group text-[#64748b] hover:text-[#0f172a]"
              >
                <ZenIcon
                  name="question-circle"
                  className="w-5 h-5 group-hover:text-[#7da8c7]"
                />
                <span className="text-sm font-medium">Help & Support</span>
              </button>

              <button
                type="button"
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all hover:bg-red-50 group text-[#64748b] hover:text-red-600"
              >
                <ZenIcon name="sign-out" className="w-5 h-5" />
                <span className="text-sm font-medium">Logout</span>
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <button
                type="button"
                className="w-10 h-10 rounded-lg flex items-center justify-center hover:bg-[#f8fafc] text-[#64748b]"
              >
                <ZenIcon name="question-circle" className="w-5 h-5" />
              </button>
              <button
                type="button"
                className="w-10 h-10 rounded-lg flex items-center justify-center hover:bg-red-50 text-[#64748b]"
              >
                <ZenIcon name="sign-out" className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={onToggle}
          className="absolute -right-3 top-24 w-6 h-6 rounded-full flex items-center justify-center transition-all hover:scale-110 hidden md:flex bg-[#7da8c7] text-white shadow-md shadow-[#7da8c7]/30"
        >
          <ZenIcon
            name="chevron-left"
            className={`w-4 h-4 transition-transform ${
              collapsed ? "rotate-180" : ""
            }`}
          />
        </button>
      </aside>
    </>
  );
}
