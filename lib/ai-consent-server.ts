import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";

export async function hasAiConsent(client: SupabaseClient, userId: string) {
  const { data, error } = await client.from("ai_consents")
    .select("version").eq("user_id", userId).eq("version", 1).maybeSingle();
  return !error && data?.version === 1;
}

export function aiConsentRequiredResponse() {
  return Response.json({ error: "Active d’abord l’assistant et accepte l’envoi des données dans ses réglages." }, { status: 403 });
}
