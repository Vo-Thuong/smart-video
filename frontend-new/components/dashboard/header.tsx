"use client";

import { useEffect, useState } from "react";
import { useLang } from "@/lib/i18n";

export function DashboardHeader() {
  const [fullname, setFullname] = useState("");
  const { lang, setLang, t } = useLang();

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      try {
        const u = JSON.parse(stored);
        setFullname(u.fullname || u.username || "");
      } catch {}
    }
  }, []);

  return (
    <div className="flex items-start justify-between gap-4">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight text-white">
          Welcome back{fullname ? `, ${fullname}` : ""}! 👋
        </h1>
        <p className="text-gray-300">{t.dashboard.header.subtitle}</p>
      </div>

      {/* Language toggle */}
      <button
        onClick={() => setLang(lang === "en" ? "vi" : "en")}
        aria-label="Toggle language"
        className="flex-shrink-0 mt-1 flex items-center gap-1.5 px-3 py-2 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-xs font-bold text-white transition-colors"
      >
        <span className={lang === "en" ? "text-[#00E5FF]" : "text-gray-400"}>EN</span>
        <span className="text-gray-600">/</span>
        <span className={lang === "vi" ? "text-[#00E5FF]" : "text-gray-400"}>VI</span>
      </button>
    </div>
  );
}