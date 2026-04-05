"use client";

import { motion } from "framer-motion";
import { useStore } from "@/lib/store";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Minus } from "lucide-react";
import { WATER_GOAL_ML } from "@/lib/constants";

interface WaterTabProps {
  today: string;
}

const AMOUNTS = [250, 500, 750, 1000];

export default function WaterTab({ today }: WaterTabProps) {
  const store = useStore();
  const waterToday = store.waterIntake[today] ?? 0;
  const goal = WATER_GOAL_ML;
  const pct = Math.min(100, (waterToday / goal) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="space-y-5"
    >
      {/* Jauge principale */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-blue-100 text-center">
        <div className="relative w-40 h-40 mx-auto mb-4">
          <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
            <circle cx="60" cy="60" r="50" fill="none" stroke="#e0f2fe" strokeWidth="10" />
            <motion.circle
              cx="60"
              cy="60"
              r="50"
              fill="none"
              stroke="#7dd3fc"
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 50}
              animate={{ strokeDashoffset: 2 * Math.PI * 50 * (1 - pct / 100) }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold text-blue-500">{waterToday}</span>
            <span className="text-xs text-gray-400">ml / {goal} ml</span>
          </div>
        </div>

        <p className="text-sm font-medium text-gray-600">
          {pct >= 100
            ? "🎉 Objectif atteint !"
            : `Encore ${goal - waterToday} ml pour atteindre l'objectif`}
        </p>
      </div>

      {/* Boutons rapides */}
      <div className="grid grid-cols-2 gap-3">
        {AMOUNTS.map((ml) => (
          <button
            key={ml}
            onClick={() => store.addWater(today, ml)}
            className="bg-white rounded-2xl py-4 shadow-sm border border-blue-100 flex flex-col items-center gap-1 hover:bg-blue-50 transition-colors"
          >
            <span className="text-2xl">💧</span>
            <span className="text-sm font-semibold text-blue-500">+ {ml} ml</span>
          </button>
        ))}
      </div>

      <button
        onClick={() => store.removeWater(today, 250)}
        disabled={waterToday === 0}
        className="w-full py-3 bg-white border border-red-100 text-red-400 rounded-2xl font-medium flex items-center justify-center gap-2 disabled:opacity-30 hover:bg-red-50 transition-colors"
      >
        <Minus className="w-4 h-4" />
        Annuler 250 ml
      </button>

      {/* Historique 7 jours */}
      <div className="bg-white rounded-3xl p-4 shadow-sm border border-blue-100">
        <h3 className="text-sm font-semibold text-[#3d2b2b] mb-3">7 derniers jours</h3>
        {Object.entries(store.waterIntake)
          .sort((a, b) => b[0].localeCompare(a[0]))
          .slice(0, 7)
          .map(([date, ml]) => (
            <div
              key={date}
              className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0"
            >
              <span className="text-sm text-gray-600">
                {format(new Date(date), "EEEE d MMM", { locale: fr })}
              </span>
              <div className="flex items-center gap-2">
                <div className="w-20 bg-blue-100 rounded-full h-2">
                  <div
                    className="bg-blue-400 h-2 rounded-full"
                    style={{ width: `${Math.min(100, ((ml as number) / goal) * 100)}%` }}
                  />
                </div>
                <span className="text-xs font-semibold text-blue-500">{ml as number} ml</span>
              </div>
            </div>
          ))}
      </div>
    </motion.div>
  );
}
