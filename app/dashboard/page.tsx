"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { TOPICS, getTopic } from "@/lib/topics";
import { DRUGS, getDrug } from "@/lib/drugs";
import { STATS } from "@/lib/content";
import { MICRO_STATS } from "@/lib/microbiology";
import { getMicroOverall } from "@/lib/micro-progress";
import {
  getCompletedTopics,
  getStreak,
  getExamDate,
  getLastDrug,
  getMCQHistory,
  getStudyPlanDone,
  isPlanCompletedToday,
  STUDY_PLAN_TASK_COUNT,
  useStoreTick,
} from "@/lib/store";

function daysUntil(dateStr: string): number | null {
  if (!dateStr) return null;
  const target = new Date(dateStr + "T00:00:00");
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - now.getTime()) / 86400000);
}

export default function DashboardPage() {
  useStoreTick();

  // localStorage is client-only. To avoid a hydration mismatch, read the store
  // only after mount. Before mount (server render + client's first render) we
  // use the same empty defaults the server produces, so the HTML matches; after
  // mount we re-render with the real values.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const completed = mounted ? getCompletedTopics() : [];
  // completedTopics is shared across subjects (pharma slugs + micro-* slugs), so
  // count only slugs that belong to Pharmacology for the pharma progress figure.
  const pharmaCompleted = completed.filter((s) => TOPICS.some((t) => t.slug === s));
  const progress = Math.round((pharmaCompleted.length / TOPICS.length) * 100);
  const streak = mounted ? getStreak() : 0;
  const examDays = daysUntil(mounted ? getExamDate() : "");
  const lastDrugId = mounted ? getLastDrug() : "";
  const lastDrug = lastDrugId ? getDrug(lastDrugId) : undefined;

  // Weak topics = topics not completed, take first 3 as "today's revision"
  const weak = TOPICS.filter((t) => !completed.includes(t.slug));
  const todaysTopic = weak[0] ?? TOPICS[0];

  const history = mounted ? getMCQHistory() : [];
  const totalQ = history.reduce((s, h) => s + h.total, 0);
  const totalC = history.reduce((s, h) => s + h.correct, 0);
  const accuracy = totalQ ? Math.round((totalC / totalQ) * 100) : 0;

  // Microbiology subject progress (multi-subject dashboard).
  const micro = mounted ? getMicroOverall() : null;

  // Today's study-plan checklist (per-day, resets each new day).
  const planDone = Math.min(mounted ? getStudyPlanDone().length : 0, STUDY_PLAN_TASK_COUNT);
  const planPct = Math.round((planDone / STUDY_PLAN_TASK_COUNT) * 100);
  const planAllDone = planDone === STUDY_PLAN_TASK_COUNT;
  const planCompletedToday = mounted ? isPlanCompletedToday() : false;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
        <p className="text-sm text-slate-500">Revise fast before your lecture or exam.</p>
      </div>

      {/* Stat row */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Progress" value={`${progress}%`} sub={`${pharmaCompleted.length}/${TOPICS.length} topics`} />
        <StatCard label="Study streak" value={`${streak}🔥`} sub="days in a row" />
        <StatCard
          label="Exam in"
          value={examDays === null ? "—" : examDays < 0 ? "past" : `${examDays}d`}
          sub={examDays === null ? "set in Settings" : "days left"}
        />
        <StatCard label="MCQ accuracy" value={`${accuracy}%`} sub={`${totalQ} attempted`} />
      </div>

      {/* Subjects */}
      <div>
        <div className="section-title mb-2">Subjects</div>
        <div className="grid gap-3 sm:grid-cols-2">
          {/* Pharmacology */}
          <Link href="/topics" className="card p-4 transition hover:shadow-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl">📚</span>
                <div>
                  <div className="font-semibold text-slate-800">Pharmacology</div>
                  <div className="text-[11px] text-slate-400">K.D. Tripathi</div>
                </div>
              </div>
              <span className="text-lg font-bold text-brand-700">{progress}%</span>
            </div>
            <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-200">
              <div className="h-full rounded-full bg-brand-500 transition-all" style={{ width: `${progress}%` }} />
            </div>
            <div className="mt-2 text-[11px] text-slate-400">
              {pharmaCompleted.length}/{TOPICS.length} topics · {STATS.drugCount} drugs · Continue →
            </div>
          </Link>

          {/* Microbiology */}
          <Link href="/microbiology" className="card p-4 transition hover:shadow-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl">🧫</span>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-slate-800">Microbiology</span>
                    <span className="rounded-full bg-emerald-100 px-1.5 py-0.5 text-[9px] font-bold text-emerald-700">
                      NEW
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400">Paniker · Smolensk lectures</div>
                </div>
              </div>
              <span className="text-lg font-bold text-brand-700">{micro ? `${micro.percent}%` : "—"}</span>
            </div>
            <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full rounded-full bg-brand-500 transition-all"
                style={{ width: `${micro?.percent ?? 0}%` }}
              />
            </div>
            <div className="mt-2 text-[11px] text-slate-400">
              {MICRO_STATS.topicCount} topics · {MICRO_STATS.mcqCount} MCQs · {MICRO_STATS.vivaCount} viva · Start →
            </div>
          </Link>
        </div>
      </div>

      {/* Today's study plan progress */}
      <div className="card p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="section-title">Today’s Study Plan</span>
              {planAllDone && (
                <span className="rounded-full bg-orange-100 px-2 py-0.5 text-[10px] font-semibold text-orange-600">
                  Plan done 🔥
                </span>
              )}
            </div>
            <div className="mt-1 text-lg font-semibold text-slate-800">
              {planDone}/{STUDY_PLAN_TASK_COUNT} tasks completed
            </div>
          </div>
          <Link href="/study-plan" className="btn-primary">
            {planAllDone ? "Review plan" : "Continue plan"} →
          </Link>
        </div>
        <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-slate-200">
          <div className="h-full rounded-full bg-brand-500 transition-all" style={{ width: `${planPct}%` }} />
        </div>
        {planAllDone && (
          <div className="mt-3 rounded-xl bg-green-50 p-3 text-center text-sm font-medium text-green-700">
            🎉 Today’s pharmacology revision is complete.
          </div>
        )}
        {/* Subtle habit indicator */}
        <p className="mt-2 text-center text-[11px] text-slate-400">
          {planCompletedToday ? "✅ Daily plan completed today" : "Finish today’s plan to keep your study habit"}
        </p>
      </div>

      {/* Continue studying */}
      <div className="card p-5">
        <div className="section-title mb-2">Continue studying</div>
        {lastDrug ? (
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-lg font-semibold text-slate-800">{lastDrug.name}</div>
              <div className="text-sm text-slate-500">{lastDrug.drugClass}</div>
            </div>
            <Link href={`/drug/${lastDrug.id}`} className="btn-primary">
              Resume →
            </Link>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-slate-500">You haven’t opened a drug yet. Start with today’s revision.</p>
            <Link href={`/topics/${todaysTopic.slug}`} className="btn-primary">
              Start →
            </Link>
          </div>
        )}
      </div>

      {/* Exam revision CTA */}
      <Link href="/revision" className="card flex items-center justify-between gap-3 bg-brand-600 p-5 text-white transition hover:bg-brand-700">
        <div>
          <div className="text-base font-semibold">⏱️ 15-minute exam revision</div>
          <div className="text-sm text-white/80">High-yield drugs, crash lists & last-minute exam list.</div>
        </div>
        <span className="text-xl">→</span>
      </Link>

      {/* Today's revision + Weak topics */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="card p-5">
          <div className="section-title mb-3">Today’s revision</div>
          <Link href={`/topics/${todaysTopic.slug}`} className="flex items-center gap-3 rounded-xl bg-brand-50 p-3 transition hover:bg-brand-100">
            <span className="text-2xl">{todaysTopic.icon}</span>
            <div>
              <div className="font-semibold text-brand-800">{todaysTopic.title}</div>
              <div className="text-xs text-brand-700/70">{todaysTopic.description}</div>
            </div>
          </Link>
          <div className="mt-3 flex gap-2">
            <Link href="/flashcards" className="btn-ghost flex-1 text-center">🃏 Flashcards</Link>
            <Link href="/exam" className="btn-ghost flex-1 text-center">📝 Quick test</Link>
          </div>
        </div>

        <div className="card p-5">
          <div className="section-title mb-3">Weak topics</div>
          {weak.length === 0 ? (
            <p className="text-sm text-slate-500">🎉 All topics marked complete. Revise with a random test.</p>
          ) : (
            <div className="space-y-2">
              {weak.slice(0, 4).map((t) => (
                <Link
                  key={t.slug}
                  href={`/topics/${t.slug}`}
                  className="flex items-center justify-between rounded-lg px-2 py-1.5 hover:bg-slate-50"
                >
                  <span className="flex items-center gap-2 text-sm text-slate-700">
                    <span>{t.icon}</span> {t.title}
                  </span>
                  <span className="text-xs text-slate-400">revise →</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Library quick stats */}
      <div className="card p-5">
        <div className="section-title mb-3">Your library</div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <MiniStat n={STATS.drugCount} label="Drugs" />
          <MiniStat n={STATS.flashcardCount} label="Flashcards" />
          <MiniStat n={STATS.mcqCount} label="MCQs" />
          <MiniStat n={STATS.vivaCount} label="Viva Qs" />
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="card p-4">
      <div className="text-xs text-slate-400">{label}</div>
      <div className="mt-1 text-2xl font-bold text-slate-800">{value}</div>
      <div className="text-[11px] text-slate-400">{sub}</div>
    </div>
  );
}

function MiniStat({ n, label }: { n: number; label: string }) {
  return (
    <div className="rounded-xl bg-slate-50 p-3 text-center">
      <div className="text-xl font-bold text-brand-700">{n}</div>
      <div className="text-[11px] text-slate-500">{label}</div>
    </div>
  );
}
