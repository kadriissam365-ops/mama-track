-- Migration 20260429 : analyses sanguines (Sprint E feature #1).
-- Appliquée via Supabase MCP sur le projet xddutehapskhgrgimpme le 2026-04-29.

create table if not exists public.blood_test_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  test_date date not null,
  results jsonb not null default '[]'::jsonb,
  warnings text,
  source text default 'scan',
  created_at timestamptz default now()
);
alter table public.blood_test_entries enable row level security;
create policy "blood_test_select_own" on public.blood_test_entries for select using (auth.uid() = user_id);
create policy "blood_test_insert_own" on public.blood_test_entries for insert with check (auth.uid() = user_id);
create policy "blood_test_delete_own" on public.blood_test_entries for delete using (auth.uid() = user_id);
create index if not exists idx_blood_test_user_date on public.blood_test_entries (user_id, test_date desc);
