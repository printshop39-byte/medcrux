"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Kbd } from "./Shortcuts";

interface Row {
  keys: string[];
  action: string;
}
interface Group {
  title?: string;
  rows: Row[];
}

// Page-aware shortcut listings. Mirrors the per-page ShortcutsBar hints.
function groupsForPath(pathname: string): Group[] {
  if (pathname.startsWith("/flashcards")) {
    return [
      {
        rows: [
          { keys: ["Space"], action: "Flip card" },
          { keys: ["←"], action: "Previous card" },
          { keys: ["→"], action: "Next card" },
          { keys: ["1"], action: "Easy" },
          { keys: ["2"], action: "Medium" },
          { keys: ["3"], action: "Hard" },
        ],
      },
    ];
  }
  if (pathname.startsWith("/exam")) {
    return [
      {
        title: "MCQ",
        rows: [
          { keys: ["1", "2", "3", "4"], action: "Select option" },
          { keys: ["→"], action: "Next (after answered)" },
        ],
      },
      {
        title: "Viva",
        rows: [
          { keys: ["Space"], action: "Show / hide answer" },
          { keys: ["←", "→"], action: "Previous / next" },
        ],
      },
      {
        title: "Short Answer",
        rows: [
          { keys: ["Space"], action: "Show / hide answer" },
          { keys: ["←", "→"], action: "Previous / next" },
        ],
      },
    ];
  }
  return [
    {
      rows: [
        { keys: ["/"], action: "Focus search" },
        { keys: ["?"], action: "Open shortcuts" },
      ],
    },
  ];
}

function isTyping(t: EventTarget | null): boolean {
  const el = t as HTMLElement | null;
  return !!(el && (el.tagName === "INPUT" || el.tagName === "SELECT" || el.tagName === "TEXTAREA" || el.isContentEditable));
}

export function ShortcutOverlay() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Global keys: "?" toggles the overlay, "/" focuses search, Esc closes.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        return;
      }
      if (isTyping(e.target)) return; // ignore while typing in a field
      if (e.key === "?") {
        e.preventDefault();
        setOpen((o) => !o);
      } else if (e.key === "/") {
        e.preventDefault();
        document.querySelector<HTMLInputElement>("[data-search-input]")?.focus();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Close automatically on route change.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const groups = groupsForPath(pathname);

  return (
    <>
      {/* Floating help button — discoverable on mobile/touch. Sits above the
          mobile bottom nav (bottom-20) and clears the corner on desktop. */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open keyboard shortcuts"
        aria-haspopup="dialog"
        className="fixed bottom-20 right-4 z-40 flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-lg font-semibold text-slate-500 shadow-lg transition hover:bg-slate-50 hover:text-brand-700 lg:bottom-6 lg:right-6"
      >
        ?
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4"
          onClick={() => setOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Keyboard shortcuts"
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-800">⌨️ Keyboard shortcuts</h2>
              <button onClick={() => setOpen(false)} aria-label="Close" className="text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>

            <div className="space-y-4">
              {groups.map((g, gi) => (
                <div key={gi}>
                  {g.title && <div className="section-title mb-2">{g.title}</div>}
                  <div className="space-y-1.5">
                    {g.rows.map((r, ri) => (
                      <div key={ri} className="flex items-center justify-between gap-3 text-sm">
                        <span className="text-slate-600">{r.action}</span>
                        <span className="flex gap-1">
                          {r.keys.map((k, ki) => (
                            <Kbd key={ki}>{k}</Kbd>
                          ))}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 text-center text-[11px] text-slate-400">
              Press <Kbd>Esc</Kbd> or click outside to close.
            </div>
          </div>
        </div>
      )}
    </>
  );
}
