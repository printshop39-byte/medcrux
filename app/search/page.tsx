"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { filterDrugs, getDrugClasses, DrugFilters } from "@/lib/content";
import { TOPICS, getTopic } from "@/lib/topics";
import { isBookmarked, useStoreTick } from "@/lib/store";

const QUICK = [
  { topic: "", label: "All", icon: "🔎" },
  { topic: "antibiotics", label: "Antibiotics only", icon: "🦠" },
  { topic: "cardiovascular-drugs", label: "CVS only", icon: "❤️" },
  { topic: "cns-drugs", label: "CNS only", icon: "🧠" },
] as const;

function SearchInner() {
  const params = useSearchParams();
  useStoreTick();

  const [filters, setFilters] = useState<DrugFilters>({
    query: params.get("q") ?? "",
    topic: params.get("topic") ?? "",
    drugClass: "",
    importantOnly: false,
    frequentOnly: false,
    sideEffect: "",
    use: "",
  });

  const set = <K extends keyof DrugFilters>(k: K, v: DrugFilters[K]) =>
    setFilters((f) => ({ ...f, [k]: v }));

  const classes = useMemo(() => getDrugClasses(), []);
  const results = useMemo(() => filterDrugs(filters), [filters]);

  const activeCount =
    (filters.query ? 1 : 0) +
    (filters.topic ? 1 : 0) +
    (filters.drugClass ? 1 : 0) +
    (filters.importantOnly ? 1 : 0) +
    (filters.frequentOnly ? 1 : 0) +
    (filters.sideEffect ? 1 : 0) +
    (filters.use ? 1 : 0);

  function reset() {
    setFilters({ query: "", topic: "", drugClass: "", importantOnly: false, frequentOnly: false, sideEffect: "", use: "" });
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Search &amp; Filters</h1>
        <p className="text-sm text-slate-500">Find drugs by name, class, topic, tag, side effect or disease.</p>
      </div>

      {/* Quick topic chips */}
      <div className="flex flex-wrap gap-2">
        {QUICK.map((c) => {
          const active = filters.topic === c.topic;
          return (
            <button
              key={c.label}
              onClick={() => set("topic", c.topic)}
              className={`rounded-full border px-3 py-1.5 text-sm font-medium transition ${
                active ? "border-brand-600 bg-brand-600 text-white" : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              {c.icon} {c.label}
            </button>
          );
        })}
      </div>

      {/* Filters */}
      <div className="card space-y-4 p-5">
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-500">Drug name or class</label>
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
            <span className="text-slate-400">🔍</span>
            <input
              value={filters.query}
              onChange={(e) => set("query", e.target.value)}
              placeholder="e.g. metoprolol, beta blocker…"
              className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
            />
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">Topic</label>
            <select value={filters.topic} onChange={(e) => set("topic", e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm">
              <option value="">Any topic</option>
              {TOPICS.map((t) => (
                <option key={t.slug} value={t.slug}>{t.title}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">Drug class</label>
            <select value={filters.drugClass} onChange={(e) => set("drugClass", e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm">
              <option value="">Any class</option>
              {classes.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">Side effect contains</label>
            <input
              value={filters.sideEffect}
              onChange={(e) => set("sideEffect", e.target.value)}
              placeholder="e.g. cough, bradycardia…"
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">Disease / use contains</label>
            <input
              value={filters.use}
              onChange={(e) => set("use", e.target.value)}
              placeholder="e.g. hypertension, asthma…"
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <label className="flex items-center gap-2 text-sm text-slate-600">
            <input type="checkbox" checked={!!filters.importantOnly} onChange={(e) => set("importantOnly", e.target.checked)} className="h-4 w-4 accent-brand-600" />
            ⭐ Important for exam
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-600">
            <input type="checkbox" checked={!!filters.frequentOnly} onChange={(e) => set("frequentOnly", e.target.checked)} className="h-4 w-4 accent-brand-600" />
            🔁 Asked frequently
          </label>
          {activeCount > 0 && (
            <button onClick={reset} className="ml-auto text-sm text-slate-400 hover:text-rose-500">
              Clear filters ✕
            </button>
          )}
        </div>
      </div>

      {/* Results */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-600">
          {results.length} result{results.length === 1 ? "" : "s"}
        </span>
        {activeCount > 0 && <span className="text-xs text-slate-400">{activeCount} filter{activeCount === 1 ? "" : "s"} active</span>}
      </div>

      {results.length === 0 ? (
        <div className="card p-8 text-center text-sm text-slate-500">
          No drugs match these filters. Try clearing some.
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {results.map((d) => (
            <Link key={d.id} href={`/drug/${d.id}`} className="card p-4 transition hover:shadow-md">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-800">{d.name}</span>
                {isBookmarked(d.id) && <span>🔖</span>}
              </div>
              <div className="mt-0.5 text-xs font-medium text-brand-600">{d.drugClass}</div>
              <div className="mt-1 text-[11px] text-slate-400">{getTopic(d.topic)?.icon} {getTopic(d.topic)?.title}</div>
              <div className="mt-2 flex flex-wrap gap-1">
                {d.importantForExam && <span className="rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-semibold text-rose-600">⭐ Important</span>}
                {d.askedFrequently && <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-600">🔁 Frequent</span>}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="text-sm text-slate-400">Loading…</div>}>
      <SearchInner />
    </Suspense>
  );
}
