-- Additive shared family routines. Existing pregnancy and baby records are untouched.
create table public.child_routines (
  id uuid primary key default gen_random_uuid(),
  baby_id uuid not null references public.babies(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (char_length(trim(title)) between 1 and 100),
  period text not null default 'anytime' check (period in ('morning','evening','anytime')),
  sort_order integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (id,baby_id)
);
create table public.routine_completions (
  id uuid primary key default gen_random_uuid(),
  routine_id uuid not null,
  baby_id uuid not null references public.babies(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  completed_on date not null default (now() at time zone 'Europe/Paris')::date,
  created_at timestamptz not null default now(),
  foreign key (routine_id,baby_id) references public.child_routines(id,baby_id) on delete cascade,
  unique (routine_id,completed_on),
  check (completed_on <= (now() at time zone 'Europe/Paris')::date)
);
create index child_routines_baby_active_idx on public.child_routines(baby_id,active,sort_order);
create index routine_completions_baby_day_idx on public.routine_completions(baby_id,completed_on);
alter table public.child_routines enable row level security;
alter table public.routine_completions enable row level security;
revoke all on public.child_routines, public.routine_completions from public,anon,authenticated;
grant all on public.child_routines, public.routine_completions to service_role;
grant select,insert on public.child_routines to authenticated;
grant update(title,period,sort_order,active) on public.child_routines to authenticated;
grant select,insert,delete on public.routine_completions to authenticated;
create policy routines_read on public.child_routines for select to authenticated using(public.can_access_baby(baby_id));
create policy routines_create on public.child_routines for insert to authenticated with check(user_id=auth.uid() and public.can_write_baby(baby_id));
create policy routines_edit on public.child_routines for update to authenticated using(public.can_write_baby(baby_id)) with check(public.can_write_baby(baby_id));
create policy routines_done_read on public.routine_completions for select to authenticated using(public.can_access_baby(baby_id));
create policy routines_done_create on public.routine_completions for insert to authenticated with check(user_id=auth.uid() and public.can_write_baby(baby_id));
create policy routines_done_remove on public.routine_completions for delete to authenticated using(public.can_write_baby(baby_id));
