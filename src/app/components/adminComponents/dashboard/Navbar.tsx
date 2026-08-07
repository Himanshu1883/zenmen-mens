"use client";

import { adminAvatarParams } from "@/app/components/adminComponents/admin-theme";
import { ZenIcon } from "@/components/icons";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useState } from "react";

interface NavbarProps {
  onMenuClick: () => void;
  sidebarCollapsed: boolean;
  admin?: {
    name?: string;
    role?: string;
    avatarUrl?: string;
  };
}

const pageTitles: Record<string, { title: string; subtitle: string }> = {
  "/admin": { title: "Dashboard", subtitle: "Overview & Analytics" },
  "/admin/sections": { title: "Website", subtitle: "Content Management" },
  "/admin/images": { title: "Gallery", subtitle: "Image Library" },
  "/admin/products": { title: "Products", subtitle: "Catalog Management" },
  "/admin/users": { title: "Clients", subtitle: "Customer Directory" },
  "/admin/orders": { title: "Orders", subtitle: "Order Management" },
  "/admin/analytics": { title: "Analytics", subtitle: "Business Insights" },
  "/admin/settings": { title: "Settings", subtitle: "System Configuration" },
};

export function Navbar({ onMenuClick, sidebarCollapsed, admin }: NavbarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [searchFocused, setSearchFocused] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const defaultAdmin = {
    name: "Admin",
    role: "admin",
    avatarUrl: `https://ui-avatars.com/api/?name=Admin&${adminAvatarParams}`,
  };

  const sessionUser = session?.user;
  const currentAdmin = {
    ...defaultAdmin,
    ...(admin || {}),
    name: sessionUser?.name ?? admin?.name ?? defaultAdmin.name,
    role:
      (sessionUser as { role?: string })?.role ??
      admin?.role ??
      defaultAdmin.role,
    avatarUrl:
      sessionUser?.image ||
      admin?.avatarUrl ||
      `https://ui-avatars.com/api/?name=${encodeURIComponent(
        (sessionUser?.name ?? admin?.name ?? defaultAdmin.name) as string,
      )}&${adminAvatarParams}`,
  };

  const currentPage = pageTitles[pathname] || pageTitles["/admin"];

  return (
    <header
      className={`fixed top-20 right-0 left-0 ${
        sidebarCollapsed ? "md:left-20" : "md:left-72"
      } h-20 z-20 transition-all duration-300 bg-white/90 backdrop-blur-md border-b border-[#e2e8f0]`}
    >
      <div className="h-full px-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-shrink-0 min-w-0">
          <button
            type="button"
            onClick={onMenuClick}
            className="md:hidden p-2 hover:bg-[#f1f5f9] rounded-lg transition-colors flex-shrink-0 text-[#0f172a]"
          >
            <ZenIcon name="bars" className="w-5 h-5" />
          </button>

          <div className="hidden md:block min-w-0">
            <h2 className="text-lg font-semibold leading-tight text-[#0f172a]">
              {currentPage.title}
            </h2>
            <p className="text-xs leading-tight mt-0.5 text-[#64748b]">
              {currentPage.subtitle}
            </p>
          </div>
        </div>

        <div className="flex-1 max-w-2xl hidden lg:block mx-auto">
          <div
            className={`relative transition-all ${
              searchFocused ? "scale-[1.02]" : ""
            }`}
          >
            <ZenIcon
              name="search"
              className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${
                searchFocused ? "text-[#7da8c7]" : "text-[#94a3b8]"
              }`}
            />
            <input
              type="text"
              placeholder="Search orders, clients, products..."
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              className={`w-full pl-11 pr-4 py-2.5 rounded-xl text-sm transition-all focus:outline-none bg-[#f8fafc] text-[#0f172a] placeholder:text-[#94a3b8] border ${
                searchFocused
                  ? "border-[#7da8c7] ring-1 ring-[#7da8c7]/20"
                  : "border-[#e2e8f0]"
              }`}
            />
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            type="button"
            className="p-2.5 hover:bg-[#f1f5f9] rounded-xl transition-all hidden md:block text-[#64748b] hover:text-[#7da8c7]"
            title="Settings"
          >
            <ZenIcon name="cog" className="w-5 h-5" />
          </button>

          <div className="relative">
            <button
              type="button"
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2.5 hover:bg-[#f1f5f9] rounded-xl transition-all text-[#64748b]"
            >
              <ZenIcon name="bell" className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#7da8c7] ring-2 ring-white" />
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 rounded-xl shadow-lg overflow-hidden bg-white border border-[#e2e8f0]">
                <div className="p-4 border-b border-[#e2e8f0]">
                  <h3 className="font-semibold text-[#0f172a]">
                    Notifications
                  </h3>
                  <p className="text-xs mt-1 text-[#64748b]">
                    You have 3 unread messages
                  </p>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {[
                    {
                      title: "New Order Received",
                      desc: "Marcus Chen - 3-Piece Suit",
                      time: "2h ago",
                      unread: true,
                    },
                    {
                      title: "Payment Confirmed",
                      desc: "₹3,200 from David Park",
                      time: "5h ago",
                      unread: true,
                    },
                    {
                      title: "Fitting Scheduled",
                      desc: "James Wilson - Tomorrow 2PM",
                      time: "1d ago",
                      unread: true,
                    },
                  ].map((notif, i) => (
                    <div
                      key={i}
                      className="p-4 hover:bg-[#f8fafc] transition-colors cursor-pointer border-b border-[#f1f5f9]"
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-2 h-2 rounded-full mt-2 bg-[#7da8c7] ${
                            notif.unread ? "opacity-100" : "opacity-0"
                          }`}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-[#0f172a]">
                            {notif.title}
                          </p>
                          <p className="text-xs mt-1 text-[#64748b]">
                            {notif.desc}
                          </p>
                          <p className="text-xs mt-1 text-[#7da8c7]">
                            {notif.time}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-3 text-center border-t border-[#e2e8f0]">
                  <button
                    type="button"
                    className="text-sm font-medium text-[#7da8c7] hover:text-[#5a8faf]"
                  >
                    View All Notifications
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="hidden md:block">
            <button
              type="button"
              className="flex items-center gap-3 px-3 py-2 hover:bg-[#f1f5f9] rounded-xl transition-all"
            >
              <div className="text-right">
                <p className="text-sm font-medium leading-tight text-[#0f172a]">
                  {currentAdmin.name}
                </p>
                <p className="text-xs leading-tight mt-0.5 text-[#64748b] capitalize">
                  {currentAdmin.role}
                </p>
              </div>
              <img
                src={currentAdmin.avatarUrl}
                alt="Profile"
                className="w-10 h-10 rounded-full ring-2 ring-[#7da8c7]/30 shrink-0"
              />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
