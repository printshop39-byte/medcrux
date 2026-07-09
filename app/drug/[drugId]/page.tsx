"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getDrug } from "@/lib/drugs";
import { getTopic } from "@/lib/topics";
import { isBookmarked, toggleBookmark, setLastDrug, useStoreTick } from "@/lib/store";
import { MCQBlock } from "@/components/MCQBlock";

export default function DrugPage({ params }: { params: Promise<{ drugId: string }> }) {
  const { drugId } = use(params);
  useStoreTick();
  // Read localStorage only after mount to avoid a hydration mismatch.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const drug = getDrug(drugId);

  useEffect(() => {
    if (drug) setLastDrug(drug.id);
  }, [drug]);

  if (!drug) notFound();

  const topic = getTopic(drug.topic);
  const bookmarked = mounted ? isBookmarked(drug.id) : false;
  const [showViva, setShowViva] = useState<Record<number, boolean>>({});

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <Link href={`/topics/${drug.topic}`} className="text-sm text-slate-500 hover:text-slate-700">
          ← {topic?.title}
        </Link>
        <button
          onClick={() => toggleBookmark(drug.id)}
          className={bookmarked ? "btn-primary" : "btn-ghost"}
        >
          {bookmarked ? "🔖 Bookmarked" : "🔖 Bookmark"}
        </button>
      </div>

      {/* Header card */}
      <div className="card p-5">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{topic?.icon}</span>
          <h1 className="text-2xl font-bold text-slate-800">{drug.name}</h1>
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-2">
          <span className="chip">{drug.drugClass}</span>
          {drug.importantForExam && (
            <span className="rounded-full bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-600">⭐ Important for exam</span>
          )}
          {drug.askedFrequently && (
            <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-600">🔁 Asked frequently</span>
          )}
        </div>
        {drug.mnemonic && (
          <div className="mt-3 rounded-xl bg-amber-50 p-3 text-sm text-amber-800">
            <span className="font-semibold">💡 Mnemonic: </span>
            {drug.mnemonic}
          </div>
        )}
      </div>

      {/* MOA */}
      <Section title="Mechanism of Action">
        <p className="text-sm text-slate-700">{drug.moa}</p>
      </Section>

      <div className="grid gap-4 md:grid-cols-2">
        <BulletSection title="Uses" items={drug.uses} tone="brand" />
        <BulletSection title="Side Effects" items={drug.sideEffects} tone="rose" />
        <BulletSection title="Contraindications" items={drug.contraindications} tone="amber" />
        <BulletSection title="Drug Interactions" items={drug.interactions} tone="slate" />
      </div>

      {/* Viva */}
      <Section title="Viva Questions">
        <div className="space-y-2">
          {drug.vivaQuestions.map((v, i) => (
            <div key={i} className="rounded-xl border border-slate-200 p-3">
              <button
                onClick={() => setShowViva((s) => ({ ...s, [i]: !s[i] }))}
                className="flex w-full items-center justify-between gap-2 text-left text-sm font-medium text-slate-800"
              >
                <span>❓ {v.q}</span>
                <span className="text-slate-400">{showViva[i] ? "−" : "+"}</span>
              </button>
              {showViva[i] && <p className="mt-2 text-sm text-brand-700">✅ {v.a}</p>}
            </div>
          ))}
        </div>
      </Section>

      {/* MCQ practice */}
      <Section title="MCQ Practice">
        <div className="space-y-3">
          {drug.mcqs.map((m) => (
            <MCQBlock key={m.id} mcq={m} />
          ))}
        </div>
      </Section>

      <div className="flex gap-2">
        <Link href={`/ai-tutor?drug=${drug.id}`} className="btn-ghost flex-1 text-center">
          🤖 Ask AI about {drug.name}
        </Link>
        <Link href={`/flashcards?topic=${drug.topic}`} className="btn-ghost flex-1 text-center">
          🃏 Flashcards
        </Link>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="card p-5">
      <div className="section-title mb-3">{title}</div>
      {children}
    </div>
  );
}

const TONES: Record<string, string> = {
  brand: "text-brand-600",
  rose: "text-rose-500",
  amber: "text-amber-500",
  slate: "text-slate-400",
};

function BulletSection({ title, items, tone }: { title: string; items: string[]; tone: string }) {
  return (
    <div className="card p-5">
      <div className="section-title mb-3">{title}</div>
      <ul className="space-y-1.5">
        {items.map((it, i) => (
          <li key={i} className="flex gap-2 text-sm text-slate-700">
            <span className={TONES[tone]}>•</span>
            <span>{it}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
