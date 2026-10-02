-- MamaTrack: unified pregnancy and baby tracking. Additive; does not alter existing pregnancy tables.


create table if not exists public.babies (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  birth_date date not null,
  sex text check (sex in ('M','F','X')),
  birth_weight_g int,
  birth_height_cm numeric(5,2),
  birth_head_cm numeric(5,2),
  photo_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.feedings (
  id uuid primary key default gen_random_uuid(),
  baby_id uuid not null references public.babies(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null check (kind in ('bottle','breast','solid','water')),
  started_at timestamptz not null,
  ended_at timestamptz,
  amount_ml int,
  side text check (side in ('left','right','both')),
  food text,
  notes text,
  created_at timestamptz default now()
);

create table if not exists public.sleeps (
  id uuid primary key default gen_random_uuid(),
  baby_id uuid not null references public.babies(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  started_at timestamptz not null,
  ended_at timestamptz,
  kind text check (kind in ('nap','night')),
  quality int check (quality between 1 and 5),
  notes text,
  created_at timestamptz default now()
);

create table if not exists public.diapers (
  id uuid primary key default gen_random_uuid(),
  baby_id uuid not null references public.babies(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  changed_at timestamptz not null default now(),
  kind text not null check (kind in ('wet','dirty','mixed','dry')),
  consistency text,
  color text,
  notes text,
  created_at timestamptz default now()
);

create table if not exists public.measurements (
  id uuid primary key default gen_random_uuid(),
  baby_id uuid not null references public.babies(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  measured_at date not null default current_date,
  weight_g int,
  height_cm numeric(5,2),
  head_cm numeric(5,2),
  notes text,
  created_at timestamptz default now()
);

create table if not exists public.vaccines_given (
  id uuid primary key default gen_random_uuid(),
  baby_id uuid not null references public.babies(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  vaccine_code text not null,
  vaccine_label text,
  given_at date not null,
  dose_number int,
  location text,
  notes text,
  created_at timestamptz default now()
);

create table if not exists public.health_events (
  id uuid primary key default gen_random_uuid(),
  baby_id uuid not null references public.babies(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null check (kind in ('fever','medicine','appointment','symptom','other')),
  occurred_at timestamptz not null default now(),
  temperature_c numeric(4,2),
  medicine_name text,
  dose text,
  title text,
  description text,
  created_at timestamptz default now()
);

create table if not exists public.diary_entries (
  id uuid primary key default gen_random_uuid(),
  baby_id uuid not null references public.babies(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  entry_date date not null default current_date,
  title text,
  body text,
  photo_url text,
  mood text,
  created_at timestamptz default now()
);

create table if not exists public.milestones (
  id uuid primary key default gen_random_uuid(),
  baby_id uuid not null references public.babies(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  code text not null,
  label text,
  achieved_at date not null default current_date,
  photo_url text,
  notes text,
  created_at timestamptz default now()
);

create table if not exists public.baby_collaborators (
  id uuid primary key default gen_random_uuid(),
  baby_id uuid not null references public.babies(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade,
  collaborator_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'caregiver' check (role in ('caregiver','viewer')),
  accepted_at timestamptz,
  created_at timestamptz default now(),
  unique(baby_id, collaborator_id)
);

create index if not exists babies_user_id_idx on public.babies(user_id);

create index if not exists feedings_baby_started_idx on public.feedings(baby_id, started_at desc);

create index if not exists sleeps_baby_started_idx on public.sleeps(baby_id, started_at desc);

create index if not exists diapers_baby_changed_idx on public.diapers(baby_id, changed_at desc);

create index if not exists measurements_baby_date_idx on public.measurements(baby_id, measured_at desc);

create index if not exists vaccines_given_baby_idx on public.vaccines_given(baby_id, given_at desc);

create index if not exists health_events_baby_idx on public.health_events(baby_id, occurred_at desc);

create index if not exists diary_baby_date_idx on public.diary_entries(baby_id, entry_date desc);

create index if not exists milestones_baby_idx on public.milestones(baby_id, achieved_at desc);

create index if not exists collab_collaborator_idx on public.baby_collaborators(collaborator_id);

create table if not exists public.baby_invitations (
  id uuid primary key default gen_random_uuid(),
  baby_id uuid not null references public.babies(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade,
  token text not null unique,
  role text not null default 'caregiver' check (role in ('caregiver','viewer')),
  expires_at timestamptz not null default (now() + interval '7 days'),
  used_at timestamptz,
  used_by uuid references auth.users(id) on delete set null,
  created_at timestamptz default now()
);

create index if not exists baby_invitations_baby_idx on public.baby_invitations(baby_id);

create index if not exists baby_invitations_token_idx on public.baby_invitations(token);

create table if not exists public.food_intros (
  id uuid primary key default gen_random_uuid(),
  baby_id uuid not null references public.babies(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  food_code text not null,
  first_tried_at date not null default current_date,
  status text not null default 'ok' check (status in ('ok','reaction','avoid')),
  reaction text,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists food_intros_baby_idx
  on public.food_intros(baby_id, first_tried_at desc);

create unique index if not exists food_intros_baby_food_unique_idx
  on public.food_intros(baby_id, food_code);

create table if not exists public.pediatrician_tokens (
  id uuid primary key default gen_random_uuid(),
  baby_id uuid not null references public.babies(id) on delete cascade,
  created_by uuid not null references auth.users(id) on delete cascade,
  token text not null unique,
  scope_months int not null default 6 check (scope_months in (1, 3, 6, 12)),
  include_diary boolean not null default false,
  label text,
  expires_at timestamptz not null,
  revoked_at timestamptz,
  last_accessed_at timestamptz,
  access_count int not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists pediatrician_tokens_baby_idx
  on public.pediatrician_tokens(baby_id);

create index if not exists pediatrician_tokens_token_idx
  on public.pediatrician_tokens(token);

create table if not exists public.coach_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  baby_id uuid not null references public.babies(id) on delete cascade,
  role text not null check (role in ('user','assistant')),
  content text not null,
  created_at timestamptz not null default now()
);

create index if not exists coach_messages_user_created_idx
  on public.coach_messages(user_id, created_at desc);

create index if not exists coach_messages_baby_created_idx
  on public.coach_messages(baby_id, created_at desc);

create table if not exists public.vaccine_reminders_sent (
  id uuid primary key default gen_random_uuid(),
  baby_id uuid not null references public.babies(id) on delete cascade,
  vaccine_code text not null,
  sent_at timestamptz not null default now(),
  unique (baby_id, vaccine_code)
);

create index if not exists vaccine_reminders_sent_baby_idx
  on public.vaccine_reminders_sent(baby_id);

create table if not exists public.monthly_reports_sent (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  baby_id uuid not null references public.babies(id) on delete cascade,
  year int not null,
  month int not null,
  sent_at timestamptz not null default now()
);

create unique index if not exists monthly_reports_sent_unique_idx
  on public.monthly_reports_sent(baby_id, year, month);

create table if not exists public.baby_push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  ua text,
  created_at timestamptz default now(),
  last_seen_at timestamptz default now()
);

create table if not exists public.push_reminders_sent (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  baby_id uuid not null references public.babies(id) on delete cascade,
  kind text not null, -- 'vaccine:hep_b', 'has:m9', 'agenda:<event_id>'
  sent_at timestamptz default now()
);

create index if not exists baby_push_subscriptions_user_idx
  on public.baby_push_subscriptions(user_id);

create unique index if not exists push_reminders_sent_unique_idx
  on public.push_reminders_sent(baby_id, kind);

alter table public.health_events add column if not exists checklist_code text;


create table if not exists public.baby_preferences (
 id uuid primary key references auth.users(id) on delete cascade,
 full_name text, email text,
 units text not null default 'metric' check (units in ('metric','imperial')),
 locale text not null default 'fr' check (locale in ('fr','en')),
 theme text not null default 'light' check (theme in ('light','dark','system')),
 vaccine_email_reminders boolean not null default false,
 push_reminders boolean not null default false,
 monthly_report_email boolean not null default false,
 updated_at timestamptz not null default now()
);
insert into public.baby_preferences(id,email)
 select id,email from auth.users on conflict (id) do nothing;

create table if not exists public.family_settings (
 user_id uuid primary key references auth.users(id) on delete cascade,
 active_stage text not null default 'pregnancy' check (active_stage in ('pregnancy','baby')),
 active_baby_id uuid references public.babies(id) on delete set null
);
create table if not exists public.ai_consents (
 user_id uuid primary key references auth.users(id) on delete cascade,
 version integer not null check (version = 1),
 accepted_at timestamptz not null default now()
);

create or replace function public.can_access_baby(b_id uuid)
returns boolean language sql stable security definer set search_path = public,pg_catalog as $$
 select auth.uid() is not null and (
  exists(select 1 from public.babies where id=b_id and user_id=auth.uid())
  or exists(select 1 from public.baby_collaborators where baby_id=b_id and collaborator_id=auth.uid() and accepted_at is not null)
 );
$$;
create or replace function public.can_write_baby(b_id uuid)
returns boolean language sql stable security definer set search_path = public,pg_catalog as $$
 select auth.uid() is not null and (
  exists(select 1 from public.babies where id=b_id and user_id=auth.uid())
  or exists(select 1 from public.baby_collaborators where baby_id=b_id and collaborator_id=auth.uid() and accepted_at is not null and role='caregiver')
 );
$$;
revoke all on function public.can_access_baby(uuid),public.can_write_baby(uuid) from public,anon;
grant execute on function public.can_access_baby(uuid),public.can_write_baby(uuid) to authenticated,service_role;

alter table public.babies enable row level security;
create policy babies_read on public.babies for select to authenticated using(public.can_access_baby(id));
create policy babies_create on public.babies for insert to authenticated with check(user_id=auth.uid() and birth_date<=(now() at time zone 'Europe/Paris')::date and char_length(name) between 1 and 80);
create policy babies_edit on public.babies for update to authenticated using(user_id=auth.uid()) with check(user_id=auth.uid() and birth_date<=(now() at time zone 'Europe/Paris')::date);
create policy babies_remove on public.babies for delete to authenticated using(user_id=auth.uid());

alter table public.baby_collaborators enable row level security;
create policy baby_collaborators_read on public.baby_collaborators for select to authenticated using(owner_id=auth.uid() or collaborator_id=auth.uid());
create policy baby_collaborators_edit on public.baby_collaborators for update to authenticated using(owner_id=auth.uid()) with check(owner_id=auth.uid() and exists(select 1 from public.babies where id=baby_id and user_id=auth.uid()));
create policy baby_collaborators_remove on public.baby_collaborators for delete to authenticated using(owner_id=auth.uid());

alter table public.baby_invitations enable row level security;
create policy baby_invitations_owner on public.baby_invitations for all to authenticated using(owner_id=auth.uid()) with check(owner_id=auth.uid() and exists(select 1 from public.babies where id=baby_id and user_id=auth.uid()) and length(token)>=32 and expires_at<=now()+interval '7 days');

alter table public.pediatrician_tokens enable row level security;
create policy pediatrician_owner on public.pediatrician_tokens for all to authenticated using(exists(select 1 from public.babies where id=baby_id and user_id=auth.uid())) with check(created_by=auth.uid() and exists(select 1 from public.babies where id=baby_id and user_id=auth.uid()) and length(token)>=32 and expires_at<=now()+interval '30 days');

alter table public.baby_preferences enable row level security;
create policy baby_preferences_own on public.baby_preferences for all to authenticated using(id=auth.uid()) with check(id=auth.uid());
alter table public.family_settings enable row level security;
create policy family_settings_own on public.family_settings for all to authenticated using(user_id=auth.uid()) with check(user_id=auth.uid() and (active_baby_id is null or public.can_access_baby(active_baby_id)));
alter table public.ai_consents enable row level security;
create policy ai_consents_own on public.ai_consents for all to authenticated using(user_id=auth.uid()) with check(user_id=auth.uid());


alter table public.feedings enable row level security;
create policy feedings_read on public.feedings for select to authenticated using(public.can_access_baby(baby_id));
create policy feedings_create on public.feedings for insert to authenticated with check(user_id=auth.uid() and public.can_write_baby(baby_id));
create policy feedings_edit on public.feedings for update to authenticated using(public.can_write_baby(baby_id)) with check(public.can_write_baby(baby_id));
create policy feedings_remove on public.feedings for delete to authenticated using(public.can_write_baby(baby_id));
alter table public.feedings add column if not exists source_author_id uuid;


alter table public.sleeps enable row level security;
create policy sleeps_read on public.sleeps for select to authenticated using(public.can_access_baby(baby_id));
create policy sleeps_create on public.sleeps for insert to authenticated with check(user_id=auth.uid() and public.can_write_baby(baby_id));
create policy sleeps_edit on public.sleeps for update to authenticated using(public.can_write_baby(baby_id)) with check(public.can_write_baby(baby_id));
create policy sleeps_remove on public.sleeps for delete to authenticated using(public.can_write_baby(baby_id));
alter table public.sleeps add column if not exists source_author_id uuid;


alter table public.diapers enable row level security;
create policy diapers_read on public.diapers for select to authenticated using(public.can_access_baby(baby_id));
create policy diapers_create on public.diapers for insert to authenticated with check(user_id=auth.uid() and public.can_write_baby(baby_id));
create policy diapers_edit on public.diapers for update to authenticated using(public.can_write_baby(baby_id)) with check(public.can_write_baby(baby_id));
create policy diapers_remove on public.diapers for delete to authenticated using(public.can_write_baby(baby_id));
alter table public.diapers add column if not exists source_author_id uuid;


alter table public.measurements enable row level security;
create policy measurements_read on public.measurements for select to authenticated using(public.can_access_baby(baby_id));
create policy measurements_create on public.measurements for insert to authenticated with check(user_id=auth.uid() and public.can_write_baby(baby_id));
create policy measurements_edit on public.measurements for update to authenticated using(public.can_write_baby(baby_id)) with check(public.can_write_baby(baby_id));
create policy measurements_remove on public.measurements for delete to authenticated using(public.can_write_baby(baby_id));
alter table public.measurements add column if not exists source_author_id uuid;


alter table public.vaccines_given enable row level security;
create policy vaccines_given_read on public.vaccines_given for select to authenticated using(public.can_access_baby(baby_id));
create policy vaccines_given_create on public.vaccines_given for insert to authenticated with check(user_id=auth.uid() and public.can_write_baby(baby_id));
create policy vaccines_given_edit on public.vaccines_given for update to authenticated using(public.can_write_baby(baby_id)) with check(public.can_write_baby(baby_id));
create policy vaccines_given_remove on public.vaccines_given for delete to authenticated using(public.can_write_baby(baby_id));
alter table public.vaccines_given add column if not exists source_author_id uuid;


alter table public.health_events enable row level security;
create policy health_events_read on public.health_events for select to authenticated using(public.can_access_baby(baby_id));
create policy health_events_create on public.health_events for insert to authenticated with check(user_id=auth.uid() and public.can_write_baby(baby_id));
create policy health_events_edit on public.health_events for update to authenticated using(public.can_write_baby(baby_id)) with check(public.can_write_baby(baby_id));
create policy health_events_remove on public.health_events for delete to authenticated using(public.can_write_baby(baby_id));
alter table public.health_events add column if not exists source_author_id uuid;


alter table public.diary_entries enable row level security;
create policy diary_entries_read on public.diary_entries for select to authenticated using(public.can_access_baby(baby_id));
create policy diary_entries_create on public.diary_entries for insert to authenticated with check(user_id=auth.uid() and public.can_write_baby(baby_id));
create policy diary_entries_edit on public.diary_entries for update to authenticated using(public.can_write_baby(baby_id)) with check(public.can_write_baby(baby_id));
create policy diary_entries_remove on public.diary_entries for delete to authenticated using(public.can_write_baby(baby_id));
alter table public.diary_entries add column if not exists source_author_id uuid;


alter table public.milestones enable row level security;
create policy milestones_read on public.milestones for select to authenticated using(public.can_access_baby(baby_id));
create policy milestones_create on public.milestones for insert to authenticated with check(user_id=auth.uid() and public.can_write_baby(baby_id));
create policy milestones_edit on public.milestones for update to authenticated using(public.can_write_baby(baby_id)) with check(public.can_write_baby(baby_id));
create policy milestones_remove on public.milestones for delete to authenticated using(public.can_write_baby(baby_id));
alter table public.milestones add column if not exists source_author_id uuid;


alter table public.food_intros enable row level security;
create policy food_intros_read on public.food_intros for select to authenticated using(public.can_access_baby(baby_id));
create policy food_intros_create on public.food_intros for insert to authenticated with check(user_id=auth.uid() and public.can_write_baby(baby_id));
create policy food_intros_edit on public.food_intros for update to authenticated using(public.can_write_baby(baby_id)) with check(public.can_write_baby(baby_id));
create policy food_intros_remove on public.food_intros for delete to authenticated using(public.can_write_baby(baby_id));
alter table public.food_intros add column if not exists source_author_id uuid;


alter table public.coach_messages enable row level security;
create policy coach_messages_read on public.coach_messages for select to authenticated using(public.can_access_baby(baby_id));
create policy coach_messages_create on public.coach_messages for insert to authenticated with check(user_id=auth.uid() and public.can_write_baby(baby_id));
create policy coach_messages_edit on public.coach_messages for update to authenticated using(public.can_write_baby(baby_id)) with check(public.can_write_baby(baby_id));
create policy coach_messages_remove on public.coach_messages for delete to authenticated using(public.can_write_baby(baby_id));
alter table public.coach_messages add column if not exists source_author_id uuid;


alter table public.babies enable row level security;
revoke all on public.babies from anon,authenticated;
grant all on public.babies to service_role;

grant select,insert,update,delete on public.babies to authenticated;

alter table public.feedings enable row level security;
revoke all on public.feedings from anon,authenticated;
grant all on public.feedings to service_role;

grant select,insert,update,delete on public.feedings to authenticated;

alter table public.sleeps enable row level security;
revoke all on public.sleeps from anon,authenticated;
grant all on public.sleeps to service_role;

grant select,insert,update,delete on public.sleeps to authenticated;

alter table public.diapers enable row level security;
revoke all on public.diapers from anon,authenticated;
grant all on public.diapers to service_role;

grant select,insert,update,delete on public.diapers to authenticated;

alter table public.measurements enable row level security;
revoke all on public.measurements from anon,authenticated;
grant all on public.measurements to service_role;

grant select,insert,update,delete on public.measurements to authenticated;

alter table public.vaccines_given enable row level security;
revoke all on public.vaccines_given from anon,authenticated;
grant all on public.vaccines_given to service_role;

grant select,insert,update,delete on public.vaccines_given to authenticated;

alter table public.health_events enable row level security;
revoke all on public.health_events from anon,authenticated;
grant all on public.health_events to service_role;

grant select,insert,update,delete on public.health_events to authenticated;

alter table public.diary_entries enable row level security;
revoke all on public.diary_entries from anon,authenticated;
grant all on public.diary_entries to service_role;

grant select,insert,update,delete on public.diary_entries to authenticated;

alter table public.milestones enable row level security;
revoke all on public.milestones from anon,authenticated;
grant all on public.milestones to service_role;

grant select,insert,update,delete on public.milestones to authenticated;

alter table public.baby_collaborators enable row level security;
revoke all on public.baby_collaborators from anon,authenticated;
grant all on public.baby_collaborators to service_role;

grant select,insert,update,delete on public.baby_collaborators to authenticated;

alter table public.baby_invitations enable row level security;
revoke all on public.baby_invitations from anon,authenticated;
grant all on public.baby_invitations to service_role;

grant select,insert,update,delete on public.baby_invitations to authenticated;

alter table public.food_intros enable row level security;
revoke all on public.food_intros from anon,authenticated;
grant all on public.food_intros to service_role;

grant select,insert,update,delete on public.food_intros to authenticated;

alter table public.pediatrician_tokens enable row level security;
revoke all on public.pediatrician_tokens from anon,authenticated;
grant all on public.pediatrician_tokens to service_role;

grant select,insert,update,delete on public.pediatrician_tokens to authenticated;

alter table public.coach_messages enable row level security;
revoke all on public.coach_messages from anon,authenticated;
grant all on public.coach_messages to service_role;

grant select,insert,update,delete on public.coach_messages to authenticated;

alter table public.vaccine_reminders_sent enable row level security;
revoke all on public.vaccine_reminders_sent from anon,authenticated;
grant all on public.vaccine_reminders_sent to service_role;

alter table public.monthly_reports_sent enable row level security;
revoke all on public.monthly_reports_sent from anon,authenticated;
grant all on public.monthly_reports_sent to service_role;

alter table public.baby_push_subscriptions enable row level security;
revoke all on public.baby_push_subscriptions from anon,authenticated;
grant all on public.baby_push_subscriptions to service_role;

grant select,insert,update,delete on public.baby_push_subscriptions to authenticated;

alter table public.push_reminders_sent enable row level security;
revoke all on public.push_reminders_sent from anon,authenticated;
grant all on public.push_reminders_sent to service_role;

alter table public.baby_preferences enable row level security;
revoke all on public.baby_preferences from anon,authenticated;
grant all on public.baby_preferences to service_role;

grant select,insert,update,delete on public.baby_preferences to authenticated;

alter table public.family_settings enable row level security;
revoke all on public.family_settings from anon,authenticated;
grant all on public.family_settings to service_role;

grant select,insert,update,delete on public.family_settings to authenticated;

alter table public.ai_consents enable row level security;
revoke all on public.ai_consents from anon,authenticated;
grant all on public.ai_consents to service_role;

grant select,insert,update,delete on public.ai_consents to authenticated;


-- Prevent ownership/child reassignment through direct REST updates.
revoke update on public.babies from authenticated;
grant update(name,birth_date,sex,birth_weight_g,birth_height_cm,birth_head_cm,photo_url,updated_at) on public.babies to authenticated;
revoke insert,update on public.baby_collaborators from authenticated;
grant update(role) on public.baby_collaborators to authenticated;
alter table public.baby_push_subscriptions enable row level security;
create policy baby_push_own on public.baby_push_subscriptions for all to authenticated using(user_id=auth.uid()) with check(user_id=auth.uid());

-- Private media: short-lived display URLs are generated only after an RLS read.
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('diary-photos','diary-photos',false,8388608,array['image/jpeg','image/png','image/webp','image/heic','image/heif','image/gif'])
on conflict(id) do nothing;
create policy family_photos_read on storage.objects for select to authenticated using(bucket_id='diary-photos' and (storage.foldername(name))[2] ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' and public.can_access_baby(((storage.foldername(name))[2])::uuid));
create policy family_photos_create on storage.objects for insert to authenticated with check(bucket_id='diary-photos' and (storage.foldername(name))[1]=auth.uid()::text and (storage.foldername(name))[2] ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' and public.can_write_baby(((storage.foldername(name))[2])::uuid));
create policy family_photos_remove on storage.objects for delete to authenticated using(bucket_id='diary-photos' and (storage.foldername(name))[1]=auth.uid()::text);

-- Invitation acceptance is atomic: a token can grant access only once.
create or replace function public.accept_baby_invitation(p_token text)
returns uuid language plpgsql security definer set search_path=public,pg_catalog as $$
declare inv public.baby_invitations; uid uuid:=auth.uid();
begin
 if uid is null then raise exception 'unauthorized'; end if;
 select * into inv from public.baby_invitations where token=p_token and used_at is null and expires_at>now() for update;
 if not found or inv.owner_id=uid then raise exception 'invalid_invitation'; end if;
 insert into public.baby_collaborators(baby_id,owner_id,collaborator_id,role,accepted_at)
 values(inv.baby_id,inv.owner_id,uid,inv.role,now())
 on conflict(baby_id,collaborator_id) do update set role=excluded.role,accepted_at=excluded.accepted_at;
 update public.baby_invitations set used_at=now(),used_by=uid where id=inv.id;
 return inv.baby_id;
end;$$;
revoke all on function public.accept_baby_invitation(text) from public,anon;
grant execute on function public.accept_baby_invitation(text) to authenticated;

-- Keep child/user provenance immutable through direct REST calls.
do $$
declare t text; columns text;
begin
 foreach t in array array['feedings','sleeps','diapers','measurements','vaccines_given','health_events','diary_entries','milestones','food_intros','coach_messages'] loop
  execute format('revoke update on public.%I from authenticated',t);
  select string_agg(quote_ident(column_name),',') into columns from information_schema.columns
   where table_schema='public' and table_name=t and column_name not in ('id','baby_id','user_id','source_author_id','created_at');
  execute format('grant update(%s) on public.%I to authenticated',columns,t);
 end loop;
end;$$;

create or replace function public.initialize_baby_preferences()
returns trigger language plpgsql security definer set search_path=public,pg_catalog as $$
begin
 insert into public.baby_preferences(id,email,full_name) values(new.id,new.email,coalesce(new.raw_user_meta_data->>'full_name',new.raw_user_meta_data->>'name')) on conflict(id) do nothing;
 return new;
end;$$;
revoke all on function public.initialize_baby_preferences() from public,anon,authenticated;
create trigger initialize_baby_preferences after insert on auth.users for each row execute function public.initialize_baby_preferences();

create or replace function public.register_baby_birth(p_id uuid,p_name text,p_birth_date date,p_sex text,p_weight integer,p_height numeric,p_head numeric)
returns uuid language plpgsql security definer set search_path=public,pg_catalog as $$
declare uid uuid:=auth.uid(); existing_owner uuid;
begin
 if uid is null then raise exception 'unauthorized'; end if;
 if length(trim(p_name)) not between 1 and 80 or p_birth_date is null or p_birth_date<'1970-01-01'::date or p_birth_date>(now() at time zone 'Europe/Paris')::date or (p_sex is not null and p_sex not in ('M','F','X')) or (p_weight is not null and p_weight not between 300 and 8000) or (p_height is not null and p_height not between 25 and 80) or (p_head is not null and p_head not between 20 and 50) then raise exception 'invalid_birth'; end if;
 insert into public.babies(id,user_id,name,birth_date,sex,birth_weight_g,birth_height_cm,birth_head_cm)
 values(p_id,uid,trim(p_name),p_birth_date,p_sex,p_weight,p_height,p_head) on conflict(id) do nothing;
 select user_id into existing_owner from public.babies where id=p_id;
 if existing_owner is distinct from uid then raise exception 'forbidden'; end if;
 insert into public.family_settings(user_id,active_stage,active_baby_id) values(uid,'baby',p_id)
 on conflict(user_id) do update set active_stage='baby',active_baby_id=p_id;
 return p_id;
end;$$;
revoke all on function public.register_baby_birth(uuid,text,date,text,integer,numeric,numeric) from public,anon;
grant execute on function public.register_baby_birth(uuid,text,date,text,integer,numeric,numeric) to authenticated;

-- Preference updates never grant control over the verified auth email.
revoke insert,update,delete on public.baby_preferences from authenticated;
grant update(full_name,units,locale,theme,vaccine_email_reminders,push_reminders,monthly_report_email,updated_at) on public.baby_preferences to authenticated;
alter table public.profiles add column if not exists conception_mode text check(conception_mode in ('naturelle','fiv_frais','fiv_tec'));
grant update(conception_mode) on public.profiles to authenticated;
