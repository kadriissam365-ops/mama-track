export const LEGACY_BABYTRACK_URL = "https://fjxoxdagmcsepmukosav.supabase.co";

// An isolated local source lets us exercise Auth, RLS and Storage without
// creating test accounts in the production BabyTrack project.
export function legacySourceUrl(): string {
  const local = process.env.BABYTRACK_LOCAL_TEST_URL;
  if (process.env.NODE_ENV === "production" || !local) return LEGACY_BABYTRACK_URL;
  const url = new URL(local);
  if (url.protocol !== "http:" || !["127.0.0.1", "localhost"].includes(url.hostname) || url.username || url.password || url.pathname !== "/" || url.search || url.hash) {
    throw new Error("Invalid local BabyTrack test URL");
  }
  return url.origin;
}
export const IMPORT_TABLES = ["feedings", "sleeps", "diapers", "measurements", "vaccines_given", "health_events", "diary_entries", "milestones", "food_intros", "coach_messages"] as const;

// A legacy media URL must stay inside the verified BabyTrack storage project.
export function legacyPhotoPath(value: unknown, sourceUrl = LEGACY_BABYTRACK_URL): string | null {
  if (typeof value !== "string") return null;
  try {
    // URL normalizes encoded dot segments before exposing pathname.
    // Check the original path first so normalization cannot hide traversal.
    const rawPath = value.match(/^[a-z][a-z0-9+.-]*:\/\/[^/]+(\/[^?#]*)/i)?.[1];
    if (!rawPath || decodeURIComponent(rawPath).split("/").some(part => part === "." || part === "..")) return null;
    const url = new URL(value);
    if (url.username || url.password) return null;
    if (url.origin !== sourceUrl) return null;
    const match = url.pathname.match(/^\/storage\/v1\/object\/(?:sign|public)\/diary-photos\/(.+)$/);
    const path = match ? decodeURIComponent(match[1]) : null;
    return path && !path.split("/").some(part => part === ".." || part === "." || !part) ? path : null;
  } catch { return null; }
}
