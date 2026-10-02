-- Queryable record of every email attempt, so a failure (SMTP outage,
-- bad address, etc.) is something an admin can actually look up instead
-- of only ever existing in a Supabase Functions log stream.
create table public.email_log (
    id uuid primary key default gen_random_uuid(),
    to_email text not null,
    subject text not null,
    status text not null check (status in ('sent', 'failed')),
    error_message text,
    submission_id uuid references public.submissions (id) on delete set null,
    created_at timestamptz not null default now()
);

create index email_log_status_idx on public.email_log (status);
create index email_log_submission_id_idx on public.email_log (submission_id);

alter table public.email_log enable row level security;

-- Admin-only -- this is an internal diagnostic log, never author-facing,
-- and never client-writable (only the mailer, via the service role).
create policy "Admins can read the email log"
    on public.email_log for select
    using (public.is_admin());
