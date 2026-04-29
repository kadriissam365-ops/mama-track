-- Sprint E feature #2 — plan repas IA hebdomadaire
-- Table de cache des plans repas générés par semaine + colonnes d'allergies / régime sur profiles.

create table if not exists public.meal_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  week_start date not null,
  trimester int not null,
  preferences jsonb not null default '{}'::jsonb,
  plan jsonb not null,
  generated_at timestamptz default now(),
  unique (user_id, week_start)
);

alter table public.meal_plans enable row level security;

create policy "meal_plans_select_own"
  on public.meal_plans for select
  using (auth.uid() = user_id);

create policy "meal_plans_insert_own"
  on public.meal_plans for insert
  with check (auth.uid() = user_id);

create policy "meal_plans_update_own"
  on public.meal_plans for update
  using (auth.uid() = user_id);

alter table public.profiles add column if not exists food_allergies text[] default '{}';
alter table public.profiles add column if not exists dietary_preferences text default 'aucune';
