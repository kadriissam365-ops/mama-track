import type { SupabaseClient } from "@supabase/supabase-js";
export function diaryStoragePath(value: unknown): string | null {
  if (typeof value !== "string" || !value.startsWith("storage:")) return null;
  const path = value.slice(8);
  return /^[0-9a-f-]{36}\/[0-9a-f-]{36}\/[a-zA-Z0-9._-]+$/.test(path) && !path.includes("..") ? path : null;
}
export async function diaryPhotoUrl(client: SupabaseClient, value: unknown): Promise<string | null> {
  const path = diaryStoragePath(value);
  if (!path) return null;
  const { data, error } = await client.storage.from("diary-photos").createSignedUrl(path, 300);
  return error ? null : data?.signedUrl ?? null;
}
