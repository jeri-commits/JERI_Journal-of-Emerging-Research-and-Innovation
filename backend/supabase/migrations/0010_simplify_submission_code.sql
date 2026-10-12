-- Simpler, shorter submission codes: JERI-00001, JERI-00002, ... instead of
-- the year-segmented JERI-2026-000123. Same sequence (public.submission_code_seq),
-- just a plain 5-digit zero-padded number with no year component.
create or replace function public.set_submission_code()
returns trigger
language plpgsql
as $$
begin
    if new.submission_code is null then
        new.submission_code := 'JERI-' || lpad(nextval('public.submission_code_seq')::text, 5, '0');
    end if;
    return new;
end;
$$;
