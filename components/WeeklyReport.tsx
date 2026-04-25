"use client";
import { m as motion, AnimatePresence } from "framer-motion";
import { X, TrendingUp, TrendingDown, Minus, Mail, ExternalLink, Loader2 } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { useStore } from "@/lib/store";
import { getCurrentWeek, getWeekData } from "@/lib/pregnancy-data";
import { format, subDays } from "date-fns";
import { fr } from "date-fns/locale";

export default function WeeklyReport({ onClose }: { onClose: () => void }) {
  const store = useStore();
  const dueDate = store.dueDate ? new Date(store.dueDate) : null;
  const currentWeek = dueDate ? getCurrentWeek(dueDate) : 20;
  const weekData = getWeekData(currentWeek);

  // Calculs des stats de la semaine (7 derniers jours)
  const today = new Date();
  const weekAgo = subDays(today, 7);

  // Poids : comparer dernière mesure vs mesure d'il y a 7j
  const lastWeight = store.weightEntries.length > 0 ? store.weightEntries[store.weightEntries.length - 1] : null;
  const prevWeight = store.weightEntries.filter(w => new Date(w.date) < weekAgo).slice(-1)[0] || null;
  const weightDiff = lastWeight && prevWeight ? (lastWeight.weight - prevWeight.weight).toFixed(1) : null;

  // Eau : moyenne 7 derniers jours
  const waterDays = Array.from({length: 7}, (_, i) => {
    const d = format(subDays(today, i), 'yyyy-MM-dd');
    return (store.waterIntake as Record<string, number>)[d] || 0;
  });
  const avgWater = Math.round(waterDays.reduce((a, b) => a + b, 0) / 7);

  // Symptômes cette semaine
  const symptomsThisWeek = store.symptomEntries.filter(s => new Date(s.date) >= weekAgo);
  const allSymptoms = symptomsThisWeek.flatMap(s => s.symptoms);
  const uniqueSymptoms = [...new Set(allSymptoms)].slice(0, 5);

  // Kicks cette semaine
  const kicksThisWeek = store.kickSessions.filter(k => new Date(k.date) >= weekAgo);

  // Prochain RDV
  const nextAppt = store.appointments
    .filter(a => !a.done && new Date(a.date) >= today)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/50 flex items-end justify-center"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ y: 300 }}
          animate={{ y: 0 }}
          exit={{ y: 300 }}
          className="bg-white dark:bg-gray-900 rounded-t-3xl p-6 w-full max-w-lg space-y-5 max-h-[85vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-[#3d2b2b] dark:text-gray-100">📊 Bilan de la semaine</h2>
              <p className="text-sm text-gray-400 dark:text-gray-500">Semaine {currentWeek} {weekData.fruitEmoji}</p>
            </div>
            <button onClick={onClose} className="w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Poids */}
          <div className="bg-pink-50 dark:bg-pink-950/30 rounded-2xl p-4 border border-pink-100 dark:border-pink-900/30">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-semibold text-[#3d2b2b] dark:text-gray-100">⚖️ Poids</span>
              {weightDiff && (
                <span className={`text-sm font-bold flex items-center gap-1 ${parseFloat(weightDiff) > 0 ? 'text-orange-500 dark:text-orange-400' : 'text-green-500 dark:text-green-400'}`}>
                  {parseFloat(weightDiff) > 0 ? <TrendingUp className="w-3 h-3" /> : parseFloat(weightDiff) < 0 ? <TrendingDown className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
                  {parseFloat(weightDiff) > 0 ? '+' : ''}{weightDiff} kg
                </span>
              )}
            </div>
            {lastWeight ? (
              <p className="text-2xl font-bold text-[#3d2b2b] dark:text-gray-100">{lastWeight.weight} <span className="text-sm font-normal text-gray-400 dark:text-gray-500">kg</span></p>
            ) : (
              <p className="text-sm text-gray-400 dark:text-gray-500">Aucune pesée cette semaine</p>
            )}
          </div>

          {/* Eau */}
          <div className="bg-purple-50 dark:bg-purple-950/30 rounded-2xl p-4 border border-purple-100 dark:border-purple-900/30">
            <span className="text-sm font-semibold text-[#3d2b2b] dark:text-gray-100">💧 Hydratation moyenne</span>
            <p className="text-2xl font-bold text-[#3d2b2b] dark:text-gray-100 mt-1">{avgWater} <span className="text-sm font-normal text-gray-400 dark:text-gray-500">ml/jour</span></p>
            <div className="w-full bg-purple-100 dark:bg-purple-900/30 rounded-full h-2 mt-2">
              <div className="bg-purple-400 h-2 rounded-full" style={{ width: `${Math.min(100, (avgWater / 2000) * 100)}%` }} />
            </div>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Objectif : 2000 ml/jour</p>
          </div>

          {/* Symptômes */}
          {uniqueSymptoms.length > 0 && (
            <div className="bg-green-50 dark:bg-green-950/30 rounded-2xl p-4 border border-green-100 dark:border-green-900/30">
              <span className="text-sm font-semibold text-[#3d2b2b] dark:text-gray-100">😣 Symptômes cette semaine</span>
              <div className="flex flex-wrap gap-2 mt-2">
                {uniqueSymptoms.map(s => (
                  <span key={s} className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-2 py-1 rounded-full">{s}</span>
                ))}
              </div>
            </div>
          )}

          {/* Kicks */}
          <div className="bg-orange-50 dark:bg-orange-950/30 rounded-2xl p-4 border border-orange-100 dark:border-orange-900/30">
            <span className="text-sm font-semibold text-[#3d2b2b] dark:text-gray-100">👶 Mouvements bébé</span>
            <p className="text-2xl font-bold text-[#3d2b2b] dark:text-gray-100 mt-1">{kicksThisWeek.length} <span className="text-sm font-normal text-gray-400 dark:text-gray-500">sessions cette semaine</span></p>
          </div>

          {/* Prochain RDV */}
          {nextAppt && (
            <div className="bg-blue-50 dark:bg-blue-950/30 rounded-2xl p-4 border border-blue-100 dark:border-blue-900/30">
              <span className="text-sm font-semibold text-[#3d2b2b] dark:text-gray-100">📅 Prochain rendez-vous</span>
              <p className="font-semibold text-[#3d2b2b] dark:text-gray-100 mt-1">{nextAppt.title}</p>
              <p className="text-sm text-gray-400 dark:text-gray-500">{format(new Date(nextAppt.date), "d MMMM yyyy", { locale: fr })} à {nextAppt.time}</p>
            </div>
          )}

          {/* Développement bébé */}
          <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-2xl p-4 border border-pink-100 dark:border-pink-900/30">
            <span className="text-sm font-semibold text-[#3d2b2b] dark:text-gray-100">✨ Cette semaine pour bébé</span>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 leading-relaxed line-clamp-3">{weekData.babyDevelopment}</p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
