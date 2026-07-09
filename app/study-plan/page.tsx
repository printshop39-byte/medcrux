"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getQuickRevisionDrugs, getWeakDrugs, getMCQs, getVivaQuestions, getConceptCrashList } from "@/lib/content";
import { getImportantDrugs, getFrequentDrugs, getDrugsByTopic } from "@/lib/drugs";
import { TOPICS, getTopic } from "@/lib/topics";
import { getExamDate, getCompletedTopics, getStudyPlanDone, toggleStudyPlanTask, useStoreTick } from "@/lib/store";

function daysUntil(dateStr: string): number | null {
  if (!dateStr) return null;
  const target = new Date(dateStr + "T00:00:00");
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - now.getTime()) / 86400000);
}

interface PlanCard {
  id: string; // stable per slot so completion persists across content changes
  icon: string;
  title: string;
  time: string;
  minutes: number;
  what: string;
  items: string[];
  href: string;
  cta: string;
  priority?: boolean;
}

// Topics prioritised when an exam is near.
const PRIORITY_TOPICS = ["antibiotics", "cardiovascular-drugs", "cns-drugs"];

export default function StudyPlanPage() {
  useStoreTick();
  // Read localStorage only after mount to avoid a hydration mismatch.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const completed = mounted ? getCompletedTopics() : [];
  const examDate = mounted ? getExamDate() : "";
  const days = daysUntil(examDate);
  const hasExam = days !== null && days >= 0;
  const examSoon = hasExam && (days as number) <= 14;

  // Pick the 30-minute focus topic.
  const dayIdx = new Date().getDate();
  const incompleteWithDrugs = TOPICS.filter((t) => !completed.includes(t.slug) && getDrugsByTopic(t.slug).length > 0);
  const balancedTopic = incompleteWithDrugs[0] ?? TOPICS.find((t) => getDrugsByTopic(t.slug).length > 0)!;
  const focusSlug = examSoon ? PRIORITY_TOPICS[dayIdx % PRIORITY_TOPICS.length] : balancedTopic.slug;
  const focusTopic = getTopic(focusSlug)!;
  const focusDrugs = getDrugsByTopic(focusSlug);

  // 15-minute quick revision drugs: exam-focused vs balanced.
  const quickDrugs = (
    examSoon
      ? Array.from(new Map([...getFrequentDrugs(), ...getImportantDrugs()].map((d) => [d.id, d])).values())
      : getQuickRevisionDrugs(12)
  ).slice(0, 8);

  const weak = getWeakDrugs(completed, 8);
  const concepts = getConceptCrashList();
  const mcqCount = getMCQs().length;
  const vivaCount = getVivaQuestions().length;

  const cards: PlanCard[] = [
    {
      id: "quick",
      icon: "⏱️",
      title: "15-minute quick revision",
      time: "15 min",
      minutes: 15,
      what: examSoon ? "High-yield, frequently-asked drugs first." : "A quick pass over must-know drugs.",
      items: quickDrugs.map((d) => d.name),
      href: "/revision",
      cta: "Start quick revision",
      priority: examSoon,
    },
    {
      id: "topic",
      icon: focusTopic.icon,
      title: "30-minute topic revision",
      time: "30 min",
      minutes: 30,
      what: `Focus topic: ${focusTopic.title} — ${focusDrugs.length} drugs.`,
      items: focusDrugs.slice(0, 6).map((d) => d.name),
      href: `/topics/${focusSlug}`,
      cta: `Revise ${focusTopic.title}`,
      priority: examSoon && PRIORITY_TOPICS.includes(focusSlug),
    },
    {
      id: "mcq",
      icon: "📝",
      title: "20 MCQ practice",
      time: "20 min",
      minutes: 20,
      what: examSoon ? "Random 20 — tick “Important-for-exam drugs only”." : "Random 20 mixed MCQs to test recall.",
      items: [`${mcqCount} MCQs available`],
      href: "/exam",
      cta: "Start MCQ test",
    },
    {
      id: "viva",
      icon: "🎤",
      title: "10 viva questions",
      time: "10 min",
      minutes: 10,
      what: "Practice oral viva Q&A — open Exam → Viva.",
      items: [`${vivaCount} viva questions available`],
      href: "/exam",
      cta: "Start viva",
    },
    {
      id: "weak",
      icon: "🎯",
      title: "Weak drugs review",
      time: "10 min",
      minutes: 10,
      what: weak.length ? "Drugs from topics you haven’t marked complete." : "All topics complete — quick mixed review.",
      items: weak.map((d) => d.name),
      href: weak.length ? `/drug/${weak[0].id}` : "/topics",
      cta: "Review weak drugs",
    },
    {
      id: "concepts",
      icon: "🧪",
      title: "General Pharmacology concepts",
      time: "15 min",
      minutes: 15,
      what: "Core concepts: kinetics, dynamics, therapeutic index, ADR, CYP450…",
      items: concepts.slice(0, 6).map((c) => c.title),
      href: "/topics/general-pharmacology",
      cta: "Revise concepts",
      priority: examSoon,
    },
  ];

  const totalMin = cards.reduce((s, c) => s + c.minutes, 0);

  // Daily checklist progress (persisted per day in localStorage).
  const doneSet = new Set(mounted ? getStudyPlanDone() : []);
  const doneCount = cards.filter((c) => doneSet.has(c.id)).length;
  const total = cards.length;
  const pct = Math.round((doneCount / total) * 100);
  const allDone = doneCount === total;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Daily Study Plan</h1>
        <p className="text-sm text-slate-500">
          {examSoon
            ? `Exam in ${days} day${days === 1 ? "" : "s"} — exam-focused plan`
            : hasExam
              ? `Exam in ${days} days — balanced plan`
              : "Balanced daily revision plan"}{" "}
          · ~{totalMin} min total
        </p>
      </div>

      {/* Today's plan progress */}
      <div className="card p-5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="section-title">Today’s Plan Progress</span>
            {allDone && (
              <span className="rounded-full bg-orange-100 px-2 py-0.5 text-[10px] font-semibold text-orange-600">
                Plan done 🔥
              </span>
            )}
          </div>
          <span className="text-sm font-semibold text-slate-700">{doneCount}/{total} tasks completed</span>
        </div>
        <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-slate-200">
          <div className="h-full rounded-full bg-brand-500 transition-all" style={{ width: `${pct}%` }} />
        </div>
        {allDone && (
          <div className="mt-3 rounded-xl bg-green-50 p-3 text-center text-sm text-green-700">
            <div className="font-semibold">🎉 Plan done 🔥</div>
            <div>You completed today’s pharmacology revision.</div>
          </div>
        )}
      </div>

      {/* Mode banner */}
      <div className={`card p-5 ${examSoon ? "bg-rose-50" : "bg-brand-50"}`}>
        <div className="flex items-center gap-3">
          <span className="text-2xl">{examSoon ? "🔥" : "📅"}</span>
          <div>
            <div className={`font-semibold ${examSoon ? "text-rose-700" : "text-brand-800"}`}>
              {examSoon ? "Exam mode: prioritising high-yield material" : "Balanced revision"}
            </div>
            <div className={`text-xs ${examSoon ? "text-rose-600/80" : "text-brand-700/80"}`}>
              {examSoon
                ? "Important & frequently-asked drugs, antibiotics, CVS, CNS and core concepts first."
                : hasExam
                  ? "Steady coverage across topics. Set closer to the exam to switch to exam mode."
                  : "Set an exam date in Settings to get an exam-focused plan."}
            </div>
          </div>
        </div>
      </div>

      {/* Plan cards */}
      <div className="space-y-3">
        {cards.map((c) => {
          const done = doneSet.has(c.id);
          return (
            <div key={c.id} className={`card p-5 transition ${done ? "opacity-60" : ""}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{c.icon}</span>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`font-semibold text-slate-800 ${done ? "line-through decoration-slate-400" : ""}`}>
                        {c.title}
                      </span>
                      <span className="chip">{c.time}</span>
                      {c.priority && (
                        <span className="rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-semibold text-rose-600">
                          ⭐ Priority
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-slate-500">{c.what}</p>
                    {c.items.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {c.items.slice(0, 6).map((it, j) => (
                          <span key={j} className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-500">
                            {it}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Checkbox toggle */}
                <button
                  onClick={() => toggleStudyPlanTask(c.id)}
                  aria-pressed={done}
                  aria-label={done ? `Mark "${c.title}" not done` : `Mark "${c.title}" done`}
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 text-sm transition ${
                    done ? "border-brand-600 bg-brand-600 text-white" : "border-slate-300 text-transparent hover:border-brand-400"
                  }`}
                >
                  ✓
                </button>
              </div>

              <div className="mt-4 flex items-center gap-3">
                <Link href={c.href} className="btn-primary">
                  {c.cta} →
                </Link>
                <button onClick={() => toggleStudyPlanTask(c.id)} className="text-sm font-medium text-slate-400 hover:text-brand-700">
                  {done ? "Undo" : "Mark done"}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-center text-xs text-slate-400">
        Tip: mark topics complete as you go — the plan adapts to your weak areas.
      </p>
    </div>
  );
}
