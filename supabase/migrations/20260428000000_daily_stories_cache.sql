-- Migration 20260428 : cache des Story du jour MamaCoach (1 par user/jour).
-- Appliquée via Supabase MCP sur le projet xddutehapskhgrgimpme le 2026-04-28.

create table if not exists public.daily_stories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  story_text text not null,
  week_sa int,
  generated_at timestamptz not null default now(),
  unique (user_id, date)
);
create index if not exists daily_stories_user_date_idx on public.daily_stories (user_id, date desc);
alter table public.daily_stories enable row level security;
create policy "users can read own stories" on public.daily_stories for select using (auth.uid() = user_id);
create policy "users can insert own stories" on public.daily_stories for insert with check (auth.uid() = user_id);
