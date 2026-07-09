# MedCrux V2 — Architecture Plan

> **Status: design only. No code in this document is implemented yet.**
> V1 (current, localStorage-only, live on Vercel) must keep working at every step.
> Everything below is **additive** and **optional-until-ready**.

MedCrux V2 turns a local pharmacology revision app into a **secure, syllabus-aware
study platform** for MBBS students in Russia (esp. Indian students): their Russian
university syllabus + college manuals + international references + Indian-style simple
explanations, wrapped in an AI tutor with **cited sources**, secure login, cloud sync,
and an **exam-readiness score**.

---

## 0. Guiding principles

1. **Never break V1.** Current features work offline via `localStorage`. V2 adds a
   cloud layer *behind an adapter*; logged-out users keep the exact V1 experience.
2. **Offline-first.** `localStorage` stays as the local cache; Supabase is the sync
   truth when logged in. Write-through + background sync.
3. **Content model is subject-agnostic** so Phase 6 (Anatomy, Physiology, etc.) needs
   no re-architecture.
4. **Security by default.** Row Level Security on all per-student data; private
   storage; server-only secrets; AI grounded + rate-limited.
5. **Grounded AI.** The tutor answers **from the student's syllabus/PDFs/references**
   and shows citations — not free hallucination.

---

## 1. V2 System Architecture

```
                         ┌────────────────────────────────────────┐
                         │            Next.js (Vercel)             │
   Student (mobile-first)│  App Router · Server + Client Components │
        │                │  Middleware (auth guard)                │
        ▼                │  /api/* route handlers (RAG, sync, …)   │
   ┌─────────┐           └───────────────┬────────────────────────┘
   │ Browser │  localStorage cache        │  @supabase/ssr (cookies)
   └─────────┘  (offline-first)           ▼
                              ┌──────────────────────────────┐
                              │            Supabase           │
                              │  Auth (Email + Google)        │
                              │  Postgres + RLS + pgvector    │
                              │  Storage (private buckets)    │
                              │  Edge Functions (ingest/score)│
                              └───────────────┬──────────────┘
                                              │ service role (server only)
                                              ▼
                              ┌──────────────────────────────┐
                              │   Claude API (server only)    │
                              │   RAG tutor · gen MCQ/viva     │
                              └──────────────────────────────┘
```

**Storage adapter (the key to not breaking V1):**
`lib/store.ts` becomes an interface with two backends —

- `LocalStore` (today's implementation, unchanged behaviour) — used when logged out.
- `CloudStore` (Supabase) — used when logged in.

On first login, a **one-time migration** reads existing `pharmaos.*` keys and upserts
them to the student's cloud rows; thereafter the cloud is source of truth with the
local cache mirroring it.

---

## 2. Database Schema Proposal

> Postgres (Supabase). `auth.users` is managed by Supabase Auth. All **per-student**
> tables carry `user_id uuid` and are protected by RLS (`auth.uid() = user_id`).
> Content/catalog tables are **public-read, admin-write**.

### 2.1 Identity & catalog

```sql
-- Student profile (1:1 with auth.users)
profiles(
  id uuid pk references auth.users on delete cascade,
  email text, full_name text, avatar_url text,
  country text default 'India',
  university_id uuid references universities,
  study_year int,                 -- 1..6
  exam_date date,
  ai_language text default 'English',   -- English | Hinglish | Russian
  role text default 'student',    -- student | admin | uni_admin
  created_at timestamptz default now()
)

universities(
  id uuid pk, name text, city text, country text default 'Russia',
  aliases text[],                 -- "Kazan State Medical University", "KSMU"
  created_at timestamptz default now()
)

subjects(                         -- pharmacology, anatomy, physiology, …
  id uuid pk, code text unique, name text, "order" int
)

user_subjects(                    -- which subjects a student is actively studying
  user_id uuid, subject_id uuid, study_year int, active bool default true,
  primary key (user_id, subject_id)
)
```

### 2.2 Syllabus, documents, RAG

```sql
documents(                        -- any source PDF: syllabus / lecture / manual / reference
  id uuid pk,
  owner_scope text,               -- 'system' | 'university' | 'user'
  university_id uuid null, subject_id uuid null, study_year int null,
  title text, source_type text,   -- syllabus | lecture | manual | textbook | reference
  language text,                  -- ru | en
  storage_path text,              -- Supabase Storage key (private)
  pages int, uploaded_by uuid,
  license_note text,              -- copyright/visibility flag
  status text default 'pending',  -- pending | processing | ready | failed
  created_at timestamptz default now()
)

syllabus_topics(                  -- extracted structure of a syllabus document
  id uuid pk, document_id uuid references documents on delete cascade,
  subject_id uuid, module text, title text, "order" int,
  page_ref int, created_at timestamptz default now()
)

document_chunks(                  -- text chunks for retrieval (RAG)
  id uuid pk, document_id uuid references documents on delete cascade,
  chunk_index int, content text,
  page_from int, page_to int,
  token_count int,
  embedding vector(1536)          -- pgvector; ANN index (ivfflat/hnsw)
)

topic_links(                      -- map syllabus topics -> existing MedCrux content
  id uuid pk, syllabus_topic_id uuid references syllabus_topics on delete cascade,
  content_type text,              -- drug | concept | mcq | viva | flashcard
  content_id text,                -- id in the seed/content tables
  confidence real,                -- semantic match score
  reviewed bool default false     -- human-verified
)
```

### 2.3 Content catalog (migrate today's typed seed data → tables)

`topics`, `drugs`, `concepts`, `mcqs`, `viva_questions`, `prescriptions`,
`flashcards(derived)` — same shapes as `lib/*.ts` today (already mirrored in
`db/schema.sql`). These stay **seedable from code** so the offline app still bundles them.

### 2.4 Per-student progress (RLS: `auth.uid() = user_id`)

```sql
user_progress(user_id, subject_id, topic_id null, completed bool, updated_at)
user_bookmarks(user_id, content_type, content_id, created_at)
user_flashcard_reviews(                       -- spaced repetition / memory score
  user_id, flashcard_id, difficulty, ease_factor real,
  interval_days int, due_at timestamptz, last_reviewed timestamptz)
user_mcq_attempts(user_id, mcq_id, subject_id, topic_id, selected_index,
                  correct bool, created_at)   -- accuracy + weak-topic detection
user_viva_progress(user_id, viva_id, topic_id, confidence int, last_reviewed)  -- 1..5
user_study_plan(user_id, plan_date date, task_id text, done bool)
user_study_sessions(user_id, session_date date, minutes int, source text)      -- streak
user_settings(user_id, name, university, exam_date, ai_language, theme)
user_exam_readiness(                          -- cached composite (recomputed on events)
  user_id, subject_id, score int, components jsonb, updated_at)
```

### 2.5 AI tutor history & quotas

```sql
ai_conversations(id, user_id, subject_id, title, created_at)
ai_messages(id, conversation_id, role, content, created_at)
ai_citations(id, message_id, document_id, chunk_id, page_from, page_to)
ai_usage(user_id, usage_date date, requests int, tokens int)   -- rate limiting
```

### 2.6 Storage buckets (Supabase Storage, all **private**)

- `syllabi/` — official/university syllabus PDFs
- `documents/` — lecture manuals, references, user uploads
- Access only via **signed URLs** issued server-side after an RLS/ownership check.

---

## 3. Syllabus Ingestion System

```
Upload PDF ─▶ Storage(documents/…) + documents row (status=pending)
   │
   ▼ (Edge Function / server job, queued)
Extract text ─▶ (native PDF text; OCR fallback for scanned RU PDFs)
   │
   ▼
Chunk (by heading/page, ~500–1000 tokens) ─▶ document_chunks
   │
   ├─▶ LLM structure pass ─▶ syllabus_topics (module, topic, order, page_ref)
   │
   └─▶ Embed each chunk ─▶ vector(1536) (pgvector)
             │
             ▼
Map topics ─▶ topic_links (semantic match to drugs/concepts/mcqs/viva) ─▶ human review
   │
   ▼
documents.status = ready   (now searchable + tutor-grounded + shown in syllabus view)
```

- **Text extraction:** native extraction first; **OCR fallback** (Tesseract / cloud OCR)
  for scanned Russian PDFs and image-based manuals.
- **Language:** store `ru`/`en`; keep original + optional translated summary.
- **Provenance:** every chunk keeps `document_id` + page range → enables **citations**.
- **Mapping:** syllabus topics link to existing MedCrux content; unmapped topics become
  candidates for AI-generated content (MCQ/viva/flashcards) queued for review.
- **Admin tooling:** upload UI, processing status, topic-mapping review screen.
- **Legal guardrail:** copyrighted textbooks are **not** redistributed publicly — a
  `license_note` + `owner_scope` gate visibility (owner/university only).

---

## 4. AI Tutor System (grounded RAG)

```
Student question (scoped to university + subject + year)
   │
   ▼ embed question
Vector search over document_chunks
   (filter: student's university/subject/year + international references)
   │  top-k chunks (with document_id + page)
   ▼
Compose prompt: system + student profile (year, language) + retrieved context(+ids)
   │
   ▼  Claude (server only, streaming)
Grounded answer  +  citations[chunk → document + page]
   │
   ├─ "Explain simply" / "Hinglish" / "Russian" reformat
   ├─ "Generate 5 MCQs" / "Generate viva Qs" / "Make flashcards"  → saved & linked to topic
   └─ Guardrail: if not in context → say so + general reference; always "not medical advice"
   │
   ▼
Persist ai_messages + ai_citations; increment ai_usage (quota)
```

- **Model:** Claude `claude-sonnet-5` default; escalate to a stronger tier for hard
  compare/mechanism questions. Server-only key (`ANTHROPIC_API_KEY`).
- **Citations UI:** chips under the answer — e.g. `📄 KSMU Pharmacology Manual · p.42`,
  clicking opens the PDF at that page (signed URL).
- **Languages:** English / **Hinglish** / Russian, driven by `profiles.ai_language`.
- **Generation → content:** generated MCQ/viva/flashcards attach to the current topic so
  they feed progress/scoring, not just chat.
- **Safety/quotas:** per-day request+token limits (`ai_usage`); input validation; refusal
  for non-study/clinical-decision requests; consistent "for study only" footer.
- **Fallback:** with no API key, keep V1's offline preset answers from the local library.

---

## 5. UI/UX Upgrade

- **Clean medical-SaaS aesthetic:** teal brand, card-based, generous whitespace,
  light+dark themes, mobile-first, desktop sidebar + mobile bottom nav (already built).
- **Icon system:** replace emoji with a consistent **SVG icon set** for body systems &
  drug classes (ANS, CVS, CNS, antibiotics, endocrine…), used across topics/cards/nav.
- **Visual mechanism cards:** small SVG MOA diagrams (receptor/pathway) on drug pages,
  plus existing mnemonics — "see it, not just read it."
- **Onboarding wizard:** university → year → subjects (3 quick steps) after signup.
- **Dashboard:** an **exam-readiness ring** + per-subject cards + today's plan + streak.
- **Subtle animations only:** micro-interactions (card flip, fade, progress fill) via a
  light motion lib; **respect `prefers-reduced-motion`**; nothing distracting.
- **Syllabus view:** browse your university's syllabus modules → topics → linked content.
- **Citations & PDF viewer:** inline source chips + a lightweight PDF page viewer.

---

## 6. Progress & Exam-Readiness Scoring

| Metric | Source | Definition |
|---|---|---|
| Subject progress | `user_progress` vs syllabus topics | topics completed ÷ total |
| Topic progress | reviews + attempts per topic | coverage of flashcards/MCQ/viva for that topic |
| MCQ accuracy | `user_mcq_attempts` | correct ÷ attempted (overall + per topic, rolling) |
| Viva readiness | `user_viva_progress` | avg confidence (1–5) across viva items |
| Flashcard memory | `user_flashcard_reviews` | SR retention (due vs mastered; ease/interval) |
| Weak topics | composite | low accuracy + hard cards + low viva confidence |
| Daily plan completion | `user_study_plan` | today's 6 tasks done (already in V1) |
| Study streak | `user_study_sessions` | consecutive study days (already in V1) |

**Exam-readiness % (per subject) — proposed weighting:**

```
readiness =  0.30 * topic_coverage
           + 0.30 * mcq_accuracy
           + 0.20 * flashcard_memory
           + 0.20 * viva_readiness      (all normalised 0–1) × 100
```

- Computed by a SQL function / Edge Function on relevant events (attempt, review, mark-done)
  and cached in `user_exam_readiness`. Weak-topic list surfaces on the dashboard and feeds
  the adaptive daily study plan.

---

## 7. Old consultancy model vs. new MedCrux model

| | **Old — study consultancy** | **New — MedCrux platform** |
|---|---|---|
| Core offer | Admission help, visa/travel support, forwarding generic PDFs/notes | Personalized, syllabus-aware study + AI tutor |
| Personalization | One-size-fits-all material | Per university / year / subject / weak topics |
| Content | Static forwarded files | Syllabus-linked drugs, MCQs, viva, flashcards + cited AI answers |
| Progress | None | Topic/subject progress, MCQ accuracy, viva readiness, memory score |
| Outcome signal | None | **Exam-readiness %** + weak-topic guidance |
| Interaction | Human, ad-hoc, working hours | 24×7 AI tutor grounded in *their* syllabus |
| Scale/econ | Service, headcount-bound, admission commissions | SaaS product; scales; data network effect (more syllabi → better) |
| Retention | Ends after admission | Daily study loop (streak, plan, readiness) keeps students returning |

**In one line:** old = *get admitted & here are some PDFs*; new = *pass your exams — a
personalized, syllabus-based AI tutor that tracks your readiness.*

---

## 8. Route & Page Structure (App Router)

**Public**
- `/` (landing) · `/login` · `/signup` · `/auth/callback`

**Onboarding (auth required)**
- `/onboarding` — university → year → subjects

**Student app (auth required, behind middleware)**
- `/dashboard` · `/study-plan` · `/subjects` · `/subjects/[subject]`
- `/syllabus` · `/syllabus/[docId]` (modules → topics → linked content, PDF viewer)
- `/topics` · `/topics/[topic]` · `/drug/[id]` · `/concept/[id]`
- `/flashcards` · `/exam` · `/search` · `/revision`
- `/ai-tutor` (grounded chat + citations) · `/bookmarks` · `/progress`
- `/settings` · `/account`

**Admin / university (role-gated)**
- `/admin` · `/admin/upload` · `/admin/documents` · `/admin/syllabi`
- `/admin/topic-mapping` (review AI topic↔content links)

**API / server**
- `POST /api/tutor/ask` (RAG, streaming) · `POST /api/tutor/generate` (mcq/viva/flashcards)
- `POST /api/ingest` (kick off/receive ingestion) · `POST /api/sync` (local→cloud migration)
- `GET /api/readiness` · `GET /api/documents/:id/signed-url`

**Supabase Edge Functions**
- `ingest-pdf` (extract+chunk+embed) · `embed-chunks` · `compute-readiness`

---

## 9. Security Plan

- **Auth:** Supabase Auth (Email + Google). Sessions via `@supabase/ssr` (HTTP-only
  cookies). Next.js **middleware** guards `/dashboard`, `/study-plan`, `/ai-tutor`, etc.
- **RLS everywhere on user data:** every `user_*` table policy = `auth.uid() = user_id`
  for select/insert/update/delete. Content/catalog tables: public read, admin write.
- **Role gating:** `profiles.role` (`student`/`admin`/`uni_admin`) checked in policies +
  middleware for `/admin/*`.
- **Storage:** all buckets **private**; access only through **server-issued signed URLs**
  after an ownership/role check. Copyrighted material scoped to owner/university.
- **Secrets server-only:** `SUPABASE_SERVICE_ROLE_KEY` and `ANTHROPIC_API_KEY` never
  reach the client; only `NEXT_PUBLIC_SUPABASE_URL` + `ANON_KEY` are public.
- **AI abuse controls:** per-user rate limits + token quotas (`ai_usage`), input
  validation, and grounding/refusal guardrails.
- **Privacy/compliance:** collect minimal PII; pick an appropriate Supabase region;
  add data-export/delete for accounts; clear "for study only — not medical advice".
- **Copyright:** never redistribute paid textbooks publicly; license-flag every document.

---

## 10. Phased Roadmap & Implementation Order

| Phase | Goal | Key work | V1 impact |
|---|---|---|---|
| **1. Stabilize (now)** | Keep MedCrux V1 live & solid | Bug-fix only, add basic analytics; freeze breaking changes | None |
| **2. Auth + cloud sync** | Secure login, per-student data | Supabase project; `@supabase/ssr`; `profiles`; **storage adapter** (Local↔Cloud); one-time local→cloud migration; RLS; onboarding (university/year/subject); middleware | Additive; logged-out = exact V1 |
| **3. Syllabus / PDF ingestion** | Real Russian syllabi in the app | Storage buckets; upload/admin UI; extract→chunk→embed (pgvector); `syllabus_topics`; topic-mapping review | New sections only |
| **4. AI tutor + citations** | Grounded, sourced answers | `/api/tutor/ask` RAG; retrieval + citations UI + PDF viewer; generation→content; quotas | New `/ai-tutor` upgrade |
| **5. Visual + gamified** | Engagement & retention | SVG icon system; mechanism cards; readiness ring; badges/streak polish; subtle motion | Visual refresh |
| **6. Multi-subject** | Beyond Pharmacology | Seed Anatomy/Physio/Biochem/Micro/Path via same content model; per-subject readiness | Content expansion |

**Recommended build order within Phase 2 (safest first cloud step):**
1. Create Supabase project + tables (§2.1, §2.4) + RLS; keep app env-optional.
2. Introduce the **storage adapter** interface around today's `lib/store.ts` (no behaviour change).
3. Add auth pages + middleware + `profiles` + onboarding.
4. Implement `CloudStore`; wire the **login-time migration** (`pharmaos.*` → cloud upsert).
5. Ship behind a flag; verify logged-out users are byte-for-byte V1.

---

## 11. What we deliberately do NOT do yet

- No code changes in this phase — this is the plan.
- No forced login — the app stays usable logged-out (offline V1) indefinitely.
- No public hosting of copyrighted textbooks.
- No Supabase hard-dependency in the build (env stays optional until Phase 2 ships).

> **For study only — not medical advice.**
