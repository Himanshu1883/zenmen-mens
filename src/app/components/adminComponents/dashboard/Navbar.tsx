"use client";
import {
  Bell,
  Menu,
  Search,
  Settings as SettingsIcon,
  Sun,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { useState } from "react";

interface NavbarProps {
  onMenuClick: () => void;
  sidebarCollapsed: boolean;
}

const pageTitles: Record<string, { title: string; subtitle: string }> = {
  "/admin": { title: "Dashboard", subtitle: "Overview & Analytics" },
  "/admin/sections": { title: "Website", subtitle: "Content Management" },
  "/admin/images": { title: "Gallery", subtitle: "Image Library" },
  "/admin/products": { title: "Products", subtitle: "Catalog Management" },
  "/admin/users": { title: "Clients", subtitle: "Customer Directory" },
  "/admin/orders": { title: "Orders", subtitle: "Commission Management" },
  "/admin/analytics": { title: "Analytics", subtitle: "Business Insights" },
  "/admin/settings": { title: "Settings", subtitle: "System Configuration" },
};

export function Navbar({ onMenuClick, sidebarCollapsed }: NavbarProps) {
  const pathname = usePathname();

  const currentPage = pageTitles[pathname] || pageTitles["/admin"];
  const [searchFocused, setSearchFocused] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <header
      className={`fixed top-16 right-0 left-0 ${
        sidebarCollapsed ? "md:left-20" : "md:left-72"
      } h-20 z-20 transition-all duration-300`}
      style={{
        background: "rgba(5, 10, 24, 0.8)",
        backdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(200, 169, 110, 0.1)",
      }}
    >
      <div className="h-full px-6 flex items-center justify-between gap-4">
        {/* Left Section */}
        <div className="flex items-center gap-4 flex-shrink-0 min-w-0">
          {/* Mobile Menu Button */}
          <button
            onClick={onMenuClick}
            className="md:hidden p-2 hover:bg-white/5 rounded-lg transition-colors flex-shrink-0"
          >
            <Menu className="w-5 h-5" style={{ color: "#FAF8F4" }} />
          </button>

          {/* Page Title */}
          <div className="hidden md:block min-w-0">
            <h2
              className="text-lg font-semibold leading-tight"
              style={{ color: "#FAF8F4" }}
            >
              {currentPage.title}
            </h2>
            <p
              className="text-xs leading-tight mt-0.5"
              style={{ color: "#9AA5B8" }}
            >
              {currentPage.subtitle}
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex-1 max-w-2xl hidden lg:block mx-auto">
          <div
            className={`relative transition-all ${
              searchFocused ? "scale-105" : ""
            }`}
          >
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors"
              style={{ color: searchFocused ? "#C8A96E" : "#9AA5B8" }}
            />
            <input
              type="text"
              placeholder="Search orders, clients, products..."
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              className="w-full pl-11 pr-4 py-2.5 rounded-xl text-sm transition-all focus:outline-none"
              style={{
                background: searchFocused
                  ? "rgba(200, 169, 110, 0.1)"
                  : "rgba(255, 255, 255, 0.05)",
                border: `1px solid ${
                  searchFocused
                    ? "rgba(200, 169, 110, 0.3)"
                    : "rgba(255, 255, 255, 0.1)"
                }`,
                color: "#E8E4DC",
              }}
            />
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Theme Toggle */}
          <button
            className="p-2.5 hover:bg-white/5 rounded-xl transition-all"
            title="Toggle Theme"
          >
            <Sun className="w-5 h-5" style={{ color: "#9AA5B8" }} />
          </button>

          {/* Settings */}
          <button
            className="p-2.5 hover:bg-white/5 rounded-xl transition-all hidden md:block"
            title="Settings"
          >
            <SettingsIcon className="w-5 h-5" style={{ color: "#9AA5B8" }} />
          </button>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2.5 hover:bg-white/5 rounded-xl transition-all"
            >
              <Bell className="w-5 h-5" style={{ color: "#9AA5B8" }} />
              <span
                className="absolute top-2 right-2 w-2 h-2 rounded-full"
                style={{
                  background: "#C8A96E",
                  boxShadow: "0 0 0 3px rgba(5, 10, 24, 0.8)",
                }}
              ></span>
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div
                className="absolute right-0 mt-2 w-80 rounded-xl shadow-2xl overflow-hidden"
                style={{
                  background:
                    "linear-gradient(135deg, #0A1220 0%, #050a18 100%)",
                  border: "1px solid rgba(200, 169, 110, 0.2)",
                }}
              >
                <div
                  className="p-4 border-b"
                  style={{ borderColor: "rgba(200, 169, 110, 0.1)" }}
                >
                  <h3 className="font-semibold" style={{ color: "#FAF8F4" }}>
                    Notifications
                  </h3>
                  <p className="text-xs mt-1" style={{ color: "#9AA5B8" }}>
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
                      desc: "$3,200 from David Park",
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
                      className="p-4 hover:bg-white/5 transition-colors cursor-pointer border-b"
                      style={{ borderColor: "rgba(200, 169, 110, 0.05)" }}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-2 h-2 rounded-full mt-2 ${
                            notif.unread ? "opacity-100" : "opacity-0"
                          }`}
                          style={{ background: "#C8A96E" }}
                        ></div>
                        <div className="flex-1 min-w-0">
                          <p
                            className="text-sm font-medium"
                            style={{ color: "#FAF8F4" }}
                          >
                            {notif.title}
                          </p>
                          <p
                            className="text-xs mt-1"
                            style={{ color: "#9AA5B8" }}
                          >
                            {notif.desc}
                          </p>
                          <p
                            className="text-xs mt-1"
                            style={{ color: "#C8A96E" }}
                          >
                            {notif.time}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div
                  className="p-3 text-center border-t"
                  style={{ borderColor: "rgba(200, 169, 110, 0.1)" }}
                >
                  <button
                    className="text-sm font-medium transition-colors hover:opacity-80"
                    style={{ color: "#C8A96E" }}
                  >
                    View All Notifications
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Profile */}
          <div className="hidden md:block">
            <button className="flex items-center gap-3 px-3 py-2 hover:bg-white/5 rounded-xl transition-all">
              <div className="text-right">
                <p
                  className="text-sm font-medium leading-tight"
                  style={{ color: "#FAF8F4" }}
                >
                  Sarah Anderson
                </p>
                <p
                  className="text-xs leading-tight mt-0.5"
                  style={{ color: "#9AA5B8" }}
                >
                  Admin
                </p>
              </div>
              <div
                className="w-10 h-10 rounded-full ring-2 transition-all flex-shrink-0"
                style={{
                  background:
                    "linear-gradient(135deg, #C8A96E 0%, #8B6E3A 100%)",
                }}
              >
                <img
                  src="https://ui-avatars.com/api/?name=Sarah+Anderson&background=C8A96E&color=050a18"
                  alt="Profile"
                  className="w-full h-full rounded-full"
                />
              </div>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
