-- Matches the author submission form fields exactly: paper type,
-- submission mode, the corresponding-author contact block (one per
-- submission, not per co-author), and the two final-stage attachments
-- (copyright form, payment slip) that didn't exist as a concept before.
alter table public.submissions
    add column paper_type text,
    add column submission_mode text default 'Regular',
    add column contact_phone text,
    add column address_line1 text,
    add column address_line2 text,
    add column city text,
    add column state_province text,
    add column postal_code text,
    add column contact_country text,
    add column copyright_form_key text,
    add column payment_slip_key text;

alter table public.submissions
    add constraint submissions_paper_type_check
    check (paper_type is null or paper_type in (
        'Research Article', 'Review Article', 'Survey Article',
        'Short Communication', 'Others'
    ));

-- Per-author fields the form now collects that weren't tracked before.
alter table public.submission_authors
    add column department text,
    add column country text;
