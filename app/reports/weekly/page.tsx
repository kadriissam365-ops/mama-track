"use client";

import { useMemo, useState } from "react";
import { m as motion } from "framer-motion";
import { useStore } from "@/lib/store";
import { useAuth } from "@/lib/auth";
import { composeWeeklyReport } from "@/lib/weekly-report-data";
import { ArrowLeft, Mail, TrendingUp, TrendingDown, Minus, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { DashboardSkeleton } from "@/components/Skeleton";
import LandingPage from "@/components/LandingPage";

export default function WeeklyReportPage() {
  const store = useStore();
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState<"success" | "error" | null>(null);

  const report = useMemo(() => {
    if (!store.dueDate) return null;
    return composeWeeklyReport({
      dueDate: store.dueDate,
      babyName: store.babyName,
      mamaName: store.mamaName,
      weightEntries: store.weightEntries,
      symptomEntries: store.symptomEntries,
      kickSessions: store.kickSessions,
      waterIntake: store.waterIntake as Record<string, number>,
      appointments: store.appointments,
    });
  }, [store.dueDate, store.babyName, store.mamaName, store.weightEntries, store.symptomEntries, store.kickSessions, store.waterIntake, store.appointments]);

  if (!isAuthenticated) return <LandingPage />;
  if (store.loading) return <DashboardSkeleton />;

  if (!report) {
    return (
      <div className="min-h-screen bg-[#fdf2f8] dark:bg-gray-950 flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-xl font-bold text-[#3d2b2b] dark:text-gray-100 mb-2">Bilan indisponible</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-6">Configure ta date d'accouchement pour voir ton bilan hebdo.</p>
        <button onClick={() => router.push("/")} className="px-6 py-3 rounded-full bg-pink-500 text-white font-semibold">Retour au dashboard</button>
      </div>
    );
  }

  const handleSendEmail = async () => {
    setSending(true);
    setSent(null);
    try {
      const res = await fetch("/api/reports/weekly/email", { method: "POST" });
      if (!res.ok) throw new Error("send failed");
      setSent("success");
    } catch {
      setSent("error");
    } finally {
      setSending(false);
    }
  };

  const weight = report.weight;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#fdf2f8] to-[#faf5ff] dark:from-gray-950 dark:to-gray-900 pb-20">
      <div className="max-w-2xl mx-auto px-4 pt-6">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-4">
          <ArrowLeft className="w-4 h-4" /> Retour
        </button>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="bg-gradient-to-br from-pink-500 to-purple-500 rounded-3xl p-6 text-white text-center shadow-lg">
          <div className="text-xs font-semibold uppercase tracking-wider opacity-90">MamaTrack · Bilan hebdo</div>
          <h1 className="text-3xl font-extrabold mt-1">Semaine {report.week} {report.weekData.fruitEmoji}</h1>
          <div className="text-sm opacity-95 mt-1">{report.periodStart} → {report.periodEnd}</div>
          {report.daysRemaining !== null && (
            <div className="text-sm opacity-90 mt-2">Plus que <strong>{report.daysRemaining} jours</strong> avant la rencontre 💕</div>
          )}
        </motion.div>

        {/* Baby development */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="mt-4 bg-white/80 dark:bg-gray-900/60 backdrop-blur rounded-3xl p-5 border border-pink-100 dark:border-pink-900/30">
          <div className="text-xs font-semibold uppercase tracking-wider text-pink-700 dark:text-pink-400">✨ Cette semaine pour {report.babyName ?? "bébé"}</div>
          <div className="mt-1 font-semibold text-[#3d2b2b] dark:text-gray-100">
            {report.weekData.fruit} {report.weekData.fruitEmoji}
            {report.weekData.sizeMm > 0 && ` · ${(report.weekData.sizeMm / 10).toFixed(1)} cm`}
            {report.weekData.weightG > 0 && ` · ${report.weekData.weightG}g`}
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 leading-relaxed">{report.weekData.babyDevelopment}</p>
        </motion.div>

        {/* Weight + Water */}
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="bg-pink-50 dark:bg-pink-950/30 rounded-2xl p-4 border border-pink-100 dark:border-pink-900/30">
            <div className="text-xs font-semibold uppercase tracking-wider text-pink-800 dark:text-pink-300">⚖️ Poids</div>
            <div className="text-2xl font-bold text-[#3d2b2b] dark:text-gray-100 mt-1">
              {weight.current !== null ? <>{weight.current} <span className="text-sm font-normal text-gray-400">kg</span></> : "—"}
            </div>
            {weight.delta !== null && (
              <div className={`text-xs flex items-center gap-1 mt-1 ${weight.delta > 0 ? "text-orange-500" : weight.delta < 0 ? "text-green-500" : "text-gray-400"}`}>
                {weight.delta > 0 ? <TrendingUp className="w-3 h-3" /> : weight.delta < 0 ? <TrendingDown className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
                {weight.delta > 0 ? "+" : ""}{weight.delta} kg
              </div>
            )}
          </div>
          <div className="bg-purple-50 dark:bg-purple-950/30 rounded-2xl p-4 border border-purple-100 dark:border-purple-900/30">
            <div className="text-xs font-semibold uppercase tracking-wider text-purple-800 dark:text-purple-300">💧 Hydratation</div>
            <div className="text-2xl font-bold text-[#3d2b2b] dark:text-gray-100 mt-1">{report.water.avgMl} <span className="text-sm font-normal text-gray-400">ml/j</span></div>
            <div className="w-full bg-purple-100 dark:bg-purple-900/30 rounded-full h-1.5 mt-2">
              <div className="bg-purple-400 h-1.5 rounded-full" style={{ width: `${report.water.percent}%` }} />
            </div>
            <div className="text-xs text-gray-400 mt-1">{report.water.percent}% de l'objectif</div>
          </div>
        </div>

        {report.symptoms.length > 0 && (
          <div className="mt-4 bg-green-50 dark:bg-green-950/30 rounded-2xl p-4 border border-green-100 dark:border-green-900/30">
            <div className="text-xs font-semibold uppercase tracking-wider text-green-800 dark:text-green-300">😣 Symptômes cette semaine</div>
            <div className="flex flex-wrap gap-2 mt-2">
              {report.symptoms.map((s) => (
                <span key={s} className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-3 py-1 rounded-full">{s}</span>
              ))}
            </div>
          </div>
        )}

        {report.kicks.sessions > 0 && (
          <div className="mt-4 bg-orange-50 dark:bg-orange-950/30 rounded-2xl p-4 border border-orange-100 dark:border-orange-900/30">
            <div className="text-xs font-semibold uppercase tracking-wider text-orange-800 dark:text-orange-300">👶 Mouvements de {report.babyName ?? "bébé"}</div>
            <div className="text-2xl font-bold text-[#3d2b2b] dark:text-gray-100 mt-1">
              {report.kicks.sessions} <span className="text-sm font-normal text-gray-400">session{report.kicks.sessions > 1 ? "s" : ""} · {report.kicks.totalMinutes} min</span>
            </div>
          </div>
        )}

        {report.nextAppointment && (
          <div className="mt-4 bg-blue-50 dark:bg-blue-950/30 rounded-2xl p-4 border border-blue-100 dark:border-blue-900/30">
            <div className="text-xs font-semibold uppercase tracking-wider text-blue-800 dark:text-blue-300">📅 Prochain rendez-vous</div>
            <div className="font-semibold text-[#3d2b2b] dark:text-gray-100 mt-1">{report.nextAppointment.title}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">{format(new Date(report.nextAppointment.date), "EEEE d MMMM", { locale: fr })} à {report.nextAppointment.time}</div>
          </div>
        )}

        {/* Weekly tip */}
        <div className="mt-4 bg-amber-50 dark:bg-amber-950/30 rounded-2xl p-4 border border-amber-100 dark:border-amber-900/30">
          <div className="text-xs font-semibold uppercase tracking-wider text-amber-800 dark:text-amber-300">💡 Conseil de la semaine</div>
          <p className="text-sm text-gray-700 dark:text-gray-200 mt-2 leading-relaxed">{report.weeklyTip}</p>
        </div>

        {/* Email CTA */}
        {user?.email && (
          <div className="mt-6 bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-200 dark:border-gray-800 text-center">
            <div className="text-sm text-gray-600 dark:text-gray-300 mb-3">Envoie-toi ce bilan par email pour le garder en mémoire 💌</div>
            <button
              onClick={handleSendEmail}
              disabled={sending || sent === "success"}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 text-white font-semibold disabled:opacity-60"
            >
              {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
              {sent === "success" ? "Envoyé ✓" : sending ? "Envoi..." : "M'envoyer par mail"}
            </button>
            {sent === "error" && <div className="text-xs text-red-500 mt-2">Échec de l'envoi. Réessaye dans un instant.</div>}
            {sent === "success" && <div className="text-xs text-green-600 mt-2">Check ta boîte ({user.email}) 📬</div>}
          </div>
        )}
      </div>
    </div>
  );
}
