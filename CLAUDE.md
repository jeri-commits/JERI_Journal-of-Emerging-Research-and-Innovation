# JERI — Journal of Emerging Research and Innovation

## Project summary

A journal website with three access tiers:
- **Public** — anyone, read-only (home, archives, author guidelines, editorial board, ethics, contact, paper submissions info).
- **Author** — authenticated, `/author` dashboard.
- **Admin** — authenticated, `/admin` dashboard.

Email + password auth (switched from an earlier magic-link-only design —
see "Auth flow" below for the history). Sign-up collects an optional
display name, email, and password; sign-in is email + password. After
signup, a "your account was created" email goes out through the
project's own Hostinger Business Email SMTP (not Supabase's default
mailer) — it confirms the email/username and **deliberately never
repeats the password** (that was a real decision point, not an
oversight — see "Auth flow").

## Tech stack

- **Frontend**: `frontend/` — React 19 + Vite + TypeScript, Tailwind v4,
  react-router-dom, zustand, react-hook-form + zod, framer-motion, a custom
  Radix-based UI kit under `frontend/src/components/ui/`. Built on a
  template originally called "Ecme" (see `package.json` name) — most of
  `components/template`, `components/ui`, `components/layouts` are
  template scaffolding, not JERI-specific.
- **Backend**: `backend/` — **Supabase** (Postgres + Auth + RLS). No
  server to run/deploy — Supabase's Auth service sends the magic-link email
  itself via custom SMTP configured in its dashboard.
  `backend/supabase/migrations/` holds the schema (currently just
  `profiles`, seeded by an `on_auth_user_created` trigger).
- **File storage**: deferred (planned: Cloudflare R2, not yet built —
  chosen for free egress and a generous free tier; Postgres will only ever
  store the R2 object key, not the file).
- Full setup steps (Supabase project creation, SMTP config, redirect URLs):
  see `backend/README.md`.

## Auth flow (implemented)

**History**: originally built as magic-link-only (no passwords at all —
user entered email, got a sign-in link). Later explicitly replaced with
email + password at the user's request. Two things were flagged and
decided before building the replacement, worth knowing if this comes up
again:
- The user's original ask was to **include the password in the
  post-signup email**. That was pushed back on as a real security
  anti-pattern (plaintext password sitting in an inbox indefinitely) —
  the user agreed, and the email now confirms account creation without
  ever repeating the password.
- Email verification-on-signup was considered and **deliberately
  skipped** — accounts are usable immediately after `signUp()`, no
  "click to confirm your email" step.
- The magic-link code (`sendSignInLink`/`completeSignInWithLink`,
  `/auth/verify`, `signInWithOtp`/`exchangeCodeForSession`) was fully
  removed, not left dormant alongside the new flow.

**Current flow**:
1. `frontend/src/views/auth/SignUp` — email + password + optional
   display name → `AuthContext.signUp` → `AuthService.apiSignUp` →
   `supabase.auth.signUp({ email, password })`, then invokes the
   `send-welcome-email` Edge Function.
2. `frontend/src/views/auth/SignIn` — email + password →
   `AuthContext.signIn` → `AuthService.apiSignIn` →
   `supabase.auth.signInWithPassword(...)`.
3. `frontend/src/auth/AuthProvider.tsx` drives `authenticated`/`user` off
   `supabase.auth.onAuthStateChange` (unchanged by the password switch —
   session handling is identical regardless of how the session was
   created), fetches the `profiles` row
   (`frontend/src/services/supabase/profiles.ts`) for `role`, and
   redirects `admin` → `/admin`, `author` → `/author`, else → public entry.
4. Roles are assigned via `/admin/users` (calls the admin-only
   `set-user-role` Edge Function) or manually in the Supabase dashboard
   (`profiles.role`) to bootstrap the first admin.
5. Route guards (`frontend/src/components/route/{ProtectedRoute,
   AuthorityGuard,PublicRoute}.tsx`, `useAuthority` hook) were **not**
   modified by either auth rewrite — they already implemented the
   public/author/admin split correctly; only the data feeding them changed.
6. **No password-reset flow yet** — not requested, flagged as a gap in
   `backend/README.md`.

## Conventions

- 4-space indentation, no semicolons (project's existing Prettier config).
- Path alias `@/` → `frontend/src/`.
- Route + nav config lives in `frontend/src/configs/routes.config/` and
  `frontend/src/configs/navigation.config/` — add routes there, not by
  hand-wiring `<Route>` elsewhere.
- Views are grouped by audience under `frontend/src/views/{public,author,
  admin,auth}/`.

## Submission/review system (in progress)

Building out a full author/admin paper-submission-and-review workflow per
a detailed spec (manuscript versioning, max 3 revisions, manual
reviewer-via-email recorded by admin, R2 storage, SMTP notifications,
audit trail, public archive gated on final admin approval). Decisions
made for this build:
- **No Google OAuth this round** — staying email-only (magic link).
- **Supabase Edge Functions**, not a separate Node/Express server, host
  all server-side business logic (status transitions, revision-count
  enforcement, R2 orchestration, email sending). RLS handles visibility
  only; it deliberately does not re-implement the state machine.
- Delivered in **phases with checkpoints**, not one continuous push.

**Phase 1 (done)**: schema + RLS —
`backend/supabase/migrations/0002_submissions.sql`. Tables:
`submissions`, `submission_authors`, `manuscript_versions`,
`reviewer_feedback`, `submission_history`, `notifications`. RLS allows
`SELECT` only (owner/admin/public-if-published) plus authors marking
their own notifications read.

**Phase 2 (done)**: Edge Functions — `backend/supabase/functions/`.
Shared helpers in `_shared/` (`auth.ts` verifies the caller's session +
real `profiles.role` server-side; `statusTransitions.ts` is the single
source of truth for the state machine + the 3-revision cap;
`storage.ts` is the R2 client via `aws4fetch`; `mailer.ts` +
`emailTemplates.ts` are the Hostinger SMTP service, `EmailService.*`).
Eight functions: `create-submission`, `return-for-correction`,
`assign-reviewer`, `record-reviewer-decision`, `submit-revision`,
`submit-final`, `final-approve`, `publish` — see the table in
`backend/README.md`. **Written but never executed against a real
Supabase project or R2 bucket** — no live infra exists yet (see below).

**Known gap in the spec itself** (not something left unbuilt by
oversight): there's no defined path from `RETURNED_FOR_CORRECTION` back
into the pipeline — flagged in `backend/README.md`.

**Phase 3 (done)**: frontend wiring. New types (`@types/submissions.ts`),
read services (`services/supabase/submissions.ts`,
`services/supabase/adminUsers.ts`) and a mutation wrapper
(`services/supabase/workflow.ts`, around `supabase.functions.invoke`).
Shared UI: `StatusBadge`, `SubmissionTimeline`, `ManuscriptVersionList`,
`NotificationsPanel`. New routes: `/author/submissions`,
`/author/submissions/new`, `/author/submissions/:id`,
`/admin/submissions`, `/admin/submissions/:id`, `/admin/users`,
`/archives/:id`. `views/author/index.tsx` and `views/admin/index.tsx`
rewritten off their mock `useState` arrays onto real Supabase queries.
`Archives/components/MonthArchives.tsx` now queries real `PUBLISHED`
submissions instead of a hard-coded array. Added a 9th Edge Function,
`get-download-url` (callable anonymously for a published paper's final
version; owner/admin for anything else) and migration
`0003_admin_profiles_policy.sql` (admins can read all `profiles` rows —
needed for `/admin/users` and showing author identity on submissions).

**Phase 4 (done)**: closed three of the gaps above.
- **Resubmit after correction**: added the `RETURNED_FOR_CORRECTION` →
  `SUBMITTED` transition and a `submit-correction` Edge Function (author
  can edit title/abstract/keywords/category/section and optionally
  replace the manuscript; doesn't touch `revision_count` — this is a
  pre-review fix, not a peer-review revision cycle). Wired into
  `views/author/Submissions/Detail.tsx`.
- **Profile fields**: migration `0004_profile_fields.sql` adds
  `full_name, phone, institution, department, country, orcid, bio,
  avatar_url` to `profiles`, plus an RLS `UPDATE` policy + column-level
  `GRANT` so a user can edit their own display info directly from the
  client (no Edge Function needed) but never their own `role`. New
  `/author/profile` and `/admin/profile` routes share one
  `components/shared/ProfileEditor.tsx`.
- **Email failure logging**: migration `0005_email_log.sql` adds an
  admin-only `email_log` table; `_shared/mailer.ts` now writes a row on
  every send attempt (sent or failed), not just `console.error`.

**Phase 5 (done)**: the remaining punch-list items.
- **Rate limiting**: migration `0006_rate_limits.sql` adds a
  `rate_limits` table + `check_rate_limit()` Postgres function (atomic
  fixed-window check-and-increment, one round trip). `_shared/rateLimit.ts`
  wraps it as `enforceRateLimit(key, maxCount, windowSeconds)`. Applied to
  every mutating function: 5/10min for the file-upload ones
  (`create-submission`, `submit-revision`, `submit-final`,
  `submit-correction`), 30/hour for the admin email-sending/role ones
  (`assign-reviewer`, `record-reviewer-decision`, `return-for-correction`,
  `final-approve`, `publish`, `set-user-role`). Deliberately **not**
  applied to `get-download-url` (would block legitimate anonymous public
  readers).
- **Admin role assignment**: new `set-user-role` Edge Function (admin-
  only; a role can never be set by anyone acting on their own account via
  any client path — `profiles.role` isn't in the column grant from
  migration 0004). `/admin/users` (`views/admin/Users/List.tsx`) now has
  a role `<select>` per row instead of being read-only; a user can't
  change their own role from the UI (dropdown disabled on self).
- **Email log viewer**: `/admin/email-log`
  (`views/admin/EmailLog/index.tsx`) reads the `email_log` table added in
  Phase 4.
- **Dashboard chart + CSV export**: `views/admin/index.tsx` has a
  horizontal bar chart (submissions by status, via `react-apexcharts`,
  already a project dependency) under the stat cards.
  `views/admin/Submissions/List.tsx` has a CSV export button (via
  `react-csv`, already a dependency) for the currently filtered list.

**Phase 5 cleanup sweep**: deleted `services/OAuthServices.ts` (dead code
returning fake `placeholder_token`/`Placeholder User` data — exactly the
kind of mock the spec says not to leave; nothing imported it since
Supabase auth replaced it). Fixed `AuthorLayout.tsx`/`AdminLayout.tsx`:
their sidebars linked to non-existent hash fragments
(`/author#submissions`, `/admin#triage`, etc.) left over from before
Phase 3 built the real pages — now point at the real routes. Their
header name always showed a hard-coded fake name (`Prof. Alex Rivera` /
`Dr. Sarah Jenkins`) because `user.userName` is never populated by the
Supabase auth flow — now shows the real email.

**Phase 6**: replaced magic-link auth with email + password (see "Auth
flow" above for the full account of the decision and what was removed).
Added the `send-welcome-email` Edge Function (12th total) +
`EmailService.sendWelcomeEmail`. Recreated `views/auth/SignUp/`, rewrote
`SignInForm.tsx`/`AuthService.ts`/`AuthContext.ts`/`AuthProvider.tsx`,
deleted `views/auth/VerifyEmail/`.

Every Edge Function (12 total) passes `deno check` + `deno lint` clean.
The frontend passes `npm run build` + `eslint` clean (zero new errors
across all six phases — remaining warnings/errors are pre-existing
project-wide nits, not from this work).

**Phase 7**: live infra wiring + author/admin UI cleanup, run against the
real deployed Supabase project (not just statically verified).
- Linked the repo to the live Supabase project via the CLI
  (`supabase link`), repaired migration history to mark 0001-0006 as
  already applied (they'd been run by hand in the SQL editor, not via the
  CLI), then deployed all 12 Edge Functions and set secrets for real —
  confirmed end-to-end signup → profile row → welcome email (`email_log`
  status `sent`) against a real test account and real Hostinger SMTP.
- **`0007_default_author_role.sql`**: every new signup is now seeded with
  `role = 'author'` directly in `handle_new_user()`, not `null`. There's
  no practical "pending" state in this product — a signed-up user's only
  job is to submit a manuscript, so they get `/author` access
  immediately; admin stays a manual promotion via `/admin/users` or the
  dashboard. Backfilled existing `null`-role rows to `author`.
- **`0008_simplify_profile_fields.sql`**: dropped `phone`, `country`,
  `orcid`, `avatar_url` from `profiles` — fields the UI collected but
  nothing displayed or used. Profile is now just `full_name`,
  `institution`, `department`, `bio` (plus the immutable `email`/`role`).
  Column-level grant updated to match. `ProfileEditor.tsx` and
  `services/supabase/profiles.ts` trimmed accordingly.
- **Dashboard chrome cleanup** (`AuthorLayout.tsx`, `AdminLayout.tsx`):
  removed the "Public Site"/"Back to Main Journal" exit links and the
  persona badges (`Research Contributor`/`Editorial Board`,
  `Sparkles` icon) — once inside the dashboard there's no path back to
  the public site other than Logout, which now always lands on
  `unAuthenticatedEntryPath` (already true before this phase, via
  `AuthProvider.signOut`). Header is now just: logo, avatar-initials +
  name/email, Logout. `AuthProvider` now populates `user.userName` from
  `profiles.full_name` (previously always blank, so headers fell back to
  raw email everywhere).
- Every author/admin route now sets route meta `footer: false` — these
  pages were inheriting the public-site `Footer` ("Copyright © Ecme...")
  from the template's default `PageContainer`, which doesn't belong in
  an app dashboard.

## Known gaps / next TODOs

- Supabase project not yet created by the user (env vars in
  `frontend/.env` are placeholders) — **nothing in this codebase has been
  run against a real Supabase instance, R2 bucket, or SMTP mailbox yet**.
  Every Edge Function and migration is written and statically verified
  (type-check + lint), not execution-tested. Don't claim end-to-end
  verification without real infra — see `backend/README.md` for the full
  manual test checklist to run once that infra exists.
- No Google OAuth (deliberate, see "Submission/review system" above).
- No password-reset flow (deliberate scope cut for this round — see
  `backend/README.md`'s "Known gap" section).
- `docs/architecture.md` describes the **pre-Supabase** state (mock auth,
  no backend) — treat it as historical/stale until updated.
