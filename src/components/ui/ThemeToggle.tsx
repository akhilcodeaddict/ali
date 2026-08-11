"use client";

import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/lib/theme-context";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="group relative flex h-9 w-[76px] shrink-0 cursor-pointer items-center rounded-full bg-section p-1"
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
    >
      <span
        className="absolute h-7 w-7 rounded-full bg-surface shadow-[var(--shadow-button)] transition-transform duration-200"
        style={{ transform: isDark ? "translateX(38px)" : "translateX(0)" }}
      />
      <span className="relative z-10 flex w-full items-center justify-between px-1.5">
        <Sun size={15} strokeWidth={1.75} className={isDark ? "text-text-helper" : "text-primary"} />
        <Moon size={15} strokeWidth={1.75} className={isDark ? "text-primary" : "text-text-helper"} />
      </span>
    </button>
  );
}
