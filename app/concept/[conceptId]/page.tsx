"use client";

import { use, useState } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getConcept, CONCEPTS } from "@/lib/concepts";

export default function ConceptPage({ params }: { params: Promise<{ conceptId: string }> }) {
  const { conceptId } = use(params);
  const concept = getConcept(conceptId);
  const [showViva, setShowViva] = useState(false);
  if (!concept) notFound();

  const idx = CONCEPTS.findIndex((c) => c.id === conceptId);
  const next = CONCEPTS[(idx + 1) % CONCEPTS.length];

  return (
    <div className="space-y-5">
      <Link href="/topics/general-pharmacology" className="text-sm text-slate-500 hover:text-slate-700">
        ← General Pharmacology
      </Link>

      <div className="card p-5">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🧪</span>
          <h1 className="text-2xl font-bold text-slate-800">{concept.title}</h1>
        </div>
        <p className="mt-2 text-sm text-slate-600">{concept.definition}</p>
        {concept.mnemonic && (
          <div className="mt-3 rounded-xl bg-amber-50 p-3 text-sm text-amber-800">
            <span className="font-semibold">💡 Mnemonic: </span>
            {concept.mnemonic}
          </div>
        )}
      </div>

      <Section title="Exam Short Answer">
        <p className="whitespace-pre-line text-sm leading-relaxed text-slate-700">{concept.examAnswer}</p>
      </Section>

      <Section title="Simple Example">
        <p className="whitespace-pre-line text-sm text-slate-700">{concept.example}</p>
      </Section>

      <Section title="Viva Question">
        <div className="rounded-xl border border-slate-200 p-3">
          <button
            onClick={() => setShowViva((s) => !s)}
            className="flex w-full items-center justify-between gap-2 text-left text-sm font-medium text-slate-800"
          >
            <span>❓ {concept.viva.q}</span>
            <span className="text-slate-400">{showViva ? "−" : "+"}</span>
          </button>
          {showViva && <p className="mt-2 text-sm text-brand-700">✅ {concept.viva.a}</p>}
        </div>
      </Section>

      <div className="flex gap-2">
        <Link href={`/concept/${next.id}`} className="btn-primary flex-1 text-center">
          Next concept: {next.title} →
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
