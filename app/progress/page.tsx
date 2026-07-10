"use client";

import { useEffect, useState } from "react";
import { TOPICS } from "@/lib/topics";
import {
  getCompletedTopics,
  getMCQHistory,
  getCardDifficulty,
  getStreak,
  useStoreTick,
} from "@/lib/store";
import { getFlashcards } from "@/lib/content";

export default function ProgressPage() {
  useStoreTick();
  // Read localStorage only after mount to avoid a hydration mismatch.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const completed = mounted ? getCompletedTopics() : [];
  const history = mounted ? getMCQHistory() : [];
  const diffs = mounted ? getCardDifficulty() : {};
  const streak = mounted ? getStreak() : 0;

  // completedTopics is shared across subjects; count only Pharmacology slugs here.
  const pharmaCompleted = completed.filter((s) => TOPICS.some((t) => t.slug === s));
  const topicProgress = Math.round((pharmaCompleted.length / TOPICS.length) * 100);

  const totalQ = history.reduce((s, h) => s + h.total, 0);
  const totalC = history.reduce((s, h) => s + h.correct, 0);
  const accuracy = totalQ ? Math.round((totalC / totalQ) * 100) : 0;

  const allCards = getFlashcards();
  const hard = allCards.filter((c) => diffs[c.id] === "hard").length;
  const medium = allCards.filter((c) => diffs[c.id] === "medium").length;
  const easy = allCards.filter((c) => diffs[c.id] === "easy").length;
  const rated = hard + medium + easy;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Progress Tracker</h1>
        <p className="text-sm text-slate-500">Topics, MCQ accuracy, flashcard difficulty and streak.</p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Topics done" value={`${pharmaCompleted.length}/${TOPICS.length}`} />
        <Stat label="MCQ accuracy" value={`${accuracy}%`} />
        <Stat label="Tests taken" value={`${history.length}`} />
        <Stat label="Streak" value={`${streak}🔥`} />
      </div>

      {/* Topic completion */}
      <div className="card p-5">
        <div className="section-title mb-3">Topic completion — {topicProgress}%</div>
        <Bar pct={topicProgress} />
        <div className="mt-4 space-y-2">
          {TOPICS.map((t) => {
            const done = completed.includes(t.slug);
            return (
              <div key={t.slug} className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-slate-700">
                  <span>{t.icon}</span> {t.title}
                </span>
                <span className={done ? "text-green-600" : "text-slate-300"}>{done ? "✓ done" : "pending"}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Flashcard difficulty */}
      <div className="card p-5">
        <div className="section-title mb-3">Flashcard difficulty</div>
        {rated === 0 ? (
          <p className="text-sm text-slate-400">Rate flashcards Easy/Medium/Hard to see this breakdown.</p>
        ) : (
          <div className="space-y-2">
            <DiffRow label="😌 Easy" n={easy} total={rated} color="bg-green-400" />
            <DiffRow label="🤔 Medium" n={medium} total={rated} color="bg-amber-400" />
            <DiffRow label="😰 Hard" n={hard} total={rated} color="bg-rose-400" />
          </div>
        )}
      </div>

      {/* MCQ history sparkline-ish */}
      <div className="card p-5">
        <div className="section-title mb-3">Recent tests</div>
        {history.length === 0 ? (
          <p className="text-sm text-slate-400">No tests yet.</p>
        ) : (
          <div className="flex items-end gap-1.5">
            {history.slice(0, 12).reverse().map((h, i) => {
              const pct = Math.round((h.correct / h.total) * 100);
              return (
                <div key={i} className="flex flex-1 flex-col items-center gap-1">
                  <div className="flex h-24 w-full items-end rounded bg-slate-100">
                    <div
                      className={`w-full rounded ${pct >= 60 ? "bg-brand-500" : "bg-rose-400"}`}
                      style={{ height: `${pct}%` }}
                      title={`${pct}%`}
                    />
                  </div>
                  <span className="text-[9px] text-slate-400">{pct}%</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="card p-4">
      <div className="text-xs text-slate-400">{label}</div>
      <div className="mt-1 text-2xl font-bold text-slate-800">{value}</div>
    </div>
  );
}

function Bar({ pct }: { pct: number }) {
  return (
    <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-200">
      <div className="h-full rounded-full bg-brand-500 transition-all" style={{ width: `${pct}%` }} />
    </div>
  );
}

function DiffRow({ label, n, total, color }: { label: string; n: number; total: number; color: string }) {
  const pct = total ? Math.round((n / total) * 100) : 0;
  return (
    <div>
      <div className="mb-1 flex justify-between text-xs text-slate-500">
        <span>{label}</span>
        <span>{n}</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
