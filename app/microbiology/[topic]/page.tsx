"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getMicroTopic, MicroFlashcard } from "@/lib/microbiology";
import { MCQBlock } from "@/components/MCQBlock";
import { getCompletedTopics, toggleTopicComplete, markStudiedToday, useStoreTick } from "@/lib/store";

function VivaItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <button
      onClick={() => setOpen((o) => !o)}
      className="w-full rounded-xl border border-slate-200 p-3 text-left transition hover:bg-slate-50"
    >
      <div className="flex items-start justify-between gap-2">
        <span className="text-sm font-medium text-slate-800">{q}</span>
        <span className="mt-0.5 shrink-0 text-xs text-slate-400">{open ? "− hide" : "+ answer"}</span>
      </div>
      {open && <p className="mt-2 text-sm text-slate-600">{a}</p>}
    </button>
  );
}

function FlashcardItem({ card }: { card: MicroFlashcard }) {
  const [revealed, setRevealed] = useState(false);
  return (
    <button
      onClick={() => setRevealed((r) => !r)}
      className="min-h-[92px] w-full rounded-xl border border-brand-200 bg-brand-50/40 p-3 text-left transition hover:bg-brand-50"
    >
      <div className="text-sm font-semibold text-slate-800">{card.front}</div>
      {revealed ? (
        <p className="mt-2 text-sm text-slate-600">{card.back}</p>
      ) : (
        <p className="mt-2 text-xs text-slate-400">Tap to reveal answer</p>
      )}
    </button>
  );
}

export default function MicroTopicPage({ params }: { params: Promise<{ topic: string }> }) {
  const { topic: slug } = use(params);
  useStoreTick();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const topic = getMicroTopic(slug);
  if (!topic) notFound();

  // Mark a study session when the student opens a topic.
  useEffect(() => {
    markStudiedToday();
  }, [slug]);

  const done = mounted ? getCompletedTopics().includes(slug) : false;

  return (
    <div className="space-y-6">
      <Link href="/microbiology" className="text-sm text-slate-500 hover:text-slate-700">
        ← All Microbiology topics
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="text-3xl">{topic.icon}</span>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">{topic.title}</h1>
            <p className="text-sm text-slate-500">{topic.summary}</p>
          </div>
        </div>
        <button onClick={() => toggleTopicComplete(slug)} className={done ? "btn-primary" : "btn-ghost"}>
          {done ? "✓ Completed" : "Mark done"}
        </button>
      </div>

      {/* Source badges: Russia syllabus + Indian reference */}
      <div className="flex flex-wrap gap-1.5">
        <span className="rounded-full bg-brand-50 px-2.5 py-1 text-[11px] font-semibold text-brand-700">
          🇷🇺 {topic.lectureRef}
        </span>
        <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
          📗 {topic.bookRef}
        </span>
        {topic.importantForExam && (
          <span className="rounded-full bg-rose-50 px-2.5 py-1 text-[11px] font-semibold text-rose-600">
            ⭐ Exam important
          </span>
        )}
      </div>

      {/* Easy notes — "Explain like I'm tired" */}
      <section className="card p-5">
        <div className="mb-3 flex items-center gap-2">
          <span className="text-lg">😴</span>
          <h2 className="text-sm font-bold text-slate-800">Explain like I&apos;m tired</h2>
        </div>
        <ul className="space-y-2">
          {topic.easyNotes.map((n, i) => (
            <li key={i} className="flex gap-2 text-sm text-slate-600">
              <span className="mt-0.5 text-brand-500">•</span>
              <span>{n}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Exam key points */}
      <section className="card p-5">
        <h2 className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-800">
          <span className="text-lg">🎯</span> Exam key points
        </h2>
        <ul className="space-y-2">
          {topic.keyPoints.map((k, i) => (
            <li key={i} className="flex gap-2 text-sm text-slate-700">
              <span className="mt-0.5 font-semibold text-rose-500">›</span>
              <span>{k}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Diagram in words + mnemonic */}
      <section className="card p-5">
        <h2 className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-800">
          <span className="text-lg">🗺️</span> Concept map
        </h2>
        <pre className="overflow-x-auto whitespace-pre rounded-xl bg-slate-900 p-4 text-[12px] leading-relaxed text-slate-100">
          {topic.diagram}
        </pre>
        {topic.mnemonic && (
          <div className="mt-3 rounded-xl bg-amber-50 p-3 text-sm text-amber-800">
            <span className="font-semibold">💡 Memory hook: </span>
            {topic.mnemonic}
          </div>
        )}
      </section>

      {/* Viva */}
      <section>
        <h2 className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-800">
          <span className="text-lg">🎤</span> Viva questions ({topic.viva.length})
        </h2>
        <div className="space-y-2">
          {topic.viva.map((v, i) => (
            <VivaItem key={i} q={v.q} a={v.a} />
          ))}
        </div>
      </section>

      {/* MCQs */}
      <section>
        <h2 className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-800">
          <span className="text-lg">📝</span> Test yourself ({topic.mcqs.length} MCQs)
        </h2>
        <div className="space-y-3">
          {topic.mcqs.map((m) => (
            <MCQBlock key={m.id} mcq={m} />
          ))}
        </div>
      </section>

      {/* Flashcards */}
      <section>
        <h2 className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-800">
          <span className="text-lg">🃏</span> Flashcards ({topic.flashcards.length})
        </h2>
        <div className="grid gap-2 sm:grid-cols-2">
          {topic.flashcards.map((c, i) => (
            <FlashcardItem key={i} card={c} />
          ))}
        </div>
      </section>

      <div className="flex justify-center pt-2">
        <button onClick={() => toggleTopicComplete(slug)} className={done ? "btn-primary" : "btn-ghost"}>
          {done ? "✓ Marked as done" : "Mark this topic done"}
        </button>
      </div>

      <p className="text-center text-[11px] text-slate-400">
        Simplified revision notes in our own words — not copied from any book. For study only, not medical advice.
      </p>
    </div>
  );
}
