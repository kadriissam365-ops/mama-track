import { createClient } from "@/lib/enfant/supabase/server";

async function update(method: "GET" | "POST" | "DELETE") {
  const client = await createClient();
  const { data: { user } } = await client.auth.getUser();
  if (!user) return Response.json({ error: "unauthorized" }, { status: 401 });
  if (method === "POST") {
    const acceptedAt = new Date().toISOString();
    const { error } = await client.from("ai_consents").upsert({ user_id: user.id, version: 1, accepted_at: acceptedAt });
    if (error) return Response.json({ error: "unavailable" }, { status: 503 });
    return Response.json({ acceptedAt });
  }
  if (method === "DELETE") {
    const { error } = await client.from("ai_consents").delete().eq("user_id", user.id);
    if (error) return Response.json({ error: "unavailable" }, { status: 503 });
    return Response.json({ acceptedAt: null });
  }
  const { data, error } = await client.from("ai_consents").select("accepted_at").eq("user_id", user.id).eq("version", 1).maybeSingle();
  if (error) return Response.json({ error: "unavailable" }, { status: 503 });
  return Response.json({ acceptedAt: data?.accepted_at ?? null }, { headers: { "Cache-Control": "private, no-store" } });
}
export async function GET() { return update("GET"); }
export async function POST() { return update("POST"); }
export async function DELETE() { return update("DELETE"); }
