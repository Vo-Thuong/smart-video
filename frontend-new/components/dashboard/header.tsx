"use client";

import { useEffect, useState } from "react";

export function DashboardHeader() {
  const [fullname, setFullname] = useState("");

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
    <div className="space-y-2">
      <h1 className="text-4xl font-bold tracking-tight text-white">
        Welcome back{fullname ? `, ${fullname}` : ""}! 👋
      </h1>
      <p className="text-gray-300">
        Join thousands of students overcoming their lack of English skill.
      </p>
    </div>
  );
}