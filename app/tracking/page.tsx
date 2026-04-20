"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useRouter } from "next/navigation";
import { Timer, Plus, Minus } from "lucide-react";
import { TrackingSkeleton } from "@/components/Skeleton";
import { useStore } from "@/lib/store";
import { WATER_GOAL_ML } from "@/lib/constants";

const WeightTab = dynamic(() => import("@/components/tracking/WeightTab"), { loading: () => <TrackingSkeleton />, ssr: false });
const KicksTab = dynamic(() => import("@/components/tracking/KicksTab"), { loading: () => <TrackingSkeleton />, ssr: false });
const NutritionTab = dynamic(() => import("@/components/tracking/NutritionTab"), { loading: () => <TrackingSkeleton />, ssr: false });
const BloodPressureTab = dynamic(() => import("@/components/tracking/BloodPressureTab"), { loading: () => <TrackingSkeleton />, ssr: false });
const AbdomenTab = dynamic(() => import("@/components/tracking/AbdomenTab"), { loading: () => <TrackingSkeleton />, ssr: false });
const MoodTab = dynamic(() => import("@/components/tracking/MoodTab"), { loading: () => <TrackingSkeleton />, ssr: false });
const SleepTab = dynamic(() => import("@/components/tracking/SleepTab"), { loading: () => <TrackingSkeleton />, ssr: false });
const ExerciseTab = dynamic(() => import("@/components/tracking/ExerciseTab"), { loading: () => <TrackingSkeleton />, ssr: false });

type Tab = "symptoms" | "weight" | "water" | "kicks" | "nutrition" | "bp" | "abdomen" | "mood" | "sleep" | "exercise";

const TABS: { id: Tab; label: string }[] = [
  { id: "symptoms", label: "😣 Symptômes" },
  { id: "weight", label: "⚖️ Poids" },
  { id: "water", label: "💧 Eau" },
  { id: "kicks", label: "👶 Mouvements" },
  { id: "sleep", label: "🌙 Sommeil" },
  { id: "exercise", label: "🏃‍♀️ Exercice" },
  { id: "bp", label: "🩺 Tension" },
  { id: "abdomen", label: "📏 Ventre" },
  { id: "mood", label: "💭 Humeur" },
  { id: "nutrition", label: "🌿 Nutrition" },
];

const SYMPTOM_OPTIONS = [
  "Nausées", "Fatigue", "Douleurs dos", "Brûlures d'estomac",
  "Vertiges", "Gonflement", "Insomnies", "Maux de tête",
  "Crampes", "Constipation", "Saignements des gencives", "Essoufflement",
];

const WATER_AMOUNTS = [250, 500, 750, 1000];

export default function TrackingPage() {
  const [activeTab, setActiveTab] = useState<Tab>("symptoms");
  const today = format(new Date(), "yyyy-MM-dd");
  const router = useRouter();
  const store = useStore();

  // Symptom form state (inline, on-page)
  const [showSymptomForm, setShowSymptomForm] = useState(false);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [severity, setSeverity] = useState(3);
  const [note, setNote] = useState("");

  const toggleSymptom = (s: string) => {
    setSelectedSymptoms((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );
  };

  const handleSymptomSubmit = () => {
    if (selectedSymptoms.length === 0) return;
    store.addSymptomEntry({
      date: format(new Date(), "yyyy-MM-dd"),
      symptoms: selectedSymptoms,
      severity,
      note: note || undefined,
    });
    setSelectedSymptoms([]);
    setSeverity(3);
    setNote("");
    setShowSymptomForm(false);
  };

  // Water state derived from store
  const waterToday = store.waterIntake[today] ?? 0;
  const waterGoal = WATER_GOAL_ML;
  const waterPct = Math.min(100, (waterToday / waterGoal) * 100);

  // Index of active tab for the slider indicator
  const activeIndex = TABS.findIndex((t) => t.id === activeTab);

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      {/* Tabs with animated slider indicator */}
      <div className="relative mb-4 overflow-x-auto scrollbar-hide">
        <div
          className="relative flex gap-1 bg-pink-50 dark:bg-pink-950/30 rounded-2xl p-1"
          style={{ minWidth: "max-content" }}
        >
          {/* Sliding indicator: width = 100/TABS.length %, left = activeIndex * that width */}
          <motion.div
            aria-hidden
            className="absolute top-1 bottom-1 bg-white dark:bg-gray-900 rounded-xl shadow-sm"
            initial={false}
            animate={{
              left: `calc(${(activeIndex * 100) / TABS.length}% + 4px)`,
              width: `calc(${100 / TABS.length}% - 8px)`,
            }}
            transition={{ type: "spring", stiffness: 400, damping: 35 }}
          />
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`relative z-10 flex-shrink-0 flex-1 py-1.5 px-2 text-xs font-medium rounded-xl transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? "text-pink-600"
                  : "text-gray-500 dark:text-gray-400 hover:text-pink-400"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Contractions shortcut */}
      <button
        onClick={() => router.push("/contractions")}
        className="w-full flex items-center gap-3 bg-purple-50 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/30 rounded-2xl px-4 py-3 mb-5 hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
      >
        <div className="w-9 h-9 bg-purple-400 rounded-xl flex items-center justify-center flex-shrink-0">
          <Timer className="w-5 h-5 text-white" />
        </div>
        <div className="text-left">
          <p className="text-sm font-semibold text-purple-700 dark:text-purple-300">Contractions</p>
          <p className="text-xs text-purple-400 dark:text-purple-300">Chronomètre & suivi des contractions</p>
        </div>
        <span className="ml-auto text-purple-300 text-lg">›</span>
      </button>

      {/* Tab content: wrap every tab in a motion.div keyed by activeTab so the
          opacity/y animation is driven from this page (guaranteed to run even
          if child sub-components fail to animate). */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
      >
        {activeTab === "symptoms" && (
          <div className="space-y-4">
            <button
              type="button"
              onClick={() => setShowSymptomForm((v) => !v)}
              className="w-full py-3 bg-pink-400 text-white rounded-2xl font-medium flex items-center justify-center gap-2 hover:bg-pink-500 dark:bg-pink-500 dark:hover:bg-pink-600 transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Ajouter des symptômes
            </button>

            {showSymptomForm && (
              <div className="bg-white dark:bg-gray-900 rounded-3xl p-5 shadow-sm border border-pink-100 dark:border-pink-900/30">
                <h3 className="font-semibold text-[#3d2b2b] dark:text-gray-100 mb-3">
                  Symptômes aujourd&apos;hui
                </h3>
                <div className="flex flex-wrap gap-2 mb-4">
                  {SYMPTOM_OPTIONS.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => toggleSymptom(s)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                        selectedSymptoms.includes(s)
                          ? "bg-pink-400 text-white shadow-sm"
                          : "bg-pink-50 dark:bg-pink-950/30 text-pink-600 hover:bg-pink-100 dark:hover:bg-pink-900/30"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>

                <div className="mb-4">
                  <label className="text-xs text-gray-500 dark:text-gray-400 block mb-2">
                    Sévérité : {severity}/5
                  </label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((v) => (
                      <button
                        key={v}
                        type="button"
                        onClick={() => setSeverity(v)}
                        className={`flex-1 h-8 rounded-xl text-sm font-bold transition-all ${
                          v <= severity
                            ? "bg-pink-400 text-white"
                            : "bg-pink-50 dark:bg-pink-950/30 text-pink-300"
                        }`}
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                </div>

                <textarea
                  placeholder="Note (optionnel)..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full border border-pink-200 dark:border-pink-800/30 rounded-xl p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-pink-300 mb-3 bg-white dark:bg-gray-900 dark:text-gray-100"
                  rows={2}
                />

                <button
                  type="button"
                  onClick={handleSymptomSubmit}
                  disabled={selectedSymptoms.length === 0}
                  className="w-full py-2.5 bg-pink-400 text-white rounded-xl font-medium disabled:opacity-50 hover:bg-pink-500 dark:bg-pink-500 dark:hover:bg-pink-600 transition-colors"
                >
                  Enregistrer
                </button>
              </div>
            )}

            {/* History of recent symptom entries */}
            <div className="space-y-3">
              {store.symptomEntries
                .slice()
                .reverse()
                .slice(0, 10)
                .map((entry) => (
                  <div
                    key={entry.id}
                    className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-sm border border-pink-100 dark:border-pink-900/30"
                  >
                    <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">
                      {format(new Date(entry.date), "d MMMM yyyy", { locale: fr })}
                    </p>
                    <div className="flex flex-wrap gap-1 mb-1">
                      {entry.symptoms.map((s) => (
                        <span
                          key={s}
                          className="text-xs bg-pink-100 dark:bg-pink-900/30 text-pink-600 px-2 py-0.5 rounded-full"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((v) => (
                        <span
                          key={v}
                          className={`w-4 h-1.5 rounded-full ${
                            v <= entry.severity ? "bg-pink-400" : "bg-pink-100 dark:bg-pink-900/30"
                          }`}
                        />
                      ))}
                    </div>
                    {entry.note && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{entry.note}</p>
                    )}
                  </div>
                ))}
            </div>
          </div>
        )}

        {activeTab === "water" && (
          <div className="space-y-5">
            {/* Jauge principale */}
            <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-sm border border-blue-100 dark:border-blue-900/30 text-center">
              <div className="relative w-40 h-40 mx-auto mb-4">
                <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
                  <circle cx="60" cy="60" r="50" fill="none" stroke="#e0f2fe" strokeWidth="10" className="dark:stroke-blue-950" />
                  <circle
                    cx="60"
                    cy="60"
                    r="50"
                    fill="none"
                    stroke="#7dd3fc"
                    strokeWidth="10"
                    strokeLinecap="round"
                    strokeDasharray={2 * Math.PI * 50}
                    strokeDashoffset={2 * Math.PI * 50 * (1 - waterPct / 100)}
                    style={{ transition: "stroke-dashoffset 0.6s ease-out" }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold text-blue-500">{waterToday}</span>
                  <span className="text-xs text-gray-400 dark:text-gray-500">
                    ml / {waterGoal} ml
                  </span>
                </div>
              </div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                {waterPct >= 100
                  ? "🎉 Objectif atteint !"
                  : `Encore ${waterGoal - waterToday} ml pour atteindre l'objectif`}
              </p>
            </div>

            {/* Quick-add buttons */}
            <div className="grid grid-cols-2 gap-3">
              {WATER_AMOUNTS.map((ml) => (
                <button
                  key={ml}
                  type="button"
                  onClick={() => store.addWater(today, ml)}
                  className="bg-white dark:bg-gray-900 rounded-2xl py-4 shadow-sm border border-blue-100 dark:border-blue-900/30 flex flex-col items-center gap-1 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors"
                >
                  <span className="text-2xl">💧</span>
                  <span className="text-sm font-semibold text-blue-500">+ {ml} ml</span>
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => store.removeWater(today, 250)}
              disabled={waterToday === 0}
              className="w-full py-3 bg-white dark:bg-gray-900 border border-red-100 dark:border-red-900/30 text-red-400 rounded-2xl font-medium flex items-center justify-center gap-2 disabled:opacity-30 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
            >
              <Minus className="w-4 h-4" />
              Annuler 250 ml
            </button>

            {/* Historique 7 jours */}
            <div className="bg-white dark:bg-gray-900 rounded-3xl p-4 shadow-sm border border-blue-100 dark:border-blue-900/30">
              <h3 className="text-sm font-semibold text-[#3d2b2b] dark:text-gray-100 mb-3">
                7 derniers jours
              </h3>
              {Object.entries(store.waterIntake)
                .sort((a, b) => b[0].localeCompare(a[0]))
                .slice(0, 7)
                .map(([date, ml]) => (
                  <div
                    key={date}
                    className="flex items-center justify-between py-2 border-b border-gray-50 dark:border-gray-800 last:border-0"
                  >
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      {format(new Date(date), "EEEE d MMM", { locale: fr })}
                    </span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-blue-100 dark:bg-blue-900/30 rounded-full h-2">
                        <div
                          className="bg-blue-400 h-2 rounded-full"
                          style={{
                            width: `${Math.min(100, ((ml as number) / waterGoal) * 100)}%`,
                          }}
                        />
                      </div>
                      <span className="text-xs font-semibold text-blue-500">
                        {ml as number} ml
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {activeTab === "weight" && <WeightTab />}
        {activeTab === "kicks" && <KicksTab today={today} />}
        {activeTab === "nutrition" && <NutritionTab />}
        {activeTab === "bp" && <BloodPressureTab />}
        {activeTab === "abdomen" && <AbdomenTab />}
        {activeTab === "mood" && <MoodTab />}
        {activeTab === "sleep" && <SleepTab />}
        {activeTab === "exercise" && <ExerciseTab />}
      </motion.div>
    </div>
  );
}
