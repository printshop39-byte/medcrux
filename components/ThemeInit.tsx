"use client";

import { useEffect } from "react";
import { getTheme, applyTheme } from "@/lib/store";

/**
 * Keeps the applied theme in sync after hydration:
 * - re-applies on mount (the inline <head> script sets the initial class),
 * - follows the OS theme live while in "system" mode,
 * - reacts to theme changes from Settings / other tabs (pharmaos:update).
 * Renders nothing.
 */
export function ThemeInit() {
  useEffect(() => {
    applyTheme(getTheme());

    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onSystemChange = () => {
      if (getTheme() === "system") applyTheme("system");
    };
    const onStoreUpdate = () => applyTheme(getTheme());

    mq.addEventListener("change", onSystemChange);
    window.addEventListener("pharmaos:update", onStoreUpdate);
    window.addEventListener("storage", onStoreUpdate);
    return () => {
      mq.removeEventListener("change", onSystemChange);
      window.removeEventListener("pharmaos:update", onStoreUpdate);
      window.removeEventListener("storage", onStoreUpdate);
    };
  }, []);

  return null;
}
