"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Github,
  Loader2,
} from "lucide-react";

export const SignInForm = () => {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const loginData = {
      email: emailRef.current?.value,
      password: passwordRef.current?.value,
    };

    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginData),
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));

        // Thông báo thành công
        toast.success("Welcome back!", {
          description: "Đăng nhập vào SmartVideo thành công.",
        });

        router.push("/dashboard"); // Chuyển hướng sang trang dashboard
      } else {
        const msg = data.message || "Email hoặc mật khẩu không chính xác";
        setError(msg);
        // Thông báo lỗi từ server
        toast.error("Đăng nhập thất bại", {
          description: msg,
        });
      }
    } catch (err) {
      const errMsg = "Không thể kết nối đến server backend.";
      setError(errMsg);
      // Thông báo lỗi hệ thống
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
      transition={{ duration: 0.5 }}
      className="w-full max-w-[420px] z-10"
    >
      {/* Header Form */}
      <div className="flex flex-col items-center mb-8">
        <Link href="/" className="group flex flex-col items-center gap-3">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(37,99,235,0.3)] group-hover:rotate-6 transition-transform duration-300 overflow-hidden p-2">
            <Image
              src="/assets/image/logo/logo-smart-video.png"
              alt="Logo"
              width={40}
              height={40}
              className="object-contain"
            />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Welcome back
          </h1>
        </Link>
        <p className="text-muted-foreground text-sm mt-2">
          Start practicing with{" "}
          <span className="text-blue-600 font-medium">SmartVideo</span>
        </p>
      </div>

      {/* Main Card */}
      <div className="bg-card border border-border rounded-[32px] p-8 shadow-sm backdrop-blur-sm">
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs text-center font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-medium ml-1">Email address</label>
            <div className="relative group">
              <Mail
                className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-blue-600 transition-colors"
                size={18}
              />
              <input
                ref={emailRef}
                type="email"
                required
                placeholder="name@example.com"
                className="w-full bg-secondary/40 border border-border rounded-2xl py-3 pl-11 pr-4 text-sm outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all placeholder:text-muted-foreground/60 text-foreground"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center ml-1">
              <label className="text-sm font-medium">Password</label>
              <Link
                href="/forgot-password"
                className="text-xs text-blue-600 hover:text-blue-700 font-medium"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative group">
              <Lock
                className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-blue-600 transition-colors"
                size={18}
              />
              <input
                ref={passwordRef}
                type={showPassword ? "text" : "password"}
                required
                placeholder="••••••••"
                className="w-full bg-secondary/40 border border-border rounded-2xl py-3 pl-11 pr-12 text-sm outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all placeholder:text-muted-foreground/60 text-foreground"
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

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white rounded-2xl py-3 font-semibold hover:bg-blue-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-blue-600/25 mt-2"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                Continue <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <div className="relative my-8 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border"></div>
          </div>
          <span className="relative bg-card px-3 text-[10px] uppercase tracking-widest text-muted-foreground font-bold">
            Or secure login with
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button className="flex items-center justify-center gap-2 border border-border rounded-2xl py-2.5 hover:bg-secondary/80 transition-all active:scale-95 group">
            <Image
              src="https://www.svgrepo.com/show/475656/google-color.svg"
              width={20}
              height={20}
              alt="Google"
            />
            <span className="text-sm font-semibold text-foreground">
              Google
            </span>
          </button>
          <button className="flex items-center justify-center gap-2 border border-border rounded-2xl py-2.5 hover:bg-secondary/80 transition-all active:scale-95 group">
            <Github
              size={20}
              className="group-hover:text-blue-600 text-foreground"
            />
            <span className="text-sm font-semibold text-foreground">
              Github
            </span>
          </button>
        </div>
      </div>

      <p className="text-center mt-8 text-sm text-muted-foreground font-medium">
        Don&apos;t have an account?{" "}
        <Link
          href="/auth/signup"
          className="text-blue-600 font-bold hover:underline underline-offset-4 transition-all"
        >
          Join for free
        </Link>
      </p>
    </motion.div>
  );
};
