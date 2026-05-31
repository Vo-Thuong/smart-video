"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useGoogleLogin } from "@react-oauth/google";
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
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  const handleGoogleLogin = useGoogleLogin({
    flow: "implicit",
    onSuccess: async (tokenResponse) => {
      setIsGoogleLoading(true);
      setError(null);
      try {
        // Lấy user info từ Google
        const userInfoRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        });
        const userInfo = await userInfoRes.json();

        // Gửi id_token lên backend – dùng access_token để lấy credential
        const res = await fetch("http://localhost:5000/api/auth/google", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ credential: tokenResponse.access_token, userInfo }),
        });
        const data = await res.json();

        if (data.success) {
          // Xóa cache pro của user cũ trước khi set user mới
          localStorage.removeItem("smartvideo_pro_plan");
          localStorage.setItem("token", data.token);
          localStorage.setItem("user", JSON.stringify(data.user));
          toast.success("Đăng nhập Google thành công!", {
            description: `Chào mừng ${data.user.fullname} đến với SmartVideo!`,
          });
          if (data.user?.onboardingCompleted === false) {
            router.push("/onboarding");
          } else {
            router.push("/dashboard");
          }
        } else {
          setError(data.message);
          toast.error("Lỗi đăng nhập Google", { description: data.message });
        }
      } catch {
        const msg = "Không thể kết nối đến server.";
        setError(msg);
        toast.error("Lỗi hệ thống", { description: msg });
      } finally {
        setIsGoogleLoading(false);
      }
    },
    onError: () => {
      toast.error("Đăng nhập Google thất bại", { description: "Vui lòng thử lại." });
    },
  });

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
        // Xóa cache pro của user cũ trước khi set user mới
        localStorage.removeItem("smartvideo_pro_plan");
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));

        // Thông báo thành công
        toast.success("Welcome back!", {
          description: "Đăng nhập vào SmartVideo thành công.",
        });

        // Redirect to onboarding if not completed yet
        if (data.user?.onboardingCompleted === false) {
          router.push("/onboarding");
        } else {
          router.push("/dashboard");
        }
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
          <button
            type="button"
            onClick={() => handleGoogleLogin()}
            disabled={isGoogleLoading}
            className="flex items-center justify-center gap-2 border border-border rounded-2xl py-2.5 hover:bg-secondary/80 transition-all active:scale-95 group disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isGoogleLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <svg width="20" height="20" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                <path fill="none" d="M0 0h48v48H0z"/>
              </svg>
            )}
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
