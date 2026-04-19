import { NextRequest, NextResponse } from "next/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { dispatchWeeklyPartnerUpdate } from "@/lib/partner-notify";

export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * GET /api/partner-notify/weekly-cron
 *
 * Weekly Vercel cron — walks every mama with at least one active duo partner,
 * then dispatches a "weekly-update" partner notification per mama (which
 * internally fans out to each opted-in partner's push subscriptions).
 *
 * Secured by `CRON_SECRET` when set.
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const expected = process.env.CRON_SECRET;
  if (expected && authHeader !== `Bearer ${expected}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    return NextResponse.json(
      { error: "Supabase service role not configured" },
      { status: 500 },
    );
  }

  const supabase = createSupabaseClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
  });

  const { data: accessRows, error: accessError } = await supabase
    .from("duo_access")
    .select("mama_id");

  if (accessError) {
    return NextResponse.json({ error: accessError.message }, { status: 500 });
  }

  const mamaIds = Array.from(
    new Set(((accessRows ?? []) as { mama_id: string }[]).map((r) => r.mama_id)),
  );

  let totalSent = 0;
  let totalFailed = 0;
  let totalSkipped = 0;
  const errors: string[] = [];

  for (const mamaId of mamaIds) {
    try {
      const res = await dispatchWeeklyPartnerUpdate(supabase, mamaId);
      totalSent += res.sent;
      totalFailed += res.failed;
      totalSkipped += res.skipped;
    } catch (err) {
      errors.push(
        `${mamaId}: ${err instanceof Error ? err.message : "unknown"}`,
      );
    }
  }

  return NextResponse.json({
    ok: true,
    mamaCount: mamaIds.length,
    sent: totalSent,
    failed: totalFailed,
    skipped: totalSkipped,
    errors: errors.slice(0, 20),
  });
}
