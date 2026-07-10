// Pathology progress — thin wrapper over the generic subject-progress helpers.

import { PATH_TOPICS } from "./pathology";
import {
  topicProgressFor,
  overallFor,
  flashcardId,
  type TopicProgress,
  type SubjectOverall,
} from "./subject-progress";

export type PathTopicProgress = TopicProgress;
export type PathOverall = SubjectOverall;

export function pathFlashcardId(topicSlug: string, index: number): string {
  return flashcardId("path", topicSlug, index);
}

export function getPathTopicProgress(): TopicProgress[] {
  return topicProgressFor(PATH_TOPICS, "path");
}

export function getPathOverall(): SubjectOverall {
  return overallFor(PATH_TOPICS, "path");
}
