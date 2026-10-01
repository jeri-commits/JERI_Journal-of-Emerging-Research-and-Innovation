# Architecture

## Runtime flow

`src/main.tsx` mounts `App`. `App` composes the theme, browser router, auth provider, route-aware layout, and `Views`. `Views` renders the configured routes inside a suspense loader.

Route definitions are in `frontend/src/configs/routes.config/`. Public routes are available without a role; author routes allow `author` and `admin`; admin routes require `admin`. Route guards are implemented in `frontend/src/components/route/`.

The layouts in `frontend/src/components/layouts/` select the public journal, pre-login, author, or admin shell based on the current route and authentication state. Page components are grouped under `frontend/src/views/` by audience.

## Data and backend boundary

Auth and profile lookups live in `frontend/src/services/AuthService.ts` and
`frontend/src/services/supabase/profiles.ts`, talking directly to
**Supabase** (Postgres + Auth), configured in
`frontend/src/configs/supabase.config.ts`. The schema and RLS policies are
in `backend/supabase/migrations/`; there is no server to deploy. See
`CLAUDE.md` and `backend/README.md` for the full picture.

The old axios-mock-adapter auth mocking has been removed (it only ever
mocked auth, which is now real).

The full author/admin paper-submission-and-review workflow (manuscript
versioning, reviewer-decision recording, Cloudflare R2 storage, SMTP
notifications, audit trail, public archive) is built end to end:
Postgres schema + RLS in `backend/supabase/migrations/`, business logic
in `backend/supabase/functions/` (Supabase Edge Functions -- the only
way `submissions` and related tables can be mutated; RLS only grants
`SELECT`), and the frontend reads directly via `services/supabase/` and
mutates via `services/supabase/workflow.ts` wrapping
`supabase.functions.invoke`. `views/author/index.tsx` and
`views/admin/index.tsx` are wired to real data, not mock arrays. See
`CLAUDE.md`'s "Submission/review system" section for the phase-by-phase
breakdown and `backend/README.md` for the manual test checklist -- none
of it has run against a live Supabase project, R2 bucket, or SMTP
mailbox yet, since that infrastructure doesn't exist.

## Deployment

Deployment config is not yet finalized post-Supabase-migration (the old
root `netlify.toml` was removed). `frontend/` builds with `npm run build`
to static output that can be hosted anywhere (Netlify, Cloudflare Pages,
Vercel) with an SPA fallback to `index.html`.

## References

`docs/references/legacy-expo-design.md` is a retained design document from an Expo project. It is not the JERI product specification. The old root `test.html` was an unrelated portfolio page and has been removed.
