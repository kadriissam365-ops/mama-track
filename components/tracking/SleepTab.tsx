"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Moon, Trash2 } from "lucide-react";
import ConfirmDialog from "@/components/ConfirmDialog";

interface SleepEntry {
  id: string;
  date: string;
  bedtime: string;
  waketime: string;
  quality: number;
  naps_minutes: number;
  night_wakings: number;
  note?: string;
}

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

function calcDuration(bedtime: string, waketime: string): number {
  const [bh, bm] = bedtime.split(":").map(Number);
  const [wh, wm] = waketime.split(":").map(Number);
  let mins = (wh * 60 + wm) - (bh * 60 + bm);
  if (mins <= 0) mins += 24 * 60;
  return mins;
}

function formatDuration(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h}h${m > 0 ? m.toString().padStart(2, "0") : ""}`;
}

export default function SleepTab() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<SleepEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [bedtime, setBedtime] = useState("22:30");
  const [waketime, setWaketime] = useState("07:00");
  const [quality, setQuality] = useState(3);
  const [naps, setNaps] = useState("");
  const [nightWakings, setNightWakings] = useState("0");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createClient() as any;
  const today = format(new Date(), "yyyy-MM-dd");

  useEffect(() => {
    if (user) loadEntries();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  async function loadEntries() {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from("sleep_entries")
      .select("*")
      .eq("user_id", user.id)
      .order("date", { ascending: false })
      .limit(30);
    setEntries(data ?? []);
    setLoading(false);
  }

  async function handleSave() {
    if (!user) return;
    setSaving(true);

    const { data, error } = await supabase
      .from("sleep_entries")
      .upsert({
        user_id: user.id,
        date: today,
        bedtime,
        waketime,
        quality,
        naps_minutes: parseInt(naps) || 0,
        night_wakings: parseInt(nightWakings) || 0,
        note: note || null,
      }, { onConflict: "user_id,date" })
      .select()
      .single();

    setSaving(false);
    if (!error && data) {
      setEntries((prev) => {
        const filtered = prev.filter((e) => e.date !== today);
        return [data, ...filtered];
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
    }
  }

  async function handleDelete(id: string) {
    await supabase.from("sleep_entries").delete().eq("id", id);
    setEntries((prev) => prev.filter((e) => e.id !== id));
    setConfirmDelete(null);
  }

  const duration = calcDuration(bedtime, waketime);
  const avgDuration = entries.length > 0
    ? Math.round(entries.reduce((sum, e) => sum + calcDuration(e.bedtime, e.waketime), 0) / entries.length)
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
      {/* Today's sleep form */}
      <div className="bg-white dark:bg-gray-900 rounded-3xl p-5 shadow-sm border border-indigo-100 dark:border-indigo-900/30">
        <div className="flex items-center gap-2 mb-3">
          <Moon className="w-5 h-5 text-indigo-400" />
          <h3 className="font-semibold text-[#3d2b2b] dark:text-gray-100">Sommeil d&apos;aujourd&apos;hui</h3>
        </div>

        {todayEntry && (
          <p className="text-xs text-gray-400 dark:text-gray-500 mb-3">
            Déjà enregistré : {formatDuration(calcDuration(todayEntry.bedtime, todayEntry.waketime))} — {QUALITY_EMOJIS[todayEntry.quality]} {QUALITY_LABELS[todayEntry.quality]}
          </p>
        )}

        {/* Bedtime / Waketime */}
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

        {/* Duration display */}
        <div className="bg-indigo-50 dark:bg-indigo-950/30 rounded-2xl px-4 py-2 mb-3 text-center">
          <span className="text-2xl font-bold text-indigo-500">{formatDuration(duration)}</span>
          <span className="text-xs text-gray-400 dark:text-gray-500 ml-1">de sommeil</span>
        </div>

        {/* Quality selector */}
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

        {/* Night wakings + naps */}
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Réveils nocturnes</label>
            <input
              type="number"
              min="0"
              max="20"
              value={nightWakings}
              onChange={(e) => setNightWakings(e.target.value)}
              className="w-full border border-indigo-200 dark:border-gray-600 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 dark:bg-gray-800 dark:text-white"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Sieste (min)</label>
            <input
              type="number"
              min="0"
              placeholder="0"
              value={naps}
              onChange={(e) => setNaps(e.target.value)}
              className="w-full border border-indigo-200 dark:border-gray-600 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 dark:bg-gray-800 dark:text-white"
            />
          </div>
        </div>

        {/* Note */}
        <textarea
          placeholder="Rêves, insomnies, douleurs... (optionnel)"
          value={note}
          onChange={(e) => setNote(e.target.value.slice(0, 200))}
          rows={2}
          className="w-full border border-indigo-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none mb-2"
        />

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-indigo-400 text-white py-2.5 rounded-xl text-sm font-medium disabled:opacity-50 hover:bg-indigo-50 dark:bg-indigo-500 transition-colors"
        >
          {saving ? "…" : success ? "✓ Enregistré !" : "Enregistrer"}
        </button>
      </div>

      {/* Stats */}
      {entries.length > 0 && (
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-sm border border-indigo-100 dark:border-indigo-900/30 text-center">
            <p className="text-2xl font-bold text-indigo-500">{formatDuration(avgDuration)}</p>
            <p className="text-xs text-gray-400 dark:text-gray-500">Moyenne / nuit</p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-sm border border-indigo-100 dark:border-indigo-900/30 text-center">
            <p className="text-2xl font-bold text-indigo-500">{avgQuality}/5</p>
            <p className="text-xs text-gray-400 dark:text-gray-500">Qualité moyenne</p>
          </div>
        </div>
      )}

      {/* Sleep chart (SVG) */}
      {entries.length > 1 && (
        <div className="bg-white dark:bg-gray-900 rounded-3xl p-4 shadow-sm border border-indigo-100 dark:border-indigo-900/30">
          <h3 className="text-sm font-semibold text-[#3d2b2b] dark:text-gray-100 mb-3">Historique</h3>
          <div className="overflow-x-auto">
            <div className="flex gap-1.5 items-end" style={{ minWidth: `${Math.min(entries.length, 14) * 36}px` }}>
              {[...entries].reverse().slice(-14).map((e) => {
                const dur = calcDuration(e.bedtime, e.waketime);
                const maxH = 12 * 60;
                const barH = Math.max(20, (dur / maxH) * 120);
                return (
                  <div key={e.id} className="flex flex-col items-center flex-1 min-w-[28px]">
                    <span className="text-[9px] text-gray-500 dark:text-gray-400 mb-0.5">{formatDuration(dur)}</span>
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

      {/* Recent entries */}
      {!loading && entries.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-[#3d2b2b] dark:text-gray-100 px-1">Dernières nuits</h3>
          {entries.slice(0, 7).map((entry) => {
            const dur = calcDuration(entry.bedtime, entry.waketime);
            return (
              <div
                key={entry.id}
                className="bg-white dark:bg-gray-900 rounded-2xl px-4 py-3 shadow-sm border border-indigo-100 dark:border-indigo-900/30 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{QUALITY_EMOJIS[entry.quality]}</span>
                  <div>
                    <p className="text-sm font-semibold text-[#3d2b2b] dark:text-gray-100">
                      {formatDuration(dur)} — {QUALITY_LABELS[entry.quality]}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      {format(new Date(entry.date), "d MMMM yyyy", { locale: fr })}
                      {" · "}{entry.bedtime} → {entry.waketime}
                      {entry.night_wakings > 0 && ` · ${entry.night_wakings} réveil${entry.night_wakings > 1 ? "s" : ""}`}
                      {entry.naps_minutes > 0 && ` · sieste ${entry.naps_minutes}min`}
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
            );
          })}
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
