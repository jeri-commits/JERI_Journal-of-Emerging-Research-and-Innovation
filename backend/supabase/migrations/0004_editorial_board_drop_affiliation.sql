-- Affiliation is dropped -- the editorial board card now shows just
-- name, position, and department (department on its own line under
-- position, not appended to it).
alter table public.editorial_board_members drop column affiliation;
