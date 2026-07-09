import { Difficulty } from "@/lib/types";

// One user's syncable state. Mirrors the pharmaos.* localStorage keys and the
// Supabase user_* tables. Reads/writes the SAME keys the existing store uses —
// it never changes store.ts logic, only mirrors its cache.
export interface CloudSnapshot {
  bookmarks: string[];
  completedTopics: string[];
  cardDifficulty: Record<string, Difficulty>;
  mcqHistory: { date: string; total: number; correct: number; topic?: string }[];
  studyPlan: Record<string, string[]>; // 'YYYY-MM-DD' -> taskId[]
  lastDrug: string;
  examDate: string;
  streak: { count: number; lastDate: string };
  lastPlanCompletedDate: string;
  settings: { name: string; university: string; aiLanguage: string };
}

// These MUST match lib/store.ts key names (not renamed in Phase 2).
const K = {
  bookmarks: "pharmaos.bookmarks",
  completedTopics: "pharmaos.completedTopics",
  cardDifficulty: "pharmaos.cardDifficulty",
  mcqHistory: "pharmaos.mcqHistory",
  streak: "pharmaos.streak",
  examDate: "pharmaos.examDate",
  lastDrug: "pharmaos.lastDrug",
  settings: "pharmaos.settings",
  lastPlanCompleted: "pharmaos.last-plan-completed-date",
  studyPlanPrefix: "pharmaos.study-plan-",
};

function readJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}
function writeJSON(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function readLocalSnapshot(): CloudSnapshot {
  const studyPlan: Record<string, string[]> = {};
  for (const key of Object.keys(localStorage)) {
    if (key.startsWith(K.studyPlanPrefix)) {
      studyPlan[key.slice(K.studyPlanPrefix.length)] = readJSON<string[]>(key, []);
    }
  }
  return {
    bookmarks: readJSON<string[]>(K.bookmarks, []),
    completedTopics: readJSON<string[]>(K.completedTopics, []),
    cardDifficulty: readJSON<Record<string, Difficulty>>(K.cardDifficulty, {}),
    mcqHistory: readJSON(K.mcqHistory, []),
    studyPlan,
    lastDrug: readJSON<string>(K.lastDrug, ""),
    examDate: readJSON<string>(K.examDate, ""),
    streak: readJSON(K.streak, { count: 0, lastDate: "" }),
    lastPlanCompletedDate: readJSON<string>(K.lastPlanCompleted, ""),
    settings: readJSON(K.settings, { name: "", university: "", aiLanguage: "English" }),
  };
}

export function writeLocalSnapshot(s: CloudSnapshot) {
  writeJSON(K.bookmarks, s.bookmarks);
  writeJSON(K.completedTopics, s.completedTopics);
  writeJSON(K.cardDifficulty, s.cardDifficulty);
  writeJSON(K.mcqHistory, s.mcqHistory);
  writeJSON(K.lastDrug, s.lastDrug);
  writeJSON(K.examDate, s.examDate);
  writeJSON(K.streak, s.streak);
  writeJSON(K.lastPlanCompleted, s.lastPlanCompletedDate);
  writeJSON(K.settings, s.settings);
  for (const [date, tasks] of Object.entries(s.studyPlan)) {
    writeJSON(`${K.studyPlanPrefix}${date}`, tasks);
  }
}

// Merge rules (multi-device safe): sets = union, maps = cloud-wins on conflict,
// scalars/dates = later-wins, mcq history = concat + dedup.
export function mergeSnapshots(local: CloudSnapshot, cloud: CloudSnapshot): CloudSnapshot {
  const union = (a: string[], b: string[]) => Array.from(new Set([...a, ...b]));
  const later = (a: string, b: string) => (a >= b ? a : b);

  const dates = new Set([...Object.keys(local.studyPlan), ...Object.keys(cloud.studyPlan)]);
  const studyPlan: Record<string, string[]> = {};
  for (const d of dates) studyPlan[d] = union(local.studyPlan[d] ?? [], cloud.studyPlan[d] ?? []);

  const seen = new Set<string>();
  const mcqHistory = [...cloud.mcqHistory, ...local.mcqHistory]
    .filter((m) => {
      const k = `${m.date}|${m.total}|${m.correct}|${m.topic ?? ""}`;
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    })
    .slice(0, 50);

  return {
    bookmarks: union(local.bookmarks, cloud.bookmarks),
    completedTopics: union(local.completedTopics, cloud.completedTopics),
    cardDifficulty: { ...local.cardDifficulty, ...cloud.cardDifficulty },
    mcqHistory,
    studyPlan,
    lastDrug: cloud.lastDrug || local.lastDrug,
    examDate: later(local.examDate, cloud.examDate),
    streak: local.streak.lastDate >= cloud.streak.lastDate ? local.streak : cloud.streak,
    lastPlanCompletedDate: later(local.lastPlanCompletedDate, cloud.lastPlanCompletedDate),
    settings: {
      name: cloud.settings.name || local.settings.name,
      university: cloud.settings.university || local.settings.university,
      aiLanguage: cloud.settings.aiLanguage || local.settings.aiLanguage,
    },
  };
}

export function summarize(s: CloudSnapshot) {
  return {
    bookmarks: s.bookmarks.length,
    topics: s.completedTopics.length,
    flashcards: Object.keys(s.cardDifficulty).length,
    mcq: s.mcqHistory.length,
    plans: Object.keys(s.studyPlan).length,
  };
}
