"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { pregnancyData, type WeekData } from "@/lib/pregnancy-data";

interface WeeklyTimelineProps {
  currentWeek: number;
  onWeekSelect?: (week: number) => void;
}

/* ------------------------------------------------------------------ */
/*  Tooltip preview for a single week                                  */
/* ------------------------------------------------------------------ */
function WeekTooltip({ weekData, onClose }: { weekData: WeekData; onClose: () => void }) {
  const sizeCm =
    weekData.sizeMm >= 10
      ? `${(weekData.sizeMm / 10).toFixed(1)} cm`
      : `${weekData.sizeMm} mm`;

  const weightDisplay =
    weekData.weightG >= 1000
      ? `${(weekData.weightG / 1000).toFixed(2)} kg`
      : `${weekData.weightG} g`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.9 }}
      transition={{ duration: 0.2, type: "spring", stiffness: 300, damping: 25 }}
      className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 pointer-events-none"
    >
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-pink-100 dark:border-pink-900/30 p-3 min-w-[160px] text-center">
        {/* Arrow */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full w-0 h-0 border-l-[6px] border-r-[6px] border-t-[6px] border-l-transparent border-r-transparent border-t-white" />

        <span className="text-3xl block mb-1">{weekData.fruitEmoji}</span>
        <p className="text-xs font-bold text-[#3d2b2b] dark:text-gray-100">Semaine {weekData.week}</p>
        <p className="text-[10px] text-pink-500 font-medium">{weekData.fruit}</p>
        <div className="flex items-center justify-center gap-2 mt-1.5">
          <span className="text-[10px] text-gray-500 dark:text-gray-400">{sizeCm}</span>
          {weekData.weightG > 0 && (
            <>
              <span className="text-[10px] text-gray-300 dark:text-gray-500">|</span>
              <span className="text-[10px] text-gray-500 dark:text-gray-400">{weightDisplay}</span>
            </>
          )}
        </div>
        {weekData.weeklyMilestone && (
          <p className="text-[10px] text-purple-500 mt-1 leading-tight">
            {weekData.weeklyMilestone}
          </p>
        )}
      </div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Individual week node                                               */
/* ------------------------------------------------------------------ */
function WeekNode({
  weekData,
  isCurrent,
  isPast,
  isHovered,
  onHover,
  onSelect,
}: {
  weekData: WeekData;
  isCurrent: boolean;
  isPast: boolean;
  isHovered: boolean;
  onHover: (week: number | null) => void;
  onSelect: (week: number) => void;
}) {
  const trimesterBg =
    weekData.trimester === 1
      ? "from-pink-100 to-pink-200 dark:from-pink-900/50 dark:to-pink-900/30"
      : weekData.trimester === 2
      ? "from-purple-100 to-purple-200 dark:from-purple-900/50 dark:to-purple-900/30"
      : "from-green-100 to-green-200 dark:from-green-900/50 dark:to-green-900/30";

  const trimesterBorder =
    weekData.trimester === 1
      ? "border-pink-200 dark:border-pink-800/30"
      : weekData.trimester === 2
      ? "border-purple-200 dark:border-purple-800/30"
      : "border-green-200 dark:border-green-800/30";

  const trimesterText =
    weekData.trimester === 1
      ? "text-pink-600 dark:text-pink-400"
      : weekData.trimester === 2
      ? "text-purple-600 dark:text-purple-400"
      : "text-green-600 dark:text-green-400";

  return (
    <div
      className="relative flex-shrink-0 snap-center"
      onMouseEnter={() => onHover(weekData.week)}
      onMouseLeave={() => onHover(null)}
      onTouchStart={() => onHover(weekData.week)}
      onTouchEnd={() => {
        // Keep tooltip visible briefly on touch
        setTimeout(() => onHover(null), 2000);
      }}
    >
      {/* Tooltip */}
      <AnimatePresence>
        {isHovered && <WeekTooltip weekData={weekData} onClose={() => onHover(null)} />}
      </AnimatePresence>

      <button
        onClick={() => onSelect(weekData.week)}
        className={`relative flex flex-col items-center gap-1 p-2 rounded-2xl transition-all duration-200 min-w-[56px] ${
          isCurrent
            ? `bg-gradient-to-b ${trimesterBg} border-2 border-pink-400 shadow-md shadow-pink-200/50`
            : isPast
            ? `bg-gradient-to-b ${trimesterBg}/50 border ${trimesterBorder} opacity-80`
            : `bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 opacity-50`
        }`}
        aria-label={`Semaine ${weekData.week}: ${weekData.fruit}`}
      >
        {/* Current week pulse */}
        {isCurrent && (
          <motion.div
            className="absolute inset-0 rounded-2xl border-2 border-pink-400"
            animate={{ scale: [1, 1.08, 1], opacity: [0.6, 0, 0.6] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          />
        )}

        {/* Emoji */}
        <motion.span
          className={`text-xl select-none ${isCurrent ? "" : isPast ? "" : "grayscale"}`}
          animate={isCurrent ? { scale: [1, 1.1, 1] } : {}}
          transition={isCurrent ? { repeat: Infinity, duration: 2 } : {}}
        >
          {weekData.fruitEmoji}
        </motion.span>

        {/* Week number */}
        <span
          className={`text-[10px] font-bold ${
            isCurrent ? "text-pink-600" : isPast ? trimesterText : "text-gray-400 dark:text-gray-500"
          }`}
        >
          S{weekData.week}
        </span>
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main timeline component                                            */
/* ------------------------------------------------------------------ */
export default function WeeklyTimeline({
  currentWeek,
  onWeekSelect,
}: WeeklyTimelineProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [hoveredWeek, setHoveredWeek] = useState<number | null>(null);

  // Auto-scroll to center on the current week on mount
  useEffect(() => {
    if (!scrollRef.current) return;
    const container = scrollRef.current;
    const currentEl = container.querySelector(`[data-week="${currentWeek}"]`);
    if (currentEl) {
      const elRect = currentEl.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();
      const scrollLeft =
        currentEl.parentElement!.offsetLeft -
        containerRect.width / 2 +
        elRect.width / 2;
      container.scrollTo({ left: scrollLeft, behavior: "smooth" });
    }
  }, [currentWeek]);

  const handleSelect = useCallback(
    (week: number) => {
      onWeekSelect?.(week);
    },
    [onWeekSelect]
  );

  const handleHover = useCallback((week: number | null) => {
    setHoveredWeek(week);
  }, []);

  // Trimester markers
  const trimesterStarts = [
    { week: 1, label: "T1", color: "bg-pink-400" },
    { week: 14, label: "T2", color: "bg-purple-400" },
    { week: 28, label: "T3", color: "bg-green-400" },
  ];

  return (
    <div className="bg-white dark:bg-gray-900 rounded-3xl border border-pink-100 dark:border-pink-900/30 shadow-sm p-4 overflow-hidden">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">🗓️</span>
          <h3 className="text-sm font-semibold text-[#3d2b2b] dark:text-gray-100">
            Timeline de grossesse
          </h3>
        </div>
        <div className="flex items-center gap-2">
          {trimesterStarts.map((t) => (
            <span key={t.label} className="flex items-center gap-1">
              <span className={`w-2 h-2 rounded-full ${t.color}`} />
              <span className="text-[10px] text-gray-400 dark:text-gray-500">{t.label}</span>
            </span>
          ))}
        </div>
      </div>

      {/* Progress bar */}
      <div className="relative h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full mb-3 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${(currentWeek / 42) * 100}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-pink-400 via-purple-400 to-green-400"
        />
      </div>

      {/* Scrollable timeline */}
      <div
        ref={scrollRef}
        className="flex gap-2 overflow-x-auto pb-2 snap-x snap-mandatory"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {pregnancyData.map((w) => (
          <div key={w.week} data-week={w.week}>
            <WeekNode
              weekData={w}
              isCurrent={w.week === currentWeek}
              isPast={w.week <= currentWeek}
              isHovered={hoveredWeek === w.week}
              onHover={handleHover}
              onSelect={handleSelect}
            />
          </div>
        ))}
      </div>

      {/* Current week label */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center justify-center mt-3 gap-2"
      >
        <span className="text-[10px] text-gray-400 dark:text-gray-500">Vous etes a la</span>
        <span className="text-xs font-bold text-pink-500 bg-pink-50 dark:bg-pink-950/30 px-2 py-0.5 rounded-full">
          semaine {currentWeek}/42
        </span>
      </motion.div>
    </div>
  );
}
