# Production QA checklist

Run through this manually before shipping a release. Use a **production build**
locally (`npm run build && npm start`) and/or a Vercel preview deployment.

> Tip: test once in a normal window and once in a **fresh/incognito** window
> (empty `localStorage`) to catch first-load and hydration issues.

## Build & load

- [ ] `npm run build` passes with **no type errors** and no build warnings that fail CI.
- [ ] App loads at `/` and redirects to `/dashboard`.
- [ ] **Dashboard loads without a hydration error** (no red overlay; browser console has no "hydration"/"did not match" errors) — check both fresh and with existing localStorage data.

## Core flows

- [ ] **Study Plan progress works** — ticking tasks on `/study-plan` updates the count/bar; returning to `/dashboard` reflects it; completing all 6 shows "Plan done 🔥"; unchecking removes it.
- [ ] **Flashcards work** — `/flashcards` flips on tap, swipe left/right navigates, Easy/Medium/Hard save; keyboard shortcuts (Space/←/→/1/2/3) work; concept cards appear in "General Pharmacology".
- [ ] **Exam modes work** — `/exam` MCQ test scores and saves history; oral viva, short-answer, and prescription-writing modes open; keyboard shortcuts work; "important-only" filter works.
- [ ] **Search filters work** — `/search` filters by name, class, topic, ⭐ important, 🔁 frequent, side effect, disease/use, and Antibiotics/CVS/CNS quick chips; result count updates live.
- [ ] **Bookmarks work** — bookmarking a drug on `/drug/[id]` shows it under `/bookmarks`; weak topics and last-revised appear.
- [ ] **Settings persist** — name, university, exam date, and AI language on `/settings` survive a refresh; "reset all local data" clears state.
- [ ] **Progress page** — topic completion, MCQ accuracy, flashcard difficulty, and streak render without errors.

## Navigation & UI

- [ ] **Mobile bottom nav works** — at mobile width all 6 tabs (Dashboard, Study Plan, Topics, Flashcards, Exam, AI Tutor) are visible and route correctly; the bar does not overlap content.
- [ ] **Floating ? help works** — the bottom-right `?` button opens the shortcuts overlay; `?` key opens it; `Esc` and outside-click close it; typing in the search box does not open it; the overlay is page-aware.
- [ ] Desktop sidebar navigation works and highlights the active route.

## PWA / offline

- [ ] **PWA installable check** — `app/manifest.webmanifest` is served (visit `/manifest.webmanifest`); name = "MedCrux — MBBS Exam Revision App", `theme_color` = `#256a66`, `display` = `standalone`, icon present. Browser shows an install / "Add to Home Screen" affordance.
- [ ] After first load, revision still works with the network offline (state comes from `localStorage`).

## Regression / data

- [ ] Existing `localStorage` data still appears after mount on every page (dashboard, study-plan, flashcards, progress, bookmarks, settings).
- [ ] No console errors while navigating across all pages.
- [ ] "For study only — not medical advice" disclaimer is present.
