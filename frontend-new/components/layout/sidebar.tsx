"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import React from "react";
import { useLang } from "@/lib/i18n";
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
  Crown,
  Bell,
} from "lucide-react";

type NavLink = { name: string; href: string; icon: React.ElementType; highlight?: boolean };

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useLang();
  const s = t.sidebar;
  const isPracticePage = pathname.startsWith("/dashboard/practice");
  const [collapsed, setCollapsed] = useState(isPracticePage);
  const [isPro, setIsPro] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const navLinks: NavLink[] = [
    { name: s.home, href: "/dashboard", icon: LayoutDashboard },
    { name: s.feed, href: "/dashboard/feed", icon: Rss },
    { name: s.friends, href: "/dashboard/friends", icon: Users },
    { name: s.myVideo, href: "/dashboard/my-video", icon: Video },
    { name: s.collections, href: "/dashboard/collections", icon: FolderOpen },
    { name: s.vocabulary, href: "/dashboard/vocabulary", icon: BookOpen },
    { name: s.profile, href: "/dashboard/profile", icon: User },
    { name: s.notifications, href: "/dashboard/notifications", icon: Bell },
  ];

  const navLinksWithUpgrade = [
    ...navLinks,
    { name: s.upgradeProLabel, href: "/dashboard/upgrade", icon: Crown, highlight: true },
  ];

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("smartvideo_pro_plan");
    router.push("/");
  }

  useEffect(() => {
    setCollapsed(isPracticePage);
  }, [isPracticePage]);

  useEffect(() => {
    // Đọc is_premium từ user object (được set đúng tại thời điểm login)
    try {
      const raw = localStorage.getItem("user");
      if (raw) {
        const user = JSON.parse(raw);
        setIsPro(!!user.is_premium);
      }
    } catch {}
  }, []);

  // Fetch pending friend requests count as unread notifications
  useEffect(() => {
    async function fetchUnread() {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
        const res = await fetch("http://localhost:5000/api/friends/requests", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) return;
        const data = await res.json();
        const lastSeen = parseInt(localStorage.getItem("notifications_last_seen") || "0", 10);
        const newCount = Array.isArray(data)
          ? data.filter((r: { createdAt: string }) => new Date(r.createdAt).getTime() > lastSeen).length
          : 0;
        setUnreadCount(newCount);
      } catch {}
    }
    fetchUnread();
    // Poll every 30 seconds
    const interval = setInterval(fetchUnread, 30000);
    // Reset badge when notifications page marks all read
    const onRead = () => setUnreadCount(0);
    window.addEventListener("notifications_read", onRead);
    return () => {
      clearInterval(interval);
      window.removeEventListener("notifications_read", onRead);
    };
  }, []);

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
        {navLinksWithUpgrade.map(({ name, href, icon: Icon, highlight }) => {
          const isActive = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
          const isNotifications = href === "/dashboard/notifications";
          return (
            <Link
              key={name}
              href={href}
              title={collapsed ? name : undefined}
              className={`
                group relative flex items-center gap-3 px-2.5 py-2.5 rounded-xl
                transition-all duration-200 select-none
                ${collapsed ? "justify-center" : ""}
                ${highlight && !isActive
                  ? "text-amber-300 bg-amber-400/10 hover:bg-amber-400/20 border border-amber-400/20"
                  : isActive
                  ? "bg-[#a78bfa]/15 text-[#c4b5fd] shadow-[inset_0_0_0_1px_rgba(167,139,250,0.2)]"
                  : "text-white/50 hover:text-white hover:bg-white/8"
                }
              `}
            >
              {/* Active indicator bar */}
              {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-[#a78bfa] rounded-full" />
              )}

              {/* Icon wrapper — relative so badge can be placed on icon */}
              <span className="relative flex-shrink-0">
                <Icon
                  className={`w-[18px] h-[18px] transition-transform duration-200 group-hover:scale-110 ${
                    isActive ? "text-[#c4b5fd]" : ""
                  }`}
                />
                {/* Badge on icon when collapsed */}
                {isNotifications && unreadCount > 0 && collapsed && (
                  <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 px-0.5 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center leading-none">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </span>

              <span
                className={`
                  text-[13px] font-medium whitespace-nowrap
                  transition-all duration-300 overflow-hidden
                  ${collapsed ? "w-0 opacity-0" : "w-auto opacity-100"}
                `}
              >
                {name}
              </span>

              {/* Notification badge when expanded */}
              {isNotifications && unreadCount > 0 && !collapsed && (
                <span className="ml-auto flex-shrink-0 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center leading-none">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}

              {/* PRO badge — show next to "Nâng cấp Pro" when plan is active */}
              {highlight && isPro && !collapsed && (
                <span className="ml-auto flex-shrink-0 text-[9px] font-black px-1.5 py-0.5 rounded-md bg-amber-400/25 text-amber-300 border border-amber-400/30 tracking-wider">
                  PRO
                </span>
              )}
              {highlight && isPro && collapsed && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-amber-400" />
              )}

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
          title={collapsed ? s.landingPage : undefined}
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
            {s.landingPage}
          </span>
          {collapsed && (
            <span className="
              pointer-events-none absolute left-full ml-3 z-50
              px-2.5 py-1.5 rounded-lg text-xs font-medium
              bg-[#1e1235] text-white border border-white/10 shadow-xl
              opacity-0 group-hover:opacity-100 translate-x-1 group-hover:translate-x-0
              transition-all duration-150 whitespace-nowrap
            ">
              {s.landingPage}
            </span>
          )}
        </Link>

        {/* Logout */}
        <button
          onClick={handleLogout}
          title={collapsed ? s.logout : undefined}
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
            {s.logout}
          </span>
          {collapsed && (
            <span className="
              pointer-events-none absolute left-full ml-3 z-50
              px-2.5 py-1.5 rounded-lg text-xs font-medium
              bg-[#1e1235] text-white border border-white/10 shadow-xl
              opacity-0 group-hover:opacity-100 translate-x-1 group-hover:translate-x-0
              transition-all duration-150 whitespace-nowrap
            ">
              {s.logout}
            </span>
          )}
        </button>
      </div>
    </aside>
  );
}
