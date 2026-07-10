"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { TOPICS } from "@/lib/topics";
import { getDrugsByTopic } from "@/lib/drugs";
import { getCompletedTopics, useStoreTick } from "@/lib/store";
import { SubjectSwitcher } from "@/components/SubjectSwitcher";

export default function TopicsPage() {
  useStoreTick();
  // Read localStorage only after mount to avoid a hydration mismatch.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const completed = mounted ? getCompletedTopics() : [];

  return (
    <div className="space-y-5">
      <SubjectSwitcher active="pharmacology" />

      <div>
        <h1 className="text-2xl font-bold text-slate-800">Topic Library</h1>
        <p className="text-sm text-slate-500">9 pharmacology categories. Tap to open drug cards.</p>
        <div className="mt-2">
          <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700">
            📗 Indian reference: K.D. Tripathi
          </span>
        </div>
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
                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    <span className="text-[11px] text-slate-400">
                      {count > 0 ? `${count} drug${count > 1 ? "s" : ""}` : "Concept topic"}
                    </span>
                    {t.reference && (
                      <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                        📗 K.D. Tripathi · {t.reference}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      <p className="text-center text-[11px] text-slate-400">
        MedCrux provides original study notes aligned to standard MBBS references (K.D. Tripathi).
        It does not reproduce textbook content — refer to the original textbook for complete reading.
      </p>
    </div>
  );
}
