-- Every new signup is a prospective author -- there is no public "no role"
-- state in practice (only admins get promoted, manually, after this). Role
-- used to start out null until an admin assigned it; now it defaults to
-- 'author' at creation time so a brand-new user can submit a manuscript
-- immediately after signing up, no admin step required first.
create or replace function public.handle_new_user()
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

-- Backfill: anyone who signed up before this change and was never promoted
-- to admin is an author in practice (they can't do anything else).
update public.profiles set role = 'author' where role is null;
