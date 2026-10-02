import type { SupabaseClient } from "@supabase/supabase-js";

export type MonthRange = {
  year: number;
  month: number; // 1-12
  startIso: string; // YYYY-MM-01T00:00:00.000Z
  endExclusiveIso: string; // first day of next month
  startDate: string; // YYYY-MM-DD (for date columns)
  endDate: string; // last day of month YYYY-MM-DD
  label: string; // "novembre 2025"
};

export function monthRange(year: number, month: number): MonthRange {
  const start = new Date(Date.UTC(year, month - 1, 1));
  const end = new Date(Date.UTC(year, month, 1));
  const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
  const endDate = `${year}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
  return {
    year,
    month,
    startIso: start.toISOString(),
    endExclusiveIso: end.toISOString(),
    startDate,
    endDate,
    label: start.toLocaleDateString("fr-FR", {
      month: "long",
      year: "numeric",
      timeZone: "UTC",
    }),
  };
}

export function lastNMonths(n: number, ref: Date = new Date()): MonthRange[] {
  const out: MonthRange[] = [];
  for (let i = 0; i < n; i++) {
    const d = new Date(ref.getFullYear(), ref.getMonth() - i, 1);
    out.push(monthRange(d.getFullYear(), d.getMonth() + 1));
  }
  return out;
}

export type MonthlyReport = {
  range: MonthRange;
  baby: { id: string; name: string; birth_date: string };
  feedings: {
    total: number;
    bottles: number;
    breast: number;
    solids: number;
    waters: number;
    totalAmountMl: number;
    avgPerDay: number;
  };
  sleeps: {
    total: number;
    naps: number;
    nights: number;
    totalMinutes: number;
    avgMinutesPerDay: number;
    longestMinutes: number;
  };
  diapers: {
    total: number;
    wet: number;
    dirty: number;
    mixed: number;
    avgPerDay: number;
  };
  growth: {
    measurements: number;
    firstWeightG: number | null;
    lastWeightG: number | null;
    deltaWeightG: number | null;
    firstHeightCm: number | null;
    lastHeightCm: number | null;
    deltaHeightCm: number | null;
  };
  health: {
    fevers: number;
    medicines: number;
    appointments: number;
    symptoms: number;
  };
  vaccines: { code: string; label: string | null; given_at: string }[];
  milestones: { code: string; label: string | null; achieved_at: string }[];
  diary: { count: number; withPhoto: number };
};

export async function buildMonthlyReport(
  supabase: SupabaseClient,
  baby: { id: string; name: string; birth_date: string },
  range: MonthRange,
): Promise<MonthlyReport> {
  const daysInMonth =
    (Date.UTC(range.year, range.month, 0) -
      Date.UTC(range.year, range.month - 1, 0)) /
    (1000 * 60 * 60 * 24);

  const [
    feedingsRes,
    sleepsRes,
    diapersRes,
    measurementsRes,
    healthRes,
    vaccinesRes,
    milestonesRes,
    diaryRes,
  ] = await Promise.all([
    supabase
      .from("feedings")
      .select("kind, started_at, ended_at, amount_ml")
      .eq("baby_id", baby.id)
      .gte("started_at", range.startIso)
      .lt("started_at", range.endExclusiveIso),
    supabase
      .from("sleeps")
      .select("kind, started_at, ended_at")
      .eq("baby_id", baby.id)
      .gte("started_at", range.startIso)
      .lt("started_at", range.endExclusiveIso),
    supabase
      .from("diapers")
      .select("kind, changed_at")
      .eq("baby_id", baby.id)
      .gte("changed_at", range.startIso)
      .lt("changed_at", range.endExclusiveIso),
    supabase
      .from("measurements")
      .select("measured_at, weight_g, height_cm, head_cm")
      .eq("baby_id", baby.id)
      .gte("measured_at", range.startDate)
      .lte("measured_at", range.endDate)
      .order("measured_at", { ascending: true }),
    supabase
      .from("health_events")
      .select("kind, occurred_at")
      .eq("baby_id", baby.id)
      .gte("occurred_at", range.startIso)
      .lt("occurred_at", range.endExclusiveIso),
    supabase
      .from("vaccines_given")
      .select("vaccine_code, vaccine_label, given_at")
      .eq("baby_id", baby.id)
      .gte("given_at", range.startDate)
      .lte("given_at", range.endDate)
      .order("given_at", { ascending: true }),
    supabase
      .from("milestones")
      .select("code, label, achieved_at")
      .eq("baby_id", baby.id)
      .gte("achieved_at", range.startDate)
      .lte("achieved_at", range.endDate)
      .order("achieved_at", { ascending: true }),
    supabase
      .from("diary_entries")
      .select("photo_url, entry_date")
      .eq("baby_id", baby.id)
      .gte("entry_date", range.startDate)
      .lte("entry_date", range.endDate),
  ]);

  const feedings = (feedingsRes.data ?? []) as {
    kind: string;
    started_at: string;
    ended_at: string | null;
    amount_ml: number | null;
  }[];
  const sleeps = (sleepsRes.data ?? []) as {
    kind: string | null;
    started_at: string;
    ended_at: string | null;
  }[];
  const diapers = (diapersRes.data ?? []) as { kind: string; changed_at: string }[];
  const measurements = (measurementsRes.data ?? []) as {
    measured_at: string;
    weight_g: number | null;
    height_cm: number | null;
    head_cm: number | null;
  }[];
  const health = (healthRes.data ?? []) as { kind: string; occurred_at: string }[];
  const vaccines = (vaccinesRes.data ?? []) as {
    vaccine_code: string;
    vaccine_label: string | null;
    given_at: string;
  }[];
  const milestones = (milestonesRes.data ?? []) as {
    code: string;
    label: string | null;
    achieved_at: string;
  }[];
  const diary = (diaryRes.data ?? []) as {
    photo_url: string | null;
    entry_date: string;
  }[];

  const sleepMinutes = (s: { started_at: string; ended_at: string | null }) => {
    if (!s.ended_at) return 0;
    return Math.max(
      0,
      Math.round(
        (new Date(s.ended_at).getTime() - new Date(s.started_at).getTime()) /
          60000,
      ),
    );
  };
  const sleepDurations = sleeps.map(sleepMinutes);
  const totalSleepMin = sleepDurations.reduce((a, b) => a + b, 0);

  const firstM = measurements[0];
  const lastM = measurements[measurements.length - 1];

  return {
    range,
    baby,
    feedings: {
      total: feedings.length,
      bottles: feedings.filter((f) => f.kind === "bottle").length,
      breast: feedings.filter((f) => f.kind === "breast").length,
      solids: feedings.filter((f) => f.kind === "solid").length,
      waters: feedings.filter((f) => f.kind === "water").length,
      totalAmountMl: feedings.reduce((a, f) => a + (f.amount_ml ?? 0), 0),
      avgPerDay: round1(feedings.length / daysInMonth),
    },
    sleeps: {
      total: sleeps.length,
      naps: sleeps.filter((s) => s.kind === "nap").length,
      nights: sleeps.filter((s) => s.kind === "night").length,
      totalMinutes: totalSleepMin,
      avgMinutesPerDay: Math.round(totalSleepMin / daysInMonth),
      longestMinutes: sleepDurations.length ? Math.max(...sleepDurations) : 0,
    },
    diapers: {
      total: diapers.length,
      wet: diapers.filter((d) => d.kind === "wet").length,
      dirty: diapers.filter((d) => d.kind === "dirty").length,
      mixed: diapers.filter((d) => d.kind === "mixed").length,
      avgPerDay: round1(diapers.length / daysInMonth),
    },
    growth: {
      measurements: measurements.length,
      firstWeightG: firstM?.weight_g ?? null,
      lastWeightG: lastM?.weight_g ?? null,
      deltaWeightG:
        firstM?.weight_g != null && lastM?.weight_g != null
          ? lastM.weight_g - firstM.weight_g
          : null,
      firstHeightCm: firstM?.height_cm ?? null,
      lastHeightCm: lastM?.height_cm ?? null,
      deltaHeightCm:
        firstM?.height_cm != null && lastM?.height_cm != null
          ? round1(Number(lastM.height_cm) - Number(firstM.height_cm))
          : null,
    },
    health: {
      fevers: health.filter((h) => h.kind === "fever").length,
      medicines: health.filter((h) => h.kind === "medicine").length,
      appointments: health.filter((h) => h.kind === "appointment").length,
      symptoms: health.filter((h) => h.kind === "symptom").length,
    },
    vaccines: vaccines.map((v) => ({
      code: v.vaccine_code,
      label: v.vaccine_label,
      given_at: v.given_at,
    })),
    milestones: milestones.map((m) => ({
      code: m.code,
      label: m.label,
      achieved_at: m.achieved_at,
    })),
    diary: {
      count: diary.length,
      withPhoto: diary.filter((d) => !!d.photo_url).length,
    },
  };
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

export function formatMinutes(min: number): string {
  if (min <= 0) return "0 min";
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h} h`;
  return `${h} h ${String(m).padStart(2, "0")}`;
}
