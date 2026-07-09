import type { SupabaseClient } from "@supabase/supabase-js";
import { Difficulty } from "@/lib/types";
import { CloudSnapshot } from "./snapshot";

// Pull the user's full snapshot from Supabase (all user_* tables + profile).
export async function pullCloud(supabase: SupabaseClient, userId: string): Promise<CloudSnapshot> {
  const [bm, prog, fc, mcq, plan, settings, profile] = await Promise.all([
    supabase.from("user_bookmarks").select("drug_id").eq("user_id", userId),
    supabase.from("user_progress").select("topic_slug").eq("user_id", userId).eq("completed", true),
    supabase.from("user_flashcard_reviews").select("card_id, difficulty").eq("user_id", userId),
    supabase.from("user_mcq_attempts").select("attempt_date, total, correct, topic").eq("user_id", userId),
    supabase.from("user_study_plan_tasks").select("plan_date, task_id").eq("user_id", userId).eq("done", true),
    supabase.from("user_settings").select("*").eq("user_id", userId).maybeSingle(),
    supabase.from("profiles").select("exam_date, ai_language, full_name, university").eq("id", userId).maybeSingle(),
  ]);

  const cardDifficulty: Record<string, Difficulty> = {};
  (fc.data ?? []).forEach((r: { card_id: string; difficulty: Difficulty }) => {
    cardDifficulty[r.card_id] = r.difficulty;
  });

  const studyPlan: Record<string, string[]> = {};
  (plan.data ?? []).forEach((r: { plan_date: string; task_id: string }) => {
    (studyPlan[r.plan_date] ??= []).push(r.task_id);
  });

  const st = (settings.data ?? {}) as {
    last_drug?: string | null;
    streak_count?: number | null;
    streak_last_date?: string | null;
    last_plan_completed_date?: string | null;
  };
  const pr = (profile.data ?? {}) as {
    exam_date?: string | null;
    ai_language?: string | null;
    full_name?: string | null;
    university?: string | null;
  };

  return {
    bookmarks: (bm.data ?? []).map((r: { drug_id: string }) => r.drug_id),
    completedTopics: (prog.data ?? []).map((r: { topic_slug: string }) => r.topic_slug),
    cardDifficulty,
    mcqHistory: (mcq.data ?? []).map((r: { attempt_date: string; total: number; correct: number; topic: string | null }) => ({
      date: r.attempt_date,
      total: r.total,
      correct: r.correct,
      topic: r.topic ?? undefined,
    })),
    studyPlan,
    lastDrug: st.last_drug ?? "",
    examDate: pr.exam_date ?? "",
    streak: { count: st.streak_count ?? 0, lastDate: st.streak_last_date ?? "" },
    lastPlanCompletedDate: st.last_plan_completed_date ?? "",
    settings: {
      name: pr.full_name ?? "",
      university: pr.university ?? "",
      aiLanguage: pr.ai_language ?? "English",
    },
  };
}

// Push the snapshot to Supabase. Collection tables use a replace strategy
// (delete the user's rows, then insert current) so removals sync too.
export async function pushCloud(supabase: SupabaseClient, userId: string, s: CloudSnapshot): Promise<void> {
  await supabase.from("user_bookmarks").delete().eq("user_id", userId);
  if (s.bookmarks.length) {
    await supabase.from("user_bookmarks").insert(s.bookmarks.map((drug_id) => ({ user_id: userId, drug_id })));
  }

  await supabase.from("user_progress").delete().eq("user_id", userId);
  if (s.completedTopics.length) {
    await supabase.from("user_progress").insert(s.completedTopics.map((topic_slug) => ({ user_id: userId, topic_slug, completed: true })));
  }

  await supabase.from("user_flashcard_reviews").delete().eq("user_id", userId);
  const fcRows = Object.entries(s.cardDifficulty).map(([card_id, difficulty]) => ({ user_id: userId, card_id, difficulty }));
  if (fcRows.length) await supabase.from("user_flashcard_reviews").insert(fcRows);

  await supabase.from("user_mcq_attempts").delete().eq("user_id", userId);
  if (s.mcqHistory.length) {
    await supabase.from("user_mcq_attempts").insert(
      s.mcqHistory.map((m) => ({ user_id: userId, attempt_date: m.date, total: m.total, correct: m.correct, topic: m.topic ?? null })),
    );
  }

  await supabase.from("user_study_plan_tasks").delete().eq("user_id", userId);
  const planRows = Object.entries(s.studyPlan).flatMap(([plan_date, tasks]) =>
    tasks.map((task_id) => ({ user_id: userId, plan_date, task_id, done: true })),
  );
  if (planRows.length) await supabase.from("user_study_plan_tasks").insert(planRows);

  // Scalars → user_settings (single-row upsert).
  await supabase.from("user_settings").upsert({
    user_id: userId,
    last_drug: s.lastDrug || null,
    streak_count: s.streak.count,
    streak_last_date: s.streak.lastDate || null,
    last_plan_completed_date: s.lastPlanCompletedDate || null,
    updated_at: new Date().toISOString(),
  });

  // Study-relevant profile fields only (does NOT overwrite onboarding identity:
  // full_name / university / onboarded are left untouched).
  await supabase.from("profiles").upsert({
    id: userId,
    exam_date: s.examDate || null,
    ai_language: s.settings.aiLanguage || "English",
    updated_at: new Date().toISOString(),
  });
}

export async function hasMigrated(supabase: SupabaseClient, userId: string): Promise<boolean> {
  const { data } = await supabase.from("sync_migrations").select("user_id").eq("user_id", userId).maybeSingle();
  return Boolean(data);
}

export async function markMigrated(supabase: SupabaseClient, userId: string, summary: Record<string, number>): Promise<void> {
  await supabase.from("sync_migrations").upsert({ user_id: userId, payload_summary: summary, migrated_at: new Date().toISOString() });
}
