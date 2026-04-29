import { getCurrentWeek, getWeekData } from "@/lib/pregnancy-data";

const MAX_HISTORY = 14;

export interface AlertItem {
  level: "info" | "warn" | "red";
  message: string;
  source: string;
}

export interface ContextData {
  profile: { dueDate: string | null; mamaName: string | null; babyName: string | null; weekMode: string };
  weekSA: number | null;
  weekGA: number | null;
  weekTip: string;
  weights: { date: string; weight: number; note?: string | null }[];
  symptoms: { date: string; symptoms: string[]; severity: number; note?: string | null }[];
  kicks: { date: string; count: number; duration: number }[];
  contractions: { date: string; nb: number; lastInterval?: number }[];
  bp: { date: string; systolic: number; diastolic: number; pulse?: number | null }[];
  sleep: { date: string; hours: number; quality: number }[];
  mood: { date: string; emoji: string; label: string }[];
  water: { date: string; ml: number }[];
  meds: { name: string; dosage: string; frequency: string; active: boolean }[];
}

export const MAX_HISTORY_PUBLIC = 14;

export function formatDate(d: string | undefined | null): string {
  if (!d) return "?";
  return d.length >= 10 ? d.slice(0, 10) : d;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function loadContext(userId: string, supabase: any): Promise<ContextData> {
  const sb = supabase;
  const [
    profileRes,
    weightRes,
    symptomRes,
    kickRes,
    contractionRes,
    bpRes,
    sleepRes,
    moodRes,
    waterRes,
    medsRes,
  ] = await Promise.all([
    sb.from("profiles").select("due_date, baby_name, mama_name, week_mode").eq("id", userId).maybeSingle(),
    sb.from("weight_entries").select("date, weight, note").eq("user_id", userId).order("date", { ascending: false }).limit(MAX_HISTORY),
    sb.from("symptom_entries").select("date, symptoms, severity, note").eq("user_id", userId).order("date", { ascending: false }).limit(MAX_HISTORY),
    sb.from("kick_sessions").select("date, count, duration").eq("user_id", userId).order("date", { ascending: false }).limit(MAX_HISTORY),
    sb.from("contraction_sessions").select("date, contractions").eq("user_id", userId).order("date", { ascending: false }).limit(MAX_HISTORY),
    sb.from("blood_pressure_entries").select("date, systolic, diastolic, pulse").eq("user_id", userId).order("date", { ascending: false }).limit(MAX_HISTORY),
    sb.from("sleep_entries").select("date, hours, quality").eq("user_id", userId).order("date", { ascending: false }).limit(MAX_HISTORY),
    sb.from("mood_entries").select("date, mood_emoji, mood_label").eq("user_id", userId).order("date", { ascending: false }).limit(MAX_HISTORY),
    sb.from("water_intake").select("date, ml").eq("user_id", userId).order("date", { ascending: false }).limit(MAX_HISTORY),
    sb.from("medications").select("name, dosage, frequency, active").eq("user_id", userId).limit(MAX_HISTORY),
  ]);

  const profileRow = profileRes.data ?? {};
  const profile = {
    dueDate: profileRow.due_date ?? null,
    mamaName: profileRow.mama_name ?? null,
    babyName: profileRow.baby_name ?? null,
    weekMode: profileRow.week_mode ?? "SA",
  };

  let weekSA: number | null = null;
  let weekGA: number | null = null;
  let weekTip = "Pas de DPA enregistrée — invite gentiment l'utilisatrice à la renseigner pour des conseils sur mesure.";
  if (profile.dueDate) {
    const dpa = new Date(profile.dueDate);
    if (!isNaN(dpa.getTime())) {
      weekSA = getCurrentWeek(dpa);
      weekGA = Math.max(1, weekSA - 2);
      weekTip = getWeekData(weekSA).weeklyTip;
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const contractions = ((contractionRes.data as any[]) ?? []).map((c: any) => {
    const arr: { startTime: number; endTime?: number; interval?: number }[] = Array.isArray(c.contractions) ? c.contractions : [];
    const last = arr[arr.length - 1];
    return { date: c.date as string, nb: arr.length, lastInterval: last?.interval };
  });

  return {
    profile,
    weekSA,
    weekGA,
    weekTip,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    weights: ((weightRes.data as any[]) ?? []).map((w: any) => ({ date: w.date, weight: w.weight, note: w.note })),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    symptoms: ((symptomRes.data as any[]) ?? []).map((s: any) => ({ date: s.date, symptoms: s.symptoms ?? [], severity: s.severity ?? 0, note: s.note })),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    kicks: ((kickRes.data as any[]) ?? []).map((k: any) => ({ date: k.date, count: k.count ?? 0, duration: k.duration ?? 0 })),
    contractions,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    bp: ((bpRes.data as any[]) ?? []).map((b: any) => ({ date: b.date, systolic: b.systolic, diastolic: b.diastolic, pulse: b.pulse })),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    sleep: ((sleepRes.data as any[]) ?? []).map((s: any) => ({ date: s.date, hours: s.hours, quality: s.quality })),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mood: ((moodRes.data as any[]) ?? []).map((m: any) => ({ date: m.date, emoji: m.mood_emoji, label: m.mood_label })),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    water: ((waterRes.data as any[]) ?? []).map((w: any) => ({ date: w.date, ml: w.ml ?? 0 })),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    meds: ((medsRes.data as any[]) ?? []).map((m: any) => ({ name: m.name, dosage: m.dosage, frequency: m.frequency, active: m.active })),
  };
}

export function computeAlerts(ctx: ContextData): AlertItem[] {
  const alerts: AlertItem[] = [];
  const sa = ctx.weekSA;

  if (sa !== null && sa >= 28 && ctx.kicks.length > 0) {
    const byDay = new Map<string, number>();
    for (const k of ctx.kicks) {
      byDay.set(k.date, (byDay.get(k.date) ?? 0) + k.count);
    }
    const sortedDays = Array.from(byDay.entries()).sort((a, b) => b[0].localeCompare(a[0]));
    const lastDay = sortedDays[0];
    if (lastDay && lastDay[1] < 10) {
      alerts.push({
        level: "warn",
        message: `Tu as compté ${lastDay[1]} mouvements le ${formatDate(lastDay[0])}. À partir de 28 SA, l'idéal est ≥ 10 par jour. Si bébé bouge moins que d'habitude, allonge-toi sur le côté gauche, hydrate-toi, et recompte. Si toujours peu de mouvements, contacte ta maternité.`,
        source: "kicks",
      });
    }
  }

  if (ctx.bp.length >= 2) {
    const [a, b] = ctx.bp;
    if (a.systolic >= 140 || a.diastolic >= 90) {
      if (b.systolic >= 140 || b.diastolic >= 90) {
        alerts.push({
          level: "red",
          message: `Ta tension est élevée sur tes 2 derniers relevés (${a.systolic}/${a.diastolic} et ${b.systolic}/${b.diastolic}). C'est un signal à prendre au sérieux pendant la grossesse — contacte ta sage-femme ou ton médecin rapidement, ou le 15 si tu as maux de tête, troubles visuels ou douleur au ventre.`,
          source: "blood_pressure",
        });
      }
    }
  }

  if (sa !== null && sa > 20 && ctx.weights.length >= 2) {
    const sorted = [...ctx.weights].sort((a, b) => a.date.localeCompare(b.date));
    const last = sorted[sorted.length - 1];
    const prev = sorted[sorted.length - 2];
    const dLast = new Date(last.date).getTime();
    const dPrev = new Date(prev.date).getTime();
    const days = Math.max(1, (dLast - dPrev) / (1000 * 60 * 60 * 24));
    if (days <= 14) {
      const weeklyGain = ((last.weight - prev.weight) / days) * 7;
      if (weeklyGain > 0.5) {
        alerts.push({
          level: "warn",
          message: `Ta prise de poids récente est d'environ ${(weeklyGain * 1000).toFixed(0)} g/semaine. Au-delà de 20 SA, on recommande plutôt 300-400 g/semaine. Surveille rétention d'eau (mains, visage) et parle-en à ta sage-femme au prochain rendez-vous.`,
          source: "weight",
        });
      }
    }
  }

  return alerts;
}
