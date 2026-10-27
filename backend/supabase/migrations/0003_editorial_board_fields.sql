-- "Designation" renamed to "position" (clearer label the admin UI
-- actually uses), plus a separate "department" field -- both now
-- fillable for every role, not just Editor-in-Chief/Associate.
alter table public.editorial_board_members rename column designation to position;
alter table public.editorial_board_members add column department text;
