"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getBookmarks, getLastDrug, getCompletedTopics, useStoreTick } from "@/lib/store";
import { getDrug } from "@/lib/drugs";
import { getTopic, TOPICS } from "@/lib/topics";

export default function BookmarksPage() {
  useStoreTick();
  // Read localStorage only after mount to avoid a hydration mismatch.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const bookmarks = (mounted ? getBookmarks() : []).map(getDrug).filter(Boolean);
  const last = mounted ? getLastDrug() : "";
  const lastDrug = last ? getDrug(last) : undefined;
  const completed = mounted ? getCompletedTopics() : [];
  const weakTopics = TOPICS.filter((t) => !completed.includes(t.slug)).slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Bookmarks</h1>
        <p className="text-sm text-slate-500">Saved drugs, weak topics and your last revised card.</p>
      </div>

      {/* Saved drugs */}
      <section>
        <div className="section-title mb-2">⭐ Saved drugs</div>
        {bookmarks.length === 0 ? (
          <div className="card p-6 text-center text-sm text-slate-500">
            No bookmarks yet. Open a drug and tap 🔖 to save it.
            <div className="mt-3">
              <Link href="/topics" className="btn-primary">Browse topics</Link>
            </div>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {bookmarks.map((d) => (
              <Link key={d!.id} href={`/drug/${d!.id}`} className="card p-4 transition hover:shadow-md">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-800">{d!.name}</span>
                  <span>🔖</span>
                </div>
                <div className="text-xs font-medium text-brand-600">{d!.drugClass}</div>
                <div className="mt-1 text-[11px] text-slate-400">{getTopic(d!.topic)?.title}</div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Last revised */}
      {lastDrug && (
        <section>
          <div className="section-title mb-2">🕐 Last revised</div>
          <Link href={`/drug/${lastDrug.id}`} className="card flex items-center justify-between p-4 hover:shadow-md">
            <div>
              <div className="font-semibold text-slate-800">{lastDrug.name}</div>
              <div className="text-xs text-slate-500">{lastDrug.drugClass}</div>
            </div>
            <span className="text-sm text-brand-600">Resume →</span>
          </Link>
        </section>
      )}

      {/* Weak topics */}
      <section>
        <div className="section-title mb-2">⚠️ Weak topics to revise</div>
        {weakTopics.length === 0 ? (
          <p className="text-sm text-slate-400">🎉 All topics completed.</p>
        ) : (
          <div className="grid gap-2 sm:grid-cols-2">
            {weakTopics.map((t) => (
              <Link key={t.slug} href={`/topics/${t.slug}`} className="card flex items-center gap-3 p-3 hover:shadow-md">
                <span className="text-xl">{t.icon}</span>
                <span className="text-sm font-medium text-slate-700">{t.title}</span>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
