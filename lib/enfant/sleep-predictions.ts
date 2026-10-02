export type SleepPrediction = {
  predictedSleepAt: Date | null;
  windowStart: Date | null;
  windowEnd: Date | null;
  confidence: "low" | "medium" | "high";
  basedOnSamples: number;
  averageWakeWindowMin: number | null;
  reason: string | null;
};

type SleepInput = { started_at: string; ended_at: string | null };

const MIN_WAKE_WINDOW_MIN = 20;
const MAX_WAKE_WINDOW_MIN = 6 * 60;
const WINDOW_PADDING_MIN = 15;
const HORIZON_DAYS = 14;
const SHORT_HORIZON_HOURS = 6;

const EMPTY: SleepPrediction = {
  predictedSleepAt: null,
  windowStart: null,
  windowEnd: null,
  confidence: "low",
  basedOnSamples: 0,
  averageWakeWindowMin: null,
  reason: "Pas assez d'historique",
};

function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];
}

function stddev(values: number[], mean: number): number {
  if (values.length <= 1) return 0;
  const variance =
    values.reduce((acc, v) => acc + (v - mean) ** 2, 0) / values.length;
  return Math.sqrt(variance);
}

function combineDateAndMinuteOfDay(base: Date, minuteOfDay: number): Date {
  const out = new Date(base);
  out.setHours(0, 0, 0, 0);
  out.setMinutes(minuteOfDay);
  return out;
}

export function predictNextSleep(
  sleeps: SleepInput[],
  ageMonths: number,
  now: Date = new Date(),
): SleepPrediction {
  if (!sleeps || sleeps.length === 0) {
    return { ...EMPTY };
  }

  const horizonMs = HORIZON_DAYS * 24 * 60 * 60 * 1000;
  const cutoff = now.getTime() - horizonMs;

  // Garde uniquement les siestes terminees dans la fenetre, validees
  const completed = sleeps
    .filter((s) => s.ended_at != null)
    .map((s) => ({
      start: new Date(s.started_at),
      end: new Date(s.ended_at as string),
    }))
    .filter(
      (s) =>
        !Number.isNaN(s.start.getTime()) &&
        !Number.isNaN(s.end.getTime()) &&
        s.end.getTime() >= s.start.getTime() &&
        s.end.getTime() >= cutoff,
    )
    .sort((a, b) => a.start.getTime() - b.start.getTime());

  if (completed.length === 0) {
    return { ...EMPTY };
  }

  // Wake-windows: delta entre fin sieste i et debut sieste i+1, exclut transitions nuit > 6h
  const wakeWindowsMin: number[] = [];
  for (let i = 0; i < completed.length - 1; i++) {
    const deltaMs =
      completed[i + 1].start.getTime() - completed[i].end.getTime();
    const deltaMin = deltaMs / 60000;
    if (
      deltaMin >= MIN_WAKE_WINDOW_MIN &&
      deltaMin <= MAX_WAKE_WINDOW_MIN
    ) {
      wakeWindowsMin.push(deltaMin);
    }
  }

  const samples = wakeWindowsMin.length;
  const avg =
    samples > 0
      ? wakeWindowsMin.reduce((a, b) => a + b, 0) / samples
      : null;
  const sd = avg != null ? stddev(wakeWindowsMin, avg) : 0;

  let confidence: "low" | "medium" | "high" = "low";
  if (samples >= 15 && sd <= 30) confidence = "high";
  else if (samples >= 5) confidence = "medium";

  // Trouve derniere sieste terminee avant now
  const before = completed.filter((s) => s.end.getTime() <= now.getTime());
  const lastEnd =
    before.length > 0 ? before[before.length - 1].end : null;

  let predictedSleepAt: Date | null = null;

  if (
    lastEnd &&
    avg != null &&
    now.getTime() - lastEnd.getTime() <= SHORT_HORIZON_HOURS * 60 * 60 * 1000
  ) {
    predictedSleepAt = new Date(lastEnd.getTime() + avg * 60 * 1000);
  } else {
    // Fallback : mediane de l'heure du premier coucher quotidien (en minutes du jour)
    const firstByDay = new Map<string, Date>();
    for (const s of completed) {
      const dayKey = `${s.start.getFullYear()}-${s.start.getMonth()}-${s.start.getDate()}`;
      const existing = firstByDay.get(dayKey);
      if (!existing || s.start.getTime() < existing.getTime()) {
        firstByDay.set(dayKey, s.start);
      }
    }
    const minutes = Array.from(firstByDay.values()).map(
      (d) => d.getHours() * 60 + d.getMinutes(),
    );
    if (minutes.length > 0) {
      const medMin = median(minutes);
      const candidate = combineDateAndMinuteOfDay(now, medMin);
      // Si l'heure mediane du premier coucher est deja passee aujourd'hui, vise demain
      if (candidate.getTime() <= now.getTime()) {
        candidate.setDate(candidate.getDate() + 1);
      }
      predictedSleepAt = candidate;
    }
  }

  if (!predictedSleepAt) {
    return {
      ...EMPTY,
      basedOnSamples: samples,
      averageWakeWindowMin: avg,
      confidence,
      reason: "Pas assez d'historique",
    };
  }

  // Decale dans le futur si necessaire
  if (predictedSleepAt.getTime() < now.getTime()) {
    predictedSleepAt = new Date(now.getTime() + 30 * 60 * 1000);
  }

  let finalConfidence = confidence;
  let reason: string | null = null;

  if (ageMonths < 4) {
    if (finalConfidence === "high") finalConfidence = "low";
    else if (finalConfidence === "medium") finalConfidence = "low";
    reason =
      "Le rythme de sommeil est encore irrégulier avant 4 mois — prédiction indicative.";
  } else if (samples < 5) {
    reason = "Basé sur peu de siestes — la fiabilité augmentera avec le temps.";
  } else if (samples < 15 && sd > 30) {
    reason = `Rythme variable (±${Math.round(sd)} min entre les fenêtres d'éveil).`;
  } else if (finalConfidence === "high") {
    reason = `Rythme régulier · ${samples} fenêtres d'éveil analysées.`;
  } else {
    reason = `${samples} fenêtres d'éveil analysées.`;
  }

  const windowStart = new Date(
    predictedSleepAt.getTime() - WINDOW_PADDING_MIN * 60 * 1000,
  );
  const windowEnd = new Date(
    predictedSleepAt.getTime() + WINDOW_PADDING_MIN * 60 * 1000,
  );

  return {
    predictedSleepAt,
    windowStart,
    windowEnd,
    confidence: finalConfidence,
    basedOnSamples: samples,
    averageWakeWindowMin: avg,
    reason,
  };
}
