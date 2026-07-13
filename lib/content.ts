import { DRUGS, getImportantDrugs } from "./drugs";
import { TOPICS } from "./topics";
import { CONCEPTS } from "./concepts";
import { PRESCRIPTIONS } from "./prescriptions";
import { Competency, Difficulty, Drug, Flashcard, MCQ } from "./types";

// Flashcards are generated from drug AND concept data — single source of truth.
// - No topic         → all concept cards + all drug cards
// - "general-pharmacology" → concept cards only
// - any other topic  → that topic's drug cards only
export function getFlashcards(topic?: string): Flashcard[] {
  const drugSource =
    topic === "general-pharmacology" ? [] : topic ? DRUGS.filter((d) => d.topic === topic) : DRUGS;

  const drugCards: Flashcard[] = drugSource.map((d) => ({
    id: `fc-${d.id}`,
    kind: "drug",
    drugId: d.id,
    topic: d.topic,
    front: d.name,
    back: [
      `Class: ${d.drugClass}`,
      `MOA: ${d.moa}`,
      `Uses: ${d.uses.slice(0, 3).join(", ")}`,
      `Side effects: ${d.sideEffects.slice(0, 3).join(", ")}`,
    ].join("\n"),
  }));

  const conceptCards: Flashcard[] =
    !topic || topic === "general-pharmacology"
      ? CONCEPTS.map((c) => ({
          id: `fc-concept-${c.id}`,
          kind: "concept",
          conceptId: c.id,
          topic: "general-pharmacology",
          front: c.title,
          back: [
            `Definition: ${c.definition}`,
            `Exam answer: ${c.examAnswer}`,
            `Example: ${c.example}`,
            c.mnemonic ? `Mnemonic: ${c.mnemonic}` : "",
          ]
            .filter(Boolean)
            .join("\n"),
        }))
      : [];

  return [...conceptCards, ...drugCards];
}

export interface MCQWithMeta extends MCQ {
  drugId: string;
  drugName: string;
  topic: string;
}

// ── MCQ metadata (Mistake Intelligence) ──────────────────────────────────────
export const COMPETENCY_LABEL: Record<Competency, string> = {
  moa: "Mechanism of action",
  uses: "Uses / indications",
  "adverse-effects": "Adverse effects",
  contraindications: "Contraindications",
  interactions: "Drug interactions",
  viva: "Viva",
  general: "General",
};

// Infer which competency an MCQ tests from its wording when it isn't tagged.
// Ordered so the most specific patterns win. Never throws — defaults to "general".
export function inferCompetency(mcq: MCQ): Competency {
  if (mcq.competency) return mcq.competency;
  const q = `${mcq.question} ${mcq.explanation}`.toLowerCase();
  if (/contraindicat|avoided in|not be given/.test(q)) return "contraindications";
  if (/interact|combined with|avoid with|together with|potentiat|raises? .*levels|reduce.*effect of/.test(q)) return "interactions";
  if (/side effect|adverse|toxicit|hepatotox|nephrotox|ototox|syndrome|risk of/.test(q)) return "adverse-effects";
  if (/mechanism|acts? by|inhibit|blocks?|agonist|antagonist|binds|receptor|channel/.test(q)) return "moa";
  if (/used for|use of|drug of choice|indicat|treatment of|preferred|first-line/.test(q)) return "uses";
  return "general";
}

export interface McqMeta {
  difficulty: Difficulty;
  competency: Competency;
  expectedTimeSeconds: number;
}

// Metadata with safe defaults so any MCQ (tagged or not) can be classified.
export function mcqMeta(mcq: MCQ): McqMeta {
  return {
    difficulty: mcq.difficulty ?? "medium",
    competency: inferCompetency(mcq),
    expectedTimeSeconds: mcq.expectedTimeSeconds ?? 60,
  };
}

export function getMCQs(topic?: string): MCQWithMeta[] {
  const drugs = topic ? DRUGS.filter((d) => d.topic === topic) : DRUGS;
  return drugs.flatMap((d) =>
    d.mcqs.map((m) => ({ ...m, drugId: d.id, drugName: d.name, topic: d.topic })),
  );
}

export interface VivaWithMeta {
  q: string;
  a: string;
  drugId: string;
  drugName: string;
  topic: string;
}

export function getVivaQuestions(topic?: string): VivaWithMeta[] {
  const drugs = topic ? DRUGS.filter((d) => d.topic === topic) : DRUGS;
  return drugs.flatMap((d) =>
    d.vivaQuestions.map((v) => ({ ...v, drugId: d.id, drugName: d.name, topic: d.topic })),
  );
}

// Deterministic shuffle (seeded) so server & client render the same order and
// avoid hydration mismatches. Uses a simple LCG.
export function seededShuffle<T>(arr: T[], seed: number): T[] {
  const a = [...arr];
  let s = seed || 1;
  for (let i = a.length - 1; i > 0; i--) {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    const j = s % (i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Stable, well-distributed 31-bit hash of a string (FNV-1a). Used to derive a
// per-question shuffle seed so each MCQ's option order is fixed but decorrelated.
export function hashString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h & 0x7fffffff;
}

// mulberry32 — a compact, good-quality deterministic PRNG. Unlike the LCG in
// seededShuffle, its low-order bits are well mixed, so it distributes uniformly
// even for tiny arrays (a 4-option shuffle uses only the low bits).
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Some options only make sense in their authored position ("Both", "Neither",
// "All of the above", "A and B", …). Shuffling those would change the question's
// meaning, so such questions are left untouched.
const ANCHORED_OPTION = /^(both|neither)$|\b(all|none) of (the above|these)\b|\b[a-d]\s*(and|&|,)\s*[a-d]\b/;

export function hasAnchoredOptions(options: string[]): boolean {
  return options.some((o) => ANCHORED_OPTION.test(o.trim().toLowerCase()));
}

// The source MCQ data is heavily biased toward option B — the correct answer sits
// at index 1 in ~3/4 of questions — which lets a student pass by always picking B.
// shuffleMCQOptions permutes a question's options and remaps answerIndex so the
// correct answer is spread across positions. Deterministic given the same seed.
export function shuffleMCQOptions<T extends MCQ>(q: T, seed: number): T {
  if (hasAnchoredOptions(q.options)) return q;
  const rng = mulberry32(seed);
  const order = q.options.map((_, i) => i);
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  return {
    ...q,
    options: order.map((i) => q.options[i]),
    answerIndex: order.indexOf(q.answerIndex),
  };
}

export interface SearchResult {
  drugId: string;
  name: string;
  drugClass: string;
  topic: string;
  matchedOn: string;
}

export function searchDrugs(query: string): SearchResult[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const results: SearchResult[] = [];
  for (const d of DRUGS) {
    let matchedOn = "";
    if (d.name.toLowerCase().includes(q)) matchedOn = "name";
    else if (d.drugClass.toLowerCase().includes(q)) matchedOn = "class";
    else if (d.uses.some((u) => u.toLowerCase().includes(q))) matchedOn = "use / disease";
    else if (d.sideEffects.some((s) => s.toLowerCase().includes(q))) matchedOn = "side effect";
    else if (d.moa.toLowerCase().includes(q)) matchedOn = "mechanism";
    if (matchedOn) {
      results.push({ drugId: d.id, name: d.name, drugClass: d.drugClass, topic: d.topic, matchedOn });
    }
  }
  return results;
}

// ── Advanced multi-field drug filtering (Search page) ────────────────────────
export interface DrugFilters {
  query?: string; // matches drug name or class
  topic?: string; // topic slug ("" = any)
  drugClass?: string; // exact class ("" = any)
  importantOnly?: boolean;
  frequentOnly?: boolean;
  sideEffect?: string; // substring match on side effects
  use?: string; // substring match on uses / diseases
}

// Distinct drug classes for the class dropdown.
export function getDrugClasses(): string[] {
  return Array.from(new Set(DRUGS.map((d) => d.drugClass))).sort((a, b) => a.localeCompare(b));
}

export function filterDrugs(f: DrugFilters): Drug[] {
  const q = (f.query ?? "").trim().toLowerCase();
  const se = (f.sideEffect ?? "").trim().toLowerCase();
  const use = (f.use ?? "").trim().toLowerCase();
  return DRUGS.filter((d) => {
    if (f.topic && d.topic !== f.topic) return false;
    if (f.drugClass && d.drugClass !== f.drugClass) return false;
    if (f.importantOnly && !d.importantForExam) return false;
    if (f.frequentOnly && !d.askedFrequently) return false;
    if (q && !(d.name.toLowerCase().includes(q) || d.drugClass.toLowerCase().includes(q))) return false;
    if (se && !d.sideEffects.some((s) => s.toLowerCase().includes(se))) return false;
    if (use && !d.uses.some((u) => u.toLowerCase().includes(use))) return false;
    return true;
  });
}

// ── Short-answer questions (Russian exam "напишите…") ────────────────────────
// Generated from drug fields + concept exam answers. Deterministic templates.
export interface ShortAnswerQ {
  id: string;
  prompt: string;
  answer: string;
  source: string; // drug name or concept title
  topic: string;
}

export function getShortAnswers(topic?: string): ShortAnswerQ[] {
  const out: ShortAnswerQ[] = [];

  // Concept short answers belong to General Pharmacology.
  if (!topic || topic === "general-pharmacology") {
    for (const c of CONCEPTS) {
      out.push({
        id: `sa-${c.id}`,
        prompt: `Define / explain: ${c.title}`,
        answer: c.examAnswer,
        source: c.title,
        topic: "general-pharmacology",
      });
    }
  }

  const drugs =
    topic === "general-pharmacology"
      ? []
      : topic
        ? DRUGS.filter((d) => d.topic === topic)
        : DRUGS;

  for (const d of drugs) {
    out.push({ id: `sa-${d.id}-moa`, prompt: `Write the mechanism of action of ${d.name}.`, answer: d.moa, source: d.name, topic: d.topic });
    out.push({ id: `sa-${d.id}-uses`, prompt: `Enumerate the therapeutic uses of ${d.name}.`, answer: d.uses.join("; "), source: d.name, topic: d.topic });
    out.push({ id: `sa-${d.id}-se`, prompt: `List the important side effects of ${d.name}.`, answer: d.sideEffects.join("; "), source: d.name, topic: d.topic });
    if (d.contraindications.length)
      out.push({ id: `sa-${d.id}-ci`, prompt: `State the contraindications of ${d.name}.`, answer: d.contraindications.join("; "), source: d.name, topic: d.topic });
  }
  return out;
}

// ── Revision helpers ─────────────────────────────────────────────────────────
// Condensed one-line takeaway for crash-revision lists.
export interface CrashItem {
  id: string;
  name: string;
  drugClass: string;
  keyPoint: string;
}

export function getCrashList(topic: string): CrashItem[] {
  return DRUGS.filter((d) => d.topic === topic).map((d) => ({
    id: d.id,
    name: d.name,
    drugClass: d.drugClass,
    keyPoint: d.moa,
  }));
}

// One-line concept crash revision for General Pharmacology.
export interface ConceptCrashItem {
  id: string;
  title: string;
  oneLine: string;
}

const CONCEPT_CRASH_IDS = [
  "pharmacokinetics",
  "pharmacodynamics",
  "bioavailability",
  "half-life",
  "therapeutic-index",
  "adverse-drug-reactions",
  "cyp450-interactions",
  "prescription-writing",
];

export function getConceptCrashList(): ConceptCrashItem[] {
  return CONCEPT_CRASH_IDS.map((id) => CONCEPTS.find((c) => c.id === id))
    .filter((c): c is (typeof CONCEPTS)[number] => Boolean(c))
    .map((c) => ({ id: c.id, title: c.title, oneLine: c.definition }));
}

// A rotating quick-revision set of the most important drugs.
export function getQuickRevisionDrugs(count = 12): Drug[] {
  return getImportantDrugs().slice(0, count);
}

// Weak drugs = drugs from topics the student hasn't marked complete.
export function getWeakDrugs(completedTopics: string[], count = 8): Drug[] {
  const weak = DRUGS.filter((d) => !completedTopics.includes(d.topic));
  return (weak.length ? weak : DRUGS).slice(0, count);
}

export const STATS = {
  drugCount: DRUGS.length,
  topicCount: TOPICS.length,
  mcqCount: getMCQs().length,
  flashcardCount: getFlashcards().length,
  vivaCount: getVivaQuestions().length,
  conceptCount: CONCEPTS.length,
  shortAnswerCount: getShortAnswers().length,
  prescriptionCount: PRESCRIPTIONS.length,
};
