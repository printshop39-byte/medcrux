"use client";

import { useState } from "react";
import { MCQ } from "@/lib/types";
import { mcqMeta } from "@/lib/mcq-meta";
import { recordMistake, recordCompetencyResult } from "@/lib/store";
import { MistakeReasonSelector } from "./MistakeReasonSelector";

// Context that turns on Mistake Intelligence for this MCQ. When supplied, a wrong
// answer is added to the Wrong-Answer Notebook and the "Why did you miss this?"
// selector appears; competency accuracy is tallied either way.
export interface McqContext {
  subject: string; // e.g. "pharmacology", "microbiology"
  topic: string; // topic slug
  topicTitle?: string;
  source?: string; // drug or concept name, when applicable
}

export function MCQBlock({
  mcq,
  onAnswer,
  context,
}: {
  mcq: MCQ;
  onAnswer?: (correct: boolean) => void;
  context?: McqContext;
}) {
  // `selected` is the single chosen OPTION INDEX (never the option text), so only
  // one option can ever be "picked" per MCQ. The correct-answer highlight is
  // driven by `mcq.answerIndex` (also an index) — independent of option text, so
  // duplicate option strings can never make two options both "selected".
  const [selected, setSelected] = useState<number | null>(null);
  const answered = selected !== null;

  function choose(i: number) {
    if (answered) return; // lock after the first answer; record only once
    setSelected(i);
    const correct = i === mcq.answerIndex;
    // Mistake Intelligence capture — only when the call site supplies context.
    if (context) {
      const meta = mcqMeta(mcq);
      recordCompetencyResult(meta.competency, correct);
      if (!correct) {
        recordMistake({
          mcqId: mcq.id,
          subject: context.subject,
          question: mcq.question,
          options: mcq.options,
          answerIndex: mcq.answerIndex,
          chosenIndex: i,
          explanation: mcq.explanation,
          topic: context.topic,
          topicTitle: context.topicTitle,
          drug: context.source,
          difficulty: meta.difficulty,
          competency: meta.competency,
        });
      }
    }
    onAnswer?.(correct);
  }

  return (
    <div className="rounded-xl border border-slate-200 p-4">
      <p className="font-medium text-slate-800">{mcq.question}</p>
      <div className="mt-3 space-y-2">
        {mcq.options.map((opt, i) => {
          const isCorrect = i === mcq.answerIndex; // by index, not text
          const isPicked = i === selected; // the one option the user chose
          const pickedWrong = isPicked && !isCorrect;
          let cls = "border-slate-200 hover:bg-slate-50";
          if (answered && isCorrect) cls = "border-green-400 bg-green-50 text-green-800";
          else if (answered && pickedWrong) cls = "border-red-300 bg-red-50 text-red-700";
          return (
            <button
              key={i}
              disabled={answered}
              onClick={() => choose(i)}
              aria-pressed={isPicked}
              className={`flex w-full items-center gap-2 rounded-lg border px-3 py-2 text-left text-sm transition ${cls}`}
            >
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-current text-[11px]">
                {String.fromCharCode(65 + i)}
              </span>
              <span className="flex-1">{opt}</span>
              {/* Labels disambiguate "the answer you picked" from "the correct answer"
                  so a wrong answer (red pick + green correct) never reads as two selections. */}
              {answered && isCorrect && (
                <span className="ml-auto shrink-0 text-[10px] font-semibold text-green-700">
                  {isPicked ? "Your answer · correct ✓" : "Correct answer ✓"}
                </span>
              )}
              {answered && pickedWrong && (
                <span className="ml-auto shrink-0 text-[10px] font-semibold text-red-600">Your answer ✕</span>
              )}
            </button>
          );
        })}
      </div>
      {answered && (
        <div className="mt-3 rounded-lg bg-slate-50 p-3 text-xs text-slate-600">
          <span className="font-semibold text-slate-700">Explanation: </span>
          {mcq.explanation}
        </div>
      )}
      {answered && selected !== mcq.answerIndex && context && (
        <MistakeReasonSelector mcqId={mcq.id} />
      )}
    </div>
  );
}
