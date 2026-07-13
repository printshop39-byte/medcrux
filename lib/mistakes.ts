// Derived coaching analytics for Mistake Intelligence. Pure read helpers over
// the localStorage-backed mistake notebook + competency tally (lib/store).
// Presentation-only: they add no new storage and never throw on empty data.

import { getMistakes, getCompetencyStats, MISTAKE_REASONS } from "./store";
import { COMPETENCY_LABEL } from "./content";
import type { Competency } from "./types";

export interface ReasonCount {
  id: string;
  label: string;
  count: number;
}

// Mistake reasons ranked by how often the student tagged them (desc).
export function mistakeReasonBreakdown(): ReasonCount[] {
  const counts = new Map<string, number>();
  for (const m of getMistakes()) {
    if (m.reason) counts.set(m.reason, (counts.get(m.reason) ?? 0) + 1);
  }
  return MISTAKE_REASONS.map((r) => ({ id: r.id, label: r.label, count: counts.get(r.id) ?? 0 })).sort(
    (a, b) => b.count - a.count,
  );
}

export function topMistakeReason(): ReasonCount | null {
  const top = mistakeReasonBreakdown()[0];
  return top && top.count > 0 ? top : null;
}

export interface TopicCount {
  slug: string;
  title: string;
  count: number;
}

// Topics ranked by number of unresolved (non-mastered) wrong answers.
export function weakTopicsByMistakes(): TopicCount[] {
  const counts = new Map<string, TopicCount>();
  for (const m of getMistakes()) {
    if (m.stage === "mastered") continue;
    const slug = m.topic || "unknown";
    const cur = counts.get(slug) ?? { slug, title: m.topicTitle || m.topic || "Unknown", count: 0 };
    cur.count += 1;
    counts.set(slug, cur);
  }
  return [...counts.values()].sort((a, b) => b.count - a.count);
}

export function weakestTopicByMistakes(): TopicCount | null {
  return weakTopicsByMistakes()[0] ?? null;
}

export interface CompetencyAccuracy {
  competency: Competency;
  label: string;
  attempted: number;
  correct: number;
  accuracy: number; // 0–100
}

// Accuracy per competency (weakest first), only for competencies actually attempted.
export function accuracyByCompetency(): CompetencyAccuracy[] {
  const stats = getCompetencyStats();
  return (Object.keys(stats) as Competency[])
    .map((c) => {
      const s = stats[c];
      return {
        competency: c,
        label: COMPETENCY_LABEL[c] ?? c,
        attempted: s.attempted,
        correct: s.correct,
        accuracy: s.attempted ? Math.round((s.correct / s.attempted) * 100) : 0,
      };
    })
    .filter((x) => x.attempted > 0)
    .sort((a, b) => a.accuracy - b.accuracy);
}

// One professional, actionable coaching sentence, or null if there isn't enough
// signal yet. Prefers a specific competency; "general" is a catch-all, so it
// isn't offered as advice — the weakest topic is used instead.
export function coachingLine(): string | null {
  const weakComp = accuracyByCompetency().find(
    (c) => c.competency !== "general" && c.attempted >= 3 && c.accuracy < 80,
  );
  if (weakComp) {
    const area = weakComp.label.toLowerCase();
    return `Most of your errors are in ${area} (${weakComp.accuracy}% accuracy). Revise ${area} before your next test.`;
  }
  const weakTopic = weakestTopicByMistakes();
  if (weakTopic) {
    return `Your weakest area right now is ${weakTopic.title} — ${weakTopic.count} unresolved mistake${
      weakTopic.count > 1 ? "s" : ""
    }. Revise it before your next test.`;
  }
  const reason = topMistakeReason();
  if (reason) {
    return `Your most common mistake type is “${reason.label.toLowerCase()}.” Target that pattern in your next revision.`;
  }
  return null;
}
