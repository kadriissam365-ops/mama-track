import { subDays, format } from "date-fns";
import { fr } from "date-fns/locale";
import { getCurrentWeek, getDaysRemaining, getWeekData, type WeekData } from "./pregnancy-data";

export interface WeeklyReportInput {
  dueDate: string | null;
  babyName?: string | null;
  mamaName?: string | null;
  weightEntries: { date: string; weight: number }[];
  symptomEntries: { date: string; symptoms: string[] }[];
  kickSessions: { date: string; duration: number }[];
  waterIntake: Record<string, number>;
  appointments: { date: string; time: string; title: string; done?: boolean }[];
}

export interface WeeklyReportData {
  week: number;
  daysRemaining: number | null;
  weekData: WeekData;
  babyName: string | null;
  mamaName: string | null;
  periodStart: string;
  periodEnd: string;
  weight: {
    current: number | null;
    delta: number | null;
  };
  water: {
    avgMl: number;
    goalMl: number;
    percent: number;
  };
  symptoms: string[];
  kicks: {
    sessions: number;
    totalMinutes: number;
  };
  nextAppointment: { date: string; time: string; title: string } | null;
  weeklyTip: string;
}

const WATER_GOAL = 2000;

export function composeWeeklyReport(input: WeeklyReportInput, today: Date = new Date()): WeeklyReportData {
  const dueDate = input.dueDate ? new Date(input.dueDate) : null;
  const week = dueDate ? getCurrentWeek(dueDate) : 20;
  const daysRemaining = dueDate ? getDaysRemaining(dueDate) : null;
  const weekData = getWeekData(week);

  const weekAgo = subDays(today, 7);

  // Weight
  const sortedWeights = [...input.weightEntries].sort((a, b) => a.date.localeCompare(b.date));
  const currentWeight = sortedWeights.length > 0 ? sortedWeights[sortedWeights.length - 1].weight : null;
  const prevWeight = sortedWeights.filter((w) => new Date(w.date) < weekAgo).slice(-1)[0] ?? null;
  const weightDelta = currentWeight !== null && prevWeight ? Number((currentWeight - prevWeight.weight).toFixed(1)) : null;

  // Water (last 7 days average)
  const waterDays = Array.from({ length: 7 }, (_, i) => {
    const d = format(subDays(today, i), "yyyy-MM-dd");
    return input.waterIntake[d] ?? 0;
  });
  const avgMl = Math.round(waterDays.reduce((a, b) => a + b, 0) / 7);

  // Symptoms this week
  const symptomsThisWeek = input.symptomEntries.filter((s) => new Date(s.date) >= weekAgo);
  const allSymptoms = symptomsThisWeek.flatMap((s) => s.symptoms);
  const uniqueSymptoms = [...new Set(allSymptoms)].slice(0, 5);

  // Kicks this week
  const kicksThisWeek = input.kickSessions.filter((k) => new Date(k.date) >= weekAgo);
  const totalKickMinutes = Math.round(kicksThisWeek.reduce((sum, k) => sum + (k.duration || 0), 0) / 60);

  // Next appointment
  const nextAppt =
    input.appointments
      .filter((a) => !a.done && new Date(a.date) >= today)
      .sort((a, b) => a.date.localeCompare(b.date))[0] ?? null;

  return {
    week,
    daysRemaining,
    weekData,
    babyName: input.babyName ?? null,
    mamaName: input.mamaName ?? null,
    periodStart: format(weekAgo, "d MMM", { locale: fr }),
    periodEnd: format(today, "d MMM yyyy", { locale: fr }),
    weight: { current: currentWeight, delta: weightDelta },
    water: {
      avgMl,
      goalMl: WATER_GOAL,
      percent: Math.min(100, Math.round((avgMl / WATER_GOAL) * 100)),
    },
    symptoms: uniqueSymptoms,
    kicks: {
      sessions: kicksThisWeek.length,
      totalMinutes: totalKickMinutes,
    },
    nextAppointment: nextAppt ? { date: nextAppt.date, time: nextAppt.time, title: nextAppt.title } : null,
    weeklyTip: weekData.weeklyTip,
  };
}
