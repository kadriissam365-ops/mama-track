import { readJsonBody } from "@/lib/request-json";
import { createClient } from "@/lib/enfant/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const client = await createClient();
  const { data: { user } } = await client.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const [babiesResult, settingsResult] = await Promise.all([
    client.from("babies").select("id,name,birth_date,user_id").order("created_at"),
    client.from("family_settings").select("active_stage,active_baby_id").eq("user_id", user.id).maybeSingle(),
  ]);
  if (babiesResult.error || settingsResult.error) return NextResponse.json({ error: "unavailable" }, { status: 503 });
  const babies = babiesResult.data ?? [];
  const settings = settingsResult.data;
  return NextResponse.json({
    babies,
    activeStage: settings?.active_stage ?? (babies.length ? "baby" : "pregnancy"),
    activeBabyId: babies.find(b => b.id === settings?.active_baby_id)?.id ?? babies[0]?.id ?? null,
  }, { headers: { "Cache-Control": "private, no-store" } });
}

export async function PATCH(request: Request) {
  const client = await createClient();
  const { data: { user } } = await client.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  let body;
  try { body = await readJsonBody(request, 2048) as { activeStage?: unknown; activeBabyId?: unknown }; } catch { return NextResponse.json({ error: "invalid_json" }, { status: 400 }); }
  if (!body || (body.activeStage !== "pregnancy" && body.activeStage !== "baby")) return NextResponse.json({ error: "invalid_stage" }, { status: 400 });
  const update: { user_id: string; active_stage: string; active_baby_id?: string } = { user_id: user.id, active_stage: body.activeStage };
  if (body.activeBabyId !== undefined) {
    if (typeof body.activeBabyId !== "string" || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(body.activeBabyId)) return NextResponse.json({ error: "invalid_baby" }, { status: 400 });
    const { data } = await client.from("babies").select("id").eq("id", body.activeBabyId).maybeSingle();
    if (!data) return NextResponse.json({ error: "forbidden" }, { status: 403 });
    update.active_baby_id = data.id;
  }
  const { error } = await client.from("family_settings").upsert(update);
  if (error) return NextResponse.json({ error: "unavailable" }, { status: 503 });
  return NextResponse.json({ success: true });
}
