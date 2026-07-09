# MedCrux — Phase 2 Cloud Sync Go-Live Runbook

> Turn on cloud sync **safely**. Do this only after auth is fully verified. Cloud
> sync is a **cache-mirror**: the app keeps working on `localStorage` (V1); the
> engine mirrors it to Supabase only when signed in **and** the flag is on.

---

## 1. Preconditions (all must be ✅ before enabling sync)

- [ ] **Supabase SQL migration applied** — `db/migrations/0002_phase2_auth_sync.sql` run in Supabase → SQL Editor (all `user_*` tables, `profiles`, `sync_migrations`, trigger).
- [ ] **RLS policies verified** — every user table has RLS enabled with an owner-only policy (`auth.uid() = user_id`; `profiles` on `id`).
- [ ] **Email login works** — `/login` shows the real form (not "Cloud login not configured yet") and sign-in succeeds.
- [ ] **Google login works** — "Continue with Google" completes and returns to the app.
- [ ] **Onboarding profile save works** — `/onboarding` saves to `profiles` with no RLS error.
- [ ] **Account page works** — `/account` shows email + profile; Export and Sign out work.
- [ ] **Sign out works** — returns to logged-out (local) mode, app still usable.
- [ ] **Vercel env vars correct** — see §2, added to the right environment, followed by a redeploy.

> If any box is unchecked, **do not enable sync yet.** Fix auth/RLS first —
> debugging sync on a broken foundation is far harder.

---

## 2. Required Vercel env vars

Vercel → Project `medcrux` → **Settings → Environment Variables** (add to **Production** and **Preview**):

| Variable | Value | Notes |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://<ref>.supabase.co` | public |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJ…` (anon public) | public |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJ…` (service_role) | **server-only** — never exposed to the client; used only by `/api/account/delete` |
| `NEXT_PUBLIC_CLOUD_SYNC_ENABLED` | `true` | flips the sync engine ON |

---

## 3. ⚠️ Important: the flag is build-time

`NEXT_PUBLIC_CLOUD_SYNC_ENABLED` (like all `NEXT_PUBLIC_*`) is **inlined at build time**.

- Changing it in Vercel does **nothing** until you **redeploy**.
- Always **Redeploy** after adding/changing any env var.

---

## 4. Go-live steps (Preview first, then Production)

1. **Preview:** set `NEXT_PUBLIC_CLOUD_SYNC_ENABLED=true` on the **Preview** environment.
2. **Redeploy Preview** (Deployments → ⋯ → Redeploy, or push a commit).
3. On the Preview URL: **test one-user sync** (§5 items 1–8).
4. **Second device/browser:** log in as the **same** user → confirm data merges down.
5. **Two-user RLS isolation:** log in as a **different** user → confirm you see only your own data (never user A's).
6. If all pass → set `NEXT_PUBLIC_CLOUD_SYNC_ENABLED=true` on **Production**.
7. **Redeploy Production.** Verify once more on `https://medcrux.vercel.app`.

---

## 5. Test checklist (run on the Preview deploy with the flag ON)

**Auth & profile**
- [ ] **Login** succeeds; header shows the account avatar.
- [ ] **Onboarding** saves profile (name, university, year, subjects, exam date, language).

**Sync (do the action → refresh → confirm it persists, then check Supabase Table Editor)**
- [ ] **Bookmark sync** — bookmark a drug → row appears in `user_bookmarks`.
- [ ] **Completed topic sync** — mark a topic done → row in `user_progress`.
- [ ] **Flashcard difficulty sync** — rate a card Hard → row in `user_flashcard_reviews`.
- [ ] **MCQ history sync** — finish a test → row in `user_mcq_attempts`.
- [ ] **Study plan tasks sync** — tick a plan task → row in `user_study_plan_tasks`.
- [ ] **Settings / exam date sync** — set exam date + language → `profiles.exam_date` / `ai_language`; last drug/streak/last-plan-date → `user_settings`.
- [ ] **"✅ Synced successfully"** toast appears on first login.

**Session & multi-device**
- [ ] **Logout → login again** — data reloads from cloud.
- [ ] **Cross-device check** — same user on a 2nd browser/device → data merges (union, no loss/dup).
- [ ] **RLS two-user check** — user B cannot read/see user A's rows.

---

## 6. Rollback (instant, safe)

If anything misbehaves after go-live:

1. Set `NEXT_PUBLIC_CLOUD_SYNC_ENABLED=false` in Vercel (Production/Preview).
2. **Redeploy.**

Result:
- The sync engine goes **inert**; the app returns to pure **V1 localStorage** behavior.
- **On-device data keeps working** (nothing local is deleted).
- **Cloud data remains safe** in Supabase (untouched by rollback) — re-enabling later resumes sync.

> Rollback changes **no app code** — it's just a flag + redeploy.

---

## 7. Common errors & fixes

| Symptom | Likely cause | Fix |
|---|---|---|
| **"Cloud login not configured yet"** on `/login` | Supabase env missing / not on this environment / no redeploy after adding | Add `NEXT_PUBLIC_SUPABASE_URL` + `ANON_KEY` to the right env → **Redeploy** |
| **RLS violation** ("new row violates row-level security policy") | RLS section of the SQL not run, or policy missing | Re-run the RLS block in `0002_phase2_auth_sync.sql`; confirm each `user_*` table has the owner policy |
| **Missing table / relation does not exist** | SQL migration not run (or partially) | Re-run the full `0002_phase2_auth_sync.sql` in SQL Editor |
| **`redirect_uri_mismatch`** (Google) | Google Console redirect URI is wrong | Use **Supabase's** callback: `https://<ref>.supabase.co/auth/v1/callback` (NOT the app's `/auth/callback`) |
| **Provider not enabled** | Google provider off in Supabase | Supabase → Auth → Providers → Google → enable + paste Client ID/Secret |
| **Sync toast not showing** | Flag off, not signed in, or no redeploy after flag change | Confirm `NEXT_PUBLIC_CLOUD_SYNC_ENABLED=true` **and redeployed**; confirm you're logged in |
| **Data not appearing on 2nd device** | Flag off on that deploy, different account, or sync not finished | Verify same account + flag on; wait for the debounced push (~2s) then refresh; check Supabase Table Editor for rows |
| **Onboarding won't save** | `profiles` table/trigger missing or RLS blocking | Ensure migration ran (table + `on_auth_user_created` trigger); RLS `own profile` policy present |

---

## Quick reference

- **Flag:** `NEXT_PUBLIC_CLOUD_SYNC_ENABLED` (build-time → redeploy to apply)
- **SQL:** `db/migrations/0002_phase2_auth_sync.sql`
- **Design:** `docs/PHASE2_AUTH_SYNC.md`
- **Engine:** `lib/sync/*` · **Gate:** `components/SyncGate.tsx`
- **Golden rule:** verify auth + RLS **before** flipping the flag; rollback is one flag + redeploy.

> For study only — not medical advice.
