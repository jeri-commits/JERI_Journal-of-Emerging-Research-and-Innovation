-- Admins need to see every user for the /admin/users page and to show
-- author display info alongside submissions. The existing "own profile
-- only" policy from 0001 stays; this adds a second, admin-only one.
create policy "Admins can read all profiles"
    on public.profiles for select
    using (public.is_admin());
