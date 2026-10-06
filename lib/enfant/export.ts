import type { SupabaseClient } from "@supabase/supabase-js";
import { IMPORT_TABLES } from "./legacy-import";

export async function exportFamily(client: SupabaseClient, userId: string) {
  const { data: babies, error } = await client
    .from("babies")
    .select("*")
    .order("id");
  if (error) throw error;
  const ids = (babies ?? []).map((baby) => baby.id);
  const records: Record<string, unknown[]> = {};
  for (const table of [
    ...IMPORT_TABLES,
    "child_routines",
    "routine_completions",
  ]) {
    const rows: unknown[] = [];
    if (ids.length) {
      for (let offset = 0; ; offset += 500) {
        const result = await client
          .from(table)
          .select("*")
          .in("baby_id", ids)
          .order("id")
          .range(offset, offset + 499);
        if (result.error) throw result.error;
        rows.push(...(result.data ?? []));
        if (!result.data || result.data.length < 500) break;
      }
    }
    records[table] = rows;
  }
  const [preferences, settings, consent] = await Promise.all([
    client.from("baby_preferences").select("*").eq("id", userId).maybeSingle(),
    client
      .from("family_settings")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle(),
    client.from("ai_consents").select("*").eq("user_id", userId).maybeSingle(),
  ]);
  if (preferences.error || settings.error || consent.error)
    throw new Error("family_export_failed");
  return {
    babies: babies ?? [],
    records,
    preferences: preferences.data,
    settings: settings.data,
    aiConsent: consent.data,
  };
}
