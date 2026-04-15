"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "@/lib/store";
import { getCurrentWeek, getWeekData, pregnancyData } from "@/lib/pregnancy-data";
import { ChevronLeft, ChevronRight, Ruler, Weight, Share2 } from "lucide-react";
import dynamic from "next/dynamic";
import { Skeleton } from "@/components/Skeleton";

const BabyVisual = dynamic(() => import("@/components/BabyVisual"), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center py-5"><Skeleton className="w-52 h-52 rounded-full" /></div>,
});
const SizeComparison = dynamic(() => import("@/components/SizeComparison"), {
  ssr: false,
  loading: () => <div className="space-y-4"><Skeleton className="h-64 w-full rounded-3xl" /><Skeleton className="h-32 w-full rounded-3xl" /></div>,
});
const SocialShareButtons = dynamic(() => import("@/components/SocialShareButtons"), {
  ssr: false,
});

export default function BabyPage() {
  const { dueDate } = useStore();
  const defaultWeek = dueDate ? getCurrentWeek(new Date(dueDate)) : 20;
  const [selectedWeek, setSelectedWeek] = useState(defaultWeek);
  const [direction, setDirection] = useState(0);
  const [showShare, setShowShare] = useState(false);

  const weekData = getWeekData(selectedWeek);

  const goTo = (w: number) => {
    const clamped = Math.max(1, Math.min(42, w));
    setDirection(clamped > selectedWeek ? 1 : -1);
    setSelectedWeek(clamped);
  };

  const trimesterLabel =
    weekData.trimester === 1
      ? "1er trimestre"
      : weekData.trimester === 2
      ? "2ème trimestre"
      : "3ème trimestre";

  const trimesterColor =
    weekData.trimester === 1
      ? "bg-pink-100 text-pink-600"
      : weekData.trimester === 2
      ? "bg-purple-100 text-purple-600"
      : "bg-green-100 text-green-600";

  const sizeDisplay =
    weekData.sizeMm >= 100
      ? `${(weekData.sizeMm / 10).toFixed(1)} cm`
      : `${weekData.sizeMm} mm`;

  const weightDisplay =
    weekData.weightG >= 1000
      ? `${(weekData.weightG / 1000).toFixed(2)} kg`
      : `${weekData.weightG} g`;

  return (
    <div className="max-w-lg mx-auto px-4 py-6 space-y-5 overflow-hidden">
      {/* Navigation semaine */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => goTo(selectedWeek - 1)}
          disabled={selectedWeek <= 1}
          aria-label="Semaine précédente"
          title="Semaine précédente"
          className="w-10 h-10 flex items-center justify-center rounded-full bg-white border border-pink-200 text-pink-400 disabled:opacity-30 hover:bg-pink-50 transition-colors shadow-sm"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="flex-1 text-center">
          <p className="text-xs text-gray-400 uppercase tracking-wider">Semaine</p>
          <p className="text-4xl font-bold text-[#3d2b2b]">{selectedWeek}</p>
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${trimesterColor}`}>
            {trimesterLabel}
          </span>
        </div>

        <button
          onClick={() => goTo(selectedWeek + 1)}
          disabled={selectedWeek >= 42}
          aria-label="Semaine suivante"
          title="Semaine suivante"
          className="w-10 h-10 flex items-center justify-center rounded-full bg-white border border-pink-200 text-pink-400 disabled:opacity-30 hover:bg-pink-50 transition-colors shadow-sm"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Illustration du bébé */}
      <div className="bg-gradient-to-br from-pink-50 via-purple-50 to-pink-50 rounded-3xl border border-pink-100 shadow-sm overflow-hidden">
        <BabyVisual week={selectedWeek} />
        <p className="text-center text-xs text-gray-400 pb-3 -mt-2">
          Illustration de votre bébé
        </p>
      </div>

      {/* Comparaisons de taille visuelles */}
      <SizeComparison currentWeek={selectedWeek} weekData={weekData} />

      {/* Bouton partager */}
      <div className="flex justify-center">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowShare(!showShare)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-400 to-purple-500 text-white text-sm font-medium rounded-full shadow-sm hover:from-pink-500 hover:to-purple-600 transition-all"
        >
          <Share2 className="w-4 h-4" />
          Partager
        </motion.button>
      </div>

      <AnimatePresence>
        {showShare && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-white dark:bg-[#1a1a2e] rounded-3xl p-4 shadow-sm border border-pink-100">
              <p className="text-xs text-gray-500 text-center mb-3">Partager sur vos réseaux</p>
              <SocialShareButtons
                compact
                content={{
                  text: `Semaine ${selectedWeek} - Bébé fait la taille d'un(e) ${weekData.fruit} ! ${weekData.fruitEmoji}\n#MamaTrack #Grossesse`,
                  fileName: `mamatrack-bebe-semaine-${selectedWeek}.png`,
                }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Taille et poids */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-pink-100 text-center">
          <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Ruler className="w-6 h-6 text-pink-500" />
          </div>
          <p className="text-2xl font-bold text-[#3d2b2b]">{sizeDisplay}</p>
          <p className="text-xs text-gray-400 mt-1">Taille (CR)</p>
        </div>

        <div className="bg-white rounded-3xl p-5 shadow-sm border border-purple-100 text-center">
          <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Weight className="w-6 h-6 text-purple-500" />
          </div>
          <p className="text-2xl font-bold text-[#3d2b2b]">{weightDisplay}</p>
          <p className="text-xs text-gray-400 mt-1">Poids estimé</p>
        </div>
      </div>

      {/* Développement bébé */}
      <div
        className="bg-white rounded-3xl p-5 shadow-sm border border-green-100"
        style={{ borderColor: "#d1fae5" }}
      >
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xl">🧬</span>
          <h3 className="font-semibold text-[#3d2b2b]">Développement de bébé</h3>
        </div>
        <p className="text-sm text-gray-600 leading-relaxed">{weekData.babyDevelopment}</p>
      </div>

      {/* Conseil maman */}
      <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-3xl p-5 border border-pink-100">
        <div className="flex items-start gap-3">
          <span className="text-2xl">💝</span>
          <div>
            <h3 className="font-semibold text-[#3d2b2b] text-sm mb-1">Conseil pour maman</h3>
            <p className="text-sm text-gray-600 leading-relaxed">{weekData.momTips}</p>
          </div>
        </div>
      </div>

      {/* Témoignages de la semaine */}
      {weekData.testimonials && weekData.testimonials.length > 0 && (
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-pink-100">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xl">💬</span>
            <h3 className="font-semibold text-[#3d2b2b]">Mamans à la semaine {selectedWeek}</h3>
          </div>
          <div className="space-y-3">
            {weekData.testimonials.map((t: string, i: number) => (
              <div key={i} className="bg-pink-50 rounded-2xl p-3 border border-pink-100">
                <p className="text-sm text-gray-600 italic leading-relaxed">&quot;{t}&quot;</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Timeline trimestres */}
      <div className="bg-white rounded-3xl p-4 shadow-sm border border-pink-100">
        <h3 className="text-sm font-semibold text-[#3d2b2b] mb-3">Toutes les semaines</h3>
        <div className="flex gap-1 flex-wrap">
          {pregnancyData.map((d) => (
            <button
              key={d.week}
              onClick={() => goTo(d.week)}
              className={`w-7 h-7 text-xs rounded-lg font-medium transition-all ${
                d.week === selectedWeek
                  ? "bg-pink-400 text-white shadow-sm scale-110"
                  : d.trimester === 1
                  ? "bg-pink-100 text-pink-600 hover:bg-pink-200"
                  : d.trimester === 2
                  ? "bg-purple-100 text-purple-600 hover:bg-purple-200"
                  : "bg-green-100 text-green-600 hover:bg-green-200"
              }`}
            >
              {d.week}
            </button>
          ))}
        </div>
        <div className="flex gap-4 mt-3 text-xs">
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-pink-200 inline-block" /> T1
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-purple-200 inline-block" /> T2
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-green-200 inline-block" /> T3
          </span>
        </div>
      </div>
    </div>
  );
}
