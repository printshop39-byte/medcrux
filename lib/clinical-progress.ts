// Clinical Examination progress — thin wrapper over the generic subject-progress
// helpers (prefix "clin").

import { CLINICAL_TOPICS } from "./clinical";
import {
  topicProgressFor,
  overallFor,
  flashcardId,
  type TopicProgress,
  type SubjectOverall,
} from "./subject-progress";

export type ClinicalTopicProgress = TopicProgress;
export type ClinicalOverall = SubjectOverall;

export function clinicalFlashcardId(topicSlug: string, index: number): string {
  return flashcardId("clin", topicSlug, index);
}

export function getClinicalTopicProgress(): TopicProgress[] {
  return topicProgressFor(CLINICAL_TOPICS, "clin");
}

export function getClinicalOverall(): SubjectOverall {
  return overallFor(CLINICAL_TOPICS, "clin");
}
