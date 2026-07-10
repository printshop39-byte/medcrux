"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MICRO_TOPICS, MICRO_STATS } from "@/lib/microbiology";
import { getCompletedTopics, useStoreTick } from "@/lib/store";

export default function MicrobiologyPage() {
  useStoreTick();
  // Read localStorage only after mount to avoid a hydration mismatch.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const completed = mounted ? getCompletedTopics() : [];
  const doneCount = MICRO_TOPICS.filter((t) => completed.includes(t.slug)).length;

  return (
    <div className="space-y-5">
      <div>
        <div className="flex items-center gap-2">
          <span className="text-2xl">🧫</span>
          <h1 className="text-2xl font-bold text-slate-800">Microbiology</h1>
        </div>
        <p className="text-sm text-slate-500">
          Russia MBBS syllabus (Smolensk lectures) explained the Indian-reference way (Paniker).
          {MICRO_STATS.topicCount} topics · {MICRO_STATS.mcqCount} MCQs · {MICRO_STATS.vivaCount} viva Qs.
        </p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          <span className="rounded-full bg-brand-50 px-2.5 py-0.5 text-[11px] font-semibold text-brand-700">
            🇷🇺 Russia syllabus matched
          </span>
          <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700">
            📗 Indian book reference
          </span>
          {mounted && (
            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold text-slate-600">
              {doneCount}/{MICRO_STATS.topicCount} done
            </span>
          )}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {MICRO_TOPICS.map((t) => {
          const done = completed.includes(t.slug);
          return (
            <Link key={t.slug} href={`/microbiology/${t.slug}`} className="card p-4 transition hover:shadow-md">
              <div className="flex items-start gap-3">
                <span className="text-2xl">{t.icon}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-800">{t.title}</span>
                    {done && <span className="chip">✓ done</span>}
                    {t.importantForExam && (
                      <span className="rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-semibold text-rose-600">
                        ⭐ Exam
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-xs text-slate-500">{t.summary}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[11px] text-slate-400">
                    <span>{t.mcqs.length} MCQs</span>
                    <span>·</span>
                    <span>{t.viva.length} viva</span>
                    <span>·</span>
                    <span>{t.flashcards.length} cards</span>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      <p className="text-center text-[11px] text-slate-400">
        Explanations are simplified concept notes written for revision — not copied from any textbook. For study only.
      </p>
    </div>
  );
}
