"use client";

import { useState } from "react";
import { getMistakes, setMistakeReason, MISTAKE_REASONS, MistakeReason } from "@/lib/store";

// Shown under a wrong answer: lets the student tag WHY they missed it, so the
// mistake is categorised in their Wrong-Answer Notebook. Correct answers never
// render this. Local state only (it appears after answering, client-side).
export function MistakeReasonSelector({ mcqId }: { mcqId: string }) {
  const [reason, setReason] = useState<MistakeReason | undefined>(
    () => getMistakes().find((m) => m.mcqId === mcqId)?.reason,
  );
  function pick(r: MistakeReason) {
    setMistakeReason(mcqId, r);
    setReason(r);
  }
  return (
    <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3">
      <div className="text-xs font-semibold text-amber-800">Why did you miss this?</div>
      <p className="mt-0.5 text-[11px] text-amber-700/80">
        Tag it so it comes back in your revision notebook at the right time.
      </p>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {MISTAKE_REASONS.map((r) => (
          <button
            key={r.id}
            onClick={() => pick(r.id)}
            aria-pressed={reason === r.id}
            className={`rounded-full border px-2.5 py-1 text-[11px] font-medium transition ${
              reason === r.id
                ? "border-amber-500 bg-amber-500 text-white"
                : "border-amber-300 bg-white text-amber-800 hover:bg-amber-100"
            }`}
          >
            {r.label}
          </button>
        ))}
      </div>
      {reason && (
        <div className="mt-2 text-[11px] font-medium text-amber-700">
          ✓ Saved to your Wrong-Answer Notebook.
        </div>
      )}
    </div>
  );
}
