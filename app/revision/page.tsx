"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getConceptCrashList, getCrashList, getQuickRevisionDrugs, getWeakDrugs } from "@/lib/content";
import { getFrequentDrugs, getImportantDrugs } from "@/lib/drugs";
import { getCompletedTopics, useStoreTick } from "@/lib/store";
import { getTopic } from "@/lib/topics";

const CRASH = [
  { topic: "antibiotics", label: "Antibiotics crash revision", icon: "🦠" },
  { topic: "cardiovascular-drugs", label: "CVS crash revision", icon: "❤️" },
  { topic: "cns-drugs", label: "CNS crash revision", icon: "🧠" },
] as const;

export default function RevisionPage() {
  useStoreTick();
  // Read localStorage only after mount to avoid a hydration mismatch.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const quick = getQuickRevisionDrugs(12);
  const weak = getWeakDrugs(mounted ? getCompletedTopics() : [], 8);
  const lastMinute = getImportantDrugs();
  const frequent = new Set(getFrequentDrugs().map((d) => d.id));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Revision</h1>
        <p className="text-sm text-slate-500">Last-minute, high-yield revision before the exam.</p>
      </div>

      {/* 15-minute quick revision */}
      <div className="card p-5">
        <div className="flex items-center justify-between">
          <div className="section-title">⏱️ 15-minute quick revision</div>
          <span className="text-[11px] text-slate-400">{quick.length} high-yield drugs</span>
        </div>
        <p className="mt-1 text-sm text-slate-500">One-line mechanism for each must-know drug. Then test yourself.</p>
        <div className="mt-3 space-y-1.5">
          {quick.map((d) => (
            <Link key={d.id} href={`/drug/${d.id}`} className="flex items-start gap-2 rounded-lg px-2 py-1.5 hover:bg-slate-50">
              <span className="mt-0.5 text-brand-500">•</span>
              <span className="text-sm text-slate-700">
                <b className="text-slate-800">{d.name}</b> — <span className="text-slate-500">{d.moa}</span>
              </span>
            </Link>
          ))}
        </div>
        <div className="mt-3 flex gap-2">
          <Link href="/flashcards" className="btn-primary flex-1 text-center">🃏 Start flashcards</Link>
          <Link href="/exam" className="btn-ghost flex-1 text-center">📝 Random 20 test</Link>
        </div>
      </div>

      {/* Today's weak drugs */}
      <div className="card p-5">
        <div className="section-title mb-2">🎯 Today’s weak drugs</div>
        <p className="mb-3 text-xs text-slate-400">From topics you haven’t marked complete yet.</p>
        <div className="grid gap-2 sm:grid-cols-2">
          {weak.map((d) => (
            <Link key={d.id} href={`/drug/${d.id}`} className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2 hover:bg-slate-50">
              <span className="text-sm font-medium text-slate-700">{d.name}</span>
              <span className="text-[10px] text-slate-400">{getTopic(d.topic)?.icon} revise →</span>
            </Link>
          ))}
        </div>
      </div>

      {/* General Pharmacology concept crash revision */}
      <div className="card p-5">
        <div className="flex items-center gap-2">
          <span className="text-xl">🧪</span>
          <span className="font-semibold text-slate-800">General Pharmacology Crash Revision</span>
        </div>
        <p className="mt-1 text-xs text-slate-400">Must-know concepts in one line. Tap for the full concept card.</p>
        <div className="mt-3 space-y-1.5">
          {getConceptCrashList().map((c) => (
            <Link key={c.id} href={`/concept/${c.id}`} className="block rounded-lg px-2 py-1.5 hover:bg-slate-50">
              <span className="text-sm text-slate-700">
                <b className="text-slate-800">{c.title}</b> — <span className="text-slate-500">{c.oneLine}</span>
              </span>
            </Link>
          ))}
        </div>
        <Link href="/topics/general-pharmacology" className="mt-2 inline-block text-xs text-brand-600 hover:underline">
          All concepts →
        </Link>
      </div>

      {/* Crash revisions */}
      <div className="space-y-3">
        {CRASH.map((c) => (
          <CrashCard key={c.topic} topic={c.topic} label={c.label} icon={c.icon} />
        ))}
      </div>

      {/* Last-minute exam list */}
      <div className="card p-5">
        <div className="section-title mb-2">📋 Last-minute exam list</div>
        <p className="mb-3 text-xs text-slate-400">
          All exam-important drugs. <span className="text-amber-600">🔁</span> = frequently asked.
        </p>
        <div className="grid grid-cols-1 gap-x-6 gap-y-1 sm:grid-cols-2">
          {lastMinute.map((d, i) => (
            <Link key={d.id} href={`/drug/${d.id}`} className="flex items-center justify-between border-b border-slate-100 py-1 text-sm hover:text-brand-700">
              <span className="text-slate-700">
                <span className="mr-2 text-slate-300">{i + 1}.</span>
                {d.name}
              </span>
              {frequent.has(d.id) && <span className="text-xs text-amber-600">🔁</span>}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

function CrashCard({ topic, label, icon }: { topic: string; label: string; icon: string }) {
  const [open, setOpen] = useState(false);
  const items = getCrashList(topic);
  return (
    <div className="card p-5">
      <button onClick={() => setOpen((o) => !o)} className="flex w-full items-center justify-between">
        <span className="flex items-center gap-2 font-semibold text-slate-800">
          <span className="text-xl">{icon}</span> {label}
        </span>
        <span className="text-sm text-slate-400">{items.length} drugs {open ? "−" : "+"}</span>
      </button>
      {open && (
        <div className="mt-3 space-y-1.5">
          {items.map((it) => (
            <Link key={it.id} href={`/drug/${it.id}`} className="block rounded-lg px-2 py-1.5 hover:bg-slate-50">
              <div className="text-sm font-medium text-slate-800">
                {it.name} <span className="text-xs font-normal text-brand-600">· {it.drugClass}</span>
              </div>
              <div className="text-xs text-slate-500">{it.keyPoint}</div>
            </Link>
          ))}
          <Link href={`/exam?topic=${topic}`} className="mt-2 inline-block text-xs text-brand-600 hover:underline">
            Test this topic →
          </Link>
        </div>
      )}
    </div>
  );
}
