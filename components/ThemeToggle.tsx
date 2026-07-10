"use client";

import { useEffect, useState } from "react";
import { setTheme, useStoreTick } from "@/lib/store";

/**
 * Quick light/dark toggle for the top bar so the theme is reachable everywhere
 * (the full Light/Dark/System control still lives in Settings). Renders nothing
 * until mounted to avoid a hydration mismatch (theme is client-only).
 */
export function ThemeToggle() {
  useStoreTick();
  const [mounted, setMounted] = useState(false);
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setMounted(true);
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  // Re-read the resolved theme whenever it changes (Settings, other tabs, OS).
  useEffect(() => {
    if (!mounted) return;
    setDark(document.documentElement.classList.contains("dark"));
  });

  if (!mounted) return null;

  return (
    <button
      onClick={() => setTheme(dark ? "light" : "dark")}
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      title={dark ? "Switch to light mode" : "Switch to dark mode"}
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 text-base transition hover:bg-slate-50"
    >
      {dark ? "☀️" : "🌙"}
    </button>
  );
}
