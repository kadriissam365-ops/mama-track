import { NextResponse } from "next/server";
import { createClient } from "@/lib/enfant/supabase/server";
import { sendPush, type StoredSubscription } from "@/lib/enfant/push";
import { consumeRateLimit, RATE_LIMITS, rateLimitedResponse } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  if (!await consumeRateLimit(supabase, RATE_LIMITS.pushSend)) return rateLimitedResponse(RATE_LIMITS.pushSend);

  const { data: subs } = await supabase
    .from("baby_push_subscriptions")
    .select("endpoint, p256dh, auth")
    .eq("user_id", user.id);

  if (!subs || subs.length === 0) {
    return NextResponse.json(
      { error: "no_subscription", hint: "Active d'abord les notifications." },
      { status: 400 },
    );
  }

  let ok = 0;
  const goneEndpoints: string[] = [];
  for (const s of subs as StoredSubscription[]) {
    const r = await sendPush(s, {
      title: "MamaTrack — test 🍼",
      body: "Si tu vois ça, les notifications push sont bien actives sur ce device !",
      url: "/enfant/dashboard",
      tag: "test",
    });
    if (r.ok) ok += 1;
    else if (r.gone) goneEndpoints.push(s.endpoint);
  }

  if (goneEndpoints.length > 0) {
    await supabase
      .from("baby_push_subscriptions")
      .delete()
      .in("endpoint", goneEndpoints);
  }

  return NextResponse.json({ ok: true, sent: ok, total: subs.length, cleaned: goneEndpoints.length });
}
