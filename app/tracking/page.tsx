"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { Timer } from "lucide-react";
import { TrackingSkeleton } from "@/components/Skeleton";

const SymptomTab = dynamic(() => import("@/components/tracking/SymptomTab"), { loading: () => <TrackingSkeleton />, ssr: false });
const WeightTab = dynamic(() => import("@/components/tracking/WeightTab"), { loading: () => <TrackingSkeleton />, ssr: false });
const WaterTab = dynamic(() => import("@/components/tracking/WaterTab"), { loading: () => <TrackingSkeleton />, ssr: false });
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

export default function TrackingPage() {
  const [activeTab, setActiveTab] = useState<Tab>("symptoms");
  const today = format(new Date(), "yyyy-MM-dd");
  const router = useRouter();

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      {/* Tabs */}
      <div className="flex gap-1 bg-pink-50 rounded-2xl p-1 mb-4 overflow-x-auto scrollbar-hide">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-shrink-0 flex-1 py-1.5 text-xs font-medium rounded-xl transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? "bg-white text-pink-600 shadow-sm"
                : "text-gray-500 hover:text-pink-400"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Contractions shortcut */}
      <button
        onClick={() => router.push("/contractions")}
        className="w-full flex items-center gap-3 bg-purple-50 border border-purple-100 rounded-2xl px-4 py-3 mb-5 hover:bg-purple-100 transition-colors"
      >
        <div className="w-9 h-9 bg-purple-400 rounded-xl flex items-center justify-center flex-shrink-0">
          <Timer className="w-5 h-5 text-white" />
        </div>
        <div className="text-left">
          <p className="text-sm font-semibold text-purple-700">Contractions</p>
          <p className="text-xs text-purple-400">Chronomètre & suivi des contractions</p>
        </div>
        <span className="ml-auto text-purple-300 text-lg">›</span>
      </button>

      <AnimatePresence mode="wait">
        {activeTab === "symptoms" && <SymptomTab key="symptoms" />}
        {activeTab === "weight" && <WeightTab key="weight" />}
        {activeTab === "water" && <WaterTab key="water" today={today} />}
        {activeTab === "kicks" && <KicksTab key="kicks" today={today} />}
        {activeTab === "nutrition" && <NutritionTab key="nutrition" />}
        {activeTab === "bp" && <BloodPressureTab key="bp" />}
        {activeTab === "abdomen" && <AbdomenTab key="abdomen" />}
        {activeTab === "mood" && <MoodTab key="mood" />}
        {activeTab === "sleep" && <SleepTab key="sleep" />}
        {activeTab === "exercise" && <ExerciseTab key="exercise" />}
      </AnimatePresence>
    </div>
  );
}
