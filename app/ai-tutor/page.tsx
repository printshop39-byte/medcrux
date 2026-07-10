"use client";

import { Suspense, useEffect, useState } from "react";
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
      text: "👋 Hi! Pick a drug and tap a preset, or type your own question — I answer from your MedCrux study library.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  // Whether the server-side AI is configured (never involves any key on the
  // client). Probed once via a cheap GET so we can show the right mode banner.
  const [aiEnhanced, setAiEnhanced] = useState(false);
  useEffect(() => {
    fetch("/api/tutor")
      .then((r) => r.json())
      .then((d) => setAiEnhanced(Boolean(d?.configured)))
      .catch(() => {});
  }, []);

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
          "💡 Typed questions are answered in AI-enhanced mode. For now, tap a preset above — those answer instantly from your MedCrux study library.",
        );
    } catch {
      push("tutor", "Network hiccup — the preset buttons above still answer from your library.");
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

      {/* Mode banner — offline by default, "AI enhanced" if the server AI is on.
          Never asks the student for a key. */}
      <div
        className={`flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium ${
          aiEnhanced ? "bg-brand-50 text-brand-700" : "bg-emerald-50 text-emerald-700"
        }`}
      >
        <span>{aiEnhanced ? "⚡" : "✅"}</span>
        {aiEnhanced
          ? "AI enhanced mode active."
          : "Offline tutor active — answers use your MedCrux study library."}
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
          placeholder="Ask anything, or tap a preset above…"
          className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 outline-none"
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
