// Microbiology progress summariser. Reads the (SSR-safe) localStorage getters in
// lib/store.ts and combines them into per-topic mastery + an overall subject
// readiness score. The weighting mirrors the exam-readiness formula in
// docs/ARCHITECTURE_V2.md so scoring stays consistent across the app.
//
// Called only from client components after mount (same pattern as lib/content.ts).

import { MICRO_TOPICS } from "./microbiology";
import { getCompletedTopics, getSubjectMCQScores, getVivaDone, getCardDifficulty } from "./store";

// Flashcard id convention used on the Microbiology topic page.
export function microFlashcardId(topicSlug: string, index: number): string {
  return `micro-fc-${topicSlug}-${index}`;
}

export interface MicroTopicProgress {
  slug: string;
  title: string;
  icon: string;
  completed: boolean;
  mcqAttempted: number;
  mcqCorrect: number;
  mcqAccuracy: number | null; // 0..1, null if none attempted
  vivaDone: number;
  vivaTotal: number;
  cardsMastered: number; // flashcards marked "easy"
  cardsTotal: number;
  percent: number; // 0..100 topic mastery
  weak: boolean;
}

// readiness = 0.30 coverage + 0.30 mcq accuracy + 0.20 flashcard memory + 0.20 viva
function topicPercent(p: {
  completed: boolean;
  mcqAccuracy: number | null;
  vivaDone: number;
  vivaTotal: number;
  cardsMastered: number;
  cardsTotal: number;
}): number {
  const coverage = p.completed ? 1 : 0;
  const mcq = p.mcqAccuracy ?? 0;
  const viva = p.vivaTotal ? p.vivaDone / p.vivaTotal : 0;
  const cards = p.cardsTotal ? p.cardsMastered / p.cardsTotal : 0;
  return Math.round(100 * (0.3 * coverage + 0.3 * mcq + 0.2 * cards + 0.2 * viva));
}

export function getMicroTopicProgress(): MicroTopicProgress[] {
  const completed = getCompletedTopics();
  const scores = getSubjectMCQScores();
  const viva = getVivaDone();
  const diff = getCardDifficulty();

  return MICRO_TOPICS.map((t) => {
    const score = scores[t.slug] ?? { attempted: 0, correct: 0 };
    const mcqAccuracy = score.attempted ? score.correct / score.attempted : null;
    const vivaDone = (viva[t.slug] ?? []).length;
    const cardsMastered = t.flashcards.reduce(
      (n, _c, i) => n + (diff[microFlashcardId(t.slug, i)] === "easy" ? 1 : 0),
      0,
    );
    const isCompleted = completed.includes(t.slug);
    const percent = topicPercent({
      completed: isCompleted,
      mcqAccuracy,
      vivaDone,
      vivaTotal: t.viva.length,
      cardsMastered,
      cardsTotal: t.flashcards.length,
    });
    return {
      slug: t.slug,
      title: t.title,
      icon: t.icon,
      completed: isCompleted,
      mcqAttempted: score.attempted,
      mcqCorrect: score.correct,
      mcqAccuracy,
      vivaDone,
      vivaTotal: t.viva.length,
      cardsMastered,
      cardsTotal: t.flashcards.length,
      percent,
      weak: percent < 40,
    };
  });
}

export interface MicroOverall {
  percent: number; // overall subject readiness 0..100
  completedTopics: number;
  totalTopics: number;
  mcqAttempted: number;
  mcqCorrect: number;
  mcqAccuracy: number | null;
  vivaDone: number;
  vivaTotal: number;
  weakTopics: MicroTopicProgress[];
}

export function getMicroOverall(): MicroOverall {
  const rows = getMicroTopicProgress();
  const totalTopics = rows.length;
  const mcqAttempted = rows.reduce((n, r) => n + r.mcqAttempted, 0);
  const mcqCorrect = rows.reduce((n, r) => n + r.mcqCorrect, 0);
  const vivaDone = rows.reduce((n, r) => n + r.vivaDone, 0);
  const vivaTotal = rows.reduce((n, r) => n + r.vivaTotal, 0);
  return {
    percent: totalTopics ? Math.round(rows.reduce((n, r) => n + r.percent, 0) / totalTopics) : 0,
    completedTopics: rows.filter((r) => r.completed).length,
    totalTopics,
    mcqAttempted,
    mcqCorrect,
    mcqAccuracy: mcqAttempted ? mcqCorrect / mcqAttempted : null,
    vivaDone,
    vivaTotal,
    weakTopics: rows.filter((r) => r.weak),
  };
}
