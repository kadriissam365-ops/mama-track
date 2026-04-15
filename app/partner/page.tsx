"use client";
import { useStore } from "@/lib/store";
import { useAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase";
import { getCurrentWeek, getDaysRemaining, getWeekData, getProgressPercent } from "@/lib/pregnancy-data";
import { getJournalNotes, type JournalNote } from "@/lib/supabase-api";
import { motion } from "framer-motion";
import {
  Heart,
  Calendar,
  Baby,
  Smile,
  Send,
  CheckCircle2,
  Activity,
  BookOpen,
  ListChecks,
  Droplets,
  Loader2,
  ArrowLeft,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { WATER_GOAL_ML } from "@/lib/constants";
import { useTranslation } from "@/lib/i18n";

// ---------- partner tips (unchanged) ----------

const partnerTips: Record<string, string[]> = {
  early: [
    "Les nausées sont normales. Proposez-lui des crackers le matin avant qu'elle se lève.",
    "L'annonce peut attendre — suivez son rythme, pas la pression sociale.",
    "La fatigue du 1er trimestre est intense. Prenez le relais sur les tâches ménagères.",
    "Accompagnez-la à la première échographie. C'est un moment magique.",
  ],
  mid: [
    "C'est le bon moment pour préparer la chambre ensemble.",
    "Les envies alimentaires sont réelles. Ne jugez pas, proposez !",
    "Posez votre main sur son ventre quand bébé bouge — partagez ce moment.",
    "Commencez à réfléchir aux prénoms ensemble, c'est un moment fun.",
  ],
  late: [
    "Préparez le sac de maternité ensemble et sachez où est la maternité.",
    "Restez joignable. Le travail peut commencer à tout moment.",
    "Massez-lui le dos et les pieds — elle en a besoin.",
    "Photographiez ces derniers moments à deux, ils sont précieux.",
  ],
  final: [
    "Gardez votre téléphone chargé et votre voiture prête.",
    "Respirez. Vous êtes un(e) super partenaire. Tout va bien se passer.",
    "Le jour J : soyez présent(e), tenez-lui la main, encouragez-la.",
    "Après la naissance : le peau-à-peau est aussi pour vous !",
  ],
};

function getTipCategory(week: number): string {
  if (week < 14) return "early";
  if (week < 28) return "mid";
  if (week < 36) return "late";
  return "final";
}

// ---------- mood entries (loaded from supabase directly) ----------

interface MoodEntry {
  id: string;
  mood_emoji: string;
  mood_label: string;
  note?: string;
  date: string;
}

const ENCOURAGEMENT_MESSAGES = [
  { emoji: "❤️", text: "Je pense à toi" },
  { emoji: "💪", text: "Tu gères !" },
  { emoji: "🤗", text: "Câlin virtuel" },
  { emoji: "🌟", text: "Tu es incroyable" },
  { emoji: "☕", text: "Besoin de quelque chose ?" },
];

// ---------- main component ----------

export default function PartnerViewPage() {
  const store = useStore();
  const { user } = useAuth();
  const router = useRouter();

  const { t } = useTranslation();
  const [supportSent, setSupportSent] = useState<string | null>(null);
  const [journalNotes, setJournalNotes] = useState<JournalNote[]>([]);
  const [moodEntries, setMoodEntries] = useState<MoodEntry[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [showAllChecklist, setShowAllChecklist] = useState(false);

  // Pregnancy data derived from store
  const dueDate = store.dueDate ? new Date(store.dueDate) : null;
  const week = dueDate ? getCurrentWeek(dueDate) : 20;
  const days = dueDate ? getDaysRemaining(dueDate) : null;
  const weekData = getWeekData(week);
  const progress = dueDate ? getProgressPercent(dueDate) : 50;

  const category = getTipCategory(week);
  const tipKeys: Record<string, string[]> = {
    early: ["partner.earlyTip1", "partner.earlyTip2", "partner.earlyTip3", "partner.earlyTip4"],
    mid: ["partner.midTip1", "partner.midTip2", "partner.midTip3", "partner.midTip4"],
    late: ["partner.lateTip1", "partner.lateTip2", "partner.lateTip3", "partner.lateTip4"],
    final: ["partner.finalTip1", "partner.finalTip2", "partner.finalTip3", "partner.finalTip4"],
  };
  const keys = tipKeys[category];
  const tipOfDay = t(keys[new Date().getDate() % keys.length]);

  // Today helpers
  const todayStr = new Date().toISOString().slice(0, 10);
  const todayWater = store.waterIntake?.[todayStr] ?? 0;
  const waterPercent = Math.min(100, Math.round((todayWater / WATER_GOAL_ML) * 100));

  const todaySymptoms = store.symptomEntries.filter(
    (e) => new Date(e.date).toDateString() === new Date().toDateString()
  );

  const lastKick =
    store.kickSessions.length > 0
      ? store.kickSessions[store.kickSessions.length - 1]
      : null;

  // Appointments: next 3 upcoming
  const upcomingAppointments = store.appointments
    .filter((a) => !a.done && new Date(a.date) >= new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 3);

  // Checklist stats
  const pendingChecklist = store.checklistItems.filter((c) => !c.done).length;
  const totalChecklist = store.checklistItems.length;
  const doneChecklist = totalChecklist - pendingChecklist;
  const checklistPercent = totalChecklist > 0 ? Math.round((doneChecklist / totalChecklist) * 100) : 0;

  // Checklist by category (for detailed view)
  const checklistByCategory = store.checklistItems.reduce<Record<string, typeof store.checklistItems>>((acc, item) => {
    const cat = item.category ?? "Autre";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {});

  // Recent mood entries (last 7 days)
  const recentMoods = moodEntries
    .filter((m) => {
      const diff = (Date.now() - new Date(m.date).getTime()) / 86400000;
      return diff <= 7;
    })
    .sort((a, b) => b.date.localeCompare(a.date));

  // Load journal notes + mood entries from Supabase
  useEffect(() => {
    async function loadPartnerData() {
      setDataLoading(true);
      try {
        // Load journal notes (we pass user id -- works when partner has shared access)
        if (user) {
          const notes = await getJournalNotes(user.id);
          setJournalNotes(notes.slice(-10).reverse()); // last 10, newest first

          // Load mood entries
          try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const supabase = createClient() as any;
            const { data } = await supabase
              .from("mood_entries")
              .select("*")
              .eq("user_id", user.id)
              .order("date", { ascending: false })
              .limit(14);
            if (data) setMoodEntries(data);
          } catch {
            // mood table may not exist yet
          }
        }
      } catch {
        // fallback: no extra data
      } finally {
        setDataLoading(false);
      }
    }
    loadPartnerData();
  }, [user]);

  const handleSendEncouragement = (text: string) => {
    setSupportSent(text);
    // Store the message in localStorage for the duo chat
    try {
      const storageKey = user ? `duo-messages-${user.id}` : "duo-messages-local";
      const existing = JSON.parse(localStorage.getItem(storageKey) || "[]");
      existing.push({
        id: crypto.randomUUID(),
        senderId: user?.id ?? "partner",
        content: text,
        createdAt: new Date().toISOString(),
        isOwn: true,
      });
      localStorage.setItem(storageKey, JSON.stringify(existing));
    } catch {
      // ignore
    }
    setTimeout(() => setSupportSent(null), 2500);
  };

  const anim = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } };

  return (
    <div className="max-w-lg mx-auto px-4 py-8 space-y-5">
      {/* Back button */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1.5 text-sm text-teal-600 hover:text-teal-800 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> {t("common.back")}
      </button>

      {/* Header */}
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-teal-400 to-blue-500 rounded-3xl flex items-center justify-center mx-auto mb-3 shadow-lg">
          <Heart className="w-8 h-8 text-white fill-white" />
        </div>
        <h1 className="text-2xl font-bold text-[#2b3d3d]">{t("partner.title")}</h1>
        {store.mamaName && (
          <p className="text-gray-500 mt-1">
            {t("partner.pregnancyOf")} <span className="font-semibold text-teal-600">{store.mamaName}</span>
          </p>
        )}
      </div>

      {/* Week + Size + Progress Hero */}
      <motion.div
        {...anim}
        className="bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50 rounded-3xl p-6 text-center border border-teal-100 shadow-sm"
      >
        <motion.div
          animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
          transition={{ repeat: Infinity, duration: 4 }}
          className="text-7xl mb-3"
        >
          {weekData.fruitEmoji}
        </motion.div>
        <h2 className="text-5xl font-bold text-[#2b3d3d]">
          {week} <span className="text-2xl text-teal-500">{t("partner.week")}</span>
        </h2>
        <p className="text-gray-500 mt-1">
          {store.babyName || "Baby"} : {t("partner.likeFruit")} {weekData.fruit}
        </p>
        <div className="flex justify-center gap-4 mt-2 text-xs text-gray-400">
          <span>📏 {weekData.sizeMm} mm</span>
          <span>⚖️ {weekData.weightG} g</span>
        </div>
        {days !== null && (
          <div className="mt-3 bg-white rounded-2xl px-4 py-2 inline-block shadow-sm">
            <span className="text-2xl font-bold text-teal-600">{days}</span>
            <span className="text-sm text-gray-400 ml-1">
              {t("partner.daysBefore")}{store.babyName ? ` ${store.babyName}` : ""}
            </span>
          </div>
        )}
        {/* Progress bar */}
        <div className="mt-4 mx-auto max-w-xs">
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span>{t("partner.start")}</span>
            <span>{Math.round(progress)}%</span>
            <span>{t("partner.birth")}</span>
          </div>
          <div className="h-2.5 bg-white rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="h-full bg-gradient-to-r from-teal-400 to-blue-400 rounded-full"
            />
          </div>
        </div>
      </motion.div>

      {/* Baby development */}
      <motion.div
        {...anim}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-3xl p-5 shadow-sm border border-teal-100"
      >
        <h3 className="font-semibold text-[#2b3d3d] mb-2 flex items-center gap-2">
          <Baby className="w-5 h-5 text-teal-500" /> {t("partner.babyDev")}
        </h3>
        <p className="text-sm text-gray-600 leading-relaxed">{weekData.babyDevelopment}</p>
      </motion.div>

      {/* Upcoming Appointments */}
      <motion.div {...anim} transition={{ delay: 0.15 }} className="bg-white rounded-3xl p-5 shadow-sm border border-blue-100">
        <h3 className="font-semibold text-[#2b3d3d] mb-3 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-blue-500" /> {t("partner.nextAppt")}
        </h3>
        {upcomingAppointments.length > 0 ? (
          <div className="space-y-2">
            {upcomingAppointments.map((appt) => (
              <div key={appt.id} className="flex items-center gap-3 bg-blue-50 rounded-2xl px-4 py-3">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
                  <Calendar className="w-5 h-5 text-blue-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-[#2b3d3d] text-sm truncate">{appt.title}</p>
                  <p className="text-xs text-gray-400">
                    {appt.date} {appt.time ? `à ${appt.time}` : ""}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-400 text-center py-3">{t("dashboard.noAppt")}</p>
        )}
      </motion.div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-3 gap-3">
        {/* Hydration */}
        <motion.div
          {...anim}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl p-3 shadow-sm border border-cyan-100 text-center"
        >
          <Droplets className="w-5 h-5 text-cyan-500 mx-auto mb-1" />
          <p className="text-lg font-bold text-[#2b3d3d]">{waterPercent}%</p>
          <p className="text-[10px] text-gray-400">{t("partner.hydration")}</p>
          <div className="h-1 bg-cyan-50 rounded-full mt-1.5 overflow-hidden">
            <div className="h-full bg-cyan-400 rounded-full transition-all" style={{ width: `${waterPercent}%` }} />
          </div>
        </motion.div>

        {/* Baby kicks */}
        <motion.div
          {...anim}
          transition={{ delay: 0.25 }}
          className="bg-white rounded-2xl p-3 shadow-sm border border-emerald-100 text-center"
        >
          <Activity className="w-5 h-5 text-emerald-500 mx-auto mb-1" />
          <p className="text-lg font-bold text-[#2b3d3d]">
            {lastKick ? lastKick.count : "—"}
          </p>
          <p className="text-[10px] text-gray-400">{t("partner.movements")}</p>
        </motion.div>

        {/* Checklist */}
        <motion.div
          {...anim}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl p-3 shadow-sm border border-blue-100 text-center cursor-pointer hover:border-blue-300 transition-colors"
          onClick={() => setShowAllChecklist(!showAllChecklist)}
        >
          <CheckCircle2 className="w-5 h-5 text-blue-500 mx-auto mb-1" />
          <p className="text-lg font-bold text-[#2b3d3d]">
            {doneChecklist}
            <span className="text-xs font-normal text-gray-400">/{totalChecklist}</span>
          </p>
          <p className="text-[10px] text-gray-400">Checklist</p>
        </motion.div>
      </div>

      {/* Checklist Progress Detail (expandable) */}
      {showAllChecklist && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="bg-white rounded-3xl p-5 shadow-sm border border-blue-100 overflow-hidden"
        >
          <h3 className="font-semibold text-[#2b3d3d] mb-3 flex items-center gap-2">
            <ListChecks className="w-5 h-5 text-blue-500" /> Checklist — {checklistPercent}% complété
          </h3>
          <div className="h-2 bg-blue-50 rounded-full overflow-hidden mb-4">
            <div
              className="h-full bg-gradient-to-r from-teal-400 to-blue-400 rounded-full transition-all"
              style={{ width: `${checklistPercent}%` }}
            />
          </div>
          <div className="space-y-3">
            {Object.entries(checklistByCategory).map(([cat, items]) => {
              const catDone = items.filter((i) => i.done).length;
              return (
                <div key={cat}>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                    {cat} ({catDone}/{items.length})
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {items.map((item) => (
                      <span
                        key={item.id}
                        className={`text-xs px-2.5 py-1 rounded-full ${
                          item.done
                            ? "bg-teal-50 text-teal-600 line-through opacity-70"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {item.done ? "✓ " : ""}{item.label}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Mood / Symptom Summary */}
      <motion.div {...anim} transition={{ delay: 0.35 }} className="bg-white rounded-3xl p-5 shadow-sm border border-violet-100">
        <h3 className="font-semibold text-[#2b3d3d] mb-3 flex items-center gap-2">
          <Smile className="w-5 h-5 text-violet-500" /> Humeur et symptômes
        </h3>

        {/* Mood summary (last 7 days) */}
        {recentMoods.length > 0 ? (
          <div className="mb-3">
            <p className="text-xs text-gray-400 mb-2">Humeur des 7 derniers jours</p>
            <div className="flex gap-2 flex-wrap">
              {recentMoods.map((m) => (
                <div
                  key={m.id}
                  className="flex items-center gap-1.5 bg-violet-50 rounded-full px-3 py-1.5"
                >
                  <span className="text-base">{m.mood_emoji}</span>
                  <span className="text-xs text-violet-600">{m.mood_label}</span>
                  <span className="text-[10px] text-gray-400">
                    {new Date(m.date).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          !dataLoading && (
            <p className="text-sm text-gray-400 mb-3">Pas de données d&apos;humeur récentes</p>
          )
        )}

        {/* Today's symptoms */}
        {todaySymptoms.length > 0 ? (
          <div>
            <p className="text-xs text-gray-400 mb-2">Symptômes aujourd&apos;hui</p>
            <div className="flex flex-wrap gap-2">
              {todaySymptoms.map((s, i) => (
                <span key={i} className="bg-violet-50 text-violet-600 text-xs px-3 py-1.5 rounded-full">
                  {Array.isArray(s.symptoms) ? (s.symptoms as string[]).join(', ') : String(s.symptoms)}
                </span>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-400">Aucun symptôme enregistré aujourd&apos;hui</p>
        )}

        {dataLoading && (
          <div className="flex justify-center py-2">
            <Loader2 className="w-5 h-5 text-violet-300 animate-spin" />
          </div>
        )}
      </motion.div>

      {/* Recent Journal Entries (read-only) */}
      <motion.div {...anim} transition={{ delay: 0.4 }} className="bg-white rounded-3xl p-5 shadow-sm border border-amber-100">
        <h3 className="font-semibold text-[#2b3d3d] mb-3 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-amber-500" /> Journal intime
        </h3>
        {dataLoading ? (
          <div className="flex justify-center py-4">
            <Loader2 className="w-5 h-5 text-amber-300 animate-spin" />
          </div>
        ) : journalNotes.length > 0 ? (
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {journalNotes.slice(0, 5).map((note) => (
              <div key={note.id} className="bg-amber-50 rounded-2xl px-4 py-3">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    {note.mood_emoji && <span className="text-base">{note.mood_emoji}</span>}
                    {note.title && (
                      <span className="text-sm font-medium text-[#2b3d3d]">{note.title}</span>
                    )}
                  </div>
                  <span className="text-[10px] text-gray-400">
                    {new Date(note.created_at).toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "short",
                    })}
                  </span>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">{note.body}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-400 text-center py-3">Aucune entrée de journal</p>
        )}
      </motion.div>

      {/* Partner Tip of the Day */}
      <motion.div
        {...anim}
        transition={{ delay: 0.45 }}
        className="bg-gradient-to-r from-teal-50 to-blue-50 rounded-3xl p-5 border border-teal-100"
      >
        <p className="text-xs font-semibold text-teal-600 mb-2 flex items-center gap-1.5">
          💡 Conseil du jour pour vous
        </p>
        <p className="text-sm text-gray-600 leading-relaxed">{tipOfDay}</p>
        {weekData.partnerTip && (
          <p className="text-sm text-gray-500 leading-relaxed mt-2 pt-2 border-t border-teal-100">
            {weekData.partnerTip}
          </p>
        )}
      </motion.div>

      {/* Quick Actions: Send Encouragement */}
      <motion.div {...anim} transition={{ delay: 0.5 }} className="bg-white rounded-3xl p-5 shadow-sm border border-teal-100">
        <h3 className="font-semibold text-[#2b3d3d] mb-3 flex items-center gap-2">
          <Send className="w-5 h-5 text-teal-500" /> Envoyer un encouragement
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {ENCOURAGEMENT_MESSAGES.map((msg) => (
            <button
              key={msg.text}
              onClick={() => handleSendEncouragement(`${msg.emoji} ${msg.text}`)}
              disabled={supportSent !== null}
              className={`text-sm rounded-2xl px-3 py-3 font-medium transition-all ${
                supportSent === `${msg.emoji} ${msg.text}`
                  ? "bg-teal-100 text-teal-700 scale-95"
                  : "bg-teal-50 text-teal-700 hover:bg-teal-100 active:scale-95"
              }`}
            >
              <span className="text-lg block mb-0.5">{msg.emoji}</span>
              {msg.text}
            </button>
          ))}
        </div>
        {supportSent && (
          <motion.p
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center text-sm text-teal-600 mt-3 font-medium"
          >
            ✓ Message envoyé avec amour
          </motion.p>
        )}
      </motion.div>

      <p className="text-center text-xs text-gray-300 pb-4">MamaTrack · Vue partenaire</p>
    </div>
  );
}
