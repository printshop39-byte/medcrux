"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { TOPICS } from "@/lib/topics";
import { getDrugsByTopic } from "@/lib/drugs";
import { getCompletedTopics, useStoreTick } from "@/lib/store";

export default function TopicsPage() {
  useStoreTick();
  // Read localStorage only after mount to avoid a hydration mismatch.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const completed = mounted ? getCompletedTopics() : [];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Topic Library</h1>
        <p className="text-sm text-slate-500">9 pharmacology categories. Tap to open drug cards.</p>
      </div>

      {/* Subject switcher */}
      <div className="grid grid-cols-2 gap-3">
        <div className="card flex items-center gap-2 p-3 ring-2 ring-brand-500">
          <span className="text-xl">📚</span>
          <div>
            <div className="text-sm font-semibold text-slate-800">Pharmacology</div>
            <div className="text-[11px] text-slate-400">K.D. Tripathi</div>
          </div>
        </div>
        <Link href="/microbiology" className="card flex items-center gap-2 p-3 transition hover:shadow-md">
          <span className="text-xl">🧫</span>
          <div>
            <div className="text-sm font-semibold text-slate-800">Microbiology</div>
            <div className="text-[11px] text-slate-400">Paniker · new</div>
          </div>
        </Link>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {TOPICS.map((t) => {
          const count = getDrugsByTopic(t.slug).length;
          const done = completed.includes(t.slug);
          return (
            <Link key={t.slug} href={`/topics/${t.slug}`} className="card p-4 transition hover:shadow-md">
              <div className="flex items-start gap-3">
                <span className="text-2xl">{t.icon}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-800">{t.title}</span>
                    {done && <span className="chip">✓ done</span>}
                  </div>
                  <p className="mt-0.5 text-xs text-slate-500">{t.description}</p>
                  <div className="mt-2 text-[11px] text-slate-400">
                    {count > 0 ? `${count} drug${count > 1 ? "s" : ""}` : "Concept topic"}
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
