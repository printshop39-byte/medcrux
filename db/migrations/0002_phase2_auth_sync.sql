-- ============================================================================
-- MedCrux Phase 2 — Auth + Cloud Sync schema
-- Run this ONCE in Supabase → SQL Editor (New query → paste → Run).
-- Safe to re-run (uses IF NOT EXISTS / DROP+CREATE where needed).
-- Full design: docs/PHASE2_AUTH_SYNC.md
-- ============================================================================

create extension if not exists "pgcrypto";

-- ── 1. profiles (1:1 with auth.users) ────────────────────────────────────────
create table if not exists public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  email         text,
  full_name     text,
  country       text default 'India',
  university    text,
  mbbs_year     int check (mbbs_year between 1 and 6),
  subject_focus text[] default '{}',
  exam_date     date,
  ai_language   text default 'English',       -- English | Hinglish | Russian
  role          text default 'student',       -- student | admin
  onboarded     boolean default false,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- ── 2. user_settings ──────────────────────────────────────────────────────────
create table if not exists public.user_settings (
  user_id                  uuid primary key references auth.users(id) on delete cascade,
  theme                    text default 'system',
  last_drug                text,
  streak_count             int  default 0,
  streak_last_date         date,
  last_plan_completed_date date,
  updated_at               timestamptz default now()
);

-- ── 3. user_progress (completed topics) ──────────────────────────────────────
create table if not exists public.user_progress (
  user_id    uuid references auth.users(id) on delete cascade,
  topic_slug text not null,
  completed  boolean default true,
  updated_at timestamptz default now(),
  primary key (user_id, topic_slug)
);

-- ── 4. user_bookmarks ─────────────────────────────────────────────────────────
create table if not exists public.user_bookmarks (
  user_id    uuid references auth.users(id) on delete cascade,
  drug_id    text not null,
  created_at timestamptz default now(),
  primary key (user_id, drug_id)
);

-- ── 5. user_flashcard_reviews ─────────────────────────────────────────────────
create table if not exists public.user_flashcard_reviews (
  user_id       uuid references auth.users(id) on delete cascade,
  card_id       text not null,
  difficulty    text check (difficulty in ('easy','medium','hard')),
  ease_factor   real,
  interval_days int,
  due_at        timestamptz,
  updated_at    timestamptz default now(),
  primary key (user_id, card_id)
);

-- ── 6. user_mcq_attempts (V1: one row per completed test) ────────────────────
create table if not exists public.user_mcq_attempts (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid references auth.users(id) on delete cascade,
  attempt_date date not null,
  total        int  not null,
  correct      int  not null,
  topic        text,
  created_at   timestamptz default now()
);
create index if not exists user_mcq_attempts_user_idx
  on public.user_mcq_attempts(user_id, attempt_date desc);

-- ── 7. user_study_plan_tasks ──────────────────────────────────────────────────
create table if not exists public.user_study_plan_tasks (
  user_id    uuid references auth.users(id) on delete cascade,
  plan_date  date not null,
  task_id    text not null,
  done       boolean default true,
  updated_at timestamptz default now(),
  primary key (user_id, plan_date, task_id)
);

-- ── 8. user_study_sessions (forward-looking) ─────────────────────────────────
create table if not exists public.user_study_sessions (
  user_id      uuid references auth.users(id) on delete cascade,
  session_date date not null,
  minutes      int default 0,
  source       text,
  primary key (user_id, session_date)
);

-- ── 9. sync_migrations (one row per migrated user) ───────────────────────────
create table if not exists public.sync_migrations (
  user_id         uuid primary key references auth.users(id) on delete cascade,
  source          text default 'localStorage-v1',
  version         int  default 1,
  status          text default 'completed',
  payload_summary jsonb,
  migrated_at     timestamptz default now()
);

-- ── Auto-create profile + settings on signup ─────────────────────────────────
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name')
  on conflict (id) do nothing;
  insert into public.user_settings (user_id) values (new.id)
  on conflict (user_id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================================
-- Row Level Security — student can access ONLY their own rows
-- ============================================================================
alter table public.profiles               enable row level security;
alter table public.user_settings          enable row level security;
alter table public.user_progress          enable row level security;
alter table public.user_bookmarks         enable row level security;
alter table public.user_flashcard_reviews enable row level security;
alter table public.user_mcq_attempts      enable row level security;
alter table public.user_study_plan_tasks  enable row level security;
alter table public.user_study_sessions    enable row level security;
alter table public.sync_migrations        enable row level security;

drop policy if exists "own profile" on public.profiles;
create policy "own profile" on public.profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists "own rows" on public.user_settings;
create policy "own rows" on public.user_settings
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "own rows" on public.user_progress;
create policy "own rows" on public.user_progress
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "own rows" on public.user_bookmarks;
create policy "own rows" on public.user_bookmarks
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "own rows" on public.user_flashcard_reviews;
create policy "own rows" on public.user_flashcard_reviews
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "own rows" on public.user_mcq_attempts;
create policy "own rows" on public.user_mcq_attempts
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "own rows" on public.user_study_plan_tasks;
create policy "own rows" on public.user_study_plan_tasks
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "own rows" on public.user_study_sessions;
create policy "own rows" on public.user_study_sessions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "own rows" on public.sync_migrations;
create policy "own rows" on public.sync_migrations
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Admin (optional, enable later):
-- create or replace function public.is_admin() returns boolean
--   language sql security definer set search_path = public as $$
--   select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin') $$;
