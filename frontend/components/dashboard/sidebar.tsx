"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Video, BookOpen, User, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

const menuItems = [
  { icon: Home, label: "Home Page", href: "/dashboard" },
  { icon: Video, label: "My Video", href: "/dashboard/videos" },
  { icon: BookOpen, label: "Vocabulary", href: "/dashboard/vocabulary" },
  { icon: User, label: "Profile", href: "/dashboard/profile" },
];

export const Sidebar = () => {
  const pathname = usePathname();

  return (
    <div className="w-64 h-screen bg-[#3a2a5d] text-white flex flex-col p-6 shrink-0">
      {/* Logo Section */}
      <div className="flex items-center gap-3 mb-12">
        <div className="w-10 h-10 relative">
          <Image
            src="/assets/image/logo/logo-smart-video.png"
            alt="Logo"
            fill
            className="object-contain"
          />
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-2">
        {menuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-4 px-4 py-3 rounded-xl transition-all font-medium",
              pathname === item.href
                ? "text-[#00e5ff] bg-white/5"
                : "text-white/70 hover:text-white hover:bg-white/5",
            )}
          >
            <item.icon size={22} />
            {item.label}
          </Link>
        ))}
      </nav>

      {/* Logout */}
      <button className="flex items-center gap-4 px-4 py-3 text-white/70 hover:text-white mt-auto">
        <LogOut size={22} />
        Logout
      </button>
    </div>
  );
};
