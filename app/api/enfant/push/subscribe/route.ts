import { NextResponse } from "next/server";
import { createClient } from "@/lib/enfant/supabase/server";
import { getSubscriptionState } from "@/lib/enfant/subscription";
import { validPushEndpoint, validPushKey } from "@/lib/push-validation";
import { readJsonBody } from "@/lib/request-json";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const state = await getSubscriptionState();
  if (!state?.hasAccess) {
    return NextResponse.json({ error: "premium_required" }, { status: 402 });
  }

  let body: unknown;
  try {
    body = await readJsonBody(request, 4096);
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const sub = body as {
    endpoint?: string;
    keys?: { p256dh?: string; auth?: string };
  };
  if (!sub || typeof sub !== "object") return NextResponse.json({ error: "invalid_subscription" }, { status: 400 });
  const endpoint = sub.endpoint;
  const p256dh = sub.keys?.p256dh;
  const auth = sub.keys?.auth;
  if (!validPushEndpoint(endpoint) || !validPushKey(p256dh) || !validPushKey(auth)) {
    return NextResponse.json({ error: "invalid_subscription" }, { status: 400 });
  }

  const ua = request.headers.get("user-agent")?.slice(0, 200) ?? null;

  const { error } = await supabase.from("baby_push_subscriptions").upsert(
    {
      user_id: user.id,
      endpoint,
      p256dh,
      auth,
      ua,
      last_seen_at: new Date().toISOString(),
    },
    { onConflict: "endpoint" },
  );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
