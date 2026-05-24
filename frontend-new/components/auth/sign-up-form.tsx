"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { toast } from "sonner"; // 1. Import thư viện thông báo
import {
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  Github,
  Loader2,
  CheckCircle2,
  UserCircle,
} from "lucide-react";

export const SignUpForm = () => {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fullnameRef = useRef<HTMLInputElement>(null);
  const usernameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreed) return;

    setIsLoading(true);
    setError(null);

    const signupData = {
      fullname: fullnameRef.current?.value,
      username: usernameRef.current?.value,
      email: emailRef.current?.value,
      password: passwordRef.current?.value,
    };

    try {
      const response = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(signupData),
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem("token", data.token);

        // 2. Thông báo đăng ký thành công
        toast.success("Tạo tài khoản thành công!", {
          description: "Chào mừng bạn đến với SmartVideo.",
        });

        localStorage.setItem("user", JSON.stringify(data.user));
        router.push("/onboarding");
      } else {
        const msg = data.message || "Đăng ký thất bại";
        setError(msg);
        // 3. Thông báo lỗi từ server (ví dụ: email đã tồn tại)
        toast.error("Lỗi đăng ký", {
          description: msg,
        });
      }
    } catch (err) {
      const errMsg = "Không thể kết nối đến máy chủ backend.";
      setError(errMsg);
      // 4. Thông báo lỗi kết nối
      toast.error("Lỗi hệ thống", {
        description: errMsg,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="w-full max-w-[440px] z-10"
    >
      {/* Header Form */}
      <div className="flex flex-col items-center mb-8">
        <Link href="/" className="group flex flex-col items-center gap-3">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-[0_0_25px_rgba(37,99,235,0.4)] group-hover:rotate-6 transition-transform duration-500 overflow-hidden p-2 bg-blue-600">
            <Image
              src="/assets/image/logo/logo-smart-video.png"
              alt="Logo"
              width={45}
              height={45}
              className="object-contain"
            />
          </div>
          <div className="text-center">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Create Account
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Start your AI language journey today
            </p>
          </div>
        </Link>
      </div>

      {/* Main Card */}
      <div className="bg-card/80 dark:bg-zinc-900/90 border border-border/50 rounded-[32px] p-8 shadow-2xl backdrop-blur-xl">
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider ml-1 text-muted-foreground">
              Full Name
            </label>
            <div className="relative group">
              <User
                className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-blue-500 transition-colors"
                size={18}
              />
              <input
                ref={fullnameRef}
                type="text"
                required
                placeholder="Vo Cong Thuong"
                className="w-full bg-secondary/30 dark:bg-zinc-800/50 border border-border/50 rounded-2xl py-3.5 pl-11 pr-4 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-muted-foreground/40 text-foreground"
              />
            </div>
          </div>

          {/* Username */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider ml-1 text-muted-foreground">
              Username
            </label>
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-blue-500 transition-colors">
                <span className="text-[14px] font-bold">@</span>
              </div>
              <input
                ref={usernameRef}
                type="text"
                required
                placeholder="vothuong123"
                className="w-full bg-secondary/30 dark:bg-zinc-800/50 border border-border/50 rounded-2xl py-3.5 pl-11 pr-4 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-muted-foreground/40 text-foreground"
              />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider ml-1 text-muted-foreground">
              Email Address
            </label>
            <div className="relative group">
              <Mail
                className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-blue-500 transition-colors"
                size={18}
              />
              <input
                ref={emailRef}
                type="email"
                required
                placeholder="thuong@example.com"
                className="w-full bg-secondary/30 dark:bg-zinc-800/50 border border-border/50 rounded-2xl py-3.5 pl-11 pr-4 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-muted-foreground/40 text-foreground"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider ml-1 text-muted-foreground">
              Create Password
            </label>
            <div className="relative group">
              <Lock
                className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-blue-500 transition-colors"
                size={18}
              />
              <input
                ref={passwordRef}
                type={showPassword ? "text" : "password"}
                required
                placeholder="••••••••"
                className="w-full bg-secondary/30 dark:bg-zinc-800/50 border border-border/50 rounded-2xl py-3.5 pl-11 pr-12 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-muted-foreground/40 text-foreground"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Terms Agreement */}
          <div className="flex items-center gap-3 px-1 py-2">
            <button
              type="button"
              onClick={() => setAgreed(!agreed)}
              className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                agreed
                  ? "bg-blue-600 border-blue-600 text-white"
                  : "border-border bg-secondary/50"
              }`}
            >
              {agreed && (
                <CheckCircle2
                  size={14}
                  fill="currentColor"
                  className="text-blue-600 fill-white"
                />
              )}
            </button>
            <p className="text-[11px] leading-relaxed text-muted-foreground">
              I agree to the{" "}
              <span className="text-blue-500 cursor-pointer hover:underline">
                Terms of Service
              </span>{" "}
              and{" "}
              <span className="text-blue-500 cursor-pointer hover:underline">
                Privacy Policy
              </span>
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || !agreed}
            className="w-full bg-blue-600 text-white rounded-2xl py-4 font-bold hover:bg-blue-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-blue-600/20 mt-4"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                Create Account <ArrowRight size={19} />
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-8 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border/60"></div>
          </div>
          <span className="relative bg-card dark:bg-zinc-900 px-4 text-[10px] uppercase tracking-[0.2em] text-muted-foreground/60 font-black">
            Quick Register
          </span>
        </div>

        {/* Social Options */}
        <div className="grid grid-cols-2 gap-4">
          <button className="flex items-center justify-center gap-3 border border-border/60 rounded-2xl py-3 hover:bg-secondary/80 dark:hover:bg-zinc-800 transition-all active:scale-95 group">
            <Image
              src="https://www.svgrepo.com/show/475656/google-color.svg"
              width={20}
              height={20}
              alt="Google"
            />
            <span className="text-sm font-bold text-foreground">Google</span>
          </button>
          <button className="flex items-center justify-center gap-3 border border-border/60 rounded-2xl py-3 hover:bg-secondary/80 dark:hover:bg-zinc-800 transition-all active:scale-95 group">
            <Github
              size={20}
              className="group-hover:text-blue-500 transition-colors text-foreground"
            />
            <span className="text-sm font-bold text-foreground">Github</span>
          </button>
        </div>
      </div>

      {/* Footer Link */}
      <p className="text-center mt-8 text-sm text-muted-foreground font-medium">
        Already part of SmartVideo?{" "}
        <Link
          href="/auth/signin"
          className="text-blue-500 font-bold hover:underline underline-offset-4 transition-all"
        >
          Sign In here
        </Link>
      </p>
    </motion.div>
  );
};
