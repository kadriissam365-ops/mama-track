-- Client-supplied parameters must never reset or enlarge a paid-service quota.
create table if not exists public.api_rate_limits (
 user_id uuid not null references auth.users(id) on delete cascade,
 bucket text not null,
 window_start timestamptz not null default now(),
 count integer not null default 0,
 primary key(user_id,bucket)
);
alter table public.api_rate_limits enable row level security;
revoke all on public.api_rate_limits from anon,authenticated;
grant all on public.api_rate_limits to service_role;

create or replace function public.consume_rate_limit(p_bucket text,p_limit integer,p_window_seconds integer)
returns boolean language plpgsql security definer set search_path=public,pg_catalog as $$
declare uid uuid:=auth.uid(); quota integer; seconds integer:=3600; used integer;
begin
 if uid is null then return false; end if;
 quota:=case p_bucket
  when 'coach_chat' then 60 when 'coach_tip' then 12
  when 'daily_story' then 10 when 'meal_plan' then 6
  when 'vision' then 15 when 'duo_invite' then 10
  when 'weekly_email' then 3 when 'push_send' then 20
  when 'baby_coach' then 5 when 'baby_import' then 3
  else null end;
 if p_bucket='baby_coach' then seconds:=86400; end if;
 if quota is null or p_limit is distinct from quota or p_window_seconds is distinct from seconds then
  return false;
 end if;
 insert into public.api_rate_limits as r(user_id,bucket,window_start,count)
 values(uid,p_bucket,now(),1)
 on conflict(user_id,bucket) do update set
 count=case when r.window_start+make_interval(secs=>seconds)<=now() then 1 else least(r.count+1,quota+1) end,
 window_start=case when r.window_start+make_interval(secs=>seconds)<=now() then now() else r.window_start end
 returning count into used;
 return used<=quota;
end;$$;
revoke all on function public.consume_rate_limit(text,integer,integer) from public,anon;
grant execute on function public.consume_rate_limit(text,integer,integer) to authenticated;
