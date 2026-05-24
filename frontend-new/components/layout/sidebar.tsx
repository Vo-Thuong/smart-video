"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Video,
  BookOpen,
  User,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  FolderOpen,
} from "lucide-react";

const navLinks = [
  { name: "Home Page", href: "/dashboard", icon: LayoutDashboard },
  { name: "My Video", href: "/dashboard/my-video", icon: Video },
  { name: "Collections", href: "/dashboard/collections", icon: FolderOpen },
  { name: "Vocabulary", href: "/dashboard/vocabulary", icon: BookOpen },
  { name: "Profile", href: "/dashboard/profile", icon: User },
];

export function Sidebar() {
  const pathname = usePathname();
  const isPracticePage = pathname.startsWith("/dashboard/practice");
  const [collapsed, setCollapsed] = useState(isPracticePage);

  // Auto-collapse when entering practice page, auto-expand when leaving
  useEffect(() => {
    setCollapsed(isPracticePage);
  }, [isPracticePage]);

  return (
    <aside
      className={`flex-shrink-0 bg-[#351F54] text-white flex flex-col border-r border-white/10 h-full transition-all duration-300 ${
        collapsed ? "w-14" : "w-64"
      }`}
    >
      {/* Toggle button */}
      <div className={`flex items-center border-b border-white/10 h-16 ${collapsed ? "justify-center" : "justify-between px-5"}`}>
        {!collapsed && (
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/assets/image/logo/logo-smart-video.png"
              alt="Smart Video Logo"
              width={32}
              height={32}
              className="rounded-md flex-shrink-0"
            />
            <span className="font-bold text-lg tracking-wider">Smart Video</span>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors flex-shrink-0"
          title={collapsed ? "Mở sidebar" : "Thu nhỏ sidebar"}
        >
          {collapsed ? (
            <PanelLeftOpen className="w-5 h-5" />
          ) : (
            <PanelLeftClose className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-1 p-2 flex-1">
        {navLinks.map(({ name, href, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={name}
              href={href}
              title={collapsed ? name : undefined}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold transition-colors ${
                isActive
                  ? "text-[#00E5FF] bg-[#00E5FF]/10"
                  : "text-gray-300 hover:text-white hover:bg-white/10"
              } ${collapsed ? "justify-center" : ""}`}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span className="text-sm">{name}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-2 border-t border-white/10">
        <Link
          href="/auth/signin"
          title={collapsed ? "Logout" : undefined}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-300 hover:text-white hover:bg-white/10 font-semibold transition-colors ${
            collapsed ? "justify-center" : ""
          }`}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span className="text-sm">Logout</span>}
        </Link>
      </div>
    </aside>
  );
}
