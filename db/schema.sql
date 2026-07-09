-- ============================================================================
-- MedCrux — Supabase / PostgreSQL schema
-- Run this in the Supabase SQL editor. It creates all tables, enables Row Level
-- Security, and seeds the topic list. Drug/MCQ/viva seed data can be imported
-- from lib/*.ts (see db/seed.md) or entered via the Supabase table editor.
-- ============================================================================

-- Extensions ----------------------------------------------------------------
create extension if not exists "pgcrypto";

-- 1. USERS (profile row per auth user) --------------------------------------
create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  university text,
  ai_language text default 'English',
  exam_date date,
  created_at timestamptz default now()
);

-- 2. TOPICS -----------------------------------------------------------------
create table if not exists public.topics (
  slug text primary key,
  title text not null,
  description text,
  icon text,
  "order" int default 0
);

-- 3. DRUGS ------------------------------------------------------------------
create table if not exists public.drugs (
  id text primary key,
  name text not null,
  topic text references public.topics(slug) on delete set null,
  drug_class text,
  moa text,
  uses text[] default '{}',
  side_effects text[] default '{}',
  contraindications text[] default '{}',
  interactions text[] default '{}',
  mnemonic text,
  created_at timestamptz default now()
);
create index if not exists drugs_topic_idx on public.drugs(topic);

-- 4. FLASHCARDS (optional; can also be derived client-side) ------------------
create table if not exists public.flashcards (
  id text primary key,
  drug_id text references public.drugs(id) on delete cascade,
  topic text references public.topics(slug) on delete set null,
  front text not null,
  back text not null
);

-- 5. MCQs -------------------------------------------------------------------
create table if not exists public.mcqs (
  id text primary key,
  drug_id text references public.drugs(id) on delete cascade,
  topic text references public.topics(slug) on delete set null,
  question text not null,
  options text[] not null,
  answer_index int not null,
  explanation text
);
create index if not exists mcqs_topic_idx on public.mcqs(topic);

-- 6. VIVA QUESTIONS ---------------------------------------------------------
create table if not exists public.viva_questions (
  id uuid primary key default gen_random_uuid(),
  drug_id text references public.drugs(id) on delete cascade,
  topic text references public.topics(slug) on delete set null,
  question text not null,
  answer text not null
);

-- 7. BOOKMARKS (per user) ---------------------------------------------------
create table if not exists public.bookmarks (
  user_id uuid references public.users(id) on delete cascade,
  drug_id text references public.drugs(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (user_id, drug_id)
);

-- 8. PROGRESS (per user, per topic/card) ------------------------------------
create table if not exists public.progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  topic text references public.topics(slug) on delete cascade,
  completed boolean default false,
  card_difficulty jsonb default '{}',   -- { cardId: 'easy'|'medium'|'hard' }
  updated_at timestamptz default now(),
  unique (user_id, topic)
);

-- 9. STUDY SESSIONS (streak + MCQ history) ----------------------------------
create table if not exists public.study_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  session_date date default current_date,
  mcq_total int default 0,
  mcq_correct int default 0,
  topic text,
  created_at timestamptz default now()
);
create index if not exists study_sessions_user_idx on public.study_sessions(user_id, session_date);

-- ============================================================================
-- Row Level Security
-- ============================================================================
alter table public.users            enable row level security;
alter table public.bookmarks        enable row level security;
alter table public.progress         enable row level security;
alter table public.study_sessions   enable row level security;

-- Content tables are public-read, admin-write (seeded content).
alter table public.topics         enable row level security;
alter table public.drugs          enable row level security;
alter table public.flashcards     enable row level security;
alter table public.mcqs           enable row level security;
alter table public.viva_questions enable row level security;

-- Public read policies for content
create policy "content_read_topics"  on public.topics         for select using (true);
create policy "content_read_drugs"   on public.drugs          for select using (true);
create policy "content_read_cards"   on public.flashcards     for select using (true);
create policy "content_read_mcqs"    on public.mcqs           for select using (true);
create policy "content_read_viva"    on public.viva_questions for select using (true);

-- Per-user policies (owner-only)
create policy "own_profile"   on public.users          for all using (auth.uid() = id) with check (auth.uid() = id);
create policy "own_bookmarks" on public.bookmarks      for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own_progress"  on public.progress       for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own_sessions"  on public.study_sessions for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Auto-create a profile row when a new auth user signs up
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.users (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================================
-- Seed: topics
-- ============================================================================
insert into public.topics (slug, title, description, icon, "order") values
  ('general-pharmacology',      'General Pharmacology',           'Pharmacokinetics, pharmacodynamics, receptors, ADR, prescription writing.', '🧪', 1),
  ('autonomic-nervous-system',  'Autonomic Nervous System',       'Cholinergics, anticholinergics, adrenergic agonists, alpha & beta blockers.', '⚡', 2),
  ('cardiovascular-drugs',      'Cardiovascular Drugs',           'Antihypertensives, diuretics, antianginals, antiarrhythmics, heart failure.', '❤️', 3),
  ('cns-drugs',                 'CNS Drugs',                      'Sedatives, benzodiazepines, antidepressants, antipsychotics, opioids.', '🧠', 4),
  ('antibiotics',               'Antibiotics',                    'Penicillins, cephalosporins, macrolides, aminoglycosides, quinolones.', '🦠', 5),
  ('antimicrobials',            'Antiviral / Antifungal / Anti-TB','Antivirals, antifungals and antitubercular drugs.', '🧬', 6),
  ('endocrine-pharmacology',    'Endocrine Pharmacology',         'Insulin, oral antidiabetics, thyroid drugs, corticosteroids.', '🩸', 7),
  ('nsaids-analgesics',         'NSAIDs & Analgesics',            'Aspirin, ibuprofen, diclofenac, paracetamol, opioids.', '💊', 8),
  ('autacoids',                 'Autacoids',                      'Histamine, antihistamines, 5-HT, prostaglandins.', '🔬', 9)
on conflict (slug) do nothing;
