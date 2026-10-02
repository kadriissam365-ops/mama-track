import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/enfant/supabase/service";
import { sendPush, type StoredSubscription } from "@/lib/enfant/push";
import { predictNextSleep } from "@/lib/enfant/sleep-predictions";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const LOOKAHEAD_MIN = 15;
const WINDOW_MIN = 2; // +/- 2 min de tolerance autour de T-15min
const HISTORY_DAYS = 14;

export async function GET(request: Request) {
  const auth = request.headers.get("authorization");
  const expected = `Bearer ${process.env.CRON_SECRET ?? ""}`;
  if (!process.env.CRON_SECRET || auth !== expected) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const supabase = createServiceClient();
  const now = new Date();
  const nowMs = now.getTime();
  const lowerMs = nowMs + (LOOKAHEAD_MIN - WINDOW_MIN) * 60 * 1000;
  const upperMs = nowMs + (LOOKAHEAD_MIN + WINDOW_MIN) * 60 * 1000;
  const sinceIso = new Date(
    nowMs - HISTORY_DAYS * 24 * 60 * 60 * 1000,
  ).toISOString();

  const { data: babies, error: babiesErr } = await supabase
    .from("babies")
    .select("id, name, birth_date, user_id");
  if (babiesErr) {
    return NextResponse.json({ error: babiesErr.message }, { status: 500 });
  }

  const stats = {
    babiesProcessed: 0,
    predictionsTriggered: 0,
    notificationsSent: 0,
    notificationsFailed: 0,
    skippedDup: 0,
    skippedConfidence: 0,
    skippedNoPrediction: 0,
    subsCleaned: 0,
    usersOptOut: 0,
  };

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

  // Cache subs par user
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

  for (const baby of babies ?? []) {
    stats.babiesProcessed += 1;

    const { data: sleepsRaw } = await supabase
      .from("sleeps")
      .select("started_at, ended_at")
      .eq("baby_id", baby.id)
      .gte("started_at", sinceIso)
      .order("started_at", { ascending: false })
      .limit(80);

    const sleeps =
      (sleepsRaw as { started_at: string; ended_at: string | null }[] | null) ??
      [];

    const ageMonths =
      (now.getTime() - new Date(baby.birth_date).getTime()) /
      (1000 * 60 * 60 * 24 * 30.44);

    const prediction = predictNextSleep(sleeps, ageMonths, now);

    if (!prediction.predictedSleepAt) {
      stats.skippedNoPrediction += 1;
      continue;
    }

    const predMs = prediction.predictedSleepAt.getTime();
    if (predMs < lowerMs || predMs > upperMs) continue;

    if (prediction.confidence === "low") {
      stats.skippedConfidence += 1;
      continue;
    }

    stats.predictionsTriggered += 1;

    const predDate = prediction.predictedSleepAt;
    const yyyy = predDate.getFullYear();
    const mm = String(predDate.getMonth() + 1).padStart(2, "0");
    const dd = String(predDate.getDate()).padStart(2, "0");
    const hh = String(predDate.getHours()).padStart(2, "0");
    const dedupKind = `nap_predict_${yyyy}-${mm}-${dd}_${hh}`;

    // Recipients = owner + collaborateurs acceptes
    const recipientIds = new Set<string>([baby.user_id]);
    const { data: collabs } = await supabase
      .from("baby_collaborators")
      .select("collaborator_id, accepted_at")
      .eq("baby_id", baby.id)
      .not("accepted_at", "is", null);
    for (const c of collabs ?? []) {
      if (c.collaborator_id) recipientIds.add(c.collaborator_id as string);
    }

    // Dedup au niveau (baby_id, kind) — table contrainte unique
    const { data: alreadyRow } = await supabase
      .from("push_reminders_sent")
      .select("kind")
      .eq("baby_id", baby.id)
      .eq("kind", dedupKind)
      .maybeSingle();
    if (alreadyRow) {
      stats.skippedDup += 1;
      continue;
    }

    let anyOk = false;
    const goneEndpoints: string[] = [];

    for (const userId of recipientIds) {
      if (!(await isOptedIn(userId))) {
        stats.usersOptOut += 1;
        continue;
      }
      const subs = await getSubs(userId);
      if (subs.length === 0) continue;

      for (const sub of subs) {
        const r = await sendPush(sub, {
          title: "Prochaine sieste bientôt",
          body: `${baby.name} sera prêt à dormir dans ~15 min`,
          url: "/enfant/sleep",
          tag: dedupKind,
        });
        if (r.ok) {
          anyOk = true;
          stats.notificationsSent += 1;
        } else {
          stats.notificationsFailed += 1;
          if (r.gone) goneEndpoints.push(sub.endpoint);
        }
      }
    }

    if (anyOk) {
      // Insert dedup row (best-effort, unique idx protege contre les collisions)
      await supabase.from("push_reminders_sent").insert({
        user_id: baby.user_id,
        baby_id: baby.id,
        kind: dedupKind,
      });
    }

    if (goneEndpoints.length > 0) {
      const uniqueGone = Array.from(new Set(goneEndpoints));
      await supabase
        .from("baby_push_subscriptions")
        .delete()
        .in("endpoint", uniqueGone);
      stats.subsCleaned += uniqueGone.length;
      for (const userId of recipientIds) subsByUser.delete(userId);
    }
  }

  return NextResponse.json({ ok: true, ...stats });
}
