"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { X, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { useStore } from "@/lib/store";
import { getCurrentWeek, getProgressPercent } from "@/lib/pregnancy-data";
import { format, subDays, parseISO, isWithinInterval, startOfDay } from "date-fns";
import { fr } from "date-fns/locale";

interface WeeklyReportProps {
  onClose: () => void;
}

export default function WeeklyReport({ onClose }: WeeklyReportProps) {
  const store = useStore();

  const report = useMemo(() => {
    const now = new Date();
    const weekStart = subDays(now, 7);
    const prevWeekStart = subDays(now, 14);

    const dueDate = store.dueDate ? new Date(store.dueDate) : null;
    const week = dueDate ? getCurrentWeek(dueDate) : 0;
    const progress = dueDate ? getProgressPercent(dueDate) : 0;

    // Water this week
    const waterEntries: number[] = [];
    for (let i = 0; i < 7; i++) {
      const date = format(subDays(now, i), "yyyy-MM-dd");
      waterEntries.push(store.waterIntake[date] ?? 0);
    }
    const avgWater = Math.round(waterEntries.reduce((a, b) => a + b, 0) / 7);

    // Weight this week vs last week
    const weightsThisWeek = store.weightEntries.filter(e =>
      isWithinInterval(parseISO(e.date), { start: weekStart, end: now })
    );
    const weightsLastWeek = store.weightEntries.filter(e =>
      isWithinInterval(parseISO(e.date), { start: prevWeekStart, end: weekStart })
    );

    const lastWeightThisWeek = weightsThisWeek[weightsThisWeek.length - 1]?.weight ?? null;
    const lastWeightPrevWeek = weightsLastWeek[weightsLastWeek.length - 1]?.weight ?? null;
    const weightDiff = lastWeightThisWeek && lastWeightPrevWeek
      ? Math.round((lastWeightThisWeek - lastWeightPrevWeek) * 10) / 10
      : null;

    // Symptoms this week
    const symptomsThisWeek = store.symptomEntries.filter(e =>
      isWithinInterval(parseISO(e.date), { start: weekStart, end: now })
    );

    // Kicks this week
    const kicksThisWeek = store.kickSessions.filter(k =>
      isWithinInterval(new Date(k.startTime), { start: weekStart, end: now })
    );

    // Next appointment
    const nextAppt = store.appointments
      .filter(a => !a.done && new Date(a.date) >= now)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];

    return {
      week,
      progress,
      lastWeightThisWeek,
      lastWeightPrevWeek,
      weightDiff,
      avgWater,
      symptomsThisWeek,
      kicksThisWeek,
      nextAppt,
    };
  }, [store]);

  const WeightIcon = report.weightDiff === null
    ? Minus
    : report.weightDiff > 0
      ? TrendingUp
      : TrendingDown;

  const weightColor = report.weightDiff === null
    ? "text-gray-400"
    : report.weightDiff > 0
      ? "text-orange-500"
      : "text-green-500";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: "100%", opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: "100%", opacity: 0 }}
        transition={{ type: "spring", damping: 30 }}
        className="bg-white dark:bg-[#1a1a2e] rounded-t-3xl sm:rounded-3xl p-6 w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">📊 Bilan de la semaine</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Semaine {report.week} · {report.progress}% terminé</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress bar */}
        <div className="mb-5">
          <div className="h-3 bg-pink-100 dark:bg-pink-950 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${report.progress}%` }}
              transition={{ duration: 1, delay: 0.3 }}
              className="h-full bg-gradient-to-r from-pink-400 to-purple-500 rounded-full"
            />
          </div>
          <p className="text-xs text-gray-400 mt-1 text-right">{report.progress}% de la grossesse</p>
        </div>

        <div className="space-y-3">
          {/* Weight */}
          <div className="bg-gray-50 dark:bg-[#0f0f1a] rounded-2xl p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wide">Poids</p>
              <p className="text-lg font-bold text-gray-800 dark:text-gray-100">
                {report.lastWeightThisWeek ? `${report.lastWeightThisWeek} kg` : "—"}
              </p>
            </div>
            {report.weightDiff !== null && (
              <div className={`flex items-center gap-1 ${weightColor}`}>
                <WeightIcon className="w-5 h-5" />
                <span className="font-semibold text-sm">
                  {report.weightDiff > 0 ? "+" : ""}{report.weightDiff} kg
                </span>
              </div>
            )}
          </div>

          {/* Eau */}
          <div className="bg-blue-50 dark:bg-blue-950/30 rounded-2xl p-4">
            <p className="text-xs text-blue-500 font-medium uppercase tracking-wide">Hydratation moyenne</p>
            <p className="text-lg font-bold text-blue-700 dark:text-blue-300">{report.avgWater} ml / jour</p>
            <div className="h-2 bg-blue-100 dark:bg-blue-900 rounded-full mt-2 overflow-hidden">
              <div
                className="h-full bg-blue-400 rounded-full"
                style={{ width: `${Math.min(100, (report.avgWater / 2000) * 100)}%` }}
              />
            </div>
          </div>

          {/* Symptoms */}
          <div className="bg-purple-50 dark:bg-purple-950/30 rounded-2xl p-4">
            <p className="text-xs text-purple-500 font-medium uppercase tracking-wide">Symptômes cette semaine</p>
            {report.symptomsThisWeek.length === 0 ? (
              <p className="text-gray-400 text-sm mt-1">Aucun symptôme loggué</p>
            ) : (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {Array.from(new Set(report.symptomsThisWeek.flatMap(s => s.symptoms))).map(s => (
                  <span key={s} className="bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-200 text-xs px-2 py-1 rounded-full">
                    {s}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Kicks */}
          <div className="bg-green-50 dark:bg-green-950/30 rounded-2xl p-4">
            <p className="text-xs text-green-600 font-medium uppercase tracking-wide">Mouvements bébé</p>
            <p className="text-lg font-bold text-green-700 dark:text-green-300">
              {report.kicksThisWeek.length} session{report.kicksThisWeek.length !== 1 ? "s" : ""}
            </p>
          </div>

          {/* Next appointment */}
          <div className="bg-orange-50 dark:bg-orange-950/30 rounded-2xl p-4">
            <p className="text-xs text-orange-500 font-medium uppercase tracking-wide">Prochain RDV</p>
            {report.nextAppt ? (
              <>
                <p className="text-base font-bold text-orange-700 dark:text-orange-300">{report.nextAppt.title}</p>
                <p className="text-sm text-orange-500">
                  {format(new Date(report.nextAppt.date), "d MMMM yyyy", { locale: fr })}
                </p>
              </>
            ) : (
              <p className="text-gray-400 text-sm mt-1">Aucun RDV à venir</p>
            )}
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full mt-5 py-3 bg-gradient-to-r from-pink-400 to-purple-500 text-white font-semibold rounded-xl hover:from-pink-500 hover:to-purple-600 transition-all"
        >
          Fermer
        </button>
      </motion.div>
    </motion.div>
  );
}
