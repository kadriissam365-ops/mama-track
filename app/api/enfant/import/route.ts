import { readJsonBody } from "@/lib/request-json";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/enfant/supabase/server";
import { createServiceClient } from "@/lib/enfant/supabase/service";
import { legacySourceUrl, IMPORT_TABLES, legacyPhotoPath } from "@/lib/enfant/legacy-import";
import { RATE_LIMITS, consumeRateLimit, rateLimitedResponse } from "@/lib/rate-limit";

export const maxDuration = 60;
export async function POST(request: Request) {
  const client = await createClient();
  const { data: { user } } = await client.auth.getUser();
  if (!user) return Response.json({ error: "Connecte-toi à ton compte MamaTrack." }, { status: 401 });
  if (!(await consumeRateLimit(client, RATE_LIMITS.babyImport))) return rateLimitedResponse(RATE_LIMITS.babyImport);
  const key = process.env.BABYTRACK_SUPABASE_PUBLISHABLE_KEY;
  if (!key || !process.env.SUPABASE_SERVICE_ROLE_KEY) return Response.json({ error: "Le transfert est momentanément indisponible." }, { status: 503 });
  let body;
  try { body = await readJsonBody(request, 4096) as {email?: unknown; password?: unknown}; } catch { return Response.json({ error: "Vérifie les informations saisies." }, { status: 400 }); }
  if (!body || typeof body.email !== "string" || typeof body.password !== "string" || body.email.length > 254 || body.password.length > 1024) return Response.json({ error: "Vérifie les informations saisies." }, { status: 400 });

  // No service key for the source: every read uses the authenticated legacy
  // account and its RLS. Never link accounts by matching email alone.
  const sourceUrl = legacySourceUrl();
  const legacy = createSupabaseClient(sourceUrl, key, { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } });
  const uploaded: string[] = [];
  const service = createServiceClient();
  try {
    const { data: auth, error: authError } = await legacy.auth.signInWithPassword({ email: body.email.trim(), password: body.password });
    if (authError || !auth.user) return Response.json({ error: "Ces identifiants BabyTrack n’ont pas permis la connexion." }, { status: 401 });
    const { data: babies, error } = await legacy.from("babies").select("*").eq("user_id", auth.user.id).order("created_at");
    if (error) throw error;
    if (!babies?.length) return Response.json({ error: "Ce compte ne possède pas de carnet bébé. Si tu avais un accès partagé, demande au parent de transférer son carnet puis de t’inviter dans MamaTrack." }, { status: 409 });
    const ids = babies.map(baby => baby.id);
    const payload: Record<string, unknown> = { babies };
    for (const table of IMPORT_TABLES) {
      const rows: Record<string, unknown>[] = [];
      for (let offset = 0; ; offset += 500) {
        const { data, error } = await legacy.from(table).select("*").in("baby_id", ids).order("id").range(offset, offset + 499);
        if (error) throw error;
        rows.push(...(data ?? []));
        if (!data || data.length < 500) break;
        if (rows.length >= 100000) throw new Error("Import too large");
      }
      payload[table] = rows;
    }
    // Copy private journal media before the SQL transaction. Do not retain
    // expired signed URLs or download any client-chosen external address.
    for (const row of payload.diary_entries as Record<string, unknown>[]) {
      if (!row.photo_url) continue;
      const path = legacyPhotoPath(row.photo_url, sourceUrl);
      if (!path) throw new Error("Unsupported legacy photo");
      const { data: photo, error } = await legacy.storage.from("diary-photos").download(path);
      if (error || !photo || photo.size > 8388608) throw new Error("Legacy photo unavailable");
      const extension = path.split(".").pop()?.replace(/[^a-z0-9]/gi, "").slice(0, 5) || "jpg";
      const destination = `${user.id}/${row.baby_id}/import-${row.id}.${extension}`;
      const { error: uploadError } = await service.storage.from("diary-photos").upload(destination, photo, { contentType: photo.type, upsert: false });
      if (uploadError && !("statusCode" in uploadError && String(uploadError.statusCode) === "409")) throw uploadError;
      if (!uploadError) uploaded.push(destination);
      row.photo_url = `storage:${destination}`;
    }
    const { data: summary, error: importError } = await service.rpc("import_babytrack", { p_source_user: auth.user.id, p_target_user: user.id, p_payload: payload });
    if (importError) throw importError;
    return Response.json({ success: true, ...summary, message: "Ton carnet est disponible dans MamaTrack. Pour le partager, invite de nouveau tes proches dans l’espace famille." });
  } catch {
    if (uploaded.length) await service.storage.from("diary-photos").remove(uploaded);
    return Response.json({ error: "Le transfert n’a pas pu être finalisé. Ton suivi d’origine reste conservé dans BabyTrack. Réessaie ou contacte le support." }, { status: 503 });
  } finally {
    await legacy.auth.signOut({ scope: "local" });
  }
}
