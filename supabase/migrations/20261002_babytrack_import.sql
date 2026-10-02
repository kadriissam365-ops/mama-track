-- Import is performed only by a server after authenticating BOTH accounts.
create table public.babytrack_imports (
 source_user_id uuid primary key,
 target_user_id uuid not null references auth.users(id) on delete cascade,
 imported_at timestamptz not null default now()
);
alter table public.babytrack_imports enable row level security;
revoke all on public.babytrack_imports from public,anon,authenticated;
grant all on public.babytrack_imports to service_role;

create or replace function public.import_babytrack(p_source_user uuid,p_target_user uuid,p_payload jsonb)
returns jsonb language plpgsql security definer set search_path=public,pg_catalog as $$
declare b jsonb; r jsonb; t text; baby_ids uuid[]:=array[]::uuid[]; v_baby_id uuid; owner uuid; previous_target uuid; count_rows integer:=0; existing_child uuid;
begin
 if auth.role() is distinct from 'service_role' then raise exception 'forbidden'; end if;
 if jsonb_typeof(p_payload->'babies') is distinct from 'array' or jsonb_array_length(p_payload->'babies')>100 then raise exception 'invalid_payload'; end if;
 perform pg_advisory_xact_lock(hashtextextended(p_source_user::text,0));
 select target_user_id into previous_target from public.babytrack_imports where source_user_id=p_source_user;
 if previous_target is not null and previous_target<>p_target_user then raise exception 'already_linked'; end if;
 for b in select value from jsonb_array_elements(p_payload->'babies') loop
  if (b->>'user_id')::uuid is distinct from p_source_user then raise exception 'invalid_owner'; end if;
  v_baby_id:=(b->>'id')::uuid;
  select user_id into owner from public.babies where babies.id=v_baby_id;
  if owner is not null and owner<>p_target_user then raise exception 'conflicting_baby'; end if;
  b:=jsonb_set(b,'{user_id}',to_jsonb(p_target_user));
  insert into public.babies select (jsonb_populate_record(null::public.babies,b)).* on conflict on constraint babies_pkey do nothing;
  baby_ids:=array_append(baby_ids,v_baby_id);
 end loop;
 foreach t in array array['feedings','sleeps','diapers','measurements','vaccines_given','health_events','diary_entries','milestones','food_intros','coach_messages'] loop
  if jsonb_typeof(p_payload->t) is distinct from 'array' or jsonb_array_length(p_payload->t)>100000 then raise exception 'invalid_records'; end if;
  for r in select value from jsonb_array_elements(p_payload->t) loop
   if not ((r->>'baby_id')::uuid=any(baby_ids)) then raise exception 'invalid_child'; end if;
   execute format('select baby_id from public.%I where id=$1',t) into existing_child using (r->>'id')::uuid;
   if existing_child is not null and existing_child<>(r->>'baby_id')::uuid then raise exception 'conflicting_record'; end if;
   r:=jsonb_set(jsonb_set(r,'{source_author_id}',coalesce(r->'user_id','null'::jsonb)),'{user_id}',to_jsonb(p_target_user));
   execute format('insert into public.%I select (jsonb_populate_record(null::public.%I,$1)).* on conflict(id) do nothing',t,t) using r;
   count_rows:=count_rows+1;
  end loop;
 end loop;
 insert into public.babytrack_imports(source_user_id,target_user_id) values(p_source_user,p_target_user) on conflict(source_user_id) do nothing;
 if array_length(baby_ids,1)>0 then
  insert into public.family_settings(user_id,active_stage,active_baby_id) values(p_target_user,'baby',baby_ids[1])
  on conflict(user_id) do update set active_stage='baby',active_baby_id=excluded.active_baby_id;
 end if;
 return jsonb_build_object('babies',coalesce(array_length(baby_ids,1),0),'records',count_rows);
end;$$;
revoke all on function public.import_babytrack(uuid,uuid,jsonb) from public,anon,authenticated;
grant execute on function public.import_babytrack(uuid,uuid,jsonb) to service_role;
