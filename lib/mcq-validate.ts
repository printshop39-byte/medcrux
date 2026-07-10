// Generic MCQ data validation, shared by every subject module. Catches the data
// shapes that make an MCQ render wrong in <MCQBlock>:
//   • not exactly 4 options
//   • answerIndex out of range (must be 0..options.length-1)
//   • duplicate option text within one MCQ (ambiguous correct-answer highlight)
//   • empty question / explanation, or duplicate MCQ id
// Used by dev-only checks on each subject page; safe to unit-test.

import type { MCQ } from "./types";

export interface MCQProblem {
  topic: string;
  mcqId: string;
  index: number; // position of the MCQ within its topic
  issues: string[];
}

// Structural: any object exposing a slug and an mcqs array works.
interface TopicWithMCQs {
  slug: string;
  mcqs: MCQ[];
}

export function validateMCQs(topics: TopicWithMCQs[]): MCQProblem[] {
  const problems: MCQProblem[] = [];
  const seenIds = new Set<string>();

  for (const topic of topics) {
    topic.mcqs.forEach((m, i) => {
      const issues: string[] = [];

      const optCount = Array.isArray(m.options) ? m.options.length : 0;
      if (optCount !== 4) issues.push(`expected exactly 4 options, got ${optCount}`);
      if (!Number.isInteger(m.answerIndex) || m.answerIndex < 0 || m.answerIndex >= optCount) {
        issues.push(`answerIndex ${m.answerIndex} is out of range 0..${optCount - 1}`);
      }
      const norm = (m.options ?? []).map((o) => o.trim().toLowerCase());
      const dupes = norm.filter((o, idx) => o && norm.indexOf(o) !== idx);
      if (dupes.length) issues.push(`duplicate option text: ${[...new Set(dupes)].join(", ")}`);
      if (!m.question?.trim()) issues.push("empty question");
      if (!m.explanation?.trim()) issues.push("empty explanation");
      if (!m.id?.trim()) issues.push("empty id");
      else if (seenIds.has(m.id)) issues.push(`duplicate id "${m.id}"`);
      else seenIds.add(m.id);

      if (issues.length) problems.push({ topic: topic.slug, mcqId: m.id, index: i, issues });
    });
  }

  return problems;
}
