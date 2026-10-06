-- Self-service "forgot password" flow. Tokens are generated and verified
-- only by Edge Functions using the service-role key (request-password-
-- reset / reset-password) -- RLS here is enabled with zero policies, so
-- no client (not even an authenticated one) can read, insert, or guess
-- its way into this table directly.
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
