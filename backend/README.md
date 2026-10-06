# JERI backend (Supabase)

This folder holds everything that runs on Supabase: the Postgres schema and
Row-Level Security (RLS) policies in `supabase/migrations/`, plus the Edge
Functions in `supabase/functions/`. There is no server to deploy.

## What this does (auth)

Email + password, handled by Supabase Auth directly — no magic link, no
email-confirmation step (deliberately skipped: the account is usable the
instant it's created).

1. **Sign up**: user enters an optional display name, email, and password
   on `/sign-up`. Frontend calls `supabase.auth.signUp({ email, password })`
   — Supabase hashes and stores the password itself; this codebase never
   sees it again after that one call.
2. The `on_auth_user_created` trigger (see
   `supabase/migrations/0001_profiles.sql`) seeds `public.profiles` with
   `role: null` the instant the Auth user is created.
3. The frontend immediately calls the `send-welcome-email` Edge Function,
   which emails **"your account has been created"** through your
   Hostinger SMTP mailbox — confirming the email/username, **never
   repeating the password** (see "A note on the welcome email" below).
4. **Sign in**: `/sign-in` takes email + password →
   `supabase.auth.signInWithPassword(...)`.
5. **You** open the Supabase dashboard → Table Editor → `profiles` (or,
   once you have a first admin, `/admin/users` in the app) and set `role`
   to `admin` or `author` by hand. Until then, that account is treated as
   public (no dashboard access).

### A note on the welcome email

The user who requested this build initially asked for the password to be
included in the welcome email. That was pushed back on and the final
decision was **not** to include it: emailing a plaintext password means
it sits in an inbox (and often a mail server's logs) indefinitely, so a
compromised inbox becomes a compromised JERI account too. The email
confirms the account exists; it never repeats the password. There is also
no password-reset flow yet — out of scope for this round; flagged as a
gap below.

## One-time setup

### 1. Create the Supabase project

- Go to https://supabase.com/dashboard → New project (free tier, no card
  required). Pick a name, a database password (save it somewhere safe —
  it's for direct Postgres access, not something you'll type often), and a
  region close to your users.

### 2. Run the schema migrations

Easiest path — paste-and-run in the dashboard, **in order**: `0001` →
`0002` → `0003` → `0004` → `0005` → `0006`, each depending on the ones
before it (`is_admin()` from `0002`, etc.) — paste each file's contents
into a new SQL Editor query and run it before moving to the next.

(Or, if you prefer the CLI: `npx supabase link --project-ref <ref>` then
`npx supabase db push` from this `backend/` folder — it applies every
migration file in order automatically.)

### 3. Enable email/password sign-in, disable email confirmation

- Authentication → Providers → Email: make sure **Email** is enabled.
- Authentication → Providers → Email → turn **Confirm email** **OFF**
  (per the decision above — accounts are usable immediately after
  signup, with no "click to verify" step).

That's it for Supabase Auth settings — no SMTP config and no redirect
URL allowlist needed here, since Supabase itself no longer sends any
auth email. The welcome email is entirely the `send-welcome-email` Edge
Function's job (via your Hostinger SMTP secrets, set up below).

### 4. Get your API keys (for the frontend)

- Project Settings → API → copy the **Project URL** and the **anon
  public** key into `frontend/.env` (see `frontend/.env.example`). The anon
  key is safe to ship in the browser bundle — it only ever acts within
  whatever RLS policies allow.

## Assigning roles

Two ways, once the Edge Functions are deployed:

- **In the app**: sign in as an admin → `/admin/users` → pick a role from
  the dropdown next to each account. Calls `set-user-role`
  (admin-only, server-verified — a role can never be self-assigned).
- **Directly**: Supabase dashboard → Table Editor → `profiles` → set
  `role` on the row by hand. Useful for bootstrapping your *first* admin
  account, since no admin exists yet to use the in-app option.

Either way, they get dashboard access next time they sign in (or on next
profile fetch).

## Submission workflow setup (Edge Functions + R2 + SMTP)

The functions in `supabase/functions/` are the only way the `submissions`
table (and friends) can be mutated — RLS makes them otherwise read-only
from the client on purpose. Each function verifies the caller's session
and real `profiles.role` itself; nothing trusts the frontend.

| Function | Who | Does |
| --- | --- | --- |
| `create-submission` | author | Creates a submission + co-authors, uploads the manuscript to R2, records version 1 (`INITIAL`) |
| `return-for-correction` | admin | `SUBMITTED` → `RETURNED_FOR_CORRECTION` with a required comment |
| `assign-reviewer` | admin | Records reviewer contact info, → `UNDER_REVIEW`, emails the reviewer a signed download link |
| `record-reviewer-decision` | admin | Logs `reviewer_feedback`, moves status to the matching outcome (`MAJOR_REVISION`/`MINOR_REVISION`/`ACCEPTED`/`REJECTED`) |
| `submit-revision` | author | Uploads a new version (enforces the 3-revision cap), → `REVISED_SUBMISSION` |
| `submit-final` | author | Uploads the `FINAL` version after acceptance, → `FINAL_SUBMISSION` |
| `final-approve` | admin | `approve` → `APPROVED_FOR_PUBLICATION`, `return` → `RETURNED_FINAL`, `reject` → `REJECTED` |
| `publish` | admin | `APPROVED_FOR_PUBLICATION` → `PUBLISHED` |
| `get-download-url` | anyone | Signed R2 URL — public only for a `PUBLISHED` submission's `FINAL` version; owner/admin for anything else |
| `submit-correction` | author | `RETURNED_FOR_CORRECTION` → `SUBMITTED`; edits metadata and/or replaces the manuscript without touching `revision_count` |
| `set-user-role` | admin | Sets `profiles.role` for any user — the only way a role ever changes besides editing the table directly |
| `send-welcome-email` | any newly-signed-up user | Confirms account creation via Hostinger SMTP — never includes the password |

Every function that mutates data or sends email is rate-limited
(`_shared/rateLimit.ts`, backed by migration `0006_rate_limits.sql`): 5
calls per 10 minutes per caller for the file-upload ones, 30 per hour for
the admin action ones. `get-download-url` is intentionally unlimited —
it's the only function the anonymous public calls.

### 1. Create the Cloudflare R2 bucket

- Cloudflare dashboard → R2 → Create bucket. Note the bucket name.
- R2 → Manage API Tokens → create a token scoped to just this bucket
  (read + write). Note the Access Key ID, Secret Access Key, and your
  Cloudflare Account ID (shown on the R2 overview page).

### 2. Install the Supabase CLI and deploy the functions

```bash
npm install -g supabase
supabase link --project-ref <your-project-ref>
supabase functions deploy
```

### 3. Set the function secrets

Copy `supabase/functions/.env.example` to `supabase/functions/.env.local`
(gitignored), fill in real values, then:

```bash
supabase secrets set --env-file supabase/functions/.env.local
```

`SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are injected automatically
once deployed — you only need those two in `.env.local` for *local*
testing with `supabase functions serve --env-file supabase/functions/.env.local`.

### 4. Calling a function from the frontend

```ts
const { data, error } = await supabase.functions.invoke('create-submission', {
    body: { title, abstract, keywords, coAuthors, fileName, mimeType, fileBase64 },
})
```

`supabase.functions.invoke` automatically attaches the signed-in user's
access token, which is what every function's `requireUser()` check reads.

## Manual test checklist (once real infra exists)

Everything above is written and statically verified (`deno check`/`deno
lint` on every function, `npm run build`/`eslint` on the frontend) but
**has never run against a real Supabase project, R2 bucket, or SMTP
mailbox**. Once you've done the one-time setup above plus the R2/SMTP
secrets, here's what to actually click through, in order:

### Auth
- [ ] `/sign-up` with a new email + password (8+ chars) → account created,
  redirected to `/` (role is `null` until you assign one).
- [ ] Check that inbox: **welcome email arrives from your Hostinger
  address**, confirms the email/username, and — deliberately —
  **does not contain the password**.
- [ ] Sign out, go to `/sign-in`, log back in with that same email +
  password → succeeds.
- [ ] Try `/sign-in` with the right email and a wrong password → fails
  with a real error, not a silent redirect.
- [ ] Set that account's role to `author` via `/admin/users` (once you
  have a first admin — see below) or the Supabase dashboard. Sign out,
  sign back in → redirected to `/author`.
- [ ] Repeat with `role = admin` → redirected to `/admin`.
- [ ] Sign out → protected routes (`/author/*`, `/admin/*`) redirect to
  `/sign-in` when visited directly.
- [ ] Try signing up twice with the same email → Supabase rejects the
  second one with a clear "already registered" error.

### Author flow
- [ ] `/author/submissions/new` → fill the form, attach a real PDF,
  submit → redirected to the new submission's detail page, status
  `SUBMITTED`.
- [ ] Check your inbox: **submission-received email** arrived, and
  **every admin** got a "new submission" email.
- [ ] `/admin/email-log` shows both as `sent`.

### Admin: triage → review → decision
- [ ] `/admin/submissions/:id` on that `SUBMITTED` paper → **Return for
  Correction** with a comment → author's email + in-app notification
  arrive; status → `RETURNED_FOR_CORRECTION`.
- [ ] As the author, `/author/submissions/:id` now shows the correct-
  and-resubmit form, pre-filled. Edit the title, resubmit → status back
  to `SUBMITTED`, admin notified.
- [ ] Back as admin, this time **Assign Reviewer** with a real email you
  can check → that inbox gets the **reviewer email with a working signed
  download link** (open it, confirm the PDF downloads) → status
  `UNDER_REVIEW`.
- [ ] **Record Reviewer Decision** = Minor Revision, with feedback →
  author gets the revision-required email; status `MINOR_REVISION`.

### Revisions (the 3-cap is the thing most worth breaking on purpose)
- [ ] As author, upload Revision 1 → status `REVISED_SUBMISSION`,
  `revision_count` = 1. Admin re-assigns reviewer → records Major
  Revision → author uploads Revision 2 (`revision_count` = 2) → repeat
  once more for Revision 3 (`revision_count` = 3).
- [ ] Try to submit a 4th revision → **must be blocked** with "Maximum
  revision limit reached" — confirm this is a real 403 from the Edge
  Function, not just a disabled button (e.g. hit it via the browser
  console or just trust the function code, but don't just trust the UI).

### Acceptance → final → publication
- [ ] Record Reviewer Decision = Accepted → author gets acceptance email,
  status `ACCEPTED`.
- [ ] Author uploads the final version → status `FINAL_SUBMISSION`,
  admins notified + emailed.
- [ ] Admin **Approve for Publication** → author gets the approval
  email, status `APPROVED_FOR_PUBLICATION`.
- [ ] Admin **Publish** → status `PUBLISHED`.
- [ ] `/archives` (no login, use a private/incognito window) → the paper
  now appears, grouped by publish month. Open it, download the PDF
  **without being signed in** — this is the one function
  (`get-download-url`) that must work anonymously.

### Rejected / returned-final paths (don't skip — different code paths)
- [ ] A separate submission: Record Reviewer Decision = Rejected →
  rejection email, status `REJECTED`, confirm it does **not** show up in
  `/archives`.
- [ ] A separate accepted submission: at the final-submission stage, use
  **Return Final Version** instead of approving → author gets the
  "final returned" email, status `RETURNED_FINAL`, author can re-upload.

### Security (confirm these actually fail, not just "look protected")
- [ ] As a signed-in author, try to open another author's
  `/author/submissions/:id` by guessing/pasting a different UUID — RLS
  should make the query return nothing.
- [ ] As an author, try calling an admin-only function directly (e.g.
  `supabase.functions.invoke('publish', {...})` from the browser
  console) — must 403.
- [ ] As a non-admin, try to visit `/admin/users` directly by URL — route
  guard should redirect to `/access-denied`.
- [ ] Try to demote yourself from `/admin/users` — the dropdown is
  disabled on your own row; `set-user-role` also rejects it server-side
  if called directly (403 "You cannot remove your own admin role"),
  so a single-admin deployment can't accidentally lock itself out.
- [ ] Hammer `create-submission` 6 times in a row within 10 minutes — the
  6th should 429.

### Profile editing
- [ ] `/author/profile` → edit name/institution/ORCID/bio → save → reload
  → changes persisted. Confirm you *cannot* change your own role from
  here (there's no field for it, and the column grant blocks it even if
  you tried via the API directly).

## Known gap: no password reset

Not requested, not built. If a user forgets their password there is
currently no self-service way to recover the account — only a direct
Supabase dashboard action (Authentication → Users → reset password) by
whoever has dashboard access. Worth adding
(`supabase.auth.resetPasswordForEmail`) before this goes in front of
real users.
