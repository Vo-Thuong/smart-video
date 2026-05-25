"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export function ModeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <button className="w-9 h-9 rounded-xl border border-border flex items-center justify-center" disabled>
        <Sun className="h-4 w-4 text-muted-foreground" />
      </button>
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label="Toggle theme"
      className="relative w-9 h-9 rounded-xl border border-border bg-background hover:bg-accent flex items-center justify-center transition-colors"
    >
      <Sun className={`h-4 w-4 transition-all duration-300 ${
        isDark ? "scale-0 rotate-90 opacity-0 absolute" : "scale-100 rotate-0 opacity-100"
      }`} />
      <Moon className={`h-4 w-4 transition-all duration-300 ${
        isDark ? "scale-100 rotate-0 opacity-100" : "scale-0 -rotate-90 opacity-0 absolute"
      }`} />
    </button>
  );
}
