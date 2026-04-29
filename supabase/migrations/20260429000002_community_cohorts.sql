-- Add cohort column to community_posts (YYYY-MM string of mama's DPA at post time)
alter table public.community_posts add column if not exists cohort text;
create index if not exists idx_community_posts_cohort on public.community_posts (cohort, created_at desc);

-- Backfill existing rows with cohort derived from author's profile.due_date
update public.community_posts cp
set cohort = to_char(p.due_date::date, 'YYYY-MM')
from public.profiles p
where cp.author_id = p.id
  and cp.cohort is null
  and p.due_date is not null;
