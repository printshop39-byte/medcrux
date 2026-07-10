"use client";

import Link from "next/link";

// Top-level subject switcher so students immediately see the app is multi-subject.
// Add new subjects here as they ship (Pathology, etc.).
const SUBJECTS = [
  { key: "pharmacology", label: "Pharmacology", icon: "📚", href: "/topics", book: "K.D. Tripathi" },
  { key: "microbiology", label: "Microbiology", icon: "🧫", href: "/microbiology", book: "Paniker" },
  { key: "pathology", label: "Pathology", icon: "🩸", href: "/pathology", book: "Harsh Mohan" },
] as const;

export type SubjectKey = (typeof SUBJECTS)[number]["key"];

export function SubjectSwitcher({ active }: { active: SubjectKey }) {
  return (
    <div className="flex gap-2 overflow-x-auto no-scrollbar">
      {SUBJECTS.map((s) => {
        const isActive = s.key === active;
        return (
          <Link
            key={s.key}
            href={s.href}
            aria-current={isActive ? "page" : undefined}
            className={`flex shrink-0 items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium transition ${
              isActive
                ? "border-brand-500 bg-brand-50 text-brand-700 ring-1 ring-brand-500"
                : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            <span className="text-base">{s.icon}</span>
            <span>{s.label}</span>
            <span className="hidden text-[11px] text-slate-400 sm:inline">· {s.book}</span>
          </Link>
        );
      })}
    </div>
  );
}
