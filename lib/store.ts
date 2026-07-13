"use client";

// Lightweight client-side persistence using localStorage. This stands in for the
// Supabase `progress`, `bookmarks`, and `study_sessions` tables so the app works
// offline (PWA-friendly). Swap these functions for Supabase calls later without
// changing component code — the shapes match db/schema.sql.

import { Difficulty } from "./types";
import { useEffect, useState } from "react";

const KEYS = {
  bookmarks: "pharmaos.bookmarks",
  completedTopics: "pharmaos.completedTopics",
  cardDifficulty: "pharmaos.cardDifficulty",
  mcqHistory: "pharmaos.mcqHistory",
  streak: "pharmaos.streak",
  examDate: "pharmaos.examDate",
  lastDrug: "pharmaos.lastDrug",
  settings: "pharmaos.settings",
  lastPlanCompleted: "pharmaos.last-plan-completed-date",
  subjectMcq: "pharmaos.subjectMcq",
  vivaDone: "pharmaos.vivaDone",
  theme: "pharmaos.theme",
};

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(new Event("pharmaos:update"));
}

// ── Bookmarks ────────────────────────────────────────────────
export function getBookmarks(): string[] {
  return read<string[]>(KEYS.bookmarks, []);
}
export function toggleBookmark(drugId: string) {
  const cur = getBookmarks();
  write(KEYS.bookmarks, cur.includes(drugId) ? cur.filter((d) => d !== drugId) : [...cur, drugId]);
}
export function isBookmarked(drugId: string) {
  return getBookmarks().includes(drugId);
}

// ── Completed topics ─────────────────────────────────────────
export function getCompletedTopics(): string[] {
  return read<string[]>(KEYS.completedTopics, []);
}
export function toggleTopicComplete(slug: string) {
  const cur = getCompletedTopics();
  write(KEYS.completedTopics, cur.includes(slug) ? cur.filter((s) => s !== slug) : [...cur, slug]);
}

// ── Flashcard difficulty (spaced-repetition weight) ──────────
export function getCardDifficulty(): Record<string, Difficulty> {
  return read<Record<string, Difficulty>>(KEYS.cardDifficulty, {});
}
export function setCardDifficulty(cardId: string, d: Difficulty) {
  const cur = getCardDifficulty();
  cur[cardId] = d;
  write(KEYS.cardDifficulty, cur);
  markStudiedToday();
}

// ── MCQ history ──────────────────────────────────────────────
export interface MCQAttempt {
  date: string; // yyyy-mm-dd
  total: number;
  correct: number;
  topic?: string;
}
export function getMCQHistory(): MCQAttempt[] {
  return read<MCQAttempt[]>(KEYS.mcqHistory, []);
}
export function addMCQAttempt(a: MCQAttempt) {
  write(KEYS.mcqHistory, [a, ...getMCQHistory()].slice(0, 50));
  markStudiedToday();
}

// ── Streak ───────────────────────────────────────────────────
interface StreakData {
  count: number;
  lastDate: string;
}
function todayStr(): string {
  // Local date as yyyy-mm-dd
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
export function markStudiedToday() {
  const s = read<StreakData>(KEYS.streak, { count: 0, lastDate: "" });
  const today = todayStr();
  if (s.lastDate === today) return;
  const yesterday = new Date(Date.now() - 86400000);
  const yStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, "0")}-${String(yesterday.getDate()).padStart(2, "0")}`;
  const next = s.lastDate === yStr ? s.count + 1 : 1;
  write(KEYS.streak, { count: next, lastDate: today });
}
export function getStreak(): number {
  const s = read<StreakData>(KEYS.streak, { count: 0, lastDate: "" });
  const today = todayStr();
  const yesterday = new Date(Date.now() - 86400000);
  const yStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, "0")}-${String(yesterday.getDate()).padStart(2, "0")}`;
  if (s.lastDate === today || s.lastDate === yStr) return s.count;
  return 0;
}

// ── Exam countdown ───────────────────────────────────────────
export function getExamDate(): string {
  return read<string>(KEYS.examDate, "");
}
export function setExamDate(date: string) {
  write(KEYS.examDate, date);
}

// ── Last studied drug (continue button) ──────────────────────
export function getLastDrug(): string {
  return read<string>(KEYS.lastDrug, "");
}
export function setLastDrug(id: string) {
  write(KEYS.lastDrug, id);
}

// ── Daily study-plan checklist ───────────────────────────────
// Keyed by date (study-plan-YYYY-MM-DD) so completion resets each new day.
export const STUDY_PLAN_TASK_COUNT = 6; // number of plan cards on /study-plan
function studyPlanKey(): string {
  return `pharmaos.study-plan-${todayStr()}`;
}
export function getStudyPlanDone(): string[] {
  return read<string[]>(studyPlanKey(), []);
}
export function toggleStudyPlanTask(taskId: string) {
  const cur = getStudyPlanDone();
  const next = cur.includes(taskId) ? cur.filter((t) => t !== taskId) : [...cur, taskId];
  write(studyPlanKey(), next);

  // Habit marker: stamp today's date when the whole plan is complete; clear it
  // if the user unchecks and the plan is no longer complete today.
  if (new Set(next).size >= STUDY_PLAN_TASK_COUNT) {
    write(KEYS.lastPlanCompleted, todayStr());
  } else if (getLastPlanCompletedDate() === todayStr()) {
    write(KEYS.lastPlanCompleted, "");
  }
}

// Simple habit helper (not a full streak system yet).
export function getLastPlanCompletedDate(): string {
  return read<string>(KEYS.lastPlanCompleted, "");
}
export function isPlanCompletedToday(): boolean {
  return getLastPlanCompletedDate() === todayStr();
}

// ── Settings ─────────────────────────────────────────────────
export interface Settings {
  name: string;
  university: string;
  aiLanguage: "English" | "Russian";
}
export function getSettings(): Settings {
  return read<Settings>(KEYS.settings, { name: "", university: "", aiLanguage: "English" });
}
export function saveSettings(s: Settings) {
  write(KEYS.settings, s);
}

// ── Subject MCQ scoring (subject-agnostic, keyed by topic slug) ──────────────
// Used by the Microbiology module (and future subjects) to keep a running
// attempted/correct tally per topic — feeds per-subject readiness scoring.
export interface MCQScore {
  attempted: number;
  correct: number;
}
export function getSubjectMCQScores(): Record<string, MCQScore> {
  return read<Record<string, MCQScore>>(KEYS.subjectMcq, {});
}
export function recordSubjectMCQ(topicSlug: string, correct: boolean) {
  const cur = getSubjectMCQScores();
  const s = cur[topicSlug] ?? { attempted: 0, correct: 0 };
  cur[topicSlug] = { attempted: s.attempted + 1, correct: s.correct + (correct ? 1 : 0) };
  write(KEYS.subjectMcq, cur);
  markStudiedToday();
}

// ── Viva "got it" tracking (keyed by topic slug → list of item indices) ──────
export function getVivaDone(): Record<string, number[]> {
  return read<Record<string, number[]>>(KEYS.vivaDone, {});
}
export function isVivaDone(topicSlug: string, index: number): boolean {
  return (getVivaDone()[topicSlug] ?? []).includes(index);
}
export function toggleVivaDone(topicSlug: string, index: number) {
  const cur = getVivaDone();
  const arr = cur[topicSlug] ?? [];
  cur[topicSlug] = arr.includes(index) ? arr.filter((i) => i !== index) : [...arr, index];
  write(KEYS.vivaDone, cur);
  markStudiedToday();
}

// ── Theme (light / dark / system) ────────────────────────────
export type ThemeMode = "light" | "dark" | "system";

export function getTheme(): ThemeMode {
  return read<ThemeMode>(KEYS.theme, "system");
}

// Apply the resolved theme to <html> (adds/removes `.dark` + sets data-theme).
export function applyTheme(theme: ThemeMode) {
  if (typeof document === "undefined") return;
  const dark =
    theme === "dark" ||
    (theme === "system" &&
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);
  const el = document.documentElement;
  el.classList.toggle("dark", dark);
  el.setAttribute("data-theme", dark ? "dark" : "light");
}

export function setTheme(theme: ThemeMode) {
  write(KEYS.theme, theme);
  applyTheme(theme);
}

// ── React hook to re-render on store changes ─────────────────
export function useStoreTick(): number {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const h = () => setTick((t) => t + 1);
    window.addEventListener("pharmaos:update", h);
    window.addEventListener("storage", h);
    return () => {
      window.removeEventListener("pharmaos:update", h);
      window.removeEventListener("storage", h);
    };
  }, []);
  return tick;
}

// True only after the component has mounted on the client. The store reads from
// localStorage, which is empty during SSR — rendering that data on the first
// client render causes a hydration mismatch. Gate localStorage-derived UI behind
// this so the initial client render matches the server, then fills in on mount.
export function useHydrated(): boolean {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  return hydrated;
}
