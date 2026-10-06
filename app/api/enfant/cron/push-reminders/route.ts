import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/enfant/supabase/service";
import { computeUpcomingVaccines } from "@/lib/enfant/vaccines-due";
import { HAS_VISITS, scheduledVisitDate } from "@/lib/enfant/checklist-data";
import {
  sendPush,
  type StoredSubscription,
  type PushPayload,
} from "@/lib/enfant/push";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const VACCINE_WINDOW_DAYS = 14;
const HAS_WINDOW_DAYS = 21;

type ReminderJob = {
  user_id: string;
  baby_id: string;
  kind: string;
  payload: PushPayload;
};

export async function GET(request: Request) {
  const auth = request.headers.get("authorization");
  const expected = `Bearer ${process.env.CRON_SECRET ?? ""}`;
  if (!process.env.CRON_SECRET || auth !== expected) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const supabase = createServiceClient();
  const now = new Date();
  const todayMs = now.getTime();

  const { data: babies, error: babiesErr } = await supabase
    .from("babies")
    .select("id, name, birth_date, user_id");
  if (babiesErr) {
    return NextResponse.json({ error: babiesErr.message }, { status: 500 });
  }

  const stats = {
    babiesProcessed: 0,
    jobsBuilt: 0,
    jobsSkippedDup: 0,
    jobsSent: 0,
    jobsFailed: 0,
    subsCleaned: 0,
    usersOptOut: 0,
  };

  // Cache des subs par user_id
  const subsByUser = new Map<string, StoredSubscription[]>();
  async function getSubs(userId: string): Promise<StoredSubscription[]> {
    const cached = subsByUser.get(userId);
    if (cached) return cached;
    const { data } = await supabase
      .from("baby_push_subscriptions")
      .select("endpoint, p256dh, auth")
      .eq("user_id", userId);
    const list = (data ?? []) as StoredSubscription[];
    subsByUser.set(userId, list);
    return list;
  }

  // Cache opt-in par user
  const optInByUser = new Map<string, boolean>();
  async function isOptedIn(userId: string): Promise<boolean> {
    const cached = optInByUser.get(userId);
    if (cached !== undefined) return cached;
    const { data } = await supabase
      .from("baby_preferences")
      .select("push_reminders")
      .eq("id", userId)
      .maybeSingle();
    const v = data?.push_reminders !== false;
    optInByUser.set(userId, v);
    return v;
  }

  for (const baby of babies ?? []) {
    stats.babiesProcessed += 1;

    const optIn = await isOptedIn(baby.user_id);
    if (!optIn) {
      stats.usersOptOut += 1;
      continue;
    }

    const [givenRes, sentRes, apptsRes] = await Promise.all([
      supabase
        .from("vaccines_given")
        .select("vaccine_code")
        .eq("baby_id", baby.id),
      supabase
        .from("push_reminders_sent")
        .select("kind")
        .eq("baby_id", baby.id),
      supabase
        .from("health_events")
        .select("id, occurred_at, title, checklist_code")
        .eq("baby_id", baby.id)
        .eq("kind", "appointment")
        .gte("occurred_at", new Date(todayMs).toISOString())
        .lte(
          "occurred_at",
          new Date(todayMs + 2 * 24 * 60 * 60 * 1000).toISOString(),
        ),
    ]);

    const givenCodes = new Set(
      (givenRes.data ?? []).map((g) => g.vaccine_code),
    );
    const alreadySent = new Set((sentRes.data ?? []).map((s) => s.kind));

    const jobs: ReminderJob[] = [];

    // 1. Vaccines (next 14 days, not given)
    const dueVax = computeUpcomingVaccines({
      birthDate: new Date(baby.birth_date),
      givenCodes,
      windowDays: VACCINE_WINDOW_DAYS,
      now,
    });
    for (const v of dueVax) {
      const kind = `vaccine:${v.code}`;
      if (alreadySent.has(kind)) continue;
      jobs.push({
        user_id: baby.user_id,
        baby_id: baby.id,
        kind,
        payload: {
          title: `💉 Vaccin de ${baby.name}`,
          body:
            v.daysUntil <= 0
              ? `${v.label} à faire maintenant.`
              : v.daysUntil === 1
                ? `${v.label} prévu demain.`
                : `${v.label} prévu dans ${v.daysUntil} jours.`,
          url: "/enfant/vaccines",
          tag: kind,
        },
      });
    }

    // 2. HAS visits (overdue or due dans 21j, non marquees fait)
    const { data: doneRaw } = await supabase
      .from("health_events")
      .select("checklist_code")
      .eq("baby_id", baby.id)
      .eq("kind", "appointment")
      .not("checklist_code", "is", null);
    const doneCodes = new Set(
      (doneRaw ?? [])
        .map((d) => d.checklist_code as string | null)
        .filter(Boolean) as string[],
    );

    for (const visit of HAS_VISITS) {
      if (doneCodes.has(visit.code)) continue;
      const due = scheduledVisitDate(baby.birth_date, visit);
      const daysUntil = Math.floor(
        (due.getTime() - todayMs) / (1000 * 60 * 60 * 24),
      );
      if (daysUntil > HAS_WINDOW_DAYS) continue;
      if (daysUntil < -visit.toleranceDays - 30) continue; // skip si trop ancien
      const kind = `has:${visit.code}`;
      if (alreadySent.has(kind)) continue;
      jobs.push({
        user_id: baby.user_id,
        baby_id: baby.id,
        kind,
        payload: {
          title: `📋 Visite ${baby.name}`,
          body:
            daysUntil < 0
              ? `${visit.label} en retard.`
              : daysUntil === 0
                ? `${visit.label} à programmer aujourd'hui.`
                : `${visit.label} dans ${daysUntil} jour${daysUntil > 1 ? "s" : ""}.`,
          url: "/enfant/agenda?view=checklist",
          tag: kind,
        },
      });
    }

    // 3. Agenda RDV J+1 (rappel veille)
    for (const a of apptsRes.data ?? []) {
      if (a.checklist_code) continue; // les HAS sont gerees au-dessus
      const at = new Date(a.occurred_at).getTime();
      const hoursUntil = Math.floor((at - todayMs) / (1000 * 60 * 60));
      if (hoursUntil < 0 || hoursUntil > 36) continue;
      const kind = `agenda:${a.id}`;
      if (alreadySent.has(kind)) continue;
      jobs.push({
        user_id: baby.user_id,
        baby_id: baby.id,
        kind,
        payload: {
          title: `📅 RDV ${baby.name}`,
          body: `${a.title ?? "Rendez-vous"} prévu ${
            hoursUntil < 24 ? "aujourd'hui" : "demain"
          }.`,
          url: "/enfant/agenda",
          tag: kind,
        },
      });
    }

    stats.jobsBuilt += jobs.length;
    if (jobs.length === 0) continue;

    const subs = await getSubs(baby.user_id);
    if (subs.length === 0) continue;

    const goneEndpoints: string[] = [];
    const sentKinds: string[] = [];

    for (const job of jobs) {
      let anyOk = false;
      for (const sub of subs) {
        const r = await sendPush(sub, job.payload);
        if (r.ok) anyOk = true;
        else if (r.gone) goneEndpoints.push(sub.endpoint);
      }
      if (anyOk) {
        sentKinds.push(job.kind);
        stats.jobsSent += 1;
      } else {
        stats.jobsFailed += 1;
      }
    }

    if (sentKinds.length > 0) {
      await supabase.from("push_reminders_sent").insert(
        sentKinds.map((kind) => ({
          user_id: baby.user_id,
          baby_id: baby.id,
          kind,
        })),
      );
    }

    if (goneEndpoints.length > 0) {
      const uniqueGone = Array.from(new Set(goneEndpoints));
      await supabase
        .from("baby_push_subscriptions")
        .delete()
        .in("endpoint", uniqueGone);
      stats.subsCleaned += uniqueGone.length;
      // Vide le cache pour cet user
      subsByUser.delete(baby.user_id);
    }
  }

  return NextResponse.json({ ok: true, ...stats });
}
