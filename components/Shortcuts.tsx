import React from "react";

// A single keyboard key cap.
export function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="inline-block min-w-[1.4rem] rounded border border-slate-300 bg-slate-50 px-1.5 py-0.5 text-center font-mono text-[10px] text-slate-600 shadow-sm">
      {children}
    </kbd>
  );
}

export interface ShortcutItem {
  keyLabel: string; // one or more keys separated by spaces, e.g. "Space" or "← →"
  action: string; // what the key does, e.g. "flip"
}

// A compact, centered shortcuts help bar. Shared by Flashcards and Exam pages.
// Each item's keyLabel is split on whitespace so multi-key hints render as
// separate key caps (e.g. "← →" → two caps).
export function ShortcutsBar({
  items,
  title = "Shortcuts",
  className,
}: {
  items: ShortcutItem[];
  title?: string;
  className?: string;
}) {
  return (
    <div
      className={`mx-auto flex max-w-lg flex-wrap items-center justify-center gap-x-3 gap-y-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-[11px] text-slate-500 ${
        className ?? ""
      }`}
    >
      <span className="font-semibold text-slate-600">⌨️ {title}:</span>
      {items.map((it, i) => (
        <span key={i}>
          {it.keyLabel
            .split(/\s+/)
            .filter(Boolean)
            .map((k, j) => (
              <React.Fragment key={j}>
                {j > 0 ? " " : ""}
                <Kbd>{k}</Kbd>
              </React.Fragment>
            ))}{" "}
          {it.action}
        </span>
      ))}
    </div>
  );
}
