"use client";

import { useRef, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { pregnancyData, type WeekData } from "@/lib/pregnancy-data";
import { Ruler, ChevronRight, RotateCw } from "lucide-react";

interface SizeComparisonProps {
  currentWeek: number;
  weekData: WeekData;
}

/* ------------------------------------------------------------------ */
/*  Helper: format size and weight                                     */
/* ------------------------------------------------------------------ */
function formatSize(mm: number): string {
  if (mm >= 10) return `${(mm / 10).toFixed(1)} cm`;
  return `${mm} mm`;
}

function formatWeight(g: number): string {
  if (g >= 1000) return `${(g / 1000).toFixed(2)} kg`;
  return `${g} g`;
}

/** Fun weight equivalences */
function weightEquivalent(g: number): { count: number; label: string; emoji: string } {
  if (g <= 0) return { count: 0, label: "presque rien", emoji: "✨" };
  if (g < 5) return { count: Math.max(1, Math.round(g / 1)), label: "grain(s) de riz", emoji: "🍚" };
  if (g < 30) return { count: Math.round(g / 4), label: "sucre(s) en morceaux", emoji: "🧊" };
  if (g < 100) return { count: Math.round(g / 10), label: "fraise(s)", emoji: "🍓" };
  if (g < 300) return { count: Math.round(g / 50), label: "oeuf(s)", emoji: "🥚" };
  if (g < 800) return { count: Math.round(g / 100), label: "pomme(s)", emoji: "🍎" };
  if (g < 1500) return { count: Math.round(g / 250), label: "paquet(s) de beurre", emoji: "🧈" };
  if (g < 3000) return { count: Math.round(g / 500), label: "bouteille(s) d'eau", emoji: "💧" };
  return { count: Math.round(g / 1000), label: "melon(s)", emoji: "🍈" };
}

/* ------------------------------------------------------------------ */
/*  Animated ruler / progress bar showing actual size                   */
/* ------------------------------------------------------------------ */
function SizeRuler({ sizeMm, week }: { sizeMm: number; week: number }) {
  const maxMm = 520;
  const pct = Math.min((sizeMm / maxMm) * 100, 100);

  // Ruler tick marks
  const ticks = useMemo(() => {
    const count = 20;
    return Array.from({ length: count + 1 }, (_, i) => ({
      pos: (i / count) * 100,
      isMajor: i % 5 === 0,
      label: i % 5 === 0 ? `${Math.round((i / count) * 52)}` : "",
    }));
  }, []);

  return (
    <div className="relative px-1">
      {/* Ruler ticks */}
      <div className="relative h-6 mb-1">
        {ticks.map((t, i) => (
          <div
            key={i}
            className="absolute bottom-0 flex flex-col items-center"
            style={{ left: `${t.pos}%`, transform: "translateX(-50%)" }}
          >
            {t.isMajor && t.label && (
              <span className="text-[9px] text-gray-400 mb-0.5">{t.label}</span>
            )}
            <div
              className={`w-px ${t.isMajor ? "h-2.5 bg-gray-400" : "h-1.5 bg-gray-300"}`}
            />
          </div>
        ))}
      </div>

      {/* Track */}
      <div className="relative h-3 bg-gray-100 rounded-full overflow-hidden border border-gray-200">
        <motion.div
          key={`ruler-${week}`}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
          className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-pink-400 via-purple-400 to-pink-300"
        />
        {/* Glow dot at end */}
        <motion.div
          key={`dot-${week}`}
          initial={{ left: "0%" }}
          animate={{ left: `${pct}%` }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-white border-2 border-pink-400 shadow-md shadow-pink-200"
        />
      </div>

      {/* Labels */}
      <div className="flex justify-between mt-1.5">
        <span className="text-[10px] text-gray-400">0 cm</span>
        <motion.span
          key={`label-${week}`}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="text-[11px] font-bold text-pink-500"
        >
          {formatSize(sizeMm)}
        </motion.span>
        <span className="text-[10px] text-gray-400">52 cm</span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Weight fun visualization                                           */
/* ------------------------------------------------------------------ */
function WeightViz({ weightG, week }: { weightG: number; week: number }) {
  const equiv = weightEquivalent(weightG);

  // Show up to 10 emoji icons representing the count
  const displayCount = Math.min(equiv.count, 10);
  const hasMore = equiv.count > 10;

  return (
    <motion.div
      key={`wv-${week}`}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-3 border border-purple-100"
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="text-sm">⚖️</span>
        <span className="text-xs font-semibold text-purple-600">
          {formatWeight(weightG)}
        </span>
        {weightG > 0 && (
          <span className="text-[10px] text-gray-400 ml-auto">
            soit environ {equiv.count} {equiv.label}
          </span>
        )}
      </div>
      {weightG > 0 && (
        <div className="flex items-center gap-0.5 flex-wrap">
          {Array.from({ length: displayCount }, (_, i) => (
            <motion.span
              key={i}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.4 + i * 0.06, type: "spring", stiffness: 300 }}
              className="text-lg"
            >
              {equiv.emoji}
            </motion.span>
          ))}
          {hasMore && (
            <span className="text-xs text-gray-400 ml-1">+{equiv.count - 10}</span>
          )}
        </div>
      )}
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Mini sparkline: growth chart from week 1 to current                */
/* ------------------------------------------------------------------ */
function GrowthSparkline({ currentWeek }: { currentWeek: number }) {
  const data = useMemo(
    () => pregnancyData.filter((d) => d.week <= currentWeek && d.week >= 1),
    [currentWeek]
  );

  if (data.length < 2) return null;

  const maxSize = Math.max(...data.map((d) => d.sizeMm), 1);
  const width = 280;
  const height = 50;
  const padding = 4;

  const points = data.map((d, i) => {
    const x = padding + (i / (data.length - 1)) * (width - padding * 2);
    const y = height - padding - (d.sizeMm / maxSize) * (height - padding * 2);
    return { x, y, week: d.week };
  });

  const pathD = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
    .join(" ");

  // Area fill path
  const areaD =
    pathD +
    ` L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`;

  const lastPt = points[points.length - 1];

  return (
    <div className="bg-white rounded-2xl border border-pink-100 p-3">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-sm">📈</span>
        <span className="text-xs font-semibold text-[#3d2b2b]">Courbe de croissance</span>
      </div>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-12"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="sparkGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#f472b6" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#f472b6" stopOpacity="0.02" />
          </linearGradient>
        </defs>
        {/* Area fill */}
        <motion.path
          d={areaD}
          fill="url(#sparkGrad)"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        />
        {/* Line */}
        <motion.path
          d={pathD}
          fill="none"
          stroke="#ec4899"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
        {/* Current week dot */}
        <motion.circle
          cx={lastPt.x}
          cy={lastPt.y}
          r="4"
          fill="#ec4899"
          stroke="white"
          strokeWidth="2"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.8, type: "spring" }}
        />
      </svg>
      <div className="flex justify-between text-[9px] text-gray-400 mt-1">
        <span>S1</span>
        <span>S{currentWeek}</span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Flip card: fruit emoji front, fun fact back                        */
/* ------------------------------------------------------------------ */
function FlipCard({ weekData }: { weekData: WeekData }) {
  const [flipped, setFlipped] = useState(false);

  const sizeCm = formatSize(weekData.sizeMm);

  return (
    <div
      className="relative w-full cursor-pointer select-none"
      style={{ perspective: "1000px", minHeight: "260px" }}
      onClick={() => setFlipped((f) => !f)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && setFlipped((f) => !f)}
      aria-label="Tap to flip card"
    >
      <motion.div
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.5, type: "spring", stiffness: 200, damping: 25 }}
        style={{ transformStyle: "preserve-3d" }}
        className="relative w-full h-full"
      >
        {/* Front face */}
        <div
          className="absolute inset-0 bg-gradient-to-br from-pink-50 via-purple-50 to-green-50 rounded-3xl border border-pink-100 shadow-sm p-6 overflow-hidden flex flex-col items-center justify-center"
          style={{ backfaceVisibility: "hidden" }}
        >
          {/* Decorative blurred blobs */}
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-pink-200/30 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-8 -left-8 w-28 h-28 bg-purple-200/30 rounded-full blur-2xl pointer-events-none" />

          <p className="text-xs font-semibold text-purple-400 uppercase tracking-wider text-center mb-2 z-10">
            Taille comparable a
          </p>

          {/* Fruit emoji with bounce */}
          <AnimatePresence mode="wait">
            <motion.div
              key={weekData.week}
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 20 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              className="flex justify-center z-10"
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
              className="text-xl font-bold text-[#3d2b2b] text-center mt-3 z-10"
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
            className="flex justify-center mt-3 z-10"
          >
            <span className="inline-flex items-center gap-1.5 bg-white/80 backdrop-blur-sm text-[#3d2b2b] text-sm font-semibold px-4 py-1.5 rounded-full border border-pink-200 shadow-sm">
              <Ruler className="w-4 h-4 text-pink-400" />
              {sizeCm}
            </span>
          </motion.div>

          {/* Tap hint */}
          <div className="flex items-center gap-1 mt-3 z-10">
            <RotateCw className="w-3 h-3 text-gray-300" />
            <span className="text-[10px] text-gray-300">Toucher pour retourner</span>
          </div>
        </div>

        {/* Back face */}
        <div
          className="absolute inset-0 bg-gradient-to-br from-purple-50 via-pink-50 to-green-50 rounded-3xl border border-purple-200 shadow-sm p-6 overflow-hidden flex flex-col items-center justify-center"
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
        >
          <div className="absolute -top-10 -left-10 w-32 h-32 bg-purple-200/30 rounded-full blur-2xl pointer-events-none" />

          <span className="text-4xl mb-3">{weekData.funComparisonEmoji}</span>
          <p className="text-xs font-semibold text-purple-400 uppercase tracking-wider mb-2">
            Le saviez-vous ?
          </p>
          <p className="text-center text-sm text-[#3d2b2b] leading-relaxed max-w-[240px]">
            Votre bebe fait environ la taille de{" "}
            <span className="font-bold text-pink-500">{weekData.funComparison}</span>{" "}
            {weekData.funComparisonEmoji}
          </p>
          <div className="mt-3 text-center">
            <span className="text-xs text-gray-500">
              {weekData.sizeMm > 0 ? `${sizeCm} — ${formatWeight(weekData.weightG)}` : "Tout petit !"}
            </span>
          </div>
          <p className="text-sm text-gray-600 mt-3 text-center leading-relaxed max-w-[260px] line-clamp-3">
            {weekData.babyDevelopment}
          </p>

          <div className="flex items-center gap-1 mt-3">
            <RotateCw className="w-3 h-3 text-gray-300" />
            <span className="text-[10px] text-gray-300">Toucher pour retourner</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Side-by-side comparison: baby vs fruit with animated scaling        */
/* ------------------------------------------------------------------ */
function SideBySide({ weekData }: { weekData: WeekData }) {
  // Scale emoji based on size (min 2rem, max 5rem)
  const maxMm = 520;
  const progress = Math.min(weekData.sizeMm / maxMm, 1);
  const babySize = 2 + progress * 3; // 2rem to 5rem
  const fruitSize = 2 + progress * 3;

  return (
    <motion.div
      key={`sbs-${weekData.week}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="bg-white rounded-2xl border border-pink-100 p-4"
    >
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider text-center mb-3">
        Comparaison de taille
      </p>
      <div className="flex items-end justify-center gap-8">
        {/* Baby side */}
        <div className="flex flex-col items-center">
          <motion.span
            key={`baby-${weekData.week}`}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
            style={{ fontSize: `${babySize}rem` }}
            className="select-none inline-block"
          >
            👶
          </motion.span>
          <span className="text-[10px] font-medium text-gray-500 mt-1">Bebe</span>
          <span className="text-[10px] text-pink-500 font-bold">{formatSize(weekData.sizeMm)}</span>
        </div>

        {/* VS divider */}
        <div className="flex flex-col items-center pb-4">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.4, type: "spring" }}
            className="w-8 h-8 rounded-full bg-gradient-to-r from-pink-100 to-purple-100 flex items-center justify-center border border-pink-200"
          >
            <span className="text-xs font-bold text-purple-500">VS</span>
          </motion.div>
        </div>

        {/* Fruit side */}
        <div className="flex flex-col items-center">
          <motion.span
            key={`fruit-${weekData.week}`}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.3 }}
            style={{ fontSize: `${fruitSize}rem` }}
            className="select-none inline-block"
          >
            {weekData.fruitEmoji}
          </motion.span>
          <span className="text-[10px] font-medium text-gray-500 mt-1">{weekData.fruit}</span>
          <span className="text-[10px] text-purple-500 font-bold">{formatSize(weekData.sizeMm)}</span>
        </div>
      </div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Gallery: horizontal scroll from week 4 to current week            */
/* ------------------------------------------------------------------ */
function SizeGallery({ currentWeek }: { currentWeek: number }) {
  const scrollRef = useRef<HTMLDivElement>(null);

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
        className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {weeks.map((w, i) => {
          const isCurrent = w.week === currentWeek;
          const sizeCm = formatSize(w.sizeMm);

          const progress = (i + 1) / weeks.length;
          const emojiSize = Math.max(1.5, 1.5 + progress * 1.5);

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
/*  Export: combines all sections with slide transitions                */
/* ------------------------------------------------------------------ */
export default function SizeComparison({
  currentWeek,
  weekData,
}: SizeComparisonProps) {
  return (
    <div className="space-y-4">
      {/* Main flip card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`flip-${weekData.week}`}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -40 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
        >
          <FlipCard weekData={weekData} />
        </motion.div>
      </AnimatePresence>

      {/* Side-by-side comparison */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`sbs-wrap-${weekData.week}`}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -40 }}
          transition={{ duration: 0.35, ease: "easeOut", delay: 0.05 }}
        >
          <SideBySide weekData={weekData} />
        </motion.div>
      </AnimatePresence>

      {/* Visual ruler */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`ruler-wrap-${weekData.week}`}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="bg-white rounded-2xl border border-pink-100 p-4"
        >
          <div className="flex items-center gap-2 mb-3">
            <Ruler className="w-4 h-4 text-pink-400" />
            <span className="text-xs font-semibold text-[#3d2b2b]">Taille reelle</span>
          </div>
          <SizeRuler sizeMm={weekData.sizeMm} week={weekData.week} />
        </motion.div>
      </AnimatePresence>

      {/* Weight visualization */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`weight-wrap-${weekData.week}`}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.3, delay: 0.15 }}
        >
          <WeightViz weightG={weekData.weightG} week={weekData.week} />
        </motion.div>
      </AnimatePresence>

      {/* Growth sparkline */}
      <GrowthSparkline currentWeek={currentWeek} />

      {/* Size gallery */}
      <SizeGallery currentWeek={currentWeek} />
    </div>
  );
}
