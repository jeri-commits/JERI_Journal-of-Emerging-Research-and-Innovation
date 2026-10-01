-- Author/admin profile fields the spec asks for (full_name, phone,
-- institution, department, country, orcid, bio, avatar_url), plus the
-- RLS/grant pair that lets a user edit their own profile *without* being
-- able to touch `role` (role stays admin-only, set by hand in the
-- dashboard or a future admin-only function -- never self-service).
alter table public.profiles
    add column full_name text,
    add column phone text,
    add column institution text,
    add column department text,
    add column country text,
    add column orcid text,
    add column bio text,
    add column avatar_url text;

create policy "Users can update their own profile"
    on public.profiles for update
    using (id = auth.uid())
    with check (id = auth.uid());

-- Column-level grant: RLS above scopes *which row*, this scopes *which
-- columns* -- a user can edit their own display info but not their own
-- role or id.
revoke update on public.profiles from authenticated;
grant update (
    full_name, phone, institution, department, country, orcid, bio, avatar_url
) on public.profiles to authenticated;
