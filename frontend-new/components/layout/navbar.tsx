"use client";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ModeToggle } from "@/components/mode-toggle";
import Image from "next/image";

export const Navbar = () => {
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
            How it works
          </a>
          <a
            href="#features"
            onClick={(e) => scrollToSection(e, "features")}
            className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            Features
          </a>

          <a
            href="#pricing"
            onClick={(e) => scrollToSection(e, "pricing")}
            className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            Pricing
          </a>
        </div>

        {/* 3. Action Buttons & Theme Toggle */}
        <div className="flex items-center gap-2 sm:gap-4">
          <ModeToggle />
          <div className="h-5 w-[1px] bg-border mx-1 hidden sm:block" />
          <Link href="./auth/signin">
            <Button
              variant="ghost"
              className="text-muted-foreground hover:text-foreground hover:bg-accent hidden sm:flex font-medium"
            >
              Sign In
            </Button>
          </Link>
          <Button
            onClick={() => {
              const element = document.getElementById("pricing");
              element?.scrollIntoView({ behavior: "smooth" });
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-6 shadow-md shadow-blue-600/10 transition-all active:scale-95 font-semibold"
          >
            Get Started
          </Button>
        </div>
      </div>
    </nav>
  );
};
