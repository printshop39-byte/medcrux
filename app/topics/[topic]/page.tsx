"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getTopic } from "@/lib/topics";
import { getDrugsByTopic } from "@/lib/drugs";
import { CONCEPTS } from "@/lib/concepts";
import { getCompletedTopics, toggleTopicComplete, isBookmarked, useStoreTick } from "@/lib/store";

function ExamTags({ important, frequent }: { important?: boolean; frequent?: boolean }) {
  if (!important && !frequent) return null;
  return (
    <div className="flex flex-wrap gap-1">
      {important && <span className="rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-semibold text-rose-600">⭐ Important</span>}
      {frequent && <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-600">🔁 Asked often</span>}
    </div>
  );
}

export default function TopicPage({ params }: { params: Promise<{ topic: string }> }) {
  const { topic: slug } = use(params);
  useStoreTick();
  // Read localStorage only after mount to avoid a hydration mismatch.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const topic = getTopic(slug);
  if (!topic) notFound();

  const drugs = getDrugsByTopic(slug);
  const done = mounted ? getCompletedTopics().includes(slug) : false;

  return (
    <div className="space-y-5">
      <Link href="/topics" className="text-sm text-slate-500 hover:text-slate-700">
        ← All topics
      </Link>

      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="text-3xl">{topic.icon}</span>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">{topic.title}</h1>
            <p className="text-sm text-slate-500">{topic.description}</p>
          </div>
        </div>
        <button
          onClick={() => toggleTopicComplete(slug)}
          className={done ? "btn-primary" : "btn-ghost"}
        >
          {done ? "✓ Completed" : "Mark done"}
        </button>
      </div>

      {(drugs.length > 0 || slug === "general-pharmacology") && (
        <div className="flex gap-2">
          {slug !== "general-pharmacology" && (
            <Link href={`/flashcards?topic=${slug}`} className="btn-ghost flex-1 text-center">🃏 Flashcards</Link>
          )}
          <Link href={`/exam?topic=${slug}`} className="btn-ghost flex-1 text-center">📝 Test this topic</Link>
        </div>
      )}

      {slug === "general-pharmacology" ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {CONCEPTS.map((c) => (
            <Link key={c.id} href={`/concept/${c.id}`} className="card p-4 transition hover:shadow-md">
              <div className="font-semibold text-slate-800">{c.title}</div>
              <p className="mt-1 line-clamp-2 text-xs text-slate-500">{c.definition}</p>
              {c.mnemonic && <div className="mt-2 text-[10px] text-amber-600">💡 mnemonic inside</div>}
            </Link>
          ))}
        </div>
      ) : drugs.length === 0 ? (
        <div className="card p-6 text-center text-sm text-slate-500">
          This is a concept-based topic. Use the AI Tutor to revise key concepts, or explore drug topics.
          <div className="mt-3">
            <Link href="/ai-tutor" className="btn-primary">Ask AI Tutor</Link>
          </div>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {drugs.map((d) => (
            <Link key={d.id} href={`/drug/${d.id}`} className="card p-4 transition hover:shadow-md">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-800">{d.name}</span>
                {mounted && isBookmarked(d.id) && <span>🔖</span>}
              </div>
              <div className="mt-0.5 text-xs font-medium text-brand-600">{d.drugClass}</div>
              <p className="mt-1 line-clamp-2 text-xs text-slate-500">{d.moa}</p>
              <div className="mt-2 flex items-center justify-between gap-2">
                <div className="flex flex-wrap gap-1">
                  {d.uses.slice(0, 2).map((u) => (
                    <span key={u} className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-500">
                      {u}
                    </span>
                  ))}
                </div>
                <ExamTags important={d.importantForExam} frequent={d.askedFrequently} />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
