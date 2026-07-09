# PharmaOS 💊

A clean, mobile-first study app for **3rd-year MBBS students** revising **Pharmacology** — short exam-focused points, flashcards, MCQs, viva and drug comparison.

Built with **Next.js 15 · TypeScript · Tailwind CSS**. Works **offline** out of the box (PWA-friendly); **Supabase** and the **Claude AI tutor** plug in when you add keys.

---

## Quick start

```bash
cd pharmaos
npm install
npm run dev
```

Open <http://localhost:3000> → it redirects to `/dashboard`.

The app runs fully with **no configuration** — all drug data lives in `lib/drugs.ts`, and your progress/bookmarks are saved in the browser (`localStorage`).

---

## Production readiness checklist

- **Local dev** — `npm install` then `npm run dev` → <http://localhost:3000>.
- **Production build** — `npm run build` then `npm start`. The build must pass with no type errors before deploying.
- **Vercel deploy** — import the repo (root = `pharmaos/`), framework auto-detects **Next.js**. No build config needed. See [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md).
- **Environment variables** — **none required.** All env vars are optional (see [`.env.example`](.env.example)); set them in Vercel → Project → Settings → Environment Variables only if you want the Claude tutor or a future Supabase integration.
- **Supabase (optional, later)** — the current version needs **no database**; it is not a dependency. Cloud sync/login can be wired later without changing the UI (`lib/store.ts` shapes match `db/schema.sql`).
- **Offline / PWA** — ships a web manifest (`app/manifest.webmanifest`), theme color `#256a66`, standalone display, and an app icon, so it is installable/add-to-home-screen friendly. State persists in `localStorage`, so revision works offline after first load.
- **Known limitations** — data is **per-device / per-browser** (no cross-device sync yet); clearing browser storage resets progress; the AI Tutor free-text mode needs an API key (presets work offline); there is no server-side auth in this version.

Full manual QA steps: [`docs/PRODUCTION_QA.md`](docs/PRODUCTION_QA.md).

---

## Pages

| Route | What it does |
|-------|--------------|
| `/dashboard` | Today's revision, weak topics, exam countdown, progress %, continue button, study-plan progress, revision CTA |
| `/study-plan` | Daily study plan with per-day checklist + progress and "Plan done 🔥" habit marker |
| `/topics` | The 9 pharmacology categories |
| `/topics/[topic]` | Drug cards inside a topic (General Pharmacology shows concept cards) + mark-as-done |
| `/concept/[conceptId]` | General-pharmacology concept card: definition, exam short answer, viva, example, mnemonic |
| `/drug/[drugId]` | Full exam card: class, MOA, uses, side effects, contraindications, interactions, mnemonic, viva, MCQ practice, exam tags |
| `/revision` | 15-min quick revision, today's weak drugs, last-minute exam list, antibiotics/CVS/CNS crash revision |
| `/flashcards` | Flip cards, rate Easy/Medium/Hard (hard cards repeat 3× more) |
| `/exam` | Random 20-Q test, topic tests, **oral viva**, **short-answer**, **prescription writing (рецептура)**, important-only filter, score history |
| `/ai-tutor` | Preset buttons (Explain in 30s, Simple English, Russian, Compare, Viva, MCQs) |
| `/search` | Advanced filters: name, class, topic, ⭐ important, 🔁 frequent, side effect, disease/use, Antibiotics/CVS/CNS |
| `/bookmarks` | Saved drugs, weak topics, last revised |
| `/progress` | Topic completion, MCQ accuracy, flashcard difficulty, streak |
| `/settings` | Name, university, exam date, AI language, reset data |

---

## Architecture

```
pharmaos/
├─ app/                 # Next.js App Router pages + /api/tutor route
├─ components/          # Shell (sidebar + bottom nav), SearchBar, MCQBlock
├─ lib/
│  ├─ types.ts          # Domain types (mirror db/schema.sql)
│  ├─ topics.ts         # 9 topics
│  ├─ drugs.ts          # 38 seeded drugs (+ JSON merge)  ← single source of truth
│  ├─ concepts.ts       # 12 General Pharmacology concept cards
│  ├─ prescriptions.ts  # 12 prescription-writing templates
│  ├─ content.ts        # flashcards / MCQ bank / viva bank / search (derived)
│  ├─ tutor.ts          # offline AI-tutor answer generation
│  └─ store.ts          # localStorage: bookmarks, progress, streak, study plan, history
└─ db/schema.sql        # Supabase/Postgres schema + RLS + topic seed
```

**Data flow today:** `lib/drugs.ts` → derived flashcards/MCQs/viva → pages. User state → `localStorage`.

**Swapping to Supabase later:** the function shapes in `lib/store.ts` match the `db/schema.sql` tables, so you replace the `localStorage` reads/writes with Supabase queries without touching the UI.

---

## Enable the Claude AI Tutor (optional)

```bash
cp .env.example .env.local
# then set ANTHROPIC_API_KEY=sk-ant-...
```

Restart `npm run dev`. The `/ai-tutor` free-text box and preset buttons now return
full Claude answers (default model `claude-sonnet-5`). Without a key, presets still
work offline from your drug library.

---

## Enable Supabase auth + cloud sync (optional)

1. Create a project at <https://supabase.com>.
2. In the SQL editor, run [`db/schema.sql`](db/schema.sql) (creates tables, RLS, seeds topics).
3. Enable **Google** and **Email** providers under Authentication → Providers.
4. Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` to `.env.local`.
5. Install the client: `npm install @supabase/supabase-js` and wire it into `lib/store.ts`.

---

## Seed data

38 high-yield drugs across ANS, CVS, CNS, antibiotics, anti-TB, endocrine, NSAIDs
and autacoids — each with MOA, uses, side effects, contraindications, interactions,
a mnemonic, viva Q&A, MCQs and exam tags (⭐ important / 🔁 frequently asked). Plus
12 General Pharmacology concept cards (`lib/concepts.ts`) and 12 prescription-writing
templates (`lib/prescriptions.ts`).

**Add more drugs without touching code** — drop JSON into `data/drugs.json` or import
a CSV with `node scripts/csv-to-json.mjs file.csv`. See [`data/README.md`](data/README.md).

> ⚠️ **For study only — not medical advice.**
