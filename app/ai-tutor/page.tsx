"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { PRESETS, Preset, localAnswer, ALL_DRUGS_MIN } from "@/lib/tutor";
import { getDrug } from "@/lib/drugs";
import { getSettings } from "@/lib/store";

interface Msg {
  role: "user" | "tutor";
  text: string;
}

function AiTutorInner() {
  const params = useSearchParams();
  const initialDrug = params.get("drug") ?? ALL_DRUGS_MIN[0].id;

  const [drugA, setDrugA] = useState(initialDrug);
  const [drugB, setDrugB] = useState(ALL_DRUGS_MIN[1].id);
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "tutor",
      text: "👋 Hi! Pick a drug and tap a preset, or type your own question. I answer using your PharmaOS library. Add an API key to enable full Claude answers.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  async function run(preset: Preset) {
    const d = getDrug(drugA);
    const label = PRESETS.find((p) => p.id === preset)?.label ?? "";
    const userText =
      preset === "compare"
        ? `Compare ${getDrug(drugA)?.name} vs ${getDrug(drugB)?.name}`
        : `${label}: ${d?.name}`;
    push("user", userText);

    // Try the API route; fall back to local generation.
    setLoading(true);
    const local = localAnswer(preset, drugA, drugB);
    try {
      const res = await fetch("/api/tutor", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ prompt: `${userText}\n\nContext:\n${local}`, language: getSettings().aiLanguage }),
      });
      const data = await res.json();
      if (data.configured && data.text) push("tutor", data.text);
      else push("tutor", local);
    } catch {
      push("tutor", local);
    }
    setLoading(false);
  }

  async function ask() {
    const q = input.trim();
    if (!q) return;
    push("user", q);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/tutor", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ prompt: q, language: getSettings().aiLanguage }),
      });
      const data = await res.json();
      if (data.configured && data.text) push("tutor", data.text);
      else
        push(
          "tutor",
          "💡 Free-text answers need a connected API key. For now, use the preset buttons above — they work offline from your drug library. (See README to add ANTHROPIC_API_KEY.)",
        );
    } catch {
      push("tutor", "Network error. Preset buttons still work offline.");
    }
    setLoading(false);
  }

  function push(role: "user" | "tutor", text: string) {
    setMessages((m) => [...m, { role, text }]);
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">AI Tutor</h1>
        <p className="text-sm text-slate-500">Quick explanations, comparisons, viva & MCQs from your library.</p>
      </div>

      {/* Drug selectors */}
      <div className="card grid grid-cols-2 gap-3 p-4">
        <label className="text-xs text-slate-500">
          Drug
          <select value={drugA} onChange={(e) => setDrugA(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 px-2 py-2 text-sm text-slate-800">
            {ALL_DRUGS_MIN.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </label>
        <label className="text-xs text-slate-500">
          Compare with
          <select value={drugB} onChange={(e) => setDrugB(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 px-2 py-2 text-sm text-slate-800">
            {ALL_DRUGS_MIN.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </label>
      </div>

      {/* Preset buttons */}
      <div className="flex flex-wrap gap-2">
        {PRESETS.map((p) => (
          <button key={p.id} onClick={() => run(p.id)} disabled={loading} className="btn-ghost text-xs">
            {p.label}
          </button>
        ))}
      </div>

      {/* Chat */}
      <div className="card space-y-3 p-4">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm ${
                m.role === "user" ? "bg-brand-600 text-white" : "bg-slate-100 text-slate-700"
              }`}
            >
              {m.text}
            </div>
          </div>
        ))}
        {loading && <div className="text-xs text-slate-400">Thinking…</div>}
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && ask()}
          placeholder="Ask anything… (needs API key for free text)"
          className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none"
        />
        <button onClick={ask} disabled={loading} className="btn-primary">Send</button>
      </div>
    </div>
  );
}

export default function AiTutorPage() {
  return (
    <Suspense fallback={<div className="text-sm text-slate-400">Loading…</div>}>
      <AiTutorInner />
    </Suspense>
  );
}
