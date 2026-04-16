"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { format } from "date-fns";

interface NutrientItem {
  id: string;
  emoji: string;
  label: string;
  description: string;
  color: string;
}

const NUTRIENTS: NutrientItem[] = [
  {
    id: "folate",
    emoji: "🌿",
    label: "Acide folique",
    description: "400-800 µg / Protection tube neural",
    color: "bg-green-100 dark:bg-green-900/30 border-green-300 text-green-700 dark:text-green-300",
  },
  {
    id: "vitd",
    emoji: "☀️",
    label: "Vitamine D",
    description: "Exposition solaire ou supplément",
    color: "bg-yellow-100 dark:bg-yellow-900/30 border-yellow-300 text-yellow-700 dark:text-yellow-300",
  },
  {
    id: "protein",
    emoji: "🥩",
    label: "Protéines",
    description: "70-100g/j / Viande, œufs, légumineuses",
    color: "bg-orange-100 dark:bg-orange-900/30 border-orange-300 text-orange-700 dark:text-orange-300",
  },
  {
    id: "calcium",
    emoji: "🥛",
    label: "Calcium",
    description: "3-4 portions laitières/j",
    color: "bg-blue-100 dark:bg-blue-900/30 border-blue-300 text-blue-700 dark:text-blue-300",
  },
  {
    id: "omega3",
    emoji: "🐟",
    label: "Oméga-3",
    description: "Poisson gras 2x/sem ou noix/lin",
    color: "bg-cyan-100 dark:bg-cyan-900/30 border-cyan-300 text-cyan-700 dark:text-cyan-300",
  },
  {
    id: "fiber",
    emoji: "🌾",
    label: "Fibres",
    description: "Légumes, fruits, céréales complètes",
    color: "bg-amber-100 dark:bg-amber-900/30 border-amber-300 text-amber-700 dark:text-amber-300",
  },
];

function getStorageKey(date: string) {
  return `nutrition-${date}`;
}

function getScoreMessage(score: number, total: number): { text: string; emoji: string } {
  const ratio = score / total;
  if (ratio === 1) return { text: "Parfait ! Bébé est comblé 💗", emoji: "🌟" };
  if (ratio >= 0.8) return { text: "Excellent ! Continuez comme ça", emoji: "✨" };
  if (ratio >= 0.5) return { text: "Bien ! Encore un petit effort", emoji: "👍" };
  if (ratio >= 0.3) return { text: "Bon début, vous pouvez faire mieux", emoji: "💪" };
  return { text: "Pensez à varier votre alimentation", emoji: "🌱" };
}

export default function NutritionTab() {
  const today = format(new Date(), "yyyy-MM-dd");
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const key = getStorageKey(today);
      const saved = localStorage.getItem(key);
      if (saved) {
        try {
          setChecked(JSON.parse(saved));
        } catch {
          setChecked({});
        }
      }
      setLoaded(true);
    }
  }, [today]);

  const toggleItem = (id: string) => {
    const newChecked = { ...checked, [id]: !checked[id] };
    setChecked(newChecked);
    if (typeof window !== "undefined") {
      localStorage.setItem(getStorageKey(today), JSON.stringify(newChecked));
    }
  };

  const score = NUTRIENTS.filter((n) => checked[n.id]).length;
  const total = NUTRIENTS.length;
  const scoreMsg = getScoreMessage(score, total);

  if (!loaded) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Header */}
      <div className="text-center">
        <p className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-1">Aujourd'hui</p>
        <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Cochez ce que vous avez consommé</p>
      </div>

      {/* Score card */}
      <motion.div
        key={score}
        initial={{ scale: 0.97 }}
        animate={{ scale: 1 }}
        className="bg-gradient-to-r from-pink-400 to-rose-500 rounded-2xl p-4 text-white text-center"
      >
        <p className="text-3xl font-bold mb-1">
          {score}/{total} {scoreMsg.emoji}
        </p>
        <p className="text-sm font-medium text-pink-100">{scoreMsg.text}</p>
        {/* Progress bar */}
        <div className="mt-3 bg-white/30 rounded-full h-2 overflow-hidden">
          <motion.div
            className="h-full bg-white rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${(score / total) * 100}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
      </motion.div>

      {/* Checklist */}
      <div className="space-y-2">
        {NUTRIENTS.map((nutrient) => {
          const isChecked = !!checked[nutrient.id];
          return (
            <motion.button
              key={nutrient.id}
              onClick={() => toggleItem(nutrient.id)}
              whileTap={{ scale: 0.98 }}
              className={`w-full flex items-center gap-3 p-3 rounded-2xl border-2 transition-all text-left ${
                isChecked
                  ? nutrient.color
                  : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-pink-200 dark:border-pink-800/30"
              }`}
            >
              {/* Emoji */}
              <span className="text-2xl flex-shrink-0">{nutrient.emoji}</span>

              {/* Text */}
              <div className="flex-1 min-w-0">
                <p
                  className={`text-sm font-semibold ${
                    isChecked ? "" : "text-gray-800 dark:text-gray-200"
                  }`}
                >
                  {nutrient.label}
                </p>
                <p
                  className={`text-xs truncate ${
                    isChecked ? "opacity-75" : "text-gray-400 dark:text-gray-500"
                  }`}
                >
                  {nutrient.description}
                </p>
              </div>

              {/* Checkbox */}
              <div
                className={`w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center border-2 transition-all ${
                  isChecked
                    ? "bg-white dark:bg-gray-900 border-current"
                    : "bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600"
                }`}
              >
                {isChecked && (
                  <motion.svg
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-3.5 h-3.5 text-current"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={3}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </motion.svg>
                )}
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Daily tip */}
      <div className="bg-amber-50 dark:bg-amber-950/30 rounded-2xl border border-amber-100 dark:border-amber-900/30 p-3">
        <p className="text-xs text-amber-700 dark:text-amber-400">
          💡 <strong>Rappel :</strong> Ces besoins sont en plus d'une alimentation équilibrée variée. En cas de doute, parlez-en à votre sage-femme ou médecin.
        </p>
      </div>
    </motion.div>
  );
}
