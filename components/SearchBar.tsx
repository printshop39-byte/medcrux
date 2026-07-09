"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { searchDrugs } from "@/lib/content";
import { getTopic } from "@/lib/topics";

export function SearchBar() {
  const [q, setQ] = useState("");
  const [focused, setFocused] = useState(false);
  const results = useMemo(() => searchDrugs(q).slice(0, 8), [q]);

  return (
    <div className="relative">
      <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
        <span className="text-slate-400">🔍</span>
        <input
          data-search-input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 150)}
          placeholder="Search drug, class, disease, side effect…"
          className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
        />
        {q && (
          <button onClick={() => setQ("")} className="text-slate-400 hover:text-slate-600">
            ✕
          </button>
        )}
      </div>

      {focused && q && (
        <div className="absolute inset-x-0 top-12 z-40 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
          {results.length === 0 ? (
            <div className="px-4 py-3 text-sm text-slate-400">No drugs found for “{q}”.</div>
          ) : (
            results.map((r) => (
              <Link
                key={r.drugId}
                href={`/drug/${r.drugId}`}
                className="flex items-center justify-between gap-3 px-4 py-2.5 hover:bg-slate-50"
              >
                <div>
                  <div className="text-sm font-medium text-slate-800">{r.name}</div>
                  <div className="text-xs text-slate-400">{r.drugClass}</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-400">
                    {getTopic(r.topic)?.icon} match: {r.matchedOn}
                  </span>
                </div>
              </Link>
            ))
          )}
          <Link
            href={`/search?q=${encodeURIComponent(q)}`}
            className="block border-t border-slate-100 bg-slate-50 px-4 py-2.5 text-center text-xs font-medium text-brand-700 hover:bg-slate-100"
          >
            🔎 Advanced search &amp; filters for “{q}” →
          </Link>
        </div>
      )}
    </div>
  );
}
