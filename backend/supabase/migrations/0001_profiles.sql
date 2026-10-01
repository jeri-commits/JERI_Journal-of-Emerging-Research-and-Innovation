-- User profiles: one row per Supabase Auth user.
-- role is null ("public", no dashboard access) until an admin sets it
-- manually to 'admin' or 'author'.
create table public.profiles (
    id uuid primary key references auth.users (id) on delete cascade,
    email text not null,
    role text check (role in ('admin', 'author')),
    created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Users can read only their own profile (used by the frontend right after
-- sign-in to decide where to redirect them).
create policy "Users can read their own profile"
    on public.profiles
    for select
    using (auth.uid() = id);

-- No client-side inserts/updates/deletes. Rows are created by the trigger
-- below, and role changes are manual (Supabase dashboard / SQL editor) for
-- this first pass -- there is no self-service role escalation path.

-- Auto-create a profile row the moment a new Auth user is created (i.e. the
-- first time someone completes the magic-link sign-in).
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
    insert into public.profiles (id, email)
    values (new.id, new.email);
    return new;
end;
$$;

create trigger on_auth_user_created
    after insert on auth.users
    for each row execute procedure public.handle_new_user();
