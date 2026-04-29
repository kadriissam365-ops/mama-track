"use client";

import { useState, useEffect } from "react";
import { m as motion } from "framer-motion";
import { useStore } from "@/lib/store";
import { useAuth } from "@/lib/auth";
import {
  getCurrentWeek,
  getDaysRemaining,
  getProgressPercent,
  getWeekData,
} from "@/lib/pregnancy-data";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Scale, Activity, Calendar, Droplets, Settings, Loader2, Timer, Share2, BarChart3, Calculator } from "lucide-react";
import DpaCalculator from "@/components/DpaCalculator";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { DashboardSkeleton } from "@/components/Skeleton";
import { initializeNotifications } from "@/lib/notifications";
import { WATER_GOAL_ML } from "@/lib/constants";
import ReminderBanner from "@/components/ReminderBanner";
import MamaCoachAlerts from "@/components/MamaCoachAlerts";
import Paywall from "@/components/Paywall";
import { Skeleton } from "@/components/Skeleton";
import { useIsPremium } from "@/lib/use-premium";
import { useTheme } from "next-themes";

const LandingPage = dynamic(() => import("@/components/LandingPage"), {
  ssr: false,
  loading: () => <div className="min-h-screen flex items-center justify-center"><DashboardSkeleton /></div>,
});

const WeeklyReport = dynamic(() => import("@/components/WeeklyReport"), {
  ssr: false,
  loading: () => <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center"><div className="bg-white dark:bg-gray-900 rounded-t-3xl p-6 w-full max-w-lg h-[60vh] animate-pulse" /></div>,
});
const ShareCard = dynamic(() => import("@/components/ShareCard"), {
  ssr: false,
  loading: () => <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center"><div className="bg-white dark:bg-gray-900 rounded-3xl p-6 w-full max-w-sm h-96 animate-pulse" /></div>,
});
const BabyIllustration = dynamic(() => import("@/components/BabyIllustration"), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center py-2"><div className="w-32 h-32 rounded-full bg-pink-50 dark:bg-pink-950/30 animate-pulse" /></div>,
});
const DailyStory = dynamic(() => import("@/components/DailyStory"), {
  ssr: false,
  loading: () => <Skeleton className="h-32 w-full rounded-3xl" />,
});

export default function DashboardPage() {
  const store = useStore();
  const { user, isAuthenticated } = useAuth();
  const { isPremium, loading: premiumLoading } = useIsPremium();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  if (!isAuthenticated) {
    return <LandingPage />;
  }
  const router = useRouter();
  const [showSetup, setShowSetup] = useState(false);
  const [showDpaCalc, setShowDpaCalc] = useState(false);
  const [dateInput, setDateInput] = useState(store.dueDate ?? "");
  const [prenomFavorisCount, setPrenomFavorisCount] = useState(0);
  const [showShare, setShowShare] = useState(false);
  const [showReport, setShowReport] = useState(false);

  useEffect(() => {
    setDateInput(store.dueDate ?? "");
  }, [store.dueDate]);

  useEffect(() => {
    const stored = localStorage.getItem('prenom-favoris');
    if (stored) {
      try { setPrenomFavorisCount(JSON.parse(stored).length); } catch {}
    }
  }, []);

  // Initialize notifications when component mounts
  useEffect(() => {
    if (typeof window !== 'undefined') {
      initializeNotifications();
    }
  }, []);

  // Show loading skeleton while data is being fetched
  if (store.loading) {
    return <DashboardSkeleton />;
  }

  const dueDate = store.dueDate ? new Date(store.dueDate) : null;
  const weekSA = dueDate ? getCurrentWeek(dueDate) : 20;
  const week = store.weekMode === "GA" ? Math.max(1, weekSA - 2) : weekSA;
  const days = dueDate ? getDaysRemaining(dueDate) : null;
  const progress = dueDate ? getProgressPercent(dueDate) : 50;
  const weekData = getWeekData(weekSA);

  const today = format(new Date(), "yyyy-MM-dd");
  const waterToday = store.waterIntake[today] ?? 0;
  const waterGoal = WATER_GOAL_ML;

  const parseLocalDate = (s: string) => {
    const [y, m, d] = s.split("-").map(Number);
    return new Date(y, (m ?? 1) - 1, d ?? 1);
  };

  const lastWeight =
    store.weightEntries.length > 0
      ? [...store.weightEntries].sort((a, b) => a.date.localeCompare(b.date)).at(-1) ?? null
      : null;

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const upcomingAppts = store.appointments
    .filter((a) => !a.done && parseLocalDate(a.date) >= todayStart)
    .slice(0, 2);

  const recentSymptoms = [...store.symptomEntries]
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-3);

  const handleSaveDueDate = () => {
    if (dateInput) {
      store.setDueDate(dateInput);
      setShowSetup(false);
    }
  };

  // Circumference for the SVG circle progress
  const radius = 56;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
      {/* Setup DPA */}
      {(!store.dueDate || showSetup) && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-900 rounded-3xl p-5 shadow-sm border border-pink-100 dark:border-pink-900/30"
        >
          <h2 className="font-semibold text-[#3d2b2b] dark:text-gray-100 mb-3">
            📅 {store.dueDate ? "Modifier" : "Définir"} votre Date Prévue d&apos;Accouchement
          </h2>
          <div className="flex gap-2">
            <input
              type="date"
              value={dateInput}
              onChange={(e) => setDateInput(e.target.value)}
              className="flex-1 border border-pink-200 dark:border-pink-800/30 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300 dark:bg-gray-800 dark:text-white dark:border-gray-600"
            />
            <button
              onClick={handleSaveDueDate}
              className="bg-pink-400 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-pink-500 dark:hover:bg-pink-600 dark:bg-pink-500 transition-colors"
            >
              OK
            </button>
          </div>
        </motion.div>
      )}

      {/* DPA calculator panel */}
      {showDpaCalc && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-900 rounded-3xl p-5 shadow-sm border border-purple-100 dark:border-purple-900/30"
        >
          <DpaCalculator defaultOpen onSaved={() => setShowDpaCalc(false)} />
        </motion.div>
      )}

      {/* Hero Card — Semaine + Fruit */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gradient-to-br from-pink-100 via-purple-50 to-emerald-50 dark:from-pink-950/40 dark:via-purple-950/30 dark:to-emerald-950/20 rounded-3xl p-6 shadow-sm border border-pink-100 dark:border-pink-900/30 relative overflow-hidden"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-pink-400 uppercase tracking-wider mb-1">
              Semaine de grossesse
            </p>
            <h1 className="text-6xl font-bold text-[#3d2b2b] dark:text-gray-100">
              {week}
              <span className="text-2xl text-pink-400 ml-1">{store.weekMode}</span>
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {weekData.fruit}
            </p>
            {dueDate && (
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                DPA : {format(dueDate, "d MMMM yyyy", { locale: fr })}
              </p>
            )}
          </div>

          <div className="relative flex items-center justify-center">
            <svg width="140" height="140" className="-rotate-90">
              <circle
                cx="70"
                cy="70"
                r={radius}
                fill="none"
                stroke="#fce7f3"
                strokeWidth="10"
              />
              <motion.circle
                cx="70"
                cy="70"
                r={radius}
                fill="none"
                stroke="#F9A8D4"
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset }}
                transition={{ duration: 1.5, ease: "easeOut" }}
              />
            </svg>
            <motion.div
              className="absolute text-5xl"
              animate={{
                scale: [1, 1.08, 1],
                rotate: [0, 5, -5, 0],
              }}
              transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
            >
              {weekData.fruitEmoji}
            </motion.div>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Progression : <span className="font-semibold text-pink-500 dark:text-pink-400">{progress}%</span>
          </div>
          {days !== null && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5, type: "spring" }}
              className="bg-white dark:bg-gray-900 rounded-2xl px-3 py-1.5 shadow-sm"
            >
              <span className="text-2xl font-bold text-purple-500 dark:text-purple-400">{days}</span>
              <span className="text-xs text-gray-400 dark:text-gray-500 ml-1">jours restants</span>
            </motion.div>
          )}
        </div>

        <div className="absolute top-3 right-3 flex items-center gap-2">
          <button
            onClick={() => setShowDpaCalc((v) => !v)}
            aria-label="Calculer ma DPA autrement"
            title="Calculer ma DPA autrement"
            className={`transition-colors ${showDpaCalc ? "text-purple-500" : "text-gray-300 hover:text-purple-400 dark:text-gray-400"}`}
          >
            <Calculator className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowSetup((v) => !v)}
            aria-label="Modifier la DPA"
            title="Modifier la DPA"
            className={`transition-colors ${
              !store.dueDate
                ? "text-gray-400 dark:text-gray-500 hover:text-gray-600"
                : "text-gray-300 hover:text-gray-500 dark:text-gray-400"
            }`}
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </motion.div>

      {/* MamaCoach signaux faibles */}
      <MamaCoachAlerts />

      {/* Story du jour MamaCoach */}
      {!premiumLoading && (
        isPremium ? (
          <DailyStory />
        ) : (
          <Paywall feature="Story du jour MamaCoach" compact>
            <DailyStory />
          </Paywall>
        )
      )}

      {/* Smart Reminders */}
      <ReminderBanner />

      {/* Trimestre badge */}
      <div className="flex gap-2">
        {[1, 2, 3].map((t) => (
          <div
            key={t}
            className={`flex-1 text-center py-2 rounded-2xl text-xs font-semibold transition-all ${
              weekData.trimester === t
                ? "bg-pink-400 text-white shadow-sm"
                : "bg-white dark:bg-gray-900 text-gray-400 dark:text-gray-500 border border-pink-100 dark:border-pink-900/30"
            }`}
          >
            {t === 1 ? "1er trimestre" : t === 2 ? "2ème trimestre" : "3ème trimestre"}
          </div>
        ))}
      </div>

      {/* Cards résumé */}
      <div className="grid grid-cols-2 gap-3">
        {/* Poids */}
        <motion.button
          type="button"
          onClick={() => router.push("/tracking?tab=weight")}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="text-left bg-white dark:bg-gray-900 rounded-3xl p-4 shadow-sm border border-pink-100 dark:border-pink-900/30 hover:shadow-md hover:border-pink-200 dark:hover:border-pink-800/50 transition-all active:scale-[0.98]"
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-pink-100 dark:bg-pink-900/30 rounded-full flex items-center justify-center">
              <Scale className="w-4 h-4 text-pink-500 dark:text-pink-400" />
            </div>
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Poids</span>
          </div>
          {lastWeight ? (
            <>
              <p className="text-2xl font-bold text-[#3d2b2b] dark:text-gray-100">
                {lastWeight.weight} <span className="text-sm font-normal text-gray-400 dark:text-gray-500">kg</span>
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                {format(parseLocalDate(lastWeight.date), "d MMM", { locale: fr })}
              </p>
            </>
          ) : (
            <p className="text-sm text-gray-400 dark:text-gray-500">Aucune mesure</p>
          )}
        </motion.button>

        {/* Eau */}
        <motion.button
          type="button"
          onClick={() => router.push("/tracking?tab=water")}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.25 }}
          className="text-left bg-white dark:bg-gray-900 rounded-3xl p-4 shadow-sm border border-purple-100 dark:border-purple-900/30 hover:shadow-md hover:border-purple-200 dark:hover:border-purple-800/50 transition-all active:scale-[0.98]"
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
              <Droplets className="w-4 h-4 text-purple-500 dark:text-purple-400" />
            </div>
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Hydratation</span>
          </div>
          <p className="text-2xl font-bold text-[#3d2b2b] dark:text-gray-100">
            {waterToday} <span className="text-sm font-normal text-gray-400 dark:text-gray-500">ml</span>
          </p>
          <div className="w-full bg-purple-100 dark:bg-purple-900/30 rounded-full h-1.5 mt-2">
            <div
              className="bg-purple-400 h-1.5 rounded-full transition-all"
              style={{ width: `${Math.min(100, (waterToday / waterGoal) * 100)}%` }}
            />
          </div>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">objectif {waterGoal} ml</p>
        </motion.button>

        {/* Symptômes */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-900 rounded-3xl p-4 shadow-sm border border-green-100 dark:border-green-900/30"
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
              <Activity className="w-4 h-4 text-green-500 dark:text-green-400" />
            </div>
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Symptômes</span>
          </div>
          {recentSymptoms.length > 0 ? (
            <div className="space-y-1">
              {recentSymptoms.slice(-1).map((s) => (
                <div key={s.id} className="flex flex-wrap gap-1">
                  {s.symptoms.slice(0, 2).map((sym) => (
                    <span key={sym} className="text-xs bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400 px-2 py-0.5 rounded-full">
                      {sym}
                    </span>
                  ))}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400 dark:text-gray-500">Aucun récent</p>
          )}
        </motion.div>

        {/* RDV */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.35 }}
          className="bg-white dark:bg-gray-900 rounded-3xl p-4 shadow-sm border border-orange-100 dark:border-orange-900/30"
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center">
              <Calendar className="w-4 h-4 text-orange-500 dark:text-orange-400" />
            </div>
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Prochain RDV</span>
          </div>
          {upcomingAppts.length > 0 ? (
            <div>
              <p className="text-sm font-semibold text-[#3d2b2b] dark:text-gray-100 truncate">
                {upcomingAppts[0].title}
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                {format(parseLocalDate(upcomingAppts[0].date), "d MMM", { locale: fr })} à {upcomingAppts[0].time}
              </p>
            </div>
          ) : (
            <p className="text-sm text-gray-400 dark:text-gray-500">Aucun RDV</p>
          )}
        </motion.div>
      </div>

      {/* Contractions shortcut */}
      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.38 }}
        onClick={() => router.push("/contractions")}
        className="w-full flex items-center gap-3 bg-purple-50 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/30 rounded-3xl px-4 py-3 hover:bg-purple-100 dark:hover:bg-purple-900/30 dark:bg-purple-900/30 transition-colors"
      >
        <div className="w-9 h-9 bg-purple-400 rounded-xl flex items-center justify-center flex-shrink-0">
          <Timer className="w-5 h-5 text-white" />
        </div>
        <div className="text-left">
          <p className="text-sm font-semibold text-purple-700 dark:text-purple-300">Contractions</p>
          <p className="text-xs text-purple-400">Chronomètre & suivi</p>
        </div>
        <span className="ml-auto text-purple-300 text-lg">›</span>
      </motion.button>

      {/* Prénoms shortcut */}
      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.41 }}
        onClick={() => router.push("/prenoms")}
        className="w-full flex items-center gap-3 bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-100 dark:border-yellow-900/30 rounded-3xl px-4 py-3 hover:bg-yellow-100 dark:hover:bg-yellow-900/30 dark:bg-yellow-900/30 transition-colors"
      >
        <div className="w-9 h-9 bg-yellow-300 rounded-xl flex items-center justify-center flex-shrink-0">
          <span className="text-lg">💛</span>
        </div>
        <div className="text-left">
          <p className="text-sm font-semibold text-yellow-700 dark:text-yellow-300">Choisir un prénom</p>
          <p className="text-xs text-yellow-500 dark:text-yellow-400">{prenomFavorisCount} favori(s) sauvegardé(s)</p>
        </div>
        <span className="ml-auto text-yellow-300 text-lg">›</span>
      </motion.button>

      {/* Bilan semaine */}
      <button onClick={() => setShowReport(true)} className="w-full flex items-center gap-3 bg-white dark:bg-gray-900 border border-purple-100 dark:border-purple-900/30 rounded-3xl px-4 py-3 hover:bg-purple-50 dark:hover:bg-purple-950/30 dark:bg-purple-950/30 transition-colors">
        <BarChart3 className="w-5 h-5 text-purple-400" />
        <span className="text-sm font-semibold text-purple-700 dark:text-purple-300">Mon bilan de la semaine</span>
        <span className="ml-auto text-purple-300 text-lg">›</span>
      </button>

      {/* Explorer — nouvelles sections */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.43 }}
        className="space-y-3"
      >
        <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 px-1">Explorer</h3>
        <div className="grid grid-cols-3 gap-2">
          {[
            { href: "/timeline", emoji: "📅", label: "Timeline", color: "bg-indigo-50 dark:bg-indigo-950/30 border-indigo-100 dark:border-indigo-900/30" },
            { href: "/bump", emoji: "📸", label: "Bump diary", color: "bg-rose-50 dark:bg-rose-950/30 border-rose-100 dark:border-rose-900/30" },
            { href: "/alimentation", emoji: "🥗", label: "Alimentation", color: "bg-green-50 dark:bg-green-950/30 border-green-100 dark:border-green-900/30" },
            { href: "/medicaments", emoji: "💊", label: "Médicaments", color: "bg-blue-50 dark:bg-blue-950/30 border-blue-100 dark:border-blue-900/30" },
            { href: "/respiration", emoji: "🌬️", label: "Respiration", color: "bg-cyan-50 dark:bg-cyan-950/30 border-cyan-100 dark:border-cyan-900/30" },
            { href: "/urgences", emoji: "🚨", label: "Urgences", color: "bg-red-50 dark:bg-red-950/30 border-red-100 dark:border-red-900/30" },
          ].map((item) => (
            <button
              key={item.href}
              onClick={() => router.push(item.href)}
              className={`${item.color} border rounded-2xl p-3 flex flex-col items-center gap-1.5 hover:scale-[1.03] transition-transform`}
            >
              <span className="text-2xl">{item.emoji}</span>
              <span className="text-xs font-medium text-gray-600 dark:text-gray-300">{item.label}</span>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Conseil de la semaine */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-3xl p-5 border border-pink-100 dark:border-pink-900/30"
      >
        <div className="flex items-start gap-3">
          <span className="text-2xl">💡</span>
          <div>
            <h3 className="font-semibold text-[#3d2b2b] dark:text-gray-100 text-sm mb-1">Conseil de la semaine</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{weekData.momTips}</p>
          </div>
        </div>
      </motion.div>

      {/* Développement bébé aperçu */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45 }}
        className="bg-white dark:bg-gray-900 rounded-3xl p-5 shadow-sm border border-mint-100"
        style={{ borderColor: "#d1fae5" }}
      >
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xl">👶</span>
          <h3 className="font-semibold text-[#3d2b2b] dark:text-gray-100">Bébé cette semaine</h3>
        </div>
        <div className="flex gap-4 mb-3">
          <div className="text-center">
            <p className="text-lg font-bold text-[#3d2b2b] dark:text-gray-100">
              {weekData.sizeMm >= 100
                ? `${(weekData.sizeMm / 10).toFixed(0)} cm`
                : `${weekData.sizeMm} mm`}
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500">Taille</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-[#3d2b2b] dark:text-gray-100">
              {weekData.weightG >= 1000
                ? `${(weekData.weightG / 1000).toFixed(1)} kg`
                : `${weekData.weightG} g`}
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500">Poids</p>
          </div>
          <div className="text-center">
            <p className="text-2xl">{weekData.fruitEmoji}</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 truncate max-w-16">{weekData.fruit}</p>
          </div>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed line-clamp-3">
          {weekData.babyDevelopment}
        </p>
      </motion.div>
      {/* Floating share button */}
      <button
        onClick={() => setShowShare(true)}
        className="fixed bottom-24 right-4 z-40 w-12 h-12 bg-gradient-to-br from-pink-400 to-purple-400 rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform"
      >
        <Share2 className="w-5 h-5 text-white" />
      </button>
      {showShare && <ShareCard onClose={() => setShowShare(false)} />}
      {showReport && <WeeklyReport onClose={() => setShowReport(false)} />}
    </div>
  );
}
