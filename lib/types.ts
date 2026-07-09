// Core domain types for PharmaOS. These mirror the Supabase/Postgres schema
// in db/schema.sql so the local seed layer can be swapped for a real DB later.

export type TopicSlug =
  | "general-pharmacology"
  | "autonomic-nervous-system"
  | "cardiovascular-drugs"
  | "cns-drugs"
  | "antibiotics"
  | "antimicrobials"
  | "endocrine-pharmacology"
  | "nsaids-analgesics"
  | "autacoids";

export interface Topic {
  slug: TopicSlug;
  title: string;
  description: string;
  icon: string; // emoji used as a lightweight icon
  order: number;
}

export interface MCQ {
  id: string;
  question: string;
  options: string[];
  answerIndex: number;
  explanation: string;
}

export interface Drug {
  id: string;
  name: string;
  topic: TopicSlug;
  drugClass: string;
  moa: string;
  uses: string[];
  sideEffects: string[];
  contraindications: string[];
  interactions: string[];
  mnemonic?: string;
  vivaQuestions: { q: string; a: string }[];
  mcqs: MCQ[];
  // Russian-exam tags. Optional so JSON/CSV imports can omit them — defaults are
  // applied at load time in lib/drugs.ts.
  importantForExam?: boolean;
  askedFrequently?: boolean;
}

// General Pharmacology concept card (non-drug topic).
export interface Concept {
  id: string;
  title: string;
  definition: string;
  examAnswer: string; // concise exam short-answer
  viva: { q: string; a: string };
  example: string;
  mnemonic?: string;
}

// Prescription-writing (рецептура) practice item.
export interface Prescription {
  id: string;
  drug: string;
  indication: string;
  form: string; // e.g. "Tablets", "Injection"
  rx: string; // model prescription in Rp./D.t.d./S. format
  note?: string;
}

// Flashcards are derived from drugs AND concepts at runtime, but the type is kept
// explicit so a future DB-backed flashcard table maps cleanly.
export interface Flashcard {
  id: string;
  kind: "drug" | "concept";
  drugId?: string; // set when kind === "drug"
  conceptId?: string; // set when kind === "concept"
  front: string;
  back: string;
  topic: TopicSlug;
}

export type Difficulty = "easy" | "medium" | "hard";
