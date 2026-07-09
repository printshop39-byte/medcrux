import { DRUGS, getDrug } from "./drugs";
import { Drug } from "./types";

export type Preset =
  | "explain30"
  | "simple"
  | "russian"
  | "compare"
  | "viva"
  | "mcq";

export const PRESETS: { id: Preset; label: string; needsTwo?: boolean }[] = [
  { id: "explain30", label: "Explain in 30 seconds" },
  { id: "simple", label: "Explain in simple English" },
  { id: "russian", label: "Explain in Russian" },
  { id: "compare", label: "Compare two drugs", needsTwo: true },
  { id: "viva", label: "Generate viva questions" },
  { id: "mcq", label: "Generate MCQs" },
];

// Local, offline answer generation from the seed data. Used when no API key is
// configured. Returns markdown-ish plain text.
export function localAnswer(preset: Preset, drugA?: string, drugB?: string): string {
  const a = drugA ? getDrug(drugA) : undefined;

  switch (preset) {
    case "explain30":
      return a ? explain30(a) : pickPrompt();
    case "simple":
      return a ? simple(a) : pickPrompt();
    case "russian":
      return a ? russian(a) : pickPrompt();
    case "viva":
      return a ? viva(a) : pickPrompt();
    case "mcq":
      return a ? mcq(a) : pickPrompt();
    case "compare": {
      const b = drugB ? getDrug(drugB) : undefined;
      if (!a || !b) return "Pick two drugs to compare using the selectors above.";
      return compare(a, b);
    }
    default:
      return pickPrompt();
  }
}

function pickPrompt() {
  return "Select a drug above, then tap a preset button.";
}

function explain30(d: Drug): string {
  return [
    `⏱️ ${d.name} in 30 seconds`,
    `• Class: ${d.drugClass}`,
    `• How it works: ${d.moa}`,
    `• Main uses: ${d.uses.slice(0, 3).join(", ")}`,
    `• Watch out for: ${d.sideEffects.slice(0, 2).join(", ")}`,
    d.mnemonic ? `• Remember: ${d.mnemonic}` : "",
  ].filter(Boolean).join("\n");
}

function simple(d: Drug): string {
  return [
    `🟢 ${d.name} — simple explanation`,
    `${d.name} is a ${d.drugClass.toLowerCase()}.`,
    `In plain words: ${d.moa}`,
    `Doctors give it mainly for: ${d.uses.slice(0, 3).join(", ")}.`,
    `The common problems it can cause are ${d.sideEffects.slice(0, 3).join(", ")}.`,
    `Avoid it when: ${d.contraindications.slice(0, 2).join(", ")}.`,
  ].join("\n");
}

function russian(d: Drug): string {
  // Basic Russian scaffold with the drug's data. Full natural-language Russian
  // explanations activate when an API key is connected (see /api/tutor).
  return [
    `🇷🇺 ${d.name}`,
    `• Класс (Class): ${d.drugClass}`,
    `• Механизм действия (MOA): ${d.moa}`,
    `• Показания (Uses): ${d.uses.slice(0, 3).join(", ")}`,
    `• Побочные эффекты (Side effects): ${d.sideEffects.slice(0, 3).join(", ")}`,
    `• Противопоказания (Contraindications): ${d.contraindications.slice(0, 2).join(", ")}`,
    ``,
    `ℹ️ Подключите API-ключ для полного объяснения на русском языке.`,
  ].join("\n");
}

function viva(d: Drug): string {
  const lines = d.vivaQuestions.map((v, i) => `${i + 1}. ${v.q}\n   → ${v.a}`);
  return [`🎤 Viva questions — ${d.name}`, ...lines].join("\n");
}

function mcq(d: Drug): string {
  const blocks = d.mcqs.map((m, i) => {
    const opts = m.options.map((o, j) => `   ${String.fromCharCode(65 + j)}. ${o}`).join("\n");
    return `Q${i + 1}. ${m.question}\n${opts}\n   ✅ Answer: ${String.fromCharCode(65 + m.answerIndex)} — ${m.explanation}`;
  });
  return [`📝 MCQs — ${d.name}`, ...blocks].join("\n\n");
}

function compare(a: Drug, b: Drug): string {
  const row = (label: string, x: string, y: string) => `• ${label}\n   ${a.name}: ${x}\n   ${b.name}: ${y}`;
  return [
    `⚖️ ${a.name} vs ${b.name}`,
    row("Class", a.drugClass, b.drugClass),
    row("MOA", a.moa, b.moa),
    row("Uses", a.uses.slice(0, 3).join(", "), b.uses.slice(0, 3).join(", ")),
    row("Side effects", a.sideEffects.slice(0, 3).join(", "), b.sideEffects.slice(0, 3).join(", ")),
    row("Contraindications", a.contraindications.slice(0, 2).join(", "), b.contraindications.slice(0, 2).join(", ")),
  ].join("\n");
}

export const ALL_DRUGS_MIN = DRUGS.map((d) => ({ id: d.id, name: d.name }));
