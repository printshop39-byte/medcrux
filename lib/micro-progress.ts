// Microbiology progress — thin wrapper over the generic subject-progress helpers.
// Kept as a stable import surface for the Microbiology pages.

import { MICRO_TOPICS } from "./microbiology";
import {
  topicProgressFor,
  overallFor,
  flashcardId,
  type TopicProgress,
  type SubjectOverall,
} from "./subject-progress";

export type MicroTopicProgress = TopicProgress;
export type MicroOverall = SubjectOverall;

export function microFlashcardId(topicSlug: string, index: number): string {
  return flashcardId("micro", topicSlug, index);
}

export function getMicroTopicProgress(): TopicProgress[] {
  return topicProgressFor(MICRO_TOPICS, "micro");
}

export function getMicroOverall(): SubjectOverall {
  return overallFor(MICRO_TOPICS, "micro");
}
