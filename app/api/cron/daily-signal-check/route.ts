import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin, getAppUrl } from "@/lib/stripe-server";
import { computeAlerts, loadContext } from "@/lib/health-alerts";
import { sendPushToUser } from "@/lib/push-notify";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(request: NextRequest) {
  const expected = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");
  if (!expected || authHeader !== `Bearer ${expected}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: subRows } = await (supabase as any)
    .from("push_subscriptions")
    .select("user_id");
  const userIds = Array.from(
    new Set(((subRows ?? []) as { user_id: string }[]).map((r) => r.user_id).filter(Boolean)),
  );

  if (userIds.length === 0) {
    return NextResponse.json({ checked: 0, alerted: 0, sent: 0 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profileRows } = await (supabase as any)
    .from("profiles")
    .select("id")
    .in("id", userIds);
  const eligibleIds = ((profileRows ?? []) as { id: string }[]).map((p) => p.id);

  const appUrl = getAppUrl();
  const cutoff = new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString();

  let checked = 0;
  let alerted = 0;
  let sent = 0;

  for (const userId of eligibleIds) {
    checked += 1;
    try {
      const ctx = await loadContext(userId, supabase);
      const alerts = computeAlerts(ctx);
      if (alerts.length === 0) continue;
      alerted += 1;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: recent } = await (supabase as any)
        .from("notifications_log")
        .select("id")
        .eq("user_id", userId)
        .eq("type", "signal_alert")
        .gte("sent_at", cutoff)
        .limit(1);
      if (recent && recent.length > 0) continue;

      const priority = alerts.find((a) => a.level === "red") ?? alerts.find((a) => a.level === "warn") ?? alerts[0];

      const count = await sendPushToUser(supabase, userId, {
        title: "⚠️ Vérification santé MamaTrack",
        body: priority.message,
        tag: "signal-alert",
        url: `${appUrl}/coach`,
      });

      if (count > 0) {
        sent += count;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase as any).from("notifications_log").insert({
          user_id: userId,
          type: "signal_alert",
          payload: { level: priority.level, source: priority.source, message: priority.message, count: alerts.length },
        });
      }
    } catch {
      // best-effort: continue with next user
    }
  }

  return NextResponse.json({ checked, alerted, sent });
}
