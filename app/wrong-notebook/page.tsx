"use client";

import { useState } from "react";
import Link from "next/link";
import {
  getMistakes,
  getDueMistakes,
  reviewMistake,
  removeMistake,
  toggleMistakeBookmark,
  MISTAKE_REASONS,
  REVISION_STAGE_LABEL,
  useStoreTick,
  useHydrated,
  type MistakeRecord,
  type RevisionStage,
} from "@/lib/store";

const REASON_LABEL: Record<string, string> = Object.fromEntries(
  MISTAKE_REASONS.map((r) => [r.id, r.label]),
);

export default function WrongNotebookPage() {
  useStoreTick();
  const hydrated = useHydrated();
  const all = hydrated ? getMistakes() : [];
  const due = hydrated ? getDueMistakes() : [];
  const dueIds = new Set(due.map((m) => m.mcqId));
  const active = all.filter((m) => m.stage !== "mastered" && !dueIds.has(m.mcqId));
  const mastered = all.filter((m) => m.stage === "mastered");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Wrong-Answer Notebook</h1>
        <p className="text-sm text-slate-500">
          Every question you miss is captured here and scheduled for spaced revision — Day 1 → 3 → 7 → 21 → mastered.
        </p>
      </div>

      {hydrated && all.length === 0 && (
        <div className="card p-8 text-center">
          <div className="text-3xl">🧠</div>
          <p className="mt-2 text-sm text-slate-600">No mistakes recorded yet.</p>
          <p className="mt-1 text-xs text-slate-400">
            Take a test — questions you get wrong appear here for timed revision.
          </p>
          <Link href="/exam" className="btn-primary mt-4 inline-flex">Go to Exam →</Link>
        </div>
      )}

      {/* Due today */}
      {hydrated && all.length > 0 && (
        <div>
          <div className="mb-2 flex items-center gap-2">
            <span className="section-title">🔔 Due today</span>
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                due.length ? "bg-rose-100 text-rose-700" : "bg-slate-100 text-slate-500"
              }`}
            >
              {due.length}
            </span>
          </div>
          {due.length === 0 ? (
            <div className="card p-5 text-sm text-slate-500">
              ✅ You&apos;re caught up — nothing due for revision today.
            </div>
          ) : (
            <div className="space-y-3">
              {due.map((m) => (
                <MistakeCard key={m.mcqId} m={m} due />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Scheduled (not yet due) */}
      {hydrated && active.length > 0 && (
        <div>
          <div className="section-title mb-2">📚 Scheduled for later</div>
          <div className="space-y-3">
            {active.map((m) => (
              <MistakeCard key={m.mcqId} m={m} />
            ))}
          </div>
        </div>
      )}

      {/* Mastered */}
      {hydrated && mastered.length > 0 && (
        <div>
          <div className="section-title mb-2">✅ Mastered — {mastered.length}</div>
          <div className="space-y-3">
            {mastered.map((m) => (
              <MistakeCard key={m.mcqId} m={m} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function MistakeCard({ m, due = false }: { m: MistakeRecord; due?: boolean }) {
  // Inline retry: re-answer the stored snapshot and advance/reset the schedule.
  const [chosen, setChosen] = useState<number | null>(null);
  const [retrying, setRetrying] = useState(false);

  function retryPick(i: number) {
    if (chosen !== null) return;
    setChosen(i);
    reviewMistake(m.mcqId, i === m.answerIndex);
  }

  return (
    <div className={`card p-4 ${due ? "border-rose-200" : ""}`}>
      <div className="flex flex-wrap items-center gap-1.5">
        <StageBadge stage={m.stage} />
        <DifficultyBadge d={m.difficulty} />
        {m.reason && (
          <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-700">
            {REASON_LABEL[m.reason] ?? m.reason}
          </span>
        )}
        <button
          onClick={() => toggleMistakeBookmark(m.mcqId)}
          aria-pressed={!!m.bookmarked}
          title={m.bookmarked ? "Remove bookmark" : "Bookmark"}
          className="ml-auto text-sm"
        >
          {m.bookmarked ? "🔖" : "🏷️"}
        </button>
      </div>

      <p className="mt-2 text-sm font-medium text-slate-800">{m.question}</p>

      <div className="mt-1 text-[11px] text-slate-400">
        {m.drug ? `${m.drug} · ` : ""}
        {m.topicTitle ?? m.topic}
      </div>

      {!retrying && (
        <div className="mt-2 space-y-1 text-xs">
          <div className="text-rose-600">
            <span className="font-semibold">Your answer:</span> {m.options[m.chosenIndex]}
          </div>
          <div className="text-green-700">
            <span className="font-semibold">Correct:</span> {m.options[m.answerIndex]}
          </div>
          {m.explanation && <div className="text-slate-500">{m.explanation}</div>}
        </div>
      )}

      {/* Inline retry */}
      {retrying && (
        <div className="mt-3 space-y-2">
          {m.options.map((opt, i) => {
            const answered = chosen !== null;
            const isCorrect = i === m.answerIndex;
            let cls = "border-slate-200 hover:bg-slate-50";
            if (answered && isCorrect) cls = "border-green-400 bg-green-50 text-green-800";
            else if (answered && i === chosen && !isCorrect) cls = "border-red-300 bg-red-50 text-red-700";
            return (
              <button
                key={i}
                disabled={answered}
                onClick={() => retryPick(i)}
                className={`flex w-full items-center gap-2 rounded-lg border px-3 py-2 text-left text-xs transition ${cls}`}
              >
                <span className="flex h-5 w-5 items-center justify-center rounded-full border border-current text-[10px]">
                  {String.fromCharCode(65 + i)}
                </span>
                {opt}
              </button>
            );
          })}
          {chosen !== null && (
            <div className="text-[11px] font-medium text-slate-600">
              {chosen === m.answerIndex
                ? `✓ Correct — promoted to ${REVISION_STAGE_LABEL[m.stage]}.`
                : "✕ Not quite — reset to Day 1."}
            </div>
          )}
        </div>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3 text-[11px]">
        <span className="text-slate-400">
          Last: {m.lastAttempted}
          {m.nextRevision ? ` · Next: ${m.nextRevision}` : ""}
        </span>
        <div className="ml-auto flex flex-wrap gap-2">
          {!retrying ? (
            <button
              onClick={() => {
                setRetrying(true);
                setChosen(null);
              }}
              className="rounded-lg border border-brand-200 px-2.5 py-1 font-medium text-brand-700 hover:bg-brand-50"
            >
              Retry
            </button>
          ) : (
            <button
              onClick={() => setRetrying(false)}
              className="rounded-lg border border-slate-200 px-2.5 py-1 font-medium text-slate-600 hover:bg-slate-50"
            >
              Close
            </button>
          )}
          {m.stage !== "mastered" && (
            <button
              onClick={() => reviewMistake(m.mcqId, true)}
              className="rounded-lg border border-green-200 px-2.5 py-1 font-medium text-green-700 hover:bg-green-50"
            >
              Mark reviewed
            </button>
          )}
          <button
            onClick={() => removeMistake(m.mcqId)}
            className="rounded-lg border border-slate-200 px-2.5 py-1 font-medium text-slate-500 hover:bg-rose-50 hover:text-rose-600"
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  );
}

function StageBadge({ stage }: { stage: RevisionStage }) {
  const mastered = stage === "mastered";
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
        mastered ? "bg-emerald-100 text-emerald-700" : "bg-brand-50 text-brand-700"
      }`}
    >
      {REVISION_STAGE_LABEL[stage]}
    </span>
  );
}

function DifficultyBadge({ d }: { d: string }) {
  const map: Record<string, string> = {
    easy: "bg-green-50 text-green-700",
    medium: "bg-amber-50 text-amber-700",
    hard: "bg-rose-50 text-rose-700",
  };
  return (
    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize ${map[d] ?? map.medium}`}>
      {d}
    </span>
  );
}
