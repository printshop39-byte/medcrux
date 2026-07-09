"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { getFlashcards, seededShuffle } from "@/lib/content";
import { TOPICS, getTopic } from "@/lib/topics";
import { Difficulty } from "@/lib/types";
import { getCardDifficulty, setCardDifficulty, useStoreTick } from "@/lib/store";
import { ShortcutsBar } from "@/components/Shortcuts";

function FlashcardsInner() {
  const params = useSearchParams();
  const topic = params.get("topic") ?? undefined;
  useStoreTick();

  const diffs = getCardDifficulty();

  // Build a weighted deck: hard cards appear 3×, medium 2×, easy/unseen 1×.
  const deck = useMemo(() => {
    const base = getFlashcards(topic);
    const weighted = base.flatMap((c) => {
      const d = diffs[c.id];
      const reps = d === "hard" ? 3 : d === "medium" ? 2 : 1;
      return Array.from({ length: reps }, () => c);
    });
    return seededShuffle(weighted, base.length + weighted.length);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topic]);

  const [i, setI] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const card = deck[i];

  function rate(d: Difficulty) {
    if (card) setCardDifficulty(card.id, d);
    next();
  }
  function next() {
    setFlipped(false);
    setI((n) => (n + 1) % deck.length);
  }
  function prev() {
    setFlipped(false);
    setI((n) => (n - 1 + deck.length) % deck.length);
  }

  // Swipe gestures (mobile): swipe right → next, swipe left → prev.
  // A horizontal swipe suppresses the tap-flip that would otherwise follow.
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const suppressClick = useRef(false);

  function onCardClick() {
    if (suppressClick.current) {
      suppressClick.current = false;
      return;
    }
    setFlipped((f) => !f);
  }

  // Keyboard shortcuts: Space flip · ←/→ prev/next · 1/2/3 rate.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "SELECT" || t.tagName === "TEXTAREA" || t.isContentEditable)) return;
      switch (e.key) {
        case " ":
        case "Spacebar":
          e.preventDefault();
          setFlipped((f) => !f);
          break;
        case "ArrowRight":
          e.preventDefault();
          next();
          break;
        case "ArrowLeft":
          e.preventDefault();
          prev();
          break;
        case "1":
          rate("easy");
          break;
        case "2":
          rate("medium");
          break;
        case "3":
          rate("hard");
          break;
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i, deck]);

  if (!card) {
    return (
      <div className="card p-8 text-center text-slate-500">
        No flashcards for this topic yet.
        <div className="mt-3">
          <Link href="/flashcards" className="btn-primary">All flashcards</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Flashcards</h1>
          <p className="text-sm text-slate-500">
            {topic ? getTopic(topic)?.title : "All topics"} · Card {i + 1} / {deck.length}
          </p>
        </div>
        <TopicPicker current={topic} />
      </div>

      {/* Card */}
      <div
        className="flip-card mx-auto max-w-lg"
        onClick={onCardClick}
        onTouchStart={(e) => {
          const t = e.touches[0];
          touchStart.current = { x: t.clientX, y: t.clientY };
        }}
        onTouchEnd={(e) => {
          const start = touchStart.current;
          touchStart.current = null;
          if (!start) return;
          const dx = e.changedTouches[0].clientX - start.x;
          const dy = e.changedTouches[0].clientY - start.y;
          // Horizontal swipe: right → next, left → prev.
          if (Math.abs(dx) >= 50 && Math.abs(dx) > Math.abs(dy) * 1.5) {
            suppressClick.current = true;
            if (dx > 0) next();
            else prev();
          }
        }}
      >
        <div className={`flip-inner min-h-[16rem] cursor-pointer ${flipped ? "flipped" : ""}`}>
          {/* Front */}
          <div className="flip-face card flex min-h-[16rem] flex-col items-center justify-center p-8 text-center">
            <div className="section-title mb-3">{getTopic(card.topic)?.title}</div>
            {card.kind === "concept" && (
              <span className="mb-2 rounded-full bg-brand-50 px-2.5 py-0.5 text-[10px] font-semibold text-brand-700">
                📖 Concept
              </span>
            )}
            <div className="text-3xl font-bold text-slate-800">{card.front}</div>
            <div className="mt-4 text-xs text-slate-400">Tap to reveal</div>
          </div>
          {/* Back */}
          <div className="flip-face flip-back card flex min-h-[16rem] max-h-[16rem] flex-col justify-start overflow-y-auto p-6 text-left">
            {card.back.split("\n").map((line, idx) => {
              const [label, ...rest] = line.split(":");
              return (
                <p key={idx} className="mb-1.5 text-sm text-slate-700">
                  <span className="font-semibold text-brand-700">{label}:</span>
                  {rest.join(":")}
                </p>
              );
            })}
            {card.kind === "concept" ? (
              <Link
                href={`/concept/${card.conceptId}`}
                onClick={(e) => e.stopPropagation()}
                className="mt-3 text-xs text-brand-600 hover:underline"
              >
                Open concept card →
              </Link>
            ) : (
              <Link
                href={`/drug/${card.drugId}`}
                onClick={(e) => e.stopPropagation()}
                className="mt-3 text-xs text-brand-600 hover:underline"
              >
                Open full drug card →
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Mobile gesture hint */}
      <p className="text-center text-[11px] text-slate-400 lg:hidden">Tap to flip · Swipe to move</p>

      {/* Controls */}
      {flipped ? (
        <div className="mx-auto grid max-w-lg grid-cols-3 gap-2">
          <button onClick={() => rate("easy")} className="rounded-xl bg-green-100 py-3 text-sm font-medium text-green-700 hover:bg-green-200">
            😌 Easy
          </button>
          <button onClick={() => rate("medium")} className="rounded-xl bg-amber-100 py-3 text-sm font-medium text-amber-700 hover:bg-amber-200">
            🤔 Medium
          </button>
          <button onClick={() => rate("hard")} className="rounded-xl bg-rose-100 py-3 text-sm font-medium text-rose-700 hover:bg-rose-200">
            😰 Hard
          </button>
        </div>
      ) : (
        <div className="mx-auto flex max-w-lg gap-2">
          <button onClick={prev} className="btn-ghost">← Prev</button>
          <button onClick={() => setFlipped(true)} className="btn-primary flex-1">Reveal answer</button>
          <button onClick={next} className="btn-ghost">Skip →</button>
        </div>
      )}

      {/* Keyboard shortcuts help */}
      <ShortcutsBar
        items={[
          { keyLabel: "Space", action: "flip" },
          { keyLabel: "← →", action: "prev / next" },
          { keyLabel: "1", action: "easy" },
          { keyLabel: "2", action: "medium" },
          { keyLabel: "3", action: "hard" },
        ]}
      />

      <p className="text-center text-xs text-slate-400">
        Hard cards repeat 3× more often. Your ratings are saved on this device.
      </p>
    </div>
  );
}

function TopicPicker({ current }: { current?: string }) {
  return (
    <select
      value={current ?? ""}
      onChange={(e) => {
        const v = e.target.value;
        window.location.href = v ? `/flashcards?topic=${v}` : "/flashcards";
      }}
      className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
    >
      <option value="">All topics</option>
      {TOPICS.map((t) => (
        <option key={t.slug} value={t.slug}>
          {t.title}
        </option>
      ))}
    </select>
  );
}

export default function FlashcardsPage() {
  return (
    <Suspense fallback={<div className="text-sm text-slate-400">Loading…</div>}>
      <FlashcardsInner />
    </Suspense>
  );
}
