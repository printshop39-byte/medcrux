"use client";

import { useEffect, useState } from "react";
import { TOPICS } from "@/lib/topics";
import {
  getCompletedTopics,
  getMCQHistory,
  getCardDifficulty,
  getSubjectMCQScores,
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

  // ── Achievement badges (derived from existing localStorage/cloud data only) ──
  const subjectScores = mounted ? getSubjectMCQScores() : {};
  const subjAttempted = Object.values(subjectScores).reduce((n, s) => n + s.attempted, 0);
  const subjCorrect = Object.values(subjectScores).reduce((n, s) => n + s.correct, 0);
  const mcqAttempted = totalQ + subjAttempted; // pharma exam history + per-subject MCQs
  const mcqCorrect = totalC + subjCorrect;
  const mcqAcc = mcqAttempted ? mcqCorrect / mcqAttempted : 0;

  const badges = [
    { id: "pharma-rookie", icon: "💊", name: "Pharmacology Rookie", desc: "Complete a pharmacology topic", earned: completed.some((s) => TOPICS.some((t) => t.slug === s)) },
    { id: "micro-starter", icon: "🧫", name: "Microbiology Starter", desc: "Complete a microbiology topic", earned: completed.some((s) => s.startsWith("micro-")) },
    { id: "path-starter", icon: "🩸", name: "Pathology Starter", desc: "Complete a pathology topic", earned: completed.some((s) => s.startsWith("path-")) },
    { id: "clin-starter", icon: "🩺", name: "Clinical Exam Starter", desc: "Complete a clinical topic", earned: completed.some((s) => s.startsWith("clin-")) },
    { id: "streak-7", icon: "🔥", name: "7-Day Streak", desc: "Study 7 days in a row", earned: streak >= 7 },
    { id: "sharp-shooter", icon: "🎯", name: "MCQ Sharp Shooter", desc: "80%+ over 20+ MCQs", earned: mcqAttempted >= 20 && mcqAcc >= 0.8 },
  ];
  const earnedBadges = badges.filter((b) => b.earned).length;

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
        <Stat
          label="Streak"
          value={
            <>
              {streak}
              <span className={`flame ${streak > 0 ? "flame-active" : ""} ${streak >= 7 ? "flame-gold" : ""}`}>🔥</span>
            </>
          }
        />
      </div>

      {/* Achievements — derived from existing progress data (no new storage). */}
      <div className="card p-5">
        <div className="section-title mb-3">
          🏅 Achievements — {earnedBadges}/{badges.length} earned
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {badges.map((b) => (
            <Badge key={b.id} icon={b.icon} name={b.name} desc={b.desc} earned={b.earned} />
          ))}
        </div>
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

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="card p-4">
      <div className="text-xs text-slate-400">{label}</div>
      <div className="mt-1 text-2xl font-bold text-slate-800">{value}</div>
    </div>
  );
}

function Badge({ icon, name, desc, earned }: { icon: string; name: string; desc: string; earned: boolean }) {
  return (
    <div
      className={`rounded-xl border p-3 text-center transition ${
        earned ? "border-brand-200 bg-brand-50" : "border-slate-200 bg-slate-50"
      }`}
      title={earned ? `Earned: ${name}` : `Locked: ${desc}`}
    >
      <div className={`text-2xl ${earned ? "" : "opacity-30 grayscale"}`} aria-hidden="true">
        {icon}
      </div>
      <div className={`mt-1 text-xs font-semibold ${earned ? "text-brand-800" : "text-slate-400"}`}>{name}</div>
      <div className="mt-0.5 text-[10px] text-slate-400">{earned ? "✓ earned" : desc}</div>
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
