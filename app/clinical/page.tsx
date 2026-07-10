"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CLINICAL_TOPICS, CLINICAL_STATS, validateMCQs } from "@/lib/clinical";
import { getClinicalTopicProgress, getClinicalOverall } from "@/lib/clinical-progress";
import { useStoreTick } from "@/lib/store";
import { SubjectSwitcher } from "@/components/SubjectSwitcher";

export default function ClinicalPage() {
  useStoreTick();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Dev-only data check for malformed MCQs.
  useEffect(() => {
    if (process.env.NODE_ENV === "production") return;
    const problems = validateMCQs();
    if (problems.length) console.warn("[MCQ validation] invalid Clinical MCQs:", problems);
    else console.info("[MCQ validation] all Clinical Examination MCQs are structurally valid ✓");
  }, []);

  const progress = mounted ? getClinicalTopicProgress() : [];
  const overall = mounted ? getClinicalOverall() : null;
  const progressBySlug = new Map(progress.map((p) => [p.slug, p]));

  return (
    <div className="space-y-5">
      <SubjectSwitcher active="clinical" />

      <div>
        <div className="flex items-center gap-2">
          <span className="text-2xl">🩺</span>
          <h1 className="text-2xl font-bold text-slate-800">Clinical Examination</h1>
        </div>
        <p className="text-sm text-slate-500">
          Bedside examination skills, explained the Macleod way.
          {CLINICAL_STATS.topicCount} topics · {CLINICAL_STATS.mcqCount} MCQs · {CLINICAL_STATS.vivaCount} viva Qs.
        </p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700">
            📗 Reference: Macleod
          </span>
          <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-[11px] font-semibold text-indigo-700">
            🇷🇺 Standard Russia syllabus mapped
          </span>
        </div>
        <p className="mt-1.5 text-[11px] text-slate-400">
          Each topic is mapped to standard Russian propaedeutics (Пропедевтика внутренних болезней).
          Upload your college lecture PDFs to match exact lectures.
        </p>
      </div>

      {/* Overall readiness */}
      {overall && (
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <span className="section-title">Clinical Examination readiness</span>
            <span className="text-2xl font-bold text-brand-700">{overall.percent}%</span>
          </div>
          <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-slate-200">
            <div className="h-full rounded-full bg-brand-500 transition-all" style={{ width: `${overall.percent}%` }} />
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2 text-center">
            <div className="rounded-lg bg-slate-50 p-2">
              <div className="text-sm font-bold text-slate-800">
                {overall.completedTopics}/{overall.totalTopics}
              </div>
              <div className="text-[10px] text-slate-500">topics done</div>
            </div>
            <div className="rounded-lg bg-slate-50 p-2">
              <div className="text-sm font-bold text-slate-800">
                {overall.mcqAccuracy === null ? "—" : `${Math.round(overall.mcqAccuracy * 100)}%`}
              </div>
              <div className="text-[10px] text-slate-500">MCQ accuracy</div>
            </div>
            <div className="rounded-lg bg-slate-50 p-2">
              <div className="text-sm font-bold text-slate-800">
                {overall.vivaDone}/{overall.vivaTotal}
              </div>
              <div className="text-[10px] text-slate-500">viva ready</div>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        {CLINICAL_TOPICS.map((t) => {
          const p = progressBySlug.get(t.slug);
          return (
            <Link key={t.slug} href={`/clinical/${t.slug}`} className="card p-4 transition hover:shadow-md">
              <div className="flex items-start gap-3">
                <span className="text-2xl">{t.icon}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-800">{t.title}</span>
                    {p?.completed && <span className="chip">✓ done</span>}
                    {mounted && p?.weak && !p.completed && (
                      <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-600">
                        weak
                      </span>
                    )}
                    {t.importantForExam && (
                      <span className="rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-semibold text-rose-600">
                        ⭐ Exam
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-xs text-slate-500">{t.summary}</p>

                  {mounted && p && (
                    <div className="mt-2">
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                        <div className="h-full rounded-full bg-brand-400 transition-all" style={{ width: `${p.percent}%` }} />
                      </div>
                    </div>
                  )}

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
        Original study notes aligned to Macleod. MedCrux does not reproduce textbook content — refer to the
        original textbook for complete reading. For study only.
      </p>
    </div>
  );
}
