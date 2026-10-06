-- The author persona has exactly one job: submit a manuscript. The profile
-- form was collecting phone/country/orcid/avatar_url that nothing in the
-- product reads or displays -- dropped in favor of just the fields that
-- actually mean something here (full_name, institution, department, a
-- short bio). role/email/id remain the only required fields; signup never
-- asks for more than name + email + password.
alter table public.profiles
    drop column if exists phone,
    drop column if exists country,
    drop column if exists orcid,
    drop column if exists avatar_url;

revoke update on public.profiles from authenticated;
grant update (full_name, institution, department, bio) on public.profiles to authenticated;
