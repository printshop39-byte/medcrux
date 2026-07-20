"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV } from "@/lib/nav";
import { SearchBar } from "./SearchBar";
import { ShortcutOverlay } from "./ShortcutOverlay";
import { AuthButton } from "./AuthButton";
import { SyncGate } from "./SyncGate";
import { SmoothScroll } from "./SmoothScroll";
import { ThemeToggle } from "./ThemeToggle";

// The 5 primary destinations in the mobile bottom bar; everything else lives in
// the "More" sheet so every page is reachable on mobile.
const MOBILE_PRIMARY = ["/dashboard", "/topics", "/flashcards", "/exam", "/ai-tutor"];

export function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isActive = (href: string) =>
    pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
  const [moreOpen, setMoreOpen] = useState(false);

  const primaryItems = MOBILE_PRIMARY.map((href) => NAV.find((n) => n.href === href)).filter(
    (n): n is (typeof NAV)[number] => Boolean(n),
  );
  const moreItems = NAV.filter((n) => !MOBILE_PRIMARY.includes(n.href));
  const moreActive = moreItems.some((n) => isActive(n.href));

  return (
    <div className="min-h-screen">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-slate-200 bg-white lg:flex">
        <div className="flex items-center gap-2 px-5 py-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-lg text-white">
            ℞
          </div>
          <div>
            <div className="text-base font-bold leading-none text-slate-800">MedCrux</div>
            <div className="text-[11px] text-slate-400">Fast MBBS exam revision</div>
          </div>
        </div>
        <nav className="flex-1 space-y-1 px-3 py-2">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                isActive(item.href)
                  ? "bg-brand-50 text-brand-700"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="px-4 py-4 text-[11px] text-slate-400">
          For study only · Not medical advice
        </div>
      </aside>

      {/* Main column */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/80 backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2 lg:hidden">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white">
                ℞
              </div>
              <span className="font-bold text-slate-800">MedCrux</span>
            </div>
            {/* Search capped so it doesn't stretch across wide screens; AuthButton
                is pushed to the right edge by the flex-1 wrapper. */}
            <div className="min-w-0 flex-1">
              <div className="max-w-xl">
                <SearchBar />
              </div>
            </div>
            {/* Quick theme toggle (all screens) + Settings gear (mobile only —
                desktop reaches Settings from the sidebar). */}
            <ThemeToggle />
            <Link
              href="/settings"
              aria-label="Settings"
              title="Settings"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 text-base transition hover:bg-slate-50 lg:hidden"
            >
              ⚙️
            </Link>
            <AuthButton />
          </div>
        </header>

        {/* Page content — wider container so large screens feel less empty. */}
        <main className="mx-auto max-w-6xl px-4 pb-28 pt-5 sm:px-6 lg:px-8 lg:pb-12">{children}</main>
      </div>

      {/* Mobile "More" sheet — every non-primary page is reachable here. */}
      {moreOpen && (
        <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMoreOpen(false)} />
          <div className="absolute inset-x-0 bottom-0 rounded-t-2xl border-t border-slate-200 bg-white p-4 pb-6 shadow-2xl">
            <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-slate-200" />
            <div className="mb-3 flex items-center justify-between">
              <span className="section-title">More</span>
              <button onClick={() => setMoreOpen(false)} className="text-sm text-slate-400 hover:text-slate-600">
                Close ✕
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {moreItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMoreOpen(false)}
                  className={`flex flex-col items-center gap-1 rounded-xl border p-3 text-center text-xs font-medium transition ${
                    isActive(item.href)
                      ? "border-brand-500 bg-brand-50 text-brand-700"
                      : "border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <span className="text-xl">{item.icon}</span>
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Mobile bottom nav — 5 primary destinations + More */}
      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white lg:hidden">
        <div className="mx-auto grid max-w-lg grid-cols-6">
          {primaryItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMoreOpen(false)}
              className={`flex flex-col items-center gap-0.5 py-2.5 text-center text-[10px] font-medium leading-tight ${
                isActive(item.href) ? "text-brand-600" : "text-slate-400"
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              {item.label}
            </Link>
          ))}
          <button
            onClick={() => setMoreOpen((o) => !o)}
            aria-label="More pages"
            aria-expanded={moreOpen}
            className={`flex flex-col items-center gap-0.5 py-2.5 text-center text-[10px] font-medium leading-tight ${
              moreOpen || moreActive ? "text-brand-600" : "text-slate-400"
            }`}
          >
            <span className="text-lg">☰</span>
            More
          </button>
        </div>
      </nav>

      {/* Global page-aware keyboard shortcuts overlay (press ?) */}
      <ShortcutOverlay />

      {/* App-wide smooth scrolling (Lenis; disabled under reduced-motion) */}
      <SmoothScroll />

      {/* Cloud sync (only active when flag on AND signed in) */}
      <SyncGate />
    </div>
  );
}
