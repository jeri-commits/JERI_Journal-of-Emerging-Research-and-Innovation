-- Generic fixed-window rate-limit counter, shared by every Edge Function
-- that needs one (file uploads, reviewer assignment, etc.) rather than
-- each function inventing its own throttling table.
create table public.rate_limits (
    key text primary key,
    window_start timestamptz not null default now(),
    count int not null default 0
);

alter table public.rate_limits enable row level security;

-- Entirely internal bookkeeping -- the client never reads or writes
-- this directly, only Edge Functions via the service role.
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
