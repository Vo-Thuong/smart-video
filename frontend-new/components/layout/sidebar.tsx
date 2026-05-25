"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Video,
  BookOpen,
  User,
  LogOut,
  ChevronLeft,
  FolderOpen,
  Rss,
  ExternalLink,
  Users,
} from "lucide-react";

const navLinks = [
  { name: "Home Page", href: "/dashboard", icon: LayoutDashboard },
  { name: "Feed", href: "/dashboard/feed", icon: Rss },
  { name: "Friends", href: "/dashboard/friends", icon: Users },
  { name: "My Video", href: "/dashboard/my-video", icon: Video },
  { name: "Collections", href: "/dashboard/collections", icon: FolderOpen },
  { name: "Vocabulary", href: "/dashboard/vocabulary", icon: BookOpen },
  { name: "Profile", href: "/dashboard/profile", icon: User },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const isPracticePage = pathname.startsWith("/dashboard/practice");
  const [collapsed, setCollapsed] = useState(isPracticePage);

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/");
  }

  useEffect(() => {
    setCollapsed(isPracticePage);
  }, [isPracticePage]);

  return (
    <aside
      className={`
        relative flex-shrink-0 flex flex-col h-full
        bg-gradient-to-b from-[#2a1845] via-[#351F54] to-[#1e1235]
        border-r border-white/8
        transition-[width] duration-300 ease-in-out overflow-hidden
        ${collapsed ? "w-[68px]" : "w-[240px]"}
      `}
    >
      {/* Decorative glow */}
      <div className="pointer-events-none absolute top-0 left-0 w-full h-40 bg-gradient-to-b from-purple-500/10 to-transparent" />
      <div className="pointer-events-none absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-indigo-900/20 to-transparent" />

      {/* ── Logo + Toggle ── */}
      <div className="relative flex items-center h-16 px-3 border-b border-white/8">
        {/* Logo — always visible, slides left when collapsed */}
        <div className={`flex items-center gap-2.5 overflow-hidden transition-all duration-300 ${collapsed ? "w-0 opacity-0" : "w-full opacity-100"}`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/assets/image/logo/logo-smart-video.png"
            alt="Logo"
            width={30}
            height={30}
            className="rounded-lg flex-shrink-0 ring-1 ring-white/20 shadow-md"
          />
          <span className="font-bold text-[15px] tracking-wide text-white whitespace-nowrap">
            Smart<span className="text-[#a78bfa]">Video</span>
          </span>
        </div>

        {/* Toggle button */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          title={collapsed ? "Expand" : "Collapse"}
          className={`
            flex-shrink-0 flex items-center justify-center
            w-8 h-8 rounded-xl
            text-white/50 hover:text-white
            bg-white/0 hover:bg-white/10
            transition-all duration-200
            ${collapsed ? "mx-auto" : "ml-auto"}
          `}
        >
          <ChevronLeft
            className={`w-4 h-4 transition-transform duration-300 ${collapsed ? "rotate-180" : ""}`}
          />
        </button>
      </div>

      {/* ── Navigation ── */}
      <nav className="flex flex-col gap-0.5 p-2 flex-1 overflow-y-auto overflow-x-hidden scrollbar-none">
        {navLinks.map(({ name, href, icon: Icon }) => {
          const isActive = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
          return (
            <Link
              key={name}
              href={href}
              title={collapsed ? name : undefined}
              className={`
                group relative flex items-center gap-3 px-2.5 py-2.5 rounded-xl
                transition-all duration-200 select-none
                ${collapsed ? "justify-center" : ""}
                ${isActive
                  ? "bg-[#a78bfa]/15 text-[#c4b5fd] shadow-[inset_0_0_0_1px_rgba(167,139,250,0.2)]"
                  : "text-white/50 hover:text-white hover:bg-white/8"
                }
              `}
            >
              {/* Active indicator bar */}
              {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-[#a78bfa] rounded-full" />
              )}

              <Icon
                className={`w-[18px] h-[18px] flex-shrink-0 transition-transform duration-200 group-hover:scale-110 ${
                  isActive ? "text-[#c4b5fd]" : ""
                }`}
              />

              <span
                className={`
                  text-[13px] font-medium whitespace-nowrap
                  transition-all duration-300 overflow-hidden
                  ${collapsed ? "w-0 opacity-0" : "w-auto opacity-100"}
                `}
              >
                {name}
              </span>

              {/* Tooltip when collapsed */}
              {collapsed && (
                <span className="
                  pointer-events-none absolute left-full ml-3 z-50
                  px-2.5 py-1.5 rounded-lg text-xs font-medium
                  bg-[#1e1235] text-white border border-white/10 shadow-xl
                  opacity-0 group-hover:opacity-100 translate-x-1 group-hover:translate-x-0
                  transition-all duration-150 whitespace-nowrap
                ">
                  {name}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* ── Bottom actions ── */}
      <div className="p-2 border-t border-white/8 space-y-0.5">
        {/* Landing Page */}
        <Link
          href="/"
          title={collapsed ? "Landing Page" : undefined}
          className={`
            group relative flex items-center gap-3 px-2.5 py-2.5 rounded-xl
            text-white/40 hover:text-white hover:bg-white/8
            transition-all duration-200
            ${collapsed ? "justify-center" : ""}
          `}
        >
          <ExternalLink className="w-[18px] h-[18px] flex-shrink-0 transition-transform duration-200 group-hover:scale-110" />
          <span
            className={`
              text-[13px] font-medium whitespace-nowrap
              transition-all duration-300 overflow-hidden
              ${collapsed ? "w-0 opacity-0" : "w-auto opacity-100"}
            `}
          >
            Landing Page
          </span>
          {collapsed && (
            <span className="
              pointer-events-none absolute left-full ml-3 z-50
              px-2.5 py-1.5 rounded-lg text-xs font-medium
              bg-[#1e1235] text-white border border-white/10 shadow-xl
              opacity-0 group-hover:opacity-100 translate-x-1 group-hover:translate-x-0
              transition-all duration-150 whitespace-nowrap
            ">
              Landing Page
            </span>
          )}
        </Link>

        {/* Logout */}
        <button
          onClick={handleLogout}
          title={collapsed ? "Logout" : undefined}
          className={`
            group relative w-full flex items-center gap-3 px-2.5 py-2.5 rounded-xl
            text-white/40 hover:text-red-400 hover:bg-red-500/10
            transition-all duration-200
            ${collapsed ? "justify-center" : ""}
          `}
        >
          <LogOut className="w-[18px] h-[18px] flex-shrink-0 transition-transform duration-200 group-hover:scale-110" />
          <span
            className={`
              text-[13px] font-medium whitespace-nowrap
              transition-all duration-300 overflow-hidden
              ${collapsed ? "w-0 opacity-0" : "w-auto opacity-100"}
            `}
          >
            Logout
          </span>
          {collapsed && (
            <span className="
              pointer-events-none absolute left-full ml-3 z-50
              px-2.5 py-1.5 rounded-lg text-xs font-medium
              bg-[#1e1235] text-white border border-white/10 shadow-xl
              opacity-0 group-hover:opacity-100 translate-x-1 group-hover:translate-x-0
              transition-all duration-150 whitespace-nowrap
            ">
              Logout
            </span>
          )}
        </button>
      </div>
    </aside>
  );
}
