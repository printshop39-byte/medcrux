# Deploying MedCrux

MedCrux is a standard **Next.js 15** app and deploys to **Vercel** with zero
configuration. **No database is required** for the current version.

---

## 1. Deploy to Vercel

### Option A — Vercel dashboard (recommended)

1. Push the project to a Git repo (GitHub / GitLab / Bitbucket).
2. Go to <https://vercel.com/new> and **Import** the repo.
3. Set **Root Directory** to `pharmaos/` (the folder containing `package.json`).
4. Framework preset auto-detects **Next.js** — leave the defaults:
   - Build command: `next build`
   - Output: handled by Next.js (App Router)
   - Install command: `npm install`
5. Click **Deploy**. That's it — no env vars needed.

### Option B — Vercel CLI

```bash
npm i -g vercel
cd pharmaos
vercel          # preview deploy
vercel --prod   # production deploy
```

---

## 2. The app works without a database

- All content (drugs, concepts, MCQs, viva, prescriptions) is **typed seed data**
  bundled in `lib/` — no backend fetch.
- All **user state** (bookmarks, progress, streak, study-plan checklist, exam date,
  settings, MCQ history, flashcard difficulty) is stored in the browser via
  **`localStorage`** (see `lib/store.ts`).
- This means a fresh deploy is instantly usable and works offline after first load.

### Implications

- Data is **per-device / per-browser**. There is no cross-device sync yet.
- Clearing site data / using a different browser starts fresh.
- No server-side user accounts in this version.

---

## 3. Environment variables (all optional)

Set these in **Vercel → Project → Settings → Environment Variables** only if needed.
See [`.env.example`](../.env.example).

| Variable | Required? | Purpose |
|----------|-----------|---------|
| `ANTHROPIC_API_KEY` | Optional | Enables full Claude answers in the AI Tutor. Without it, preset answers still work offline. |
| `NEXT_PUBLIC_SUPABASE_URL` | Optional (unused now) | Placeholder for future cloud sync. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Optional (unused now) | Placeholder for future cloud sync. |

> The app builds and runs with **none** of these set.

---

## 4. Supabase can be wired later (do not add it yet)

The current release intentionally has **no Supabase requirement**. When cloud
login / sync is desired later:

1. Create a Supabase project and run [`db/schema.sql`](../db/schema.sql).
2. Enable Google + Email auth providers.
3. Add the two `NEXT_PUBLIC_SUPABASE_*` env vars.
4. Install `@supabase/supabase-js` and replace the `localStorage` reads/writes in
   `lib/store.ts` — the function shapes already match the SQL tables, so the UI
   does not change.

Until then, **do not add Supabase as a build/runtime dependency.**

---

## 5. Pre-deploy sanity

```bash
cd pharmaos
npm run build      # must pass with no type errors
```

Then walk the manual checklist in [`PRODUCTION_QA.md`](PRODUCTION_QA.md).
