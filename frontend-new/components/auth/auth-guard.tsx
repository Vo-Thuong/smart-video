"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.replace("/auth/signin");
    } else {
      setChecking(false);
    }
  }, [router]);

  if (checking) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-[#3E2465] to-[#1C1642]">
        <div className="w-8 h-8 rounded-full border-4 border-[#00E5FF] border-t-transparent animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}
