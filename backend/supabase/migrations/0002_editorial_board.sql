-- Lets an admin manage the public Editorial Board page (Editor-in-Chief,
-- Associate Editor-in-Chief, Editor) instead of it being hard-coded in
-- the frontend. Only these three roles -- the page's "Advisory Editors"
-- section stays static, out of scope here.
create table public.editorial_board_members (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    role text not null check (role in ('EDITOR_IN_CHIEF', 'ASSOCIATE_EDITOR_IN_CHIEF', 'EDITOR')),
    designation text,
    affiliation text,
    display_order int not null default 0,
    created_at timestamptz not null default now()
);

create index editorial_board_members_role_idx on public.editorial_board_members (role);

alter table public.editorial_board_members enable row level security;

-- Public read -- this is what populates the public Editorial Board page,
-- no account required.
create policy "Anyone can read editorial board members"
    on public.editorial_board_members for select
    using (true);

-- Admin-only writes, same is_admin() helper every other admin-gated
-- table in this schema uses.
create policy "Admins can add editorial board members"
    on public.editorial_board_members for insert
    with check (public.is_admin());

create policy "Admins can update editorial board members"
    on public.editorial_board_members for update
    using (public.is_admin())
    with check (public.is_admin());

create policy "Admins can remove editorial board members"
    on public.editorial_board_members for delete
    using (public.is_admin());
