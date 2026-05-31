"use client";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ModeToggle } from "@/components/mode-toggle";
import Image from "next/image";
import { useLang } from "@/lib/i18n";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export const Navbar = () => {
  const { lang, setLang, t } = useLang();
  const router = useRouter();
  const [user, setUser] = useState<{ name?: string; avatar?: string } | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const raw = localStorage.getItem("user");
    if (raw) {
      try { setUser(JSON.parse(raw)); } catch { /* ignore */ }
    }
  }, []);

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    router.push("/");
  }

  // Hàm xử lý cuộn mượt (Optional - nếu bạn muốn kiểm soát bằng JS)
  const scrollToSection = (
    e: React.MouseEvent<HTMLAnchorElement>,
    id: string,
  ) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  return (
    <nav className="fixed top-0 w-full z-50 border-b border-border bg-background/80 backdrop-blur-md transition-all duration-300">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* 1. Logo Area - Cuộn lên đầu trang */}
        <Link
          href="/"
          onClick={(e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          className="flex items-center gap-2.5 hover:opacity-90 transition-opacity group"
        >
          <div className="w-9 h-9 bg-black-600 rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(37,99,235,0.4)] group-hover:rotate-6 transition-transform overflow-hidden">
            <Image
              src="/public/assets/image/logo/logo-smart-video.png"
              alt="Smart Video Logo"
              width={60}
              height={60}
              className="object-contain"
            />
          </div>
          <span className="font-bold text-xl tracking-tight text-foreground">
            SMART<span className="text-blue-600 dark:text-blue-500">VIDEO</span>
          </span>
        </Link>

        {/* 2. Desktop Navigation - Smooth Scroll */}
        <div className="hidden md:flex items-center gap-8 text-sm font-semibold">
          <a
            href="#product-preview"
            onClick={(e) => scrollToSection(e, "product-preview")}
            className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            {t.nav.howItWorks}
          </a>
          <a
            href="#features"
            onClick={(e) => scrollToSection(e, "features")}
            className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            {t.nav.features}
          </a>
          <a
            href="#pricing"
            onClick={(e) => scrollToSection(e, "pricing")}
            className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            {t.nav.pricing}
          </a>
        </div>

        {/* 3. Action Buttons & Theme Toggle */}
        <div className="flex items-center gap-2 sm:gap-3">
          <ModeToggle />

          {/* Language toggle */}
          <button
            onClick={() => setLang(lang === "en" ? "vi" : "en")}
            aria-label="Toggle language"
            className="w-9 h-9 rounded-xl border border-border bg-background hover:bg-accent flex items-center justify-center text-xs font-bold text-foreground transition-colors"
          >
            {lang === "en" ? "VI" : "EN"}
          </button>

          <div className="h-5 w-[1px] bg-border mx-1 hidden sm:block" />

          {mounted && user ? (
            <>
              <Button
                variant="ghost"
                onClick={handleLogout}
                className="text-muted-foreground hover:text-red-500 hover:bg-red-500/10 hidden sm:flex font-medium"
              >
                Sign Out
              </Button>
              <Link href="/dashboard">
                <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-blue-500 cursor-pointer hover:ring-2 hover:ring-blue-400 transition-all flex items-center justify-center bg-blue-600 text-white font-bold text-sm">
                  {user.avatar ? (
                    <img
                      src={user.avatar.startsWith("/uploads") ? `http://localhost:5000${user.avatar}` : user.avatar}
                      alt="avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span>{user.name ? user.name.charAt(0).toUpperCase() : "U"}</span>
                  )}
                </div>
              </Link>
            </>
          ) : (
            <>
              <Link href="./auth/signin">
                <Button
                  variant="ghost"
                  className="text-muted-foreground hover:text-foreground hover:bg-accent hidden sm:flex font-medium"
                >
                  {t.nav.signIn}
                </Button>
              </Link>
              <Button
                onClick={() => {
                  const element = document.getElementById("pricing");
                  element?.scrollIntoView({ behavior: "smooth" });
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-6 shadow-md shadow-blue-600/10 transition-all active:scale-95 font-semibold"
              >
                {t.nav.getStarted}
              </Button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};
