# MedCrux Phase 2 — Supabase Auth + Cloud Sync (implementation plan)

> **Status: plan only. No code implemented here. V1 (localStorage, live on Vercel)
> must keep working unchanged.** Login is **optional**: logged-out users get the exact
> current offline app. `pharmaos.*` localStorage keys are **NOT** renamed in this phase.

---

## 0. Design decision that protects V1 (read this first)

The current UI reads the store **synchronously** during render (gated by a `mounted`
flag). Supabase is **async**. If we swapped reads to async we'd have to rewrite every
page and risk new hydration bugs.

**So CloudStore is implemented as a cache-mirror, not a synchronous read replacement:**

- `localStorage` (the `pharmaos.*` keys) stays the **hot cache the UI reads/writes
  synchronously** — exactly as today.
- A **SyncEngine** mirrors that cache ↔ Supabase when a user is logged in:
  - **on login:** pull cloud → merge into local cache (UI reads it synchronously as always)
  - **on write:** write local cache immediately (sync) **and** enqueue a debounced cloud upsert
  - **first login only:** migrate existing local data up to the cloud, once
- Logged-out → SyncEngine is inert → app behaves 100% like V1.

This gives the "LocalStore vs CloudStore" adapter the user asked for, while keeping the
synchronous UI and the existing `mounted` hydration guards untouched.

```
        write            SyncEngine (only when signed in)
UI ───────────────▶ localStorage(pharmaos.*) ──debounced upsert──▶ Supabase (RLS)
   ◀─────────────── (synchronous reads, as today) ◀──── pull+merge ──┘
```

---

## 1. Environment variables (all optional until the flag is on)

`.env.local` / Vercel env:

```
# Public (safe in client bundle)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_ENABLE_CLOUD=false        # feature flag; keep false until Phase 2 verified

# Server only (NEVER prefixed NEXT_PUBLIC_) — used only by admin route (delete/export)
SUPABASE_SERVICE_ROLE_KEY=
```

- App must still **build and run with none of these set** (flag off = pure V1).
- `SUPABASE_SERVICE_ROLE_KEY` is used **only** in server route handlers, never imported
  into a client component.

---

## 2. Exact Supabase SQL (`db/migrations/0002_phase2.sql`)

> Run in the Supabase SQL editor. Idempotent-ish (`if not exists`). `auth.users` is
> managed by Supabase Auth.

```sql
-- ── Extensions ───────────────────────────────────────────────────────────────
create extension if not exists "pgcrypto";

-- ── 1. profiles (1:1 with auth.users) ────────────────────────────────────────
create table if not exists public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  email         text,
  full_name     text,
  country       text default 'India',
  university    text,                         -- free text in P2 (universities table = P3)
  mbbs_year     int check (mbbs_year between 1 and 6),
  subject_focus text[] default '{}',          -- e.g. {'pharmacology'}
  exam_date     date,
  ai_language   text default 'English',       -- English | Hinglish | Russian
  role          text default 'student',       -- student | admin
  onboarded     boolean default false,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- ── 2. user_settings (app-level scalar state that isn't profile identity) ─────
create table if not exists public.user_settings (
  user_id                  uuid primary key references auth.users(id) on delete cascade,
  theme                    text default 'system',
  last_drug                text,              -- pharmaos.lastDrug
  streak_count             int  default 0,    -- pharmaos.streak.count
  streak_last_date         date,              -- pharmaos.streak.lastDate
  last_plan_completed_date date,              -- pharmaos.last-plan-completed-date
  updated_at               timestamptz default now()
);

-- ── 3. user_progress (completed topics; per-subject-ready) ────────────────────
create table if not exists public.user_progress (
  user_id    uuid references auth.users(id) on delete cascade,
  topic_slug text not null,                   -- pharmaos.completedTopics[]
  completed  boolean default true,
  updated_at timestamptz default now(),
  primary key (user_id, topic_slug)
);

-- ── 4. user_bookmarks ─────────────────────────────────────────────────────────
create table if not exists public.user_bookmarks (
  user_id    uuid references auth.users(id) on delete cascade,
  drug_id    text not null,                   -- pharmaos.bookmarks[]
  created_at timestamptz default now(),
  primary key (user_id, drug_id)
);

-- ── 5. user_flashcard_reviews (difficulty now; SR fields ready for P4) ────────
create table if not exists public.user_flashcard_reviews (
  user_id      uuid references auth.users(id) on delete cascade,
  card_id      text not null,                 -- pharmaos.cardDifficulty keys
  difficulty   text check (difficulty in ('easy','medium','hard')),
  ease_factor  real,                          -- reserved for Phase 4 spaced repetition
  interval_days int,                          -- reserved
  due_at       timestamptz,                   -- reserved
  updated_at   timestamptz default now(),
  primary key (user_id, card_id)
);

-- ── 6. user_mcq_attempts ──────────────────────────────────────────────────────
-- NOTE: V1 stores TEST-SESSION summaries (date/total/correct/topic), so in Phase 2
-- each row is one completed test. Per-QUESTION rows are added in Phase 4.
create table if not exists public.user_mcq_attempts (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid references auth.users(id) on delete cascade,
  attempt_date date not null,                 -- pharmaos.mcqHistory[].date
  total        int  not null,
  correct      int  not null,
  topic        text,                           -- nullable (mixed)
  created_at   timestamptz default now()
);
create index if not exists user_mcq_attempts_user_idx
  on public.user_mcq_attempts(user_id, attempt_date desc);

-- ── 7. user_study_plan_tasks (daily checklist; done rows only) ────────────────
create table if not exists public.user_study_plan_tasks (
  user_id    uuid references auth.users(id) on delete cascade,
  plan_date  date not null,                   -- from pharmaos.study-plan-YYYY-MM-DD key
  task_id    text not null,                   -- 'quick'|'topic'|'mcq'|'viva'|'weak'|'concepts'
  done       boolean default true,
  updated_at timestamptz default now(),
  primary key (user_id, plan_date, task_id)
);

-- ── 8. user_study_sessions (forward-looking per-day log; empty at migration) ──
-- V1 has only the scalar streak (stored in user_settings). This table records real
-- per-day study minutes from Phase 3 onward for a robust streak.
create table if not exists public.user_study_sessions (
  user_id      uuid references auth.users(id) on delete cascade,
  session_date date not null,
  minutes      int default 0,
  source       text,
  primary key (user_id, session_date)
);

-- ── 9. sync_migrations (one row per user once migrated) ───────────────────────
create table if not exists public.sync_migrations (
  user_id         uuid primary key references auth.users(id) on delete cascade,
  source          text default 'localStorage-v1',
  version         int  default 1,
  status          text default 'completed',   -- completed | failed
  payload_summary jsonb,                        -- counts migrated, for debugging
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
```

---

## 3. Exact RLS policies (`db/migrations/0002_phase2_rls.sql`)

> Every user-owned table: a student can `select/insert/update/delete` **only their own
> rows**. Admin access is *planned* via a helper but not required for Phase 2.

```sql
-- Enable RLS
alter table public.profiles              enable row level security;
alter table public.user_settings         enable row level security;
alter table public.user_progress         enable row level security;
alter table public.user_bookmarks        enable row level security;
alter table public.user_flashcard_reviews enable row level security;
alter table public.user_mcq_attempts     enable row level security;
alter table public.user_study_plan_tasks enable row level security;
alter table public.user_study_sessions   enable row level security;
alter table public.sync_migrations       enable row level security;

-- profiles: keyed by id = auth.uid()
create policy "own profile (rw)" on public.profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);

-- Generic owner policy for every user_id-keyed table (repeat per table):
create policy "own rows"  on public.user_settings
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own rows"  on public.user_progress
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own rows"  on public.user_bookmarks
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own rows"  on public.user_flashcard_reviews
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own rows"  on public.user_mcq_attempts
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own rows"  on public.user_study_plan_tasks
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own rows"  on public.user_study_sessions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own rows"  on public.sync_migrations
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ── Admin (PLANNED, optional — enable later) ─────────────────────────────────
-- create or replace function public.is_admin() returns boolean
--   language sql security definer set search_path = public as $$
--   select exists (select 1 from public.profiles
--                  where id = auth.uid() and role = 'admin') $$;
-- Then, per table: create policy "admin read" on <table>
--   for select using (public.is_admin());
```

**Default-deny:** with RLS enabled and only owner policies present, no client (using the
anon key) can read another user's rows — the two-user test in §9 must confirm this.

---

## 4. Proposed TypeScript interfaces (not implemented)

### 4.1 Supabase clients

```ts
// lib/supabase/client.ts   (browser — anon key only)
export function createBrowserSupabase(): SupabaseClient | null; // null if flag off / no env

// lib/supabase/server.ts    (server components / route handlers — cookies via @supabase/ssr)
export function createServerSupabase(): SupabaseClient;

// lib/supabase/admin.ts     (SERVER ONLY — service role; used solely by delete/export route)
export function createAdminSupabase(): SupabaseClient;
```

### 4.2 Cloud snapshot = the shape of a user's synced state

```ts
export interface CloudSnapshot {
  bookmarks: string[];                       // drug ids
  completedTopics: string[];                 // topic slugs
  cardDifficulty: Record<string, Difficulty>;// cardId -> easy|medium|hard
  mcqHistory: MCQAttempt[];                  // {date,total,correct,topic}
  studyPlan: Record<string, string[]>;       // 'YYYY-MM-DD' -> taskId[]
  lastDrug: string;
  examDate: string;                          // 'YYYY-MM-DD'
  streak: { count: number; lastDate: string };
  lastPlanCompletedDate: string;
  settings: { fullName: string; university: string; aiLanguage: string };
}
```

### 4.3 Backend adapter + sync engine

```ts
export interface StoreBackend {
  readSnapshot(): CloudSnapshot;             // sync (LocalStore) — reads pharmaos.* today
  writeSnapshot(s: Partial<CloudSnapshot>): void;
}

// LocalStore: thin wrapper over the EXISTING lib/store.ts helpers (no behaviour change).
// CloudStore: pulls/pushes Supabase and mirrors into LocalStore's cache.

export interface SyncEngine {
  enabled: boolean;                          // NEXT_PUBLIC_ENABLE_CLOUD && session
  init(session: Session | null): Promise<void>;
  migrateOnce(): Promise<{ migrated: boolean; summary: Record<string, number> }>;
  pull(): Promise<void>;                     // cloud -> local cache (merge)
  queueWrite(domain: SyncDomain): void;      // debounced upsert of one domain
  flush(): Promise<void>;
  status: 'idle' | 'syncing' | 'synced' | 'error' | 'offline';
}

type SyncDomain =
  | 'bookmarks' | 'progress' | 'flashcards' | 'mcq'
  | 'studyPlan' | 'settings' | 'streak' | 'lastDrug' | 'lastPlanCompleted';
```

### 4.4 Mappers (localStorage ⇄ rows)

```ts
export function localToSnapshot(): CloudSnapshot;             // reads pharmaos.* keys
export function snapshotToRows(userId: string, s: CloudSnapshot): CloudRowset;  // for upsert
export function rowsToSnapshot(rows: CloudRowset): CloudSnapshot;               // after pull
export function writeSnapshotToLocal(s: CloudSnapshot): void; // hydrate pharmaos.* cache
```

### 4.5 Auth context (client)

```ts
// lib/auth/AuthProvider.tsx
export function useUser(): { user: User | null; loading: boolean };
// Renders children immediately; session resolves client-side after mount so SSR HTML
// stays identical (no hydration regression). Auth-conditional UI is `mounted`-gated.
```

### 4.6 Feature flag

```ts
export const CLOUD_ENABLED =
  process.env.NEXT_PUBLIC_ENABLE_CLOUD === 'true' && !!process.env.NEXT_PUBLIC_SUPABASE_URL;
```

---

## 5. Migration plan (first login, once)

Trigger: user becomes authenticated **and** `sync_migrations` has no row for them.

```
1. read all pharmaos.* keys        → localToSnapshot()
2. pull existing cloud (if any)    → rowsToSnapshot()   (multi-device safety)
3. MERGE local + cloud:
     - sets (bookmarks, completedTopics)         → UNION
     - maps (cardDifficulty, studyPlan by date)  → per-key: keep latest (cloud wins on tie)
     - mcqHistory                                → concat + dedup by (date,total,correct,topic)
     - streak                                    → keep the one with the later lastDate
     - lastPlanCompletedDate / examDate          → keep later date
     - settings                                  → cloud non-empty wins, else local
4. upsert merged → Supabase (batched per table)
5. on SUCCESS:
     - insert sync_migrations row (marker + payload_summary counts)
     - writeSnapshotToLocal(merged)   (cache now matches cloud)
     - toast "Synced successfully ✅"
6. on FAILURE:
     - DO NOT write sync_migrations
     - DO NOT delete/alter localStorage  (V1 data stays safe)
     - toast "Sync failed — your data is safe on this device. Retry?"  (retry button)
```

- **Idempotent:** the `sync_migrations` marker guarantees migration runs at most once.
- **localStorage is never deleted** — it remains the offline cache and keeps mirroring.
- Runs client-side after mount (never during SSR) → no hydration impact.

---

## 6. UI pages / routes

| Route | Type | Purpose |
|---|---|---|
| `/login` | public | Email (magic link/password) + "Continue with Google" |
| `/signup` | public | Same providers; new account |
| `/auth/callback` | route handler | Exchanges code → session cookie, then redirect (`/onboarding` if `!onboarded`, else `/dashboard`) |
| `/onboarding` | auth | Wizard: full name · country · university · MBBS year · subject focus · exam date · language → writes `profiles`, sets `onboarded=true` |
| `/account` | auth | Session info, **sync status**, sign-out, **export data**, **delete account** |
| `/settings` | existing | Add an "Account & Sync" section: signed-in email, last-synced time, "Sync now", link to `/account`; keep all current local controls |

**Navigation/header:** add a small auth control (top-right / sidebar footer): logged-out →
"Sign in"; logged-in → avatar/initials → `/account`. This element is **`mounted`-gated**
so server HTML (logged-out) matches the client's first render.

**Middleware:** `middleware.ts` refreshes the Supabase session cookie on every request
(per `@supabase/ssr`) and **redirects only `/onboarding` and `/account` to `/login`
when unauthenticated**. All study routes stay **public** (login remains optional).

---

## 7. Security

- **Anon key client-only; service-role server-only.** Service role appears solely in
  `lib/supabase/admin.ts`, imported only by the `/api/account/*` route handlers.
- **RLS is a hard prerequisite:** the `NEXT_PUBLIC_ENABLE_CLOUD` flag is not flipped to
  `true` in production until the two-user RLS test (§9) passes.
- **Server-only ops:** account **delete** (`POST /api/account/delete` → admin client
  deletes `auth.users` row, cascades all `user_*` rows) and **export**
  (`GET /api/account/export` → returns the caller's rows as JSON, using their own session,
  RLS-scoped).
- **PII minimization:** store only what onboarding needs; choose an appropriate Supabase
  region; document retention. Keep "for study only — not medical advice."
- **No secret in client bundle:** verify with a production `next build` bundle check.

---

## 8. File-by-file implementation order

> Order chosen so the app keeps building & running (flag off) after **every** step.

1. `package.json` — add `@supabase/supabase-js`, `@supabase/ssr`. *(build still passes)*
2. `.env.example` — add the 3 optional vars + flag (documented as optional).
3. `db/migrations/0002_phase2.sql` + `0002_phase2_rls.sql` — run in Supabase. *(no app change)*
4. `lib/supabase/client.ts`, `server.ts`, `admin.ts` — clients (return null/no-op if flag off).
5. `lib/flags.ts` — `CLOUD_ENABLED`.
6. `lib/auth/AuthProvider.tsx` + `useUser()` — mount into `Shell` (renders children immediately).
7. `middleware.ts` — session refresh; guard `/onboarding`,`/account` only.
8. `app/login/page.tsx`, `app/signup/page.tsx`, `app/auth/callback/route.ts`.
9. `app/onboarding/page.tsx` — profile wizard.
10. `app/account/page.tsx` + `app/api/account/export/route.ts` + `.../delete/route.ts`.
11. `lib/sync/mappers.ts` — `localToSnapshot` / `snapshotToRows` / `rowsToSnapshot` / `writeSnapshotToLocal`.
12. `lib/sync/cloudStore.ts` + `lib/sync/engine.ts` — `SyncEngine` (pull/queueWrite/flush/migrateOnce).
13. Wire `SyncEngine` into a client boundary in `Shell` (runs only when `CLOUD_ENABLED && user`).
14. `app/settings/page.tsx` — add "Account & Sync" section (behind flag).
15. **Flip flag** `NEXT_PUBLIC_ENABLE_CLOUD=true` in a Vercel **Preview** first → test → then Production.

**Not touched:** existing `lib/store.ts` keys/behavior, existing pages' read/write logic,
the `pharmaos.*` key names.

---

## 9. Risk list & mitigations

| Risk | Mitigation |
|---|---|
| Async cloud vs sync UI → big rewrite | **Cache-mirror** design (§0): UI stays synchronous; cloud mirrors localStorage |
| New hydration mismatch from auth UI | Session resolved **client-side after mount**; auth-conditional UI `mounted`-gated; SSR renders logged-out HTML |
| Migration overwrites cloud from a 2nd device | Pull-then-**merge** (union/latest) before upsert; run once via `sync_migrations` marker |
| Partial migration failure loses data | Marker written **only on success**; localStorage never deleted; retry button |
| RLS misconfigured → data leak | Flag stays off until **two-user RLS test** passes; default-deny with owner-only policies |
| Service-role key leaks to client | Key only in `lib/supabase/admin.ts`, imported only by server routes; bundle check |
| Renaming `pharmaos.*` keys breaks V1 users | **Do not rename in Phase 2** (explicit rule) |
| Offline while logged in | Writes queue in localStorage; `SyncEngine.flush()` on reconnect/visibilitychange |
| Supabase free-tier limits | Debounce writes; batch upserts; monitor usage |
| Google OAuth redirect misconfig | Set Site URL + redirect URLs for Vercel prod + preview domains |

---

## 10. Testing checklist (must all pass before flag → prod)

**V1 safety (flag OFF)**
- [ ] Logged-out app is byte-for-byte V1 (dashboard, study-plan, flashcards, exam, search, settings).
- [ ] No hydration error on any page (fresh + seeded localStorage).
- [ ] `next build` passes; no `SUPABASE_SERVICE_ROLE_KEY` in the client bundle.

**Auth**
- [ ] Email signup/login works; Google login works; `/auth/callback` sets session.
- [ ] Logout returns to local mode (reads localStorage again, no crash).
- [ ] `/onboarding` writes `profiles`, sets `onboarded=true`; redirect logic correct.

**Migration & sync (flag ON, preview)**
- [ ] First login migrates all 10 data types once; `sync_migrations` row created.
- [ ] Re-login does **not** re-migrate (idempotent).
- [ ] Cloud data appears after a refresh on the same device.
- [ ] Log in on a **second device** → data pulls down and merges (no loss/dup).
- [ ] Failed migration keeps localStorage intact and shows retry.
- [ ] Toast "Synced successfully" appears on success.

**Security**
- [ ] Two users: user B **cannot** read/update user A's rows (RLS default-deny confirmed).
- [ ] `/api/account/export` returns only the caller's data; `/delete` removes all their rows.

**Deploy**
- [ ] Vercel preview deploy with flag ON works end-to-end; then enable on production.

---

## 11. Explicitly out of scope for Phase 2

- Renaming `pharmaos.*` keys (kept as-is).
- Syllabus/PDF ingestion, RAG tutor, exam-readiness scoring, universities table, per-question
  MCQ rows (Phases 3–5).
- Forcing login — the app stays fully usable logged-out.

> **For study only — not medical advice.**
