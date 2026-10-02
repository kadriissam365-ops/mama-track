// @vitest-environment node
import { PGlite } from "@electric-sql/pglite";
import { readFileSync } from "node:fs";
import { beforeAll, afterAll, describe, expect, it } from "vitest";

const owner = "11111111-1111-4111-8111-111111111111";
const viewer = "22222222-2222-4222-8222-222222222222";
const stranger = "33333333-3333-4333-8333-333333333333";
const child = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const token = "a".repeat(64);
let db: PGlite;
async function identity(id: string, role = "authenticated") {
  await db.exec("reset role");
  await db.query("select set_config('request.jwt.claim.sub',$1,false), set_config('request.jwt.claim.role',$2,false)", [id, role]);
  await db.exec(`set role ${role}`);
}

beforeAll(async () => {
  db = new PGlite();
  // Only provider infrastructure is stubbed; application migrations run as-is.
  await db.exec(`
    create role anon; create role authenticated; create role service_role bypassrls;
    create schema auth; create schema storage;
    create table auth.users(id uuid primary key,email text,raw_user_meta_data jsonb default '{}');
    create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
    create function auth.role() returns text language sql stable as $$select current_setting('request.jwt.claim.role',true)$$;
    create table public.profiles(id uuid primary key references auth.users, due_date date, baby_name text);
    create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);
    create table storage.objects(id uuid primary key default gen_random_uuid(),bucket_id text,name text);
    alter table storage.objects enable row level security;
    create function storage.foldername(text) returns text[] language sql immutable as $$select string_to_array($1,'/')$$;
    grant usage on schema public,auth,storage to anon,authenticated,service_role;
    grant select,insert,delete on storage.objects to authenticated;
    grant execute on function auth.uid(),auth.role(),storage.foldername(text) to anon,authenticated,service_role;
    insert into auth.users(id,email) values ('${owner}','parent@example.invalid'),('${viewer}','viewer@example.invalid'),('${stranger}','stranger@example.invalid');
    insert into public.profiles(id,due_date) values('${owner}','2026-09-01');
  `);
  for (const file of ["unified_family", "rate_limit_rules", "babytrack_import"]) {
    await db.exec(readFileSync(`supabase/migrations/20261002_${file}.sql`, "utf8"));
  }
}, 30000);
afterAll(async () => { await db?.close(); });

describe.sequential("Unified family PostgreSQL security", () => {
  it("registers a birth once, preserves pregnancy and rejects another owner", async () => {
    await identity(owner);
    const sql = "select register_baby_birth($1,'Lou','2026-09-01','X',3200,50,34)";
    await db.query(sql, [child]); await db.query(sql, [child]);
    expect((await db.query("select * from babies")).rows).toHaveLength(1);
    expect((await db.query("select active_stage from family_settings")).rows).toEqual([{ active_stage: "baby" }]);
    await identity(stranger);
    await expect(db.query(sql, [child])).rejects.toThrow("forbidden");
    expect((await db.query("select * from babies")).rows).toHaveLength(0);
    await db.exec("reset role");
    expect((await db.query("select due_date::text from profiles")).rows).toEqual([{ due_date: "2026-09-01" }]);
  });
  it("rejects future births and privilege/ownership edits", async () => {
    await identity(owner);
    await expect(db.query("select register_baby_birth(gen_random_uuid(),'Lou','2099-01-01','X',null,null,null)")).rejects.toThrow("invalid_birth");
    await expect(db.query("update babies set user_id=$1 where id=$2", [stranger, child])).rejects.toThrow("permission denied");
    await expect(db.query("update baby_preferences set email='attacker@example.invalid'")).rejects.toThrow("permission denied");
  });
  it("consumes invitations atomically and keeps a viewer read-only", async () => {
    await identity(owner);
    await db.query("insert into baby_invitations(baby_id,owner_id,role,token,expires_at) values($1,$2,'viewer',$3,now()+interval '1 day')", [child, owner, token]);
    await db.query("insert into feedings(baby_id,user_id,kind,started_at) values($1,$2,'bottle',now())", [child, owner]);
    await identity(viewer);
    await db.query("select accept_baby_invitation($1)", [token]);
    expect((await db.query("select * from feedings")).rows).toHaveLength(1);
    await expect(db.query("insert into feedings(baby_id,user_id,kind,started_at) values($1,$2,'bottle',now())", [child, viewer])).rejects.toThrow("row-level security");
    expect((await db.query("update feedings set amount_ml=200 returning id")).rows).toHaveLength(0);
    await expect(db.query("select accept_baby_invitation($1)", [token])).rejects.toThrow("invalid_invitation");
    await identity(stranger);
    await expect(db.query("select accept_baby_invitation($1)", [token])).rejects.toThrow("invalid_invitation");
  });
  it("protects private media and delivery logs", async () => {
    await identity(owner);
    await db.query("insert into storage.objects(bucket_id,name) values('diary-photos',$1)", [`${owner}/${child}/photo.jpg`]);
    await identity(viewer);
    expect((await db.query("select * from storage.objects")).rows).toHaveLength(1);
    await identity(stranger);
    expect((await db.query("select * from storage.objects")).rows).toHaveLength(0);
    await expect(db.query("select * from push_reminders_sent")).rejects.toThrow("permission denied");
  });
  it("cannot reset or enlarge a quota through RPC arguments", async () => {
    await identity(owner);
    for (let i=0;i<5;i++) expect((await db.query("select consume_rate_limit('baby_coach',5,86400) as ok")).rows).toEqual([{ok:true}]);
    for (const args of [[5,86400],[999,86400],[5,-1],[5,0],[5,1]]) {
      expect((await db.query("select consume_rate_limit('baby_coach',$1,$2) as ok",args)).rows).toEqual([{ok:false}]);
    }
  });
  it("only the service role can import; retries preserve newer target edits", async () => {
    const imported = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";
    const source = "44444444-4444-4444-8444-444444444444";
    const payload: Record<string, unknown> = { babies: [{id:imported,user_id:source,name:"Noé",birth_date:"2026-08-01"}] };
    for (const table of ["feedings","sleeps","diapers","measurements","vaccines_given","health_events","diary_entries","milestones","food_intros","coach_messages"]) payload[table]=[];
    await identity(owner);
    const sql = "select import_babytrack($1,$2,$3::jsonb)";
    await expect(db.query(sql,[source,owner,JSON.stringify(payload)])).rejects.toThrow("permission denied");
    await identity(owner,"service_role");
    await db.query(sql,[source,owner,JSON.stringify(payload)]);
    await identity(owner);
    await db.query("update babies set name='Noé actualisé' where id=$1",[imported]);
    await identity(owner,"service_role");
    await db.query(sql,[source,owner,JSON.stringify(payload)]);
    expect((await db.query("select name from babies where id=$1",[imported])).rows).toEqual([{name:"Noé actualisé"}]);
    await expect(db.query(sql,[source,stranger,JSON.stringify(payload)])).rejects.toThrow("already_linked");
  });
});
