"use client";

import { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark";

const ThemeContext = createContext<{ theme: Theme; setTheme: (t: Theme) => void } | null>(null);

/** Inline script run before hydration so the correct theme class is present on first paint (no flash). */
export const themeInitScript = `
(function() {
  try {
    var stored = localStorage.getItem("wbt_theme");
    // Light unless the user picked dark with the toggle; the OS setting is ignored.
    if (stored === "dark") document.documentElement.classList.add("dark");
  } catch (e) {}
})();
`;

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("light");

  useEffect(() => {
    const stored = localStorage.getItem("wbt_theme");
    const initial: Theme = stored === "dark" || stored === "light" ? stored : "light";
    setThemeState(initial);
  }, []);

  function setTheme(t: Theme) {
    setThemeState(t);
    localStorage.setItem("wbt_theme", t);
    document.documentElement.classList.toggle("dark", t === "dark");
  }

  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
