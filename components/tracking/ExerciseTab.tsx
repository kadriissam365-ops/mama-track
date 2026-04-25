"use client";

import { useState } from "react";
import { m as motion } from "framer-motion";
import { useStore } from "@/lib/store";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Trash2 } from "lucide-react";
import ConfirmDialog from "@/components/ConfirmDialog";

const ACTIVITIES = [
  { emoji: "🚶‍♀️", label: "Marche", id: "marche" },
  { emoji: "🧘", label: "Yoga prénatal", id: "yoga" },
  { emoji: "🏊‍♀️", label: "Natation", id: "natation" },
  { emoji: "🤸‍♀️", label: "Pilates", id: "pilates" },
  { emoji: "🚴‍♀️", label: "Vélo", id: "velo" },
  { emoji: "💃", label: "Danse", id: "danse" },
  { emoji: "🏋️‍♀️", label: "Renforcement", id: "renforcement" },
  { emoji: "🧘‍♀️", label: "Étirements", id: "etirements" },
  { emoji: "🫁", label: "Respiration", id: "respiration" },
  { emoji: "🏃‍♀️", label: "Jogging léger", id: "jogging" },
  { emoji: "🧹", label: "Ménage actif", id: "menage" },
  { emoji: "✨", label: "Autre", id: "autre" },
];

const INTENSITIES = [
  { id: "leger", label: "Léger", emoji: "💚", color: "bg-green-100 dark:bg-green-900/30 border-green-300" },
  { id: "modere", label: "Modéré", emoji: "💛", color: "bg-yellow-100 dark:bg-yellow-900/30 border-yellow-300" },
  { id: "intense", label: "Intense", emoji: "🧡", color: "bg-orange-100 dark:bg-orange-900/30 border-orange-300" },
];

export default function ExerciseTab() {
  const store = useStore();
  const entries = store.exerciseSessions;
  const loading = store.loading;

  const [selectedActivity, setSelectedActivity] = useState<string | null>(null);
  const [duration, setDuration] = useState("30");
  const [intensity, setIntensity] = useState("modere");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  async function handleSave() {
    if (!selectedActivity) return;
    setSaving(true);
    const today = format(new Date(), "yyyy-MM-dd");
    const dur = parseInt(duration);
    const safeDur = isNaN(dur) || dur < 1 ? 30 : Math.min(dur, 600);
    const trimmedNote = note.trim();

    await store.addExerciseSession({
      date: today,
      activity: selectedActivity,
      durationMin: safeDur,
      intensity,
      note: trimmedNote || undefined,
    });

    setSaving(false);
    setSelectedActivity(null);
    setNote("");
    setSuccess(true);
    setTimeout(() => setSuccess(false), 2000);
  }

  async function handleDelete(id: string) {
    await store.deleteExerciseSession(id);
    setConfirmDelete(null);
  }

  const today = format(new Date(), "yyyy-MM-dd");
  const todayEntries = entries.filter((e) => e.date === today);
  const todayMinutes = todayEntries.reduce((sum, e) => sum + e.durationMin, 0);

  const weekEntries = entries.filter((e) => {
    const d = new Date(e.date);
    const now = new Date();
    const diff = (now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24);
    return diff < 7;
  });
  const weekMinutes = weekEntries.reduce((sum, e) => sum + e.durationMin, 0);
  const weekGoal = 150;
  const weekPct = Math.min(100, (weekMinutes / weekGoal) * 100);

  const activityMap = new Map(ACTIVITIES.map((a) => [a.id, a]));

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="space-y-4"
    >
      <div className="bg-white dark:bg-gray-900 rounded-3xl p-5 shadow-sm border border-emerald-100">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-[#3d2b2b] dark:text-gray-100">Objectif semaine</h3>
          <span className="text-xs text-gray-400 dark:text-gray-500">{weekMinutes} / {weekGoal} min</span>
        </div>
        <div className="w-full bg-emerald-100 rounded-full h-3 mb-1">
          <motion.div
            className="h-3 rounded-full bg-emerald-400"
            initial={{ width: 0 }}
            animate={{ width: `${weekPct}%` }}
            transition={{ duration: 0.8 }}
          />
        </div>
        <p className="text-xs text-gray-400 dark:text-gray-500">
          {weekPct >= 100
            ? "🎉 Objectif atteint !"
            : `Recommandation OMS : 150 min d'activité modérée/semaine`}
        </p>

        {todayMinutes > 0 && (
          <div className="mt-2 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl px-3 py-2 text-center">
            <span className="text-sm font-semibold text-emerald-600">
              Aujourd&apos;hui : {todayMinutes} min ({todayEntries.length} activité{todayEntries.length > 1 ? "s" : ""})
            </span>
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-3xl p-5 shadow-sm border border-emerald-100">
        <h3 className="font-semibold text-[#3d2b2b] dark:text-gray-100 mb-3">Ajouter une activité</h3>

        <div className="grid grid-cols-4 gap-2 mb-3">
          {ACTIVITIES.map((act) => (
            <button
              key={act.id}
              onClick={() => setSelectedActivity(act.id)}
              className={`flex flex-col items-center py-2 px-1 rounded-2xl border-2 transition-all ${
                selectedActivity === act.id
                  ? "bg-emerald-100 border-emerald-300 scale-105 shadow-md"
                  : "border-gray-100 dark:border-gray-800 hover:border-emerald-200 bg-gray-50 dark:bg-gray-800"
              }`}
            >
              <span className="text-xl">{act.emoji}</span>
              <span className="text-[9px] text-gray-500 dark:text-gray-400 mt-0.5 text-center leading-tight">{act.label}</span>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Durée (min)</label>
            <input
              type="number"
              min="5"
              max="600"
              step="5"
              inputMode="numeric"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="w-full border border-emerald-200 dark:border-gray-600 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 dark:bg-gray-800 dark:text-white"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Intensité</label>
            <div className="flex gap-1">
              {INTENSITIES.map((int) => (
                <button
                  key={int.id}
                  onClick={() => setIntensity(int.id)}
                  className={`flex-1 py-2 rounded-xl border-2 text-center transition-all ${
                    intensity === int.id
                      ? `${int.color} shadow-sm`
                      : "border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800"
                  }`}
                >
                  <span className="text-sm">{int.emoji}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <textarea
          placeholder="Notes (optionnel)"
          value={note}
          onChange={(e) => setNote(e.target.value.slice(0, 200))}
          rows={2}
          className="w-full border border-emerald-200 dark:border-gray-600 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 resize-none mb-2 dark:bg-gray-800 dark:text-white"
        />

        <button
          onClick={handleSave}
          disabled={!selectedActivity || saving}
          className="w-full bg-emerald-400 text-white py-2.5 rounded-xl text-sm font-medium disabled:opacity-50 hover:bg-emerald-50 dark:bg-emerald-500 transition-colors"
        >
          {saving ? "…" : success ? "✓ Ajoutée !" : "Ajouter l'activité"}
        </button>
      </div>

      {weekEntries.length > 0 && (
        <div className="bg-white dark:bg-gray-900 rounded-3xl p-4 shadow-sm border border-emerald-100">
          <h3 className="text-sm font-semibold text-[#3d2b2b] dark:text-gray-100 mb-3">Cette semaine</h3>
          <div className="flex gap-1.5 items-end justify-around">
            {Array.from({ length: 7 }).map((_, i) => {
              const d = new Date();
              d.setDate(d.getDate() - (6 - i));
              const dateStr = format(d, "yyyy-MM-dd");
              const dayEntries = entries.filter((e) => e.date === dateStr);
              const dayMins = dayEntries.reduce((sum, e) => sum + e.durationMin, 0);
              const barH = Math.max(4, (dayMins / 60) * 80);
              return (
                <div key={i} className="flex flex-col items-center flex-1">
                  {dayMins > 0 && (
                    <span className="text-[9px] text-gray-500 dark:text-gray-400 mb-0.5">{dayMins}m</span>
                  )}
                  <div
                    className={`w-full rounded-t-lg ${dayMins > 0 ? "bg-emerald-300" : "bg-gray-100 dark:bg-gray-800"}`}
                    style={{ height: `${barH}px` }}
                  />
                  <span className="text-[9px] text-gray-400 dark:text-gray-500 mt-0.5">
                    {format(d, "EEE", { locale: fr }).slice(0, 2)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {!loading && entries.length === 0 && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl px-4 py-6 text-center border border-emerald-100">
          <p className="text-2xl mb-1">🚶‍♀️</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Aucune activité enregistrée. Ajoutez votre première séance ci-dessus.
          </p>
        </div>
      )}

      {!loading && entries.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-[#3d2b2b] dark:text-gray-100 px-1">Dernières activités</h3>
          {entries.slice(0, 10).map((entry) => {
            const act = activityMap.get(entry.activity);
            const int = INTENSITIES.find((i) => i.id === entry.intensity);
            return (
              <div
                key={entry.id}
                className="bg-white dark:bg-gray-900 rounded-2xl px-4 py-3 shadow-sm border border-emerald-100 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{act?.emoji ?? "✨"}</span>
                  <div>
                    <p className="text-sm font-semibold text-[#3d2b2b] dark:text-gray-100">
                      {act?.label ?? entry.activity} · {entry.durationMin} min {int?.emoji}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      {format(new Date(entry.date), "d MMMM yyyy", { locale: fr })}
                      {entry.note && ` — ${entry.note}`}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setConfirmDelete(entry.id)}
                  className="text-gray-300 dark:text-gray-500 hover:text-red-400 transition-colors flex-shrink-0"
                  aria-label="Supprimer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      <ConfirmDialog
        isOpen={confirmDelete !== null}
        title="Supprimer cette activité ?"
        message="Cette action est irréversible."
        onConfirm={() => confirmDelete && handleDelete(confirmDelete)}
        onCancel={() => setConfirmDelete(null)}
      />
    </motion.div>
  );
}
