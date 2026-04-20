"use client";

import { useRef, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { pregnancyData, type WeekData } from "@/lib/pregnancy-data";
import { Ruler, ChevronRight, RotateCw, ChevronDown } from "lucide-react";

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

/** Pluralize a French noun: singular if count <= 1, else plural */
function pluralize(count: number, singular: string, plural: string): string {
  return count <= 1 ? singular : plural;
}

/** Contract "de" before a vowel/h: "de une" -> "d'une", "de un" -> "d'un" */
function deContraction(word: string): string {
  if (/^[aeéèêiîoôuûhAEÉÈÊIÎOÔUÛH]/.test(word)) {
    return `d'${word}`;
  }
  return `de ${word}`;
}

/** Fun weight equivalences */
function weightEquivalent(g: number): { count: number; label: string; emoji: string } {
  if (g <= 0) return { count: 0, label: "presque rien", emoji: "✨" };
  if (g < 5) { const c = Math.max(1, Math.round(g / 1)); return { count: c, label: pluralize(c, "grain de riz", "grains de riz"), emoji: "🍚" }; }
  if (g < 30) { const c = Math.round(g / 4); return { count: c, label: pluralize(c, "sucre en morceaux", "sucres en morceaux"), emoji: "🧊" }; }
  if (g < 100) { const c = Math.round(g / 10); return { count: c, label: pluralize(c, "fraise", "fraises"), emoji: "🍓" }; }
  if (g < 300) { const c = Math.round(g / 50); return { count: c, label: pluralize(c, "œuf", "œufs"), emoji: "🥚" }; }
  if (g < 800) { const c = Math.round(g / 100); return { count: c, label: pluralize(c, "pomme", "pommes"), emoji: "🍎" }; }
  if (g < 1500) { const c = Math.round(g / 250); return { count: c, label: pluralize(c, "paquet de beurre", "paquets de beurre"), emoji: "🧈" }; }
  if (g < 3000) { const c = Math.round(g / 500); return { count: c, label: pluralize(c, "bouteille d'eau", "bouteilles d'eau"), emoji: "💧" }; }
  { const c = Math.round(g / 1000); return { count: c, label: pluralize(c, "melon", "melons"), emoji: "🍈" }; }
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
              <span className="text-[9px] text-gray-400 dark:text-gray-500 mb-0.5">{t.label}</span>
            )}
            <div
              className={`w-px ${t.isMajor ? "h-2.5 bg-gray-400 dark:bg-gray-600" : "h-1.5 bg-gray-300 dark:bg-gray-700"}`}
            />
          </div>
        ))}
      </div>

      {/* Track */}
      <div className="relative h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden border border-gray-200 dark:border-gray-700">
        <motion.div
          key={`ruler-${week}`}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-pink-400 via-purple-400 to-pink-300"
        />
        {/* Glow dot at end */}
        <motion.div
          key={`dot-${week}`}
          initial={{ left: "0%" }}
          animate={{ left: `${pct}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-white dark:bg-gray-900 border-2 border-pink-400 shadow-md shadow-pink-200"
        />
      </div>

      {/* Labels */}
      <div className="flex justify-between mt-1.5">
        <span className="text-[10px] text-gray-400 dark:text-gray-500">0 cm</span>
        <span className="text-[11px] font-bold text-pink-500 dark:text-pink-400">
          {formatSize(sizeMm)}
        </span>
        <span className="text-[10px] text-gray-400 dark:text-gray-500">52 cm</span>
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
    <div
      className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 rounded-2xl p-3 border border-purple-100 dark:border-purple-900/30"
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="text-sm">⚖️</span>
        <span className="text-xs font-semibold text-purple-600 dark:text-purple-400">
          {formatWeight(weightG)}
        </span>
        {weightG > 0 && (
          <span className="text-[10px] text-gray-400 dark:text-gray-500 ml-auto">
            soit environ {equiv.count} {equiv.label}
          </span>
        )}
      </div>
      {weightG > 0 && (
        <div className="flex items-center gap-0.5 flex-wrap">
          {Array.from({ length: displayCount }, (_, i) => (
            <span
              key={i}
              className="text-lg"
            >
              {equiv.emoji}
            </span>
          ))}
          {hasMore && (
            <span className="text-xs text-gray-400 dark:text-gray-500 ml-1">+{equiv.count - 10}</span>
          )}
        </div>
      )}
    </div>
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
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-pink-100 dark:border-pink-900/30 p-3">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-sm">📈</span>
        <span className="text-xs font-semibold text-[#3d2b2b] dark:text-gray-100">Courbe de croissance</span>
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
        <path
          d={areaD}
          fill="url(#sparkGrad)"
        />
        <path
          d={pathD}
          fill="none"
          stroke="#ec4899"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle
          cx={lastPt.x}
          cy={lastPt.y}
          r="4"
          fill="#ec4899"
          stroke="white"
          strokeWidth="2"
        />
      </svg>
      <div className="flex justify-between text-[9px] text-gray-400 dark:text-gray-500 mt-1">
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
  const [expanded, setExpanded] = useState(false);

  const sizeCm = formatSize(weekData.sizeMm);

  const toggle = () => {
    setFlipped((f) => !f);
    setExpanded(false);
  };

  return (
    <div
      className="relative w-full cursor-pointer select-none"
      onClick={toggle}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && toggle()}
      aria-label="Toucher pour retourner"
    >
      <div className="relative">
        <AnimatePresence mode="wait" initial={false}>
          {!flipped ? (
            <motion.div
              key="front"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="relative bg-gradient-to-br from-pink-50 via-purple-50 to-green-50 dark:from-pink-950/30 dark:via-purple-950/30 dark:to-green-950/30 rounded-3xl border border-pink-100 dark:border-pink-900/30 shadow-sm p-6 overflow-hidden flex flex-col items-center justify-center min-h-[300px]"
            >
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-pink-200/30 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute -bottom-8 -left-8 w-28 h-28 bg-purple-200/30 rounded-full blur-2xl pointer-events-none" />

              <p className="text-xs font-semibold text-purple-400 uppercase tracking-wider text-center mb-2 z-10">
                Taille comparable à
              </p>

              <div className="flex justify-center z-10">
                <span className="text-8xl select-none inline-block">
                  {weekData.fruitEmoji}
                </span>
              </div>

              <h2 className="text-xl font-bold text-[#3d2b2b] dark:text-gray-100 text-center mt-3 z-10">
                {weekData.fruit}
              </h2>

              <div className="flex justify-center mt-3 z-10">
                <span className="inline-flex items-center gap-1.5 bg-white/80 dark:bg-gray-900/80 text-[#3d2b2b] dark:text-gray-100 text-sm font-semibold px-4 py-1.5 rounded-full border border-pink-200 dark:border-pink-800/30 shadow-sm">
                  <Ruler className="w-4 h-4 text-pink-400" />
                  {sizeCm}
                </span>
              </div>

              <div className="flex items-center gap-1 mt-3 z-10">
                <RotateCw className="w-3 h-3 text-gray-300 dark:text-gray-500" />
                <span className="text-[10px] text-gray-300 dark:text-gray-500">Toucher pour retourner</span>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="back"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="relative bg-gradient-to-br from-purple-50 via-pink-50 to-green-50 dark:from-purple-950/30 dark:via-pink-950/30 dark:to-green-950/30 rounded-3xl border border-purple-200 dark:border-purple-800/30 shadow-sm p-6 pb-8 overflow-hidden flex flex-col items-center justify-start min-h-[300px]"
            >
              <div className="absolute -top-10 -left-10 w-32 h-32 bg-purple-200/30 rounded-full blur-2xl pointer-events-none" />

              <span className="text-4xl mb-3">{weekData.funComparisonEmoji}</span>
              <p className="text-xs font-semibold text-purple-400 uppercase tracking-wider mb-2">
                Le saviez-vous ?
              </p>
              <p className="text-center text-sm text-[#3d2b2b] dark:text-gray-100 leading-relaxed max-w-[240px]">
                Votre bébé fait environ la taille{" "}
                <span className="font-bold text-pink-500 dark:text-pink-400">{deContraction(weekData.funComparison)}</span>{" "}
                {weekData.funComparisonEmoji}
              </p>
              <div className="mt-3 text-center">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {weekData.sizeMm > 0 ? `${sizeCm} — ${formatWeight(weekData.weightG)}` : "Tout petit !"}
                </span>
              </div>
              <div className="w-full max-w-[260px] mt-3">
                <p
                  className={`text-sm text-gray-600 dark:text-gray-300 text-center leading-relaxed ${
                    expanded ? "" : "line-clamp-2"
                  }`}
                >
                  {weekData.babyDevelopment}
                </p>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setExpanded((v) => !v);
                  }}
                  className="mt-1.5 mx-auto flex items-center gap-1 text-[11px] font-semibold text-purple-500 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors"
                  aria-expanded={expanded}
                >
                  {expanded ? "Voir moins" : "Voir plus"}
                  <ChevronDown
                    className={`w-3 h-3 transition-transform ${expanded ? "rotate-180" : ""}`}
                  />
                </button>
              </div>

              <div className="flex items-center gap-1 mt-3">
                <RotateCw className="w-3 h-3 text-gray-300 dark:text-gray-500" />
                <span className="text-[10px] text-gray-300 dark:text-gray-500">Toucher pour retourner</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Side-by-side comparison: baby vs fruit with animated scaling        */
/* ------------------------------------------------------------------ */
function SideBySide({ weekData }: { weekData: WeekData }) {
  const maxMm = 520;
  const progress = Math.min(weekData.sizeMm / maxMm, 1);
  const babySize = 2 + progress * 3;
  const fruitSize = 2 + progress * 3;

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-pink-100 dark:border-pink-900/30 p-4">
      <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider text-center mb-3">
        Comparaison de taille
      </p>
      <div className="flex items-end justify-center gap-8">
        <div className="flex flex-col items-center">
          <span
            style={{ fontSize: `${babySize}rem` }}
            className="select-none inline-block"
          >
            👶
          </span>
          <span className="text-[10px] font-medium text-gray-500 dark:text-gray-400 mt-1">Bébé</span>
          <span className="text-[10px] text-pink-500 dark:text-pink-400 font-bold">{formatSize(weekData.sizeMm)}</span>
        </div>

        <div className="flex flex-col items-center pb-4">
          <div
            className="w-8 h-8 rounded-full bg-gradient-to-r from-pink-100 to-purple-100 dark:from-pink-900/40 dark:to-purple-900/40 flex items-center justify-center border border-pink-200 dark:border-pink-800/30"
          >
            <span className="text-xs font-bold text-purple-500 dark:text-purple-400">VS</span>
          </div>
        </div>

        <div className="flex flex-col items-center">
          <span
            style={{ fontSize: `${fruitSize}rem` }}
            className="select-none inline-block"
          >
            {weekData.fruitEmoji}
          </span>
          <span className="text-[10px] font-medium text-gray-500 dark:text-gray-400 mt-1">{weekData.fruit}</span>
          <span className="text-[10px] text-purple-500 dark:text-purple-400 font-bold">{formatSize(weekData.sizeMm)}</span>
        </div>
      </div>
    </div>
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
    <div className="bg-white dark:bg-gray-900 rounded-3xl border border-purple-100 dark:border-purple-900/30 shadow-sm p-4 overflow-hidden">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">📏</span>
          <h3 className="text-sm font-semibold text-[#3d2b2b] dark:text-gray-100">
            Évolution de la taille
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
            <div
              key={w.week}
              className={`snap-center flex-shrink-0 flex flex-col items-center justify-end rounded-2xl p-3 min-w-[80px] transition-all ${
                isCurrent
                  ? "bg-gradient-to-b from-pink-100 to-purple-100 dark:from-pink-900/40 dark:to-purple-900/40 border-2 border-pink-300 dark:border-pink-700 shadow-md"
                  : "bg-gradient-to-b from-gray-50 to-purple-50/30 dark:from-gray-800 dark:to-purple-950/30 border border-gray-100 dark:border-gray-800"
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
                  isCurrent ? "text-pink-600 dark:text-pink-400" : "text-gray-500 dark:text-gray-400"
                }`}
              >
                {w.fruit}
              </p>
              <p
                className={`text-[10px] mt-0.5 ${
                  isCurrent ? "text-purple-600 dark:text-purple-400 font-bold" : "text-gray-400 dark:text-gray-500"
                }`}
              >
                {sizeCm}
              </p>
              <span
                className={`mt-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                  isCurrent
                    ? "bg-pink-400 text-white"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400"
                }`}
              >
                S{w.week}
              </span>
            </div>
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
  const isEarlyWeek = weekData.week <= 3;

  return (
      <div
        key={`size-comparison-${currentWeek}`}
        className="space-y-4"
      >
        {/* Main flip card */}
        {isEarlyWeek ? (
          <div className="bg-gradient-to-br from-pink-50 via-purple-50 to-green-50 dark:from-pink-950/30 dark:via-purple-950/30 dark:to-green-950/30 rounded-3xl border border-pink-100 dark:border-pink-900/30 shadow-sm p-6 flex flex-col items-center justify-center min-h-[280px]">
            <span className="text-6xl mb-4">🌱</span>
            <p className="text-sm text-[#3d2b2b] dark:text-gray-100 text-center leading-relaxed max-w-[260px]">
              Votre bébé est encore trop petit pour être comparé à un fruit. Il mesure à peine {formatSize(weekData.sizeMm)} !
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">Les comparaisons commencent à la semaine 4</p>
          </div>
        ) : (
          <FlipCard weekData={weekData} />
        )}

        {/* Side-by-side comparison */}
        {!isEarlyWeek && <SideBySide weekData={weekData} />}

        {/* Visual ruler */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-pink-100 dark:border-pink-900/30 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Ruler className="w-4 h-4 text-pink-400" />
            <span className="text-xs font-semibold text-[#3d2b2b] dark:text-gray-100">Taille réelle</span>
          </div>
          <SizeRuler sizeMm={weekData.sizeMm} week={weekData.week} />
        </div>

        {/* Weight visualization */}
        <WeightViz weightG={weekData.weightG} week={weekData.week} />

        {/* Growth sparkline */}
        <GrowthSparkline currentWeek={currentWeek} />

        {/* Size gallery */}
        <SizeGallery currentWeek={currentWeek} />
      </div>
  );
}
