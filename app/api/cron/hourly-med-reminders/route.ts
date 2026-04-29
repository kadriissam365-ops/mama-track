import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin, getAppUrl } from "@/lib/stripe-server";
import { sendPushToUser } from "@/lib/push-notify";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

interface Medication {
  id: string;
  user_id: string;
  name: string;
  dosage: string;
  time: string;
  active: boolean;
}

function parisNow(): { hour: number; minute: number; date: string } {
  const fmt = new Intl.DateTimeFormat("fr-FR", {
    timeZone: "Europe/Paris",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const parts = fmt.formatToParts(new Date());
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const get = (t: string) => parts.find((p: any) => p.type === t)?.value ?? "00";
  const year = get("year");
  const month = get("month");
  const day = get("day");
  const hour = parseInt(get("hour"), 10);
  const minute = parseInt(get("minute"), 10);
  return { hour, minute, date: `${year}-${month}-${day}` };
}

function parseHM(t: string | null | undefined): { h: number; m: number } | null {
  if (!t) return null;
  const match = /^(\d{1,2}):(\d{2})/.exec(t);
  if (!match) return null;
  const h = parseInt(match[1], 10);
  const m = parseInt(match[2], 10);
  if (isNaN(h) || isNaN(m)) return null;
  return { h, m };
}

export async function GET(request: NextRequest) {
  const expected = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");
  if (!expected || authHeader !== `Bearer ${expected}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();
  const appUrl = getAppUrl();
  const { hour, minute, date: today } = parisNow();
  const nowMinutes = hour * 60 + minute;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: meds } = await (supabase as any)
    .from("medications")
    .select("id, user_id, name, dosage, time, active")
    .eq("active", true);

  const activeMeds = (meds ?? []) as Medication[];

  let checked = 0;
  let due = 0;
  let sent = 0;

  for (const med of activeMeds) {
    checked += 1;
    const hm = parseHM(med.time);
    if (!hm) continue;
    const medMinutes = hm.h * 60 + hm.m;
    const diff = Math.abs(medMinutes - nowMinutes);
    if (diff > 5) continue;
    due += 1;

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: takenRows } = await (supabase as any)
        .from("medication_logs")
        .select("id")
        .eq("med_id", med.id)
        .eq("date", today)
        .eq("taken", true)
        .limit(1);
      if (takenRows && takenRows.length > 0) continue;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: alreadyLogged } = await (supabase as any)
        .from("notifications_log")
        .select("id")
        .eq("user_id", med.user_id)
        .eq("type", "med_reminder")
        .gte("sent_at", `${today}T00:00:00Z`)
        .filter("payload->>med_id", "eq", med.id)
        .limit(1);
      if (alreadyLogged && alreadyLogged.length > 0) continue;

      const count = await sendPushToUser(supabase, med.user_id, {
        title: `💊 ${med.name}`,
        body: `Pense à prendre ta dose de ${med.dosage}`,
        tag: `med-${med.id}-${today}`,
        url: `${appUrl}/medicaments`,
      });

      if (count > 0) {
        sent += count;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase as any).from("notifications_log").insert({
          user_id: med.user_id,
          type: "med_reminder",
          payload: { med_id: med.id, name: med.name },
        });
      }
    } catch {
      // best-effort: continue with next medication
    }
  }

  return NextResponse.json({ checked, due, sent, parisHour: `${hour}:${String(minute).padStart(2, "0")}` });
}
