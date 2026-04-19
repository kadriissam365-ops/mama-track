import type { SupabaseClient } from "@supabase/supabase-js";
import type { WeeklyReportInput } from "./weekly-report-data";

export async function fetchUserReportInputs(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: SupabaseClient<any>,
  userId: string,
): Promise<WeeklyReportInput & { email?: string | null }> {
  const [profileRes, weightRes, symptomRes, kicksRes, waterRes, apptsRes] = await Promise.all([
    supabase.from("profiles").select("due_date, baby_name, mama_name").eq("id", userId).maybeSingle(),
    supabase.from("weight_entries").select("date, weight").eq("user_id", userId).order("date"),
    supabase.from("symptom_entries").select("date, symptoms").eq("user_id", userId),
    supabase.from("kick_sessions").select("date, duration").eq("user_id", userId),
    supabase.from("water_intake").select("date, ml").eq("user_id", userId),
    supabase.from("appointments").select("date, time, title, done").eq("user_id", userId),
  ]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const profile = (profileRes.data ?? {}) as any;
  const waterIntake: Record<string, number> = {};
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  for (const row of (waterRes.data ?? []) as any[]) {
    waterIntake[row.date] = row.ml;
  }

  return {
    dueDate: profile.due_date ?? null,
    babyName: profile.baby_name ?? null,
    mamaName: profile.mama_name ?? null,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    weightEntries: ((weightRes.data ?? []) as any[]).map((w) => ({ date: w.date, weight: Number(w.weight) })),
    symptomEntries: // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ((symptomRes.data ?? []) as any[]).map((s) => ({
        date: s.date,
        symptoms: Array.isArray(s.symptoms) ? s.symptoms : [],
      })),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    kickSessions: ((kicksRes.data ?? []) as any[]).map((k) => ({ date: k.date, duration: k.duration ?? 0 })),
    waterIntake,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    appointments: ((apptsRes.data ?? []) as any[]).map((a) => ({
      date: a.date,
      time: a.time,
      title: a.title,
      done: Boolean(a.done),
    })),
  };
}
