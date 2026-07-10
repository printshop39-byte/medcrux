// Generic, subject-agnostic progress summariser shared by every subject module
// (Microbiology, Pathology, …). It reads the SSR-safe localStorage getters in
// lib/store.ts and combines them into per-topic mastery + overall readiness,
// using the exam-readiness weighting from docs/ARCHITECTURE_V2.md.
//
// It takes the topic list as an argument (structural typing) so it never imports
// any specific subject — each subject wraps it with its own prefix
// (see lib/micro-progress.ts, lib/path-progress.ts).

import { getCompletedTopics, getSubjectMCQScores, getVivaDone, getCardDifficulty } from "./store";

// Minimal shape a topic must expose to be scored. MicroTopic / PathTopic satisfy it.
export interface ProgressTopic {
  slug: string;
  title: string;
  icon: string;
  viva: unknown[];
  flashcards: unknown[];
}

// Flashcard difficulty ids are namespaced per subject so subjects never collide.
export function flashcardId(prefix: string, topicSlug: string, index: number): string {
  return `${prefix}-fc-${topicSlug}-${index}`;
}

export interface TopicProgress {
  slug: string;
  title: string;
  icon: string;
  completed: boolean;
  mcqAttempted: number;
  mcqCorrect: number;
  mcqAccuracy: number | null; // 0..1, null if none attempted
  vivaDone: number;
  vivaTotal: number;
  cardsMastered: number;
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

export function topicProgressFor(topics: ProgressTopic[], prefix: string): TopicProgress[] {
  const completed = getCompletedTopics();
  const scores = getSubjectMCQScores();
  const viva = getVivaDone();
  const diff = getCardDifficulty();

  return topics.map((t) => {
    const score = scores[t.slug] ?? { attempted: 0, correct: 0 };
    const mcqAccuracy = score.attempted ? score.correct / score.attempted : null;
    const vivaDone = (viva[t.slug] ?? []).length;
    const cardsMastered = t.flashcards.reduce(
      (n: number, _c, i) => n + (diff[flashcardId(prefix, t.slug, i)] === "easy" ? 1 : 0),
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

export interface SubjectOverall {
  percent: number; // 0..100 subject readiness
  completedTopics: number;
  totalTopics: number;
  mcqAttempted: number;
  mcqCorrect: number;
  mcqAccuracy: number | null;
  vivaDone: number;
  vivaTotal: number;
  weakTopics: TopicProgress[];
}

export function overallFor(topics: ProgressTopic[], prefix: string): SubjectOverall {
  const rows = topicProgressFor(topics, prefix);
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
