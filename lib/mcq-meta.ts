// MCQ metadata + competency inference (Mistake Intelligence). Kept in its own
// lightweight module — importing only ./types — so components like MCQBlock can
// classify any MCQ without pulling in the full drug dataset from lib/content.

import type { Competency, Difficulty, MCQ } from "./types";

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
