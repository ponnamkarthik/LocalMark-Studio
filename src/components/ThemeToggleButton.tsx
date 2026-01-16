"use client";

import React, { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

type Theme = "dark" | "light";

export default function ThemeToggleButton({
  className = "",
}: {
  className?: string;
}) {
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    const root = document.documentElement;

    const stored = (() => {
      try {
        const value = localStorage.getItem("localmark_theme");
        return value === "dark" || value === "light" ? value : null;
      } catch {
        return null;
      }
    })();

    const initial: Theme =
      stored ?? (root.classList.contains("light") ? "light" : "dark");
    setTheme(initial);
  }, []);

  const applyTheme = (next: Theme) => {
    const root = document.documentElement;
    root.classList.remove("dark", "light");
    root.classList.add(next);

    try {
      localStorage.setItem("localmark_theme", next);
    } catch {}

    setTheme(next);
  };

  const toggle = () => {
    applyTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <button
      type="button"
      onClick={toggle}
      className={`inline-flex items-center justify-center rounded-md border border-theme-border bg-theme-activity p-2 text-theme-text-muted hover:bg-theme-hover hover:text-theme-text-main transition-colors ${className}`}
      title={
        theme === "dark" ? "Switch to light theme" : "Switch to dark theme"
      }
      aria-label={
        theme === "dark" ? "Switch to light theme" : "Switch to dark theme"
      }
    >
      {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );
}
