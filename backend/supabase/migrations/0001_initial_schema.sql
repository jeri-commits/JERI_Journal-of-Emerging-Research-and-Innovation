-- ===========================================================================
-- JERI — complete schema, consolidated.
--
-- This single file replaces the 13 incremental migrations the schema was
-- actually built up through during development (added/renamed/dropped
-- columns, simplified submission codes, trimmed unused profile fields,
-- etc.). It represents only the final, currently-used structure — nothing
-- here was ever added "for later"; every column is read or written by the
-- frontend or an Edge Function today.
--
-- Columns that existed at some point but are no longer written by any
-- Edge Function were dropped rather than carried forward:
--   - submissions.reviewer_name / reviewer_email / reviewer_institution /
--     reviewer_notes — reviewer identity is handled entirely outside the
--     app (the admin downloads the manuscript and emails it to whichever
--     reviewer they've lined up themselves); keeping it here would also
--     risk leaking reviewer identity to the author, who must stay blind
--     to it per the journal's double-blind review policy.
--   - submissions.copyright_form_key / payment_slip_key — the Final
--     Submission step no longer collects a copyright form or payment
--     slip, only the camera-ready manuscript.
--   - submission_authors.affiliation — superseded by the separate
--     department + institution + country fields the submission form
--     actually collects.
-- ===========================================================================

-- ---------------------------------------------------------------------
-- Shared helper used by every table below that tracks updated_at.
-- is_admin() is defined further down, right after the profiles table
-- it reads from.
-- ---------------------------------------------------------------------
create function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
    new.updated_at = now();
    return new;
end;
$$;

-- ---------------------------------------------------------------------
-- profiles — one row per Supabase Auth user.
-- ---------------------------------------------------------------------
create table public.profiles (
    id uuid primary key references auth.users (id) on delete cascade,
    email text not null,
    role text check (role in ('admin', 'author')),
    full_name text,
    institution text,
    department text,
    bio text,
    created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Is the current authenticated user an admin? Backed by the real
-- profiles row (never a JWT claim the client could shape), so RLS
-- policies that call this are genuine server-side enforcement.
create function public.is_admin()
returns boolean
language sql
stable
security definer set search_path = public
as $$
    select exists (
        select 1 from public.profiles
        where id = auth.uid() and role = 'admin'
    );
$$;

create policy "Users can read their own profile"
    on public.profiles for select
    using (auth.uid() = id);

create policy "Admins can read all profiles"
    on public.profiles for select
    using (public.is_admin());

create policy "Users can update their own profile"
    on public.profiles for update
    using (id = auth.uid())
    with check (id = auth.uid());

-- Column-level grant: RLS above scopes *which row*, this scopes *which
-- columns* — a user can edit their own display info but never their own
-- role (that's admin-only, via the set-user-role Edge Function).
revoke update on public.profiles from authenticated;
grant update (full_name, institution, department, bio) on public.profiles to authenticated;

-- Every signup is a prospective author — there's no practical "no role"
-- state in this product, so the trigger seeds the role directly rather
-- than leaving it null for an admin to assign later.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
    insert into public.profiles (id, email, role)
    values (new.id, new.email, 'author');
    return new;
end;
$$;

create trigger on_auth_user_created
    after insert on auth.users
    for each row execute procedure public.handle_new_user();

-- ---------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------
create type public.submission_status as enum (
    'SUBMITTED',
    'RETURNED_FOR_CORRECTION',
    'UNDER_REVIEW',
    'MAJOR_REVISION',
    'MINOR_REVISION',
    'REVISED_SUBMISSION',
    'ACCEPTED',
    'REJECTED',
    'FINAL_SUBMISSION',
    'RETURNED_FINAL',
    'APPROVED_FOR_PUBLICATION',
    'PUBLISHED'
);

create type public.manuscript_version_type as enum (
    'INITIAL',
    'REVISION',
    'FINAL'
);

create type public.reviewer_decision as enum (
    'MAJOR_REVISION',
    'MINOR_REVISION',
    'REJECTED',
    'ACCEPTED'
);

-- ---------------------------------------------------------------------
-- submissions
-- ---------------------------------------------------------------------
create sequence public.submission_code_seq;

create table public.submissions (
    id uuid primary key default gen_random_uuid(),
    submission_code text unique,
    author_id uuid not null references public.profiles (id),

    -- Manuscript info
    title text not null,
    abstract text not null,
    paper_type text check (paper_type is null or paper_type in (
        'Research Article', 'Review Article', 'Survey Article',
        'Short Communication', 'Others'
    )),
    submission_mode text default 'Regular',
    keywords text[] not null default '{}',
    category text,
    journal_section text,

    -- Contact info (the submitting/corresponding author's own details)
    contact_phone text,
    address_line1 text,
    address_line2 text,
    city text,
    state_province text,
    postal_code text,
    contact_country text,

    -- Workflow state
    status public.submission_status not null default 'SUBMITTED',
    revision_count int not null default 0,

    -- A denormalized "what does the author need to do right now" note,
    -- set by every admin action that requires author follow-up (return
    -- for correction, revision required, final returned) and cleared
    -- when the author resubmits. Lets the author's submissions list show
    -- it without an extra join/query per row.
    latest_feedback_note text,
    latest_feedback_at timestamptz,

    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    submitted_at timestamptz default now(),
    accepted_at timestamptz,
    rejected_at timestamptz,
    published_at timestamptz,
    constraint revision_count_max check (revision_count >= 0 and revision_count <= 3)
);

-- JERI-00001, JERI-00002, ... — a plain 5-digit zero-padded sequence.
create function public.set_submission_code()
returns trigger
language plpgsql
as $$
begin
    if new.submission_code is null then
        new.submission_code := 'JERI-' || lpad(nextval('public.submission_code_seq')::text, 5, '0');
    end if;
    return new;
end;
$$;

create trigger set_submission_code before insert on public.submissions
    for each row execute procedure public.set_submission_code();

create trigger set_submissions_updated_at before update on public.submissions
    for each row execute procedure public.set_updated_at();

create index submissions_author_id_idx on public.submissions (author_id);
create index submissions_status_idx on public.submissions (status);
create index submissions_created_at_idx on public.submissions (created_at);
-- submission_code already has a unique index from the UNIQUE constraint.

-- ---------------------------------------------------------------------
-- submission_authors (co-authors)
-- ---------------------------------------------------------------------
create table public.submission_authors (
    id uuid primary key default gen_random_uuid(),
    submission_id uuid not null references public.submissions (id) on delete cascade,
    name text not null,
    email text not null,
    department text,
    institution text,
    country text,
    author_order int not null default 0,
    corresponding_author boolean not null default false
);

create index submission_authors_submission_id_idx on public.submission_authors (submission_id);

-- ---------------------------------------------------------------------
-- manuscript_versions — immutable, never overwritten
-- ---------------------------------------------------------------------
create table public.manuscript_versions (
    id uuid primary key default gen_random_uuid(),
    submission_id uuid not null references public.submissions (id) on delete cascade,
    version_number int not null,
    revision_number int not null,
    file_name text not null,
    file_size bigint not null,
    mime_type text not null,
    r2_object_key text not null,
    uploaded_by uuid not null references public.profiles (id),
    uploaded_at timestamptz not null default now(),
    version_type public.manuscript_version_type not null,
    unique (submission_id, version_number)
);

create index manuscript_versions_submission_id_idx on public.manuscript_versions (submission_id);

-- Now that manuscript_versions exists, point submissions at its current one.
alter table public.submissions
    add column current_version_id uuid references public.manuscript_versions (id);

-- ---------------------------------------------------------------------
-- reviewer_feedback
-- ---------------------------------------------------------------------
create table public.reviewer_feedback (
    id uuid primary key default gen_random_uuid(),
    submission_id uuid not null references public.submissions (id) on delete cascade,
    version_id uuid not null references public.manuscript_versions (id),
    feedback text not null,
    decision public.reviewer_decision not null,
    created_by uuid not null references public.profiles (id),
    created_at timestamptz not null default now(),

    -- An optional file the admin attaches on behalf of the reviewer
    -- (e.g. an annotated manuscript the reviewer emailed back).
    attachment_key text,
    attachment_name text
);

create index reviewer_feedback_submission_id_idx on public.reviewer_feedback (submission_id);

-- ---------------------------------------------------------------------
-- submission_history — audit trail
-- ---------------------------------------------------------------------
create table public.submission_history (
    id uuid primary key default gen_random_uuid(),
    submission_id uuid not null references public.submissions (id) on delete cascade,
    actor_id uuid references public.profiles (id),
    action text not null,
    previous_status public.submission_status,
    new_status public.submission_status,
    comments text,
    created_at timestamptz not null default now()
);

create index submission_history_submission_id_idx on public.submission_history (submission_id);

-- ---------------------------------------------------------------------
-- notifications
-- ---------------------------------------------------------------------
create table public.notifications (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references public.profiles (id),
    submission_id uuid references public.submissions (id) on delete cascade,
    type text not null,
    title text not null,
    message text not null,
    is_read boolean not null default false,
    created_at timestamptz not null default now()
);

create index notifications_user_id_idx on public.notifications (user_id);

-- ---------------------------------------------------------------------
-- Row-Level Security — submissions and everything hanging off them.
--
-- Everything here is read-heavy from the client (SELECT policies below)
-- and write-only through Supabase Edge Functions using the service-role
-- key (which bypasses RLS) — so the state machine and business rules
-- (valid status transitions, max-3-revisions, etc.) live in those
-- functions, not here. RLS's job is strictly visibility, plus blocking
-- any direct client write that didn't go through a function.
-- ---------------------------------------------------------------------
alter table public.submissions enable row level security;
alter table public.submission_authors enable row level security;
alter table public.manuscript_versions enable row level security;
alter table public.reviewer_feedback enable row level security;
alter table public.submission_history enable row level security;
alter table public.notifications enable row level security;

-- submissions: owner, admin, or public-if-published. No client writes.
create policy "Owner, admin, or published submissions are readable"
    on public.submissions for select
    using (
        author_id = auth.uid()
        or public.is_admin()
        or status = 'PUBLISHED'
    );

-- submission_authors: visible wherever the parent submission is visible.
create policy "Co-authors visible with their submission"
    on public.submission_authors for select
    using (
        exists (
            select 1 from public.submissions s
            where s.id = submission_authors.submission_id
              and (s.author_id = auth.uid() or public.is_admin() or s.status = 'PUBLISHED')
        )
    );

-- manuscript_versions: owner/admin see everything; public sees only the
-- FINAL version of a PUBLISHED submission.
create policy "Versions visible to owner, admin, or as the published final"
    on public.manuscript_versions for select
    using (
        exists (
            select 1 from public.submissions s
            where s.id = manuscript_versions.submission_id
              and (
                  s.author_id = auth.uid()
                  or public.is_admin()
                  or (s.status = 'PUBLISHED' and manuscript_versions.version_type = 'FINAL')
              )
        )
    );

-- reviewer_feedback: owner (author) and admin only — never public.
create policy "Reviewer feedback visible to owner or admin"
    on public.reviewer_feedback for select
    using (
        public.is_admin()
        or exists (
            select 1 from public.submissions s
            where s.id = reviewer_feedback.submission_id
              and s.author_id = auth.uid()
        )
    );

-- submission_history: owner and admin only — the audit trail is internal.
create policy "History visible to owner or admin"
    on public.submission_history for select
    using (
        public.is_admin()
        or exists (
            select 1 from public.submissions s
            where s.id = submission_history.submission_id
              and s.author_id = auth.uid()
        )
    );

-- notifications: strictly your own. The one client-writable column.
create policy "Users read their own notifications"
    on public.notifications for select
    using (user_id = auth.uid());

create policy "Users can mark their own notifications read"
    on public.notifications for update
    using (user_id = auth.uid())
    with check (user_id = auth.uid());

-- RLS scopes *which rows*; this scopes *which column* — without it a
-- client could still flip is_read AND rewrite title/message/type on a
-- row they own. Revoke the broad grant Supabase gives `authenticated`
-- by default, then grant back only the one column that's meant to be
-- client-writable.
revoke update on public.notifications from authenticated;
grant update (is_read) on public.notifications to authenticated;

-- ---------------------------------------------------------------------
-- rate_limits — generic fixed-window counter shared by every Edge
-- Function that needs one (file uploads, reviewer assignment, etc.)
-- rather than each function inventing its own throttling table.
-- ---------------------------------------------------------------------
create table public.rate_limits (
    key text primary key,
    window_start timestamptz not null default now(),
    count int not null default 0
);

alter table public.rate_limits enable row level security;

-- Entirely internal bookkeeping — the client never reads or writes this
-- directly, only Edge Functions via the service role.
create policy "No client access to rate limits"
    on public.rate_limits for all
    using (false);

-- Atomic check-and-increment, done in one round trip so two concurrent
-- requests from the same caller can't both slip through a race between
-- "read the count" and "write the incremented count". Returns true if
-- this call is allowed, false if the caller is over the limit.
create function public.check_rate_limit(
    p_key text,
    p_max_count int,
    p_window_seconds int
)
returns boolean
language plpgsql
security definer set search_path = public
as $$
declare
    v_window_start timestamptz;
    v_count int;
begin
    insert into public.rate_limits (key, window_start, count)
    values (p_key, now(), 1)
    on conflict (key) do update set
        window_start = case
            when public.rate_limits.window_start < now() - (p_window_seconds || ' seconds')::interval
                then now()
            else public.rate_limits.window_start
        end,
        count = case
            when public.rate_limits.window_start < now() - (p_window_seconds || ' seconds')::interval
                then 1
            else public.rate_limits.count + 1
        end
    returning window_start, count into v_window_start, v_count;

    return v_count <= p_max_count;
end;
$$;

-- ---------------------------------------------------------------------
-- password_reset_tokens — self-service "forgot password" flow. Tokens
-- are generated and verified only by Edge Functions using the
-- service-role key (request-password-reset / reset-password) — RLS here
-- is enabled with zero policies, so no client (not even an authenticated
-- one) can read, insert, or guess its way into this table directly.
-- ---------------------------------------------------------------------
create table public.password_reset_tokens (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users (id) on delete cascade,
    token_hash text not null unique,
    expires_at timestamptz not null,
    used_at timestamptz,
    created_at timestamptz not null default now()
);

create index password_reset_tokens_user_id_idx on public.password_reset_tokens (user_id);
create index password_reset_tokens_expires_at_idx on public.password_reset_tokens (expires_at);

alter table public.password_reset_tokens enable row level security;
-- Deliberately no policies: every access path is server-side (service role).

-- ---------------------------------------------------------------------
-- email_log — queryable record of every email attempt (including the
-- exact rendered HTML that was sent), so a failure or a "what did this
-- email actually say" question is something an admin can look up
-- directly instead of only ever existing in a Supabase Functions log
-- stream or an inbox.
-- ---------------------------------------------------------------------
create table public.email_log (
    id uuid primary key default gen_random_uuid(),
    to_email text not null,
    subject text not null,
    status text not null check (status in ('sent', 'failed')),
    error_message text,
    body_html text,
    submission_id uuid references public.submissions (id) on delete set null,
    created_at timestamptz not null default now()
);

create index email_log_status_idx on public.email_log (status);
create index email_log_submission_id_idx on public.email_log (submission_id);

alter table public.email_log enable row level security;

-- Admin-only — this is an internal diagnostic log, never author-facing,
-- and never client-writable (only the mailer, via the service role).
create policy "Admins can read the email log"
    on public.email_log for select
    using (public.is_admin());
