"use client";

import { useState } from "react";
import { MCQ } from "@/lib/types";

export function MCQBlock({ mcq }: { mcq: MCQ }) {
  const [selected, setSelected] = useState<number | null>(null);
  const answered = selected !== null;

  return (
    <div className="rounded-xl border border-slate-200 p-4">
      <p className="font-medium text-slate-800">{mcq.question}</p>
      <div className="mt-3 space-y-2">
        {mcq.options.map((opt, i) => {
          const isCorrect = i === mcq.answerIndex;
          const isPicked = i === selected;
          let cls = "border-slate-200 hover:bg-slate-50";
          if (answered && isCorrect) cls = "border-green-400 bg-green-50 text-green-800";
          else if (answered && isPicked && !isCorrect) cls = "border-red-300 bg-red-50 text-red-700";
          return (
            <button
              key={i}
              disabled={answered}
              onClick={() => setSelected(i)}
              className={`flex w-full items-center gap-2 rounded-lg border px-3 py-2 text-left text-sm transition ${cls}`}
            >
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-current text-[11px]">
                {String.fromCharCode(65 + i)}
              </span>
              {opt}
              {answered && isCorrect && <span className="ml-auto">✓</span>}
              {answered && isPicked && !isCorrect && <span className="ml-auto">✕</span>}
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
    </div>
  );
}
