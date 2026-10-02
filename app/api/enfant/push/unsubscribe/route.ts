import { NextResponse } from "next/server";
import { createClient } from "@/lib/enfant/supabase/server";

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

  let endpoint: string | null = null;
  try {
    const body = (await request.json()) as { endpoint?: string };
    endpoint = body.endpoint ?? null;
  } catch {
    /* no body — delete all for user */
  }

  const q = supabase
    .from("baby_push_subscriptions")
    .delete()
    .eq("user_id", user.id);
  if (endpoint) q.eq("endpoint", endpoint);
  const { error } = await q;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
