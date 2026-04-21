"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useStore } from "@/lib/store";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Moon, Trash2 } from "lucide-react";
import ConfirmDialog from "@/components/ConfirmDialog";

const QUALITY_LABELS = ["", "Très mal", "Mal", "Moyen", "Bien", "Très bien"];
const QUALITY_EMOJIS = ["", "😫", "😣", "😐", "😊", "😴"];
const QUALITY_COLORS = [
  "",
  "bg-red-100 dark:bg-red-900/30 border-red-300 dark:border-red-700",
  "bg-orange-100 dark:bg-orange-900/30 border-orange-300",
  "bg-yellow-100 dark:bg-yellow-900/30 border-yellow-300",
  "bg-green-100 dark:bg-green-900/30 border-green-300",
  "bg-indigo-100 dark:bg-indigo-900/30 border-indigo-300",
];

function calcHours(bedtime: string, waketime: string): number {
  const [bh, bm] = bedtime.split(":").map(Number);
  const [wh, wm] = waketime.split(":").map(Number);
  let mins = (wh * 60 + wm) - (bh * 60 + bm);
  if (mins <= 0) mins += 24 * 60;
  return Math.round((mins / 60) * 10) / 10;
}

function formatHours(hours: number): string {
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  return `${h}h${m > 0 ? m.toString().padStart(2, "0") : ""}`;
}

export default function SleepTab() {
  const store = useStore();
  const entries = store.sleepEntries;
  const loading = store.loading;

  const [bedtime, setBedtime] = useState("22:30");
  const [waketime, setWaketime] = useState("07:00");
  const [quality, setQuality] = useState(3);
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const today = format(new Date(), "yyyy-MM-dd");

  async function handleSave() {
    setSaving(true);
    const hours = calcHours(bedtime, waketime);
    const trimmedNote = note.trim();
    await store.addSleepEntry({
      date: today,
      hours,
      quality,
      note: trimmedNote || undefined,
    });
    setSaving(false);
    setSuccess(true);
    setNote("");
    setTimeout(() => setSuccess(false), 2000);
  }

  async function handleDelete(id: string) {
    await store.deleteSleepEntry(id);
    setConfirmDelete(null);
  }

  const duration = calcHours(bedtime, waketime);
  const avgDuration = entries.length > 0
    ? entries.reduce((sum, e) => sum + e.hours, 0) / entries.length
    : 0;
  const avgQuality = entries.length > 0
    ? (entries.reduce((sum, e) => sum + e.quality, 0) / entries.length).toFixed(1)
    : "—";

  const todayEntry = entries.find((e) => e.date === today);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="space-y-4"
    >
      <div className="bg-white dark:bg-gray-900 rounded-3xl p-5 shadow-sm border border-indigo-100 dark:border-indigo-900/30">
        <div className="flex items-center gap-2 mb-3">
          <Moon className="w-5 h-5 text-indigo-400" />
          <h3 className="font-semibold text-[#3d2b2b] dark:text-gray-100">Sommeil d&apos;aujourd&apos;hui</h3>
        </div>

        {todayEntry && (
          <p className="text-xs text-gray-400 dark:text-gray-500 mb-3">
            Déjà enregistré : {formatHours(todayEntry.hours)} — {QUALITY_EMOJIS[todayEntry.quality]} {QUALITY_LABELS[todayEntry.quality]}
          </p>
        )}

        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Coucher</label>
            <input
              type="time"
              value={bedtime}
              onChange={(e) => setBedtime(e.target.value)}
              className="w-full border border-indigo-200 dark:border-gray-600 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 dark:bg-gray-800 dark:text-white"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Réveil</label>
            <input
              type="time"
              value={waketime}
              onChange={(e) => setWaketime(e.target.value)}
              className="w-full border border-indigo-200 dark:border-gray-600 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 dark:bg-gray-800 dark:text-white"
            />
          </div>
        </div>

        <div className="bg-indigo-50 dark:bg-indigo-950/30 rounded-2xl px-4 py-2 mb-3 text-center">
          <span className="text-2xl font-bold text-indigo-500">{formatHours(duration)}</span>
          <span className="text-xs text-gray-400 dark:text-gray-500 ml-1">de sommeil</span>
        </div>

        <label className="text-xs text-gray-500 dark:text-gray-400 mb-1.5 block">Qualité du sommeil</label>
        <div className="flex gap-1.5 mb-3">
          {[1, 2, 3, 4, 5].map((q) => (
            <button
              key={q}
              onClick={() => setQuality(q)}
              className={`flex-1 flex flex-col items-center py-2 rounded-2xl border-2 transition-all ${
                quality === q
                  ? `${QUALITY_COLORS[q]} scale-105 shadow-md`
                  : "border-gray-100 dark:border-gray-800 hover:border-indigo-200 bg-gray-50 dark:bg-gray-800"
              }`}
            >
              <span className="text-lg">{QUALITY_EMOJIS[q]}</span>
              <span className="text-[9px] text-gray-500 dark:text-gray-400 mt-0.5">{QUALITY_LABELS[q]}</span>
            </button>
          ))}
        </div>

        <textarea
          placeholder="Rêves, insomnies, douleurs... (optionnel)"
          value={note}
          onChange={(e) => setNote(e.target.value.slice(0, 200))}
          rows={2}
          className="w-full border border-indigo-200 dark:border-gray-600 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none mb-2 dark:bg-gray-800 dark:text-white"
        />

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-indigo-400 text-white py-2.5 rounded-xl text-sm font-medium disabled:opacity-50 hover:bg-indigo-50 dark:bg-indigo-500 transition-colors"
        >
          {saving ? "…" : success ? "✓ Enregistré !" : "Enregistrer"}
        </button>
      </div>

      {entries.length > 0 && (
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-sm border border-indigo-100 dark:border-indigo-900/30 text-center">
            <p className="text-2xl font-bold text-indigo-500">{formatHours(avgDuration)}</p>
            <p className="text-xs text-gray-400 dark:text-gray-500">Moyenne / nuit</p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-sm border border-indigo-100 dark:border-indigo-900/30 text-center">
            <p className="text-2xl font-bold text-indigo-500">{avgQuality}/5</p>
            <p className="text-xs text-gray-400 dark:text-gray-500">Qualité moyenne</p>
          </div>
        </div>
      )}

      {entries.length > 1 && (
        <div className="bg-white dark:bg-gray-900 rounded-3xl p-4 shadow-sm border border-indigo-100 dark:border-indigo-900/30">
          <h3 className="text-sm font-semibold text-[#3d2b2b] dark:text-gray-100 mb-3">Historique</h3>
          <div className="overflow-x-auto">
            <div className="flex gap-1.5 items-end" style={{ minWidth: `${Math.min(entries.length, 14) * 36}px` }}>
              {[...entries].reverse().slice(-14).map((e) => {
                const maxH = 12;
                const barH = Math.max(20, (e.hours / maxH) * 120);
                return (
                  <div key={e.id} className="flex flex-col items-center flex-1 min-w-[28px]">
                    <span className="text-[9px] text-gray-500 dark:text-gray-400 mb-0.5">{formatHours(e.hours)}</span>
                    <div
                      className="w-full rounded-t-lg bg-indigo-200"
                      style={{ height: `${barH}px` }}
                    >
                      <div
                        className="w-full rounded-t-lg"
                        style={{
                          height: "100%",
                          background: e.quality >= 4 ? "#818cf8" : e.quality >= 3 ? "#a5b4fc" : "#fca5a5",
                        }}
                      />
                    </div>
                    <span className="text-[8px] text-gray-400 dark:text-gray-500 mt-0.5">
                      {format(new Date(e.date), "dd/MM")}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {!loading && entries.length === 0 && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl px-4 py-6 text-center border border-indigo-100 dark:border-indigo-900/30">
          <Moon className="w-6 h-6 mx-auto mb-2 text-indigo-300" />
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Aucune nuit enregistrée. Notez votre première nuit ci-dessus.
          </p>
        </div>
      )}

      {!loading && entries.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-[#3d2b2b] dark:text-gray-100 px-1">Dernières nuits</h3>
          {entries.slice(0, 7).map((entry) => (
            <div
              key={entry.id}
              className="bg-white dark:bg-gray-900 rounded-2xl px-4 py-3 shadow-sm border border-indigo-100 dark:border-indigo-900/30 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{QUALITY_EMOJIS[entry.quality]}</span>
                <div>
                  <p className="text-sm font-semibold text-[#3d2b2b] dark:text-gray-100">
                    {formatHours(entry.hours)} — {QUALITY_LABELS[entry.quality]}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    {format(new Date(entry.date), "d MMMM yyyy", { locale: fr })}
                  </p>
                  {entry.note && <p className="text-xs text-gray-400 dark:text-gray-500 italic">{entry.note}</p>}
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
          ))}
        </div>
      )}

      <ConfirmDialog
        isOpen={confirmDelete !== null}
        title="Supprimer cette entrée ?"
        message="Cette action est irréversible."
        onConfirm={() => confirmDelete && handleDelete(confirmDelete)}
        onCancel={() => setConfirmDelete(null)}
      />
    </motion.div>
  );
}
