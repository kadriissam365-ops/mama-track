import { NextRequest, NextResponse } from "next/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { composeWeeklyReport } from "@/lib/weekly-report-data";
import { renderWeeklyReportEmail } from "@/lib/email-templates/weekly-report";
import { sendReportEmail } from "@/lib/email-send";
import { fetchUserReportInputs } from "@/lib/weekly-report-fetch";

export const runtime = "nodejs";
export const maxDuration = 60;

interface PushSub {
  user_id: string;
  endpoint: string;
  subscription_json: string;
}

async function sendPushForUser(
  webpush: typeof import("web-push"),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  userId: string,
  appUrl: string,
  week: number,
  fruitEmoji: string,
): Promise<number> {
  const { data: subs } = await supabase
    .from("push_subscriptions")
    .select("endpoint, subscription_json")
    .eq("user_id", userId);
  if (!subs || subs.length === 0) return 0;

  const payload = JSON.stringify({
    title: `🤰 Bilan semaine ${week} ${fruitEmoji}`,
    body: "Ton récap MamaTrack est prêt — ouvre pour voir l'évolution.",
    tag: "weekly-report",
    url: `${appUrl}/reports/weekly`,
  });

  let sent = 0;
  await Promise.all(
    (subs as { endpoint: string; subscription_json: string }[]).map(async (sub) => {
      try {
        await webpush.sendNotification(JSON.parse(sub.subscription_json), payload);
        sent += 1;
      } catch (err: unknown) {
        const e = err as { statusCode?: number };
        if (e.statusCode === 410 || e.statusCode === 404) {
          await supabase.from("push_subscriptions").delete().eq("endpoint", sub.endpoint);
        }
      }
    }),
  );
  return sent;
}

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const expected = process.env.CRON_SECRET;
  if (expected && authHeader !== `Bearer ${expected}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    return NextResponse.json({ error: "Supabase service role not configured" }, { status: 500 });
  }

  const supabase = createSupabaseClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
  });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://mamatrack.fr";

  // Setup web-push
  const vapidPublic = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const vapidPrivate = process.env.VAPID_PRIVATE_KEY;
  const vapidSubject = process.env.VAPID_SUBJECT || "mailto:contact@mamatrack.fr";
  const webpush = (await import("web-push")).default;
  const pushReady = Boolean(vapidPublic && vapidPrivate);
  if (pushReady) {
    webpush.setVapidDetails(vapidSubject, vapidPublic!, vapidPrivate!);
  }

  // Fetch all profiles with due_date set (opt-in is implicit via profile)
  const { data: profiles, error: profilesError } = await supabase
    .from("profiles")
    .select("id, due_date")
    .not("due_date", "is", null);

  if (profilesError) {
    return NextResponse.json({ error: profilesError.message }, { status: 500 });
  }

  // List users with emails (service role can read auth.users)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: authList } = await (supabase.auth as any).admin.listUsers({ perPage: 1000 });
  const emailById = new Map<string, string>();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  for (const u of (authList?.users ?? []) as any[]) {
    if (u.id && u.email) emailById.set(u.id, u.email);
  }

  let emailsSent = 0;
  let pushesSent = 0;
  let skipped = 0;
  const errors: string[] = [];

  for (const profile of (profiles ?? []) as { id: string; due_date: string }[]) {
    try {
      const input = await fetchUserReportInputs(supabase, profile.id);
      if (!input.dueDate) {
        skipped += 1;
        continue;
      }
      const report = composeWeeklyReport(input);

      // Email
      const email = emailById.get(profile.id);
      if (email) {
        const { subject, html, text } = renderWeeklyReportEmail(report, appUrl);
        const result = await sendReportEmail({ to: email, subject, html, text });
        if (result.ok) emailsSent += 1;
        else errors.push(`${profile.id}: ${result.error}`);
      }

      // Push
      if (pushReady) {
        pushesSent += await sendPushForUser(
          webpush,
          supabase,
          profile.id,
          appUrl,
          report.week,
          report.weekData.fruitEmoji,
        );
      }
    } catch (err) {
      errors.push(`${profile.id}: ${err instanceof Error ? err.message : "unknown"}`);
    }
  }

  return NextResponse.json({
    ok: true,
    totalProfiles: profiles?.length ?? 0,
    emailsSent,
    pushesSent,
    skipped,
    errors: errors.slice(0, 20),
  });
}
