"use client";

import { useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { pregnancyData, type WeekData } from "@/lib/pregnancy-data";
import { Ruler, ChevronRight } from "lucide-react";

interface SizeComparisonProps {
  currentWeek: number;
  weekData: WeekData;
}

/* ------------------------------------------------------------------ */
/*  Main visual card: big emoji + real size + comparison label         */
/* ------------------------------------------------------------------ */
function SizeCard({ weekData }: { weekData: WeekData }) {
  const sizeCm =
    weekData.sizeMm >= 10
      ? `${(weekData.sizeMm / 10).toFixed(1)} cm`
      : `${weekData.sizeMm} mm`;

  return (
    <div className="relative bg-gradient-to-br from-pink-50 via-purple-50 to-green-50 rounded-3xl border border-pink-100 shadow-sm p-6 overflow-hidden">
      {/* Decorative blurred blobs */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-pink-200/30 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -bottom-8 -left-8 w-28 h-28 bg-purple-200/30 rounded-full blur-2xl pointer-events-none" />

      <p className="text-xs font-semibold text-purple-400 uppercase tracking-wider text-center mb-2">
        Taille comparable a
      </p>

      {/* Fruit emoji with entrance animation */}
      <AnimatePresence mode="wait">
        <motion.div
          key={weekData.week}
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          exit={{ scale: 0, rotate: 20 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="flex justify-center"
        >
          <motion.span
            animate={{
              y: [0, -6, 0],
              rotate: [0, 3, -3, 0],
            }}
            transition={{
              repeat: Infinity,
              duration: 3,
              ease: "easeInOut",
            }}
            className="text-8xl select-none inline-block drop-shadow-lg"
          >
            {weekData.fruitEmoji}
          </motion.span>
        </motion.div>
      </AnimatePresence>

      {/* Fruit name */}
      <AnimatePresence mode="wait">
        <motion.h2
          key={`name-${weekData.week}`}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25, delay: 0.1 }}
          className="text-xl font-bold text-[#3d2b2b] text-center mt-3"
        >
          {weekData.fruit}
        </motion.h2>
      </AnimatePresence>

      {/* Size badge */}
      <motion.div
        key={`badge-${weekData.week}`}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="flex justify-center mt-3"
      >
        <span className="inline-flex items-center gap-1.5 bg-white/80 backdrop-blur-sm text-[#3d2b2b] text-sm font-semibold px-4 py-1.5 rounded-full border border-pink-200 shadow-sm">
          <Ruler className="w-4 h-4 text-pink-400" />
          {sizeCm}
        </span>
      </motion.div>

      {/* Fun comparison sub-line */}
      <p className="text-center text-xs text-gray-400 mt-2">
        Environ la taille de {weekData.funComparison} {weekData.funComparisonEmoji}
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Gallery: horizontal scroll from week 4 to current week            */
/* ------------------------------------------------------------------ */
function SizeGallery({ currentWeek }: { currentWeek: number }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Only show from week 4 (when size becomes meaningful) up to the current week
  const startWeek = 4;
  const weeks = pregnancyData.filter(
    (d) => d.week >= startWeek && d.week <= currentWeek
  );

  if (weeks.length <= 1) return null;

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 200, behavior: "smooth" });
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-purple-100 shadow-sm p-4 overflow-hidden">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">📏</span>
          <h3 className="text-sm font-semibold text-[#3d2b2b]">
            Evolution de la taille
          </h3>
        </div>
        {weeks.length > 4 && (
          <button
            onClick={scrollRight}
            className="flex items-center gap-0.5 text-xs text-purple-400 hover:text-purple-600 transition-colors"
          >
            Scroller
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide snap-x snap-mandatory"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {weeks.map((w, i) => {
          const isCurrent = w.week === currentWeek;
          const sizeCm =
            w.sizeMm >= 10
              ? `${(w.sizeMm / 10).toFixed(1)} cm`
              : `${w.sizeMm} mm`;

          // Scale the emoji size relative to its position in the pregnancy
          const progress = (i + 1) / weeks.length;
          const emojiSize = Math.max(1.5, 1.5 + progress * 1.5); // 1.5rem to 3rem

          return (
            <motion.div
              key={w.week}
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: Math.min(i * 0.03, 0.6), duration: 0.3 }}
              className={`snap-center flex-shrink-0 flex flex-col items-center justify-end rounded-2xl p-3 min-w-[80px] transition-all ${
                isCurrent
                  ? "bg-gradient-to-b from-pink-100 to-purple-100 border-2 border-pink-300 shadow-md"
                  : "bg-gradient-to-b from-gray-50 to-purple-50/30 border border-gray-100"
              }`}
            >
              <span
                className="select-none inline-block mb-1"
                style={{ fontSize: `${emojiSize}rem` }}
              >
                {w.fruitEmoji}
              </span>
              <p
                className={`text-[10px] font-medium truncate max-w-[72px] text-center ${
                  isCurrent ? "text-pink-600" : "text-gray-500"
                }`}
              >
                {w.fruit}
              </p>
              <p
                className={`text-[10px] mt-0.5 ${
                  isCurrent ? "text-purple-600 font-bold" : "text-gray-400"
                }`}
              >
                {sizeCm}
              </p>
              <span
                className={`mt-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                  isCurrent
                    ? "bg-pink-400 text-white"
                    : "bg-gray-100 text-gray-500"
                }`}
              >
                S{w.week}
              </span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Export: combines both                                              */
/* ------------------------------------------------------------------ */
export default function SizeComparison({
  currentWeek,
  weekData,
}: SizeComparisonProps) {
  return (
    <div className="space-y-4">
      <SizeCard weekData={weekData} />
      <SizeGallery currentWeek={currentWeek} />
    </div>
  );
}
