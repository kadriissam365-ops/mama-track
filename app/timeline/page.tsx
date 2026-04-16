"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { useStore } from "@/lib/store";
import { getCurrentWeek, getWeekData } from "@/lib/pregnancy-data";
import { ChevronDown, ChevronUp, Baby, Heart, Stethoscope, Star } from "lucide-react";

const TRIMESTER_COLORS = {
  1: { bg: "bg-pink-100 dark:bg-pink-900/30", border: "border-pink-300", text: "text-pink-700 dark:text-pink-300", dot: "bg-pink-400", gradient: "from-pink-200 to-pink-50" },
  2: { bg: "bg-purple-100 dark:bg-purple-900/30", border: "border-purple-300", text: "text-purple-700 dark:text-purple-300", dot: "bg-purple-400", gradient: "from-purple-200 to-purple-50" },
  3: { bg: "bg-indigo-100 dark:bg-indigo-900/30", border: "border-indigo-300", text: "text-indigo-700 dark:text-indigo-300", dot: "bg-indigo-400", gradient: "from-indigo-200 to-indigo-50" },
};

const MILESTONES: Record<number, { icon: string; label: string }> = {
  4: { icon: "💓", label: "Premier battement de cœur" },
  8: { icon: "🫒", label: "Tous les organes sont formés" },
  12: { icon: "🔬", label: "Échographie T1 — dépistage" },
  13: { icon: "🎉", label: "Fin du 1er trimestre !" },
  16: { icon: "🦋", label: "Premiers mouvements possibles" },
  20: { icon: "👀", label: "Bébé ouvre les yeux" },
  22: { icon: "🔬", label: "Échographie T2 — morphologie" },
  24: { icon: "🫁", label: "Poumons commencent à mûrir" },
  27: { icon: "🎉", label: "Fin du 2ème trimestre !" },
  28: { icon: "😴", label: "Bébé dort et rêve" },
  32: { icon: "🔬", label: "Échographie T3" },
  34: { icon: "🧳", label: "Préparer la valise maternité" },
  37: { icon: "✅", label: "Bébé est à terme !" },
  40: { icon: "🎂", label: "Date prévue d'accouchement" },
};

export default function TimelinePage() {
  const { dueDate } = useStore();
  const currentWeek = dueDate ? getCurrentWeek(new Date(dueDate)) : 20;
  const [expandedWeek, setExpandedWeek] = useState<number | null>(currentWeek);
  const currentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (currentRef.current) {
      currentRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, []);

  const weeks = Array.from({ length: 40 }, (_, i) => i + 1);

  return (
    <div className="max-w-lg mx-auto px-4 py-6 space-y-4">
      <div>
        <h1 className="text-xl font-bold text-[#3d2b2b] dark:text-gray-100 flex items-center gap-2">
          📅 Ma grossesse
        </h1>
        <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Semaine par semaine, de la conception à la naissance</p>
      </div>

      {/* Trimester legend */}
      <div className="flex gap-2">
        {([1, 2, 3] as const).map((t) => {
          const colors = TRIMESTER_COLORS[t];
          const range = t === 1 ? "SA 1-13" : t === 2 ? "SA 14-27" : "SA 28-40";
          return (
            <div key={t} className={`flex-1 ${colors.bg} ${colors.border} border rounded-2xl px-3 py-2 text-center`}>
              <p className={`text-xs font-semibold ${colors.text}`}>
                {t === 1 ? "1er" : t === 2 ? "2ème" : "3ème"} trimestre
              </p>
              <p className="text-[10px] text-gray-400 dark:text-gray-500">{range}</p>
            </div>
          );
        })}
      </div>

      {/* Progress bar */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-sm border border-pink-100 dark:border-pink-900/30">
        <div className="flex justify-between text-xs text-gray-400 dark:text-gray-500 mb-2">
          <span>Semaine {currentWeek}/40</span>
          <span>{Math.round((currentWeek / 40) * 100)}%</span>
        </div>
        <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-3 overflow-hidden">
          <motion.div
            className="h-3 rounded-full bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400"
            initial={{ width: 0 }}
            animate={{ width: `${(currentWeek / 40) * 100}%` }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          />
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-[10px] text-pink-400">T1</span>
          <span className="text-[10px] text-purple-400">T2</span>
          <span className="text-[10px] text-indigo-400">T3</span>
        </div>
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gradient-to-b from-pink-200 via-purple-200 to-indigo-200" />

        <div className="space-y-1">
          {weeks.map((week) => {
            const weekData = getWeekData(week);
            const colors = TRIMESTER_COLORS[weekData.trimester];
            const milestone = MILESTONES[week];
            const isCurrent = week === currentWeek;
            const isPast = week < currentWeek;
            const isExpanded = expandedWeek === week;

            return (
              <div key={week} ref={isCurrent ? currentRef : undefined}>
                {/* Trimester header */}
                {(week === 1 || week === 14 || week === 28) && (
                  <div className={`ml-10 mb-2 mt-4 first:mt-0`}>
                    <span className={`text-xs font-bold ${colors.text} ${colors.bg} px-3 py-1 rounded-full`}>
                      {week === 1 ? "1er trimestre" : week === 14 ? "2ème trimestre" : "3ème trimestre"}
                    </span>
                  </div>
                )}

                <button
                  onClick={() => setExpandedWeek(isExpanded ? null : week)}
                  className="w-full flex items-start gap-3 text-left group"
                >
                  {/* Dot */}
                  <div className="relative z-10 flex-shrink-0 mt-1">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                        isCurrent
                          ? `${colors.dot} border-white shadow-lg ring-2 ring-pink-300`
                          : isPast
                          ? `${colors.bg} ${colors.border}`
                          : "bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                      }`}
                    >
                      {milestone ? (
                        <span className="text-sm">{milestone.icon}</span>
                      ) : (
                        <span className={`text-xs font-bold ${isCurrent ? "text-white" : isPast ? colors.text : "text-gray-300 dark:text-gray-500"}`}>
                          {week}
                        </span>
                      )}
                    </div>
                    {isCurrent && (
                      <motion.div
                        className="absolute -inset-1 rounded-full border-2 border-pink-300"
                        animate={{ scale: [1, 1.2, 1], opacity: [1, 0.5, 1] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                      />
                    )}
                  </div>

                  {/* Content */}
                  <div className={`flex-1 rounded-2xl p-3 transition-all ${
                    isCurrent
                      ? `bg-gradient-to-r ${colors.gradient} border-2 ${colors.border} shadow-sm`
                      : isExpanded
                      ? "bg-white dark:bg-gray-900 border border-pink-100 dark:border-pink-900/30 shadow-sm"
                      : isPast
                      ? "bg-white/60 dark:bg-gray-800/60"
                      : "bg-gray-50 dark:bg-gray-800/50"
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{weekData.fruitEmoji}</span>
                        <div>
                          <p className={`text-sm font-semibold ${isCurrent ? colors.text : isPast ? "text-[#3d2b2b] dark:text-gray-100" : "text-gray-400 dark:text-gray-500"}`}>
                            Semaine {week}
                            {isCurrent && <span className="ml-2 text-xs bg-pink-400 text-white px-2 py-0.5 rounded-full">Vous êtes ici</span>}
                          </p>
                          <p className={`text-xs ${isPast || isCurrent ? "text-gray-500 dark:text-gray-400 dark:text-gray-500" : "text-gray-300 dark:text-gray-500"}`}>
                            {weekData.fruit} · {weekData.sizeMm >= 100 ? `${(weekData.sizeMm / 10).toFixed(0)} cm` : `${weekData.sizeMm} mm`} · {weekData.weightG >= 1000 ? `${(weekData.weightG / 1000).toFixed(1)} kg` : `${weekData.weightG} g`}
                          </p>
                        </div>
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-gray-300 dark:text-gray-500" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-gray-300 dark:text-gray-500" />
                      )}
                    </div>

                    {/* Milestone badge */}
                    {milestone && !isExpanded && (
                      <div className={`mt-1.5 flex items-center gap-1 text-xs ${colors.text}`}>
                        <Star className="w-3 h-3" />
                        {milestone.label}
                      </div>
                    )}

                    {/* Expanded content */}
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        className="mt-3 space-y-3"
                      >
                        {milestone && (
                          <div className={`${colors.bg} rounded-xl p-2.5 flex items-center gap-2`}>
                            <Star className={`w-4 h-4 ${colors.text}`} />
                            <span className={`text-xs font-semibold ${colors.text}`}>{milestone.label}</span>
                          </div>
                        )}

                        <div className="flex items-start gap-2">
                          <Baby className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-xs font-semibold text-[#3d2b2b] dark:text-gray-100 mb-0.5">Développement bébé</p>
                            <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">{weekData.babyDevelopment}</p>
                          </div>
                        </div>

                        <div className="flex items-start gap-2">
                          <Heart className="w-4 h-4 text-pink-400 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-xs font-semibold text-[#3d2b2b] dark:text-gray-100 mb-0.5">Conseil maman</p>
                            <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">{weekData.momTips}</p>
                          </div>
                        </div>

                        {weekData.weeklySymptoms && weekData.weeklySymptoms.length > 0 && (
                          <div className="flex items-start gap-2">
                            <Stethoscope className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="text-xs font-semibold text-[#3d2b2b] dark:text-gray-100 mb-1">Symptômes fréquents</p>
                              <div className="flex flex-wrap gap-1">
                                {weekData.weeklySymptoms.map((s, i) => (
                                  <span key={i} className="text-[10px] bg-green-50 dark:bg-green-950/30 text-green-600 px-2 py-0.5 rounded-full">
                                    {s}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}

                        {weekData.testimonials && weekData.testimonials.length > 0 && (
                          <div className="bg-pink-50 dark:bg-pink-950/30 rounded-xl p-3">
                            <p className="text-[10px] font-semibold text-pink-500 mb-1">Témoignages</p>
                            {weekData.testimonials.map((t, i) => (
                              <p key={i} className="text-xs text-gray-600 dark:text-gray-300 italic mb-1 last:mb-0">&quot;{t}&quot;</p>
                            ))}
                          </div>
                        )}
                      </motion.div>
                    )}
                  </div>
                </button>
              </div>
            );
          })}

          {/* Birth! */}
          <div className="flex items-start gap-3">
            <div className="relative z-10 flex-shrink-0 mt-1">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-400 to-purple-400 flex items-center justify-center border-2 border-white shadow-lg">
                <span className="text-lg">👶</span>
              </div>
            </div>
            <div className="bg-gradient-to-r from-pink-100 to-purple-100 rounded-2xl p-4 flex-1 border border-pink-200 dark:border-pink-800/30">
              <h3 className="text-sm font-bold text-[#3d2b2b] dark:text-gray-100">Naissance ! 🎉</h3>
              <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">Bienvenue au monde, bébé ! Le plus beau voyage commence maintenant.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
