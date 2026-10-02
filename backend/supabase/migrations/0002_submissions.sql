-- Submission / review / versioning schema for the author+admin workflow.
-- Everything here is read-heavy from the client (RLS SELECT policies
-- below) and write-only through Supabase Edge Functions using the
-- service-role key (which bypasses RLS) -- so the state machine and
-- business rules (valid status transitions, max-3-revisions, etc.) live
-- in those functions, not here. RLS's job is strictly visibility, plus
-- blocking any direct client write that didn't go through a function.

-- ---------------------------------------------------------------------
-- Helper: is the current authenticated user an admin? Backed by the
-- real profiles row (never a JWT claim the client could shape), so RLS
-- policies that call this are genuine server-side enforcement.
-- ---------------------------------------------------------------------
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
    title text not null,
    abstract text not null,
    keywords text[] not null default '{}',
    category text,
    journal_section text,
    status public.submission_status not null default 'SUBMITTED',
    revision_count int not null default 0,
    reviewer_name text,
    reviewer_email text,
    reviewer_institution text,
    reviewer_notes text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    submitted_at timestamptz default now(),
    accepted_at timestamptz,
    rejected_at timestamptz,
    published_at timestamptz,
    constraint revision_count_max check (revision_count >= 0 and revision_count <= 3)
);

create function public.set_submission_code()
returns trigger
language plpgsql
as $$
begin
    if new.submission_code is null then
        new.submission_code := 'JERI-' || extract(year from now())::text
            || '-' || lpad(nextval('public.submission_code_seq')::text, 6, '0');
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
    affiliation text,
    institution text,
    author_order int not null default 0,
    corresponding_author boolean not null default false
);

create index submission_authors_submission_id_idx on public.submission_authors (submission_id);

-- ---------------------------------------------------------------------
-- manuscript_versions -- immutable, never overwritten
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
    created_at timestamptz not null default now()
);

create index reviewer_feedback_submission_id_idx on public.reviewer_feedback (submission_id);

-- ---------------------------------------------------------------------
-- submission_history -- audit trail
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
-- Row-Level Security
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

-- reviewer_feedback: owner (author) and admin only -- never public.
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

-- submission_history: owner and admin only -- the audit trail is internal.
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

-- RLS scopes *which rows*; this scopes *which column* -- without it a
-- client could still flip is_read AND rewrite title/message/type on a
-- row they own. Revoke the broad grant Supabase gives `authenticated`
-- by default, then grant back only the one column that's meant to be
-- client-writable.
revoke update on public.notifications from authenticated;
grant update (is_read) on public.notifications to authenticated;
