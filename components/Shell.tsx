"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV } from "@/lib/nav";
import { SearchBar } from "./SearchBar";
import { ShortcutOverlay } from "./ShortcutOverlay";

// Static classes so Tailwind keeps them; keyed by number of mobile nav items.
const MOBILE_GRID: Record<number, string> = {
  5: "grid-cols-5",
  6: "grid-cols-6",
};

export function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isActive = (href: string) =>
    pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
  const mobileItems = NAV.filter((n) => n.mobile);

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
            <div className="text-[11px] text-slate-400">Fast pharmacology revision</div>
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
          <div className="mx-auto flex max-w-4xl items-center gap-3 px-4 py-3">
            <div className="flex items-center gap-2 lg:hidden">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white">
                ℞
              </div>
              <span className="font-bold text-slate-800">MedCrux</span>
            </div>
            <div className="flex-1">
              <SearchBar />
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="mx-auto max-w-4xl px-4 pb-28 pt-5 lg:pb-12">{children}</main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white lg:hidden">
        <div className={`mx-auto grid max-w-lg ${MOBILE_GRID[mobileItems.length] ?? "grid-cols-5"}`}>
          {mobileItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 py-2.5 text-center text-[10px] font-medium leading-tight ${
                isActive(item.href) ? "text-brand-600" : "text-slate-400"
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </div>
      </nav>

      {/* Global page-aware keyboard shortcuts overlay (press ?) */}
      <ShortcutOverlay />
    </div>
  );
}
