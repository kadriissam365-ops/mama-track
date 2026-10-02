export const LEGACY_BABYTRACK_URL = "https://fjxoxdagmcsepmukosav.supabase.co";
export const IMPORT_TABLES = ["feedings", "sleeps", "diapers", "measurements", "vaccines_given", "health_events", "diary_entries", "milestones", "food_intros", "coach_messages"] as const;

// A legacy media URL must stay inside the verified BabyTrack storage project.
export function legacyPhotoPath(value: unknown): string | null {
  if (typeof value !== "string") return null;
  try {
    const url = new URL(value);
    if (url.origin !== LEGACY_BABYTRACK_URL) return null;
    const match = url.pathname.match(/^\/storage\/v1\/object\/(?:sign|public)\/diary-photos\/(.+)$/);
    const path = match ? decodeURIComponent(match[1]) : null;
    return path && !path.split("/").some(part => part === ".." || part === "." || !part) ? path : null;
  } catch { return null; }
}
