"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from "date-fns";
import { fr } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface MoodEntry {
  id: string;
  mood_emoji: string;
  mood_label: string;
  note?: string;
  date: string;
}

const MOODS = [
  { emoji: "😊", label: "Bien", color: "bg-yellow-100 dark:bg-yellow-900/30 border-yellow-300" },
  { emoji: "😐", label: "Neutre", color: "bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600" },
  { emoji: "😔", label: "Triste", color: "bg-blue-100 dark:bg-blue-900/30 border-blue-300" },
  { emoji: "😰", label: "Anxieuse", color: "bg-orange-100 dark:bg-orange-900/30 border-orange-300" },
  { emoji: "😍", label: "Épanouie", color: "bg-pink-100 dark:bg-pink-900/30 border-pink-300" },
  { emoji: "😤", label: "Irritable", color: "bg-red-100 dark:bg-red-900/30 border-red-300 dark:border-red-700" },
  { emoji: "🥰", label: "Sereine", color: "bg-purple-100 dark:bg-purple-900/30 border-purple-300" },
];

const MOOD_DAY_COLORS: Record<string, string> = {
  "😊": "bg-yellow-200",
  "😐": "bg-gray-200 dark:bg-gray-700",
  "😔": "bg-blue-200",
  "😰": "bg-orange-200",
  "😍": "bg-pink-200",
  "😤": "bg-red-200",
  "🥰": "bg-purple-200",
};

// SQL to run in Supabase dashboard:
/*
CREATE TABLE IF NOT EXISTS mood_entries (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  mood_emoji text NOT NULL,
  mood_label text NOT NULL,
  note text,
  date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, date)
);
ALTER TABLE mood_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own mood" ON mood_entries FOR ALL USING (auth.uid() = user_id);
*/

export default function MoodTab() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<MoodEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMood, setSelectedMood] = useState<typeof MOODS[0] | null>(null);
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [success, setSuccess] = useState(false);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createClient() as any;

  const today = format(new Date(), "yyyy-MM-dd");
  const todayEntry = entries.find((e) => e.date === today);

  useEffect(() => {
    if (user) loadEntries();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  async function loadEntries() {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from("mood_entries")
      .select("*")
      .eq("user_id", user.id)
      .order("date", { ascending: true });
    setEntries(data ?? []);
    setLoading(false);
  }

  async function handleSave() {
    if (!user || !selectedMood) return;
    setSaving(true);

    const { data, error } = await supabase
      .from("mood_entries")
      .upsert({
        user_id: user.id,
        mood_emoji: selectedMood.emoji,
        mood_label: selectedMood.label,
        note: note || null,
        date: today,
      }, { onConflict: "user_id,date" })
      .select()
      .single();

    setSaving(false);
    if (!error && data) {
      setEntries((prev) => {
        const filtered = prev.filter((e) => e.date !== today);
        return [...filtered, data].sort((a, b) => a.date.localeCompare(b.date));
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
    }
  }

  // Calendar grid
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const firstDayOfWeek = (monthStart.getDay() + 6) % 7; // Monday first

  const entryMap = new Map(entries.map((e) => [e.date, e]));

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="space-y-4"
    >
      {/* Today's mood form */}
      <div className="bg-white dark:bg-gray-900 rounded-3xl p-5 shadow-sm border border-pink-100 dark:border-pink-900/30">
        <h3 className="font-semibold text-[#3d2b2b] dark:text-gray-100 mb-1">Comment tu te sens aujourd'hui ?</h3>
        {todayEntry && (
          <p className="text-xs text-gray-400 dark:text-gray-500 mb-3">
            Aujourd'hui : {todayEntry.mood_emoji} {todayEntry.mood_label}
          </p>
        )}

        {/* Mood selector */}
        <div className="grid grid-cols-4 gap-2 mb-3">
          {MOODS.map((mood) => (
            <button
              key={mood.emoji}
              onClick={() => setSelectedMood(mood)}
              className={`flex flex-col items-center py-2 px-1 rounded-2xl border-2 transition-all ${
                selectedMood?.emoji === mood.emoji
                  ? `${mood.color} scale-105 shadow-md`
                  : "border-gray-100 dark:border-gray-800 hover:border-pink-200 dark:border-pink-800/30 bg-gray-50 dark:bg-gray-800"
              }`}
            >
              <span className="text-2xl">{mood.emoji}</span>
              <span className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">{mood.label}</span>
            </button>
          ))}
        </div>

        {/* Note */}
        <textarea
          placeholder="Une note ? (max 200 caractères)"
          value={note}
          onChange={(e) => setNote(e.target.value.slice(0, 200))}
          rows={2}
          className="w-full border border-pink-200 dark:border-pink-800/30 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300 resize-none mb-2 dark:bg-gray-800 dark:text-white"
        />
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400 dark:text-gray-500">{note.length}/200</span>
          <button
            onClick={handleSave}
            disabled={!selectedMood || saving}
            className="bg-pink-400 text-white px-5 py-2 rounded-xl text-sm font-medium disabled:opacity-50 hover:bg-pink-500 dark:hover:bg-pink-600 dark:bg-pink-500 transition-colors"
          >
            {saving ? "…" : success ? "✓ Enregistré !" : "Enregistrer"}
          </button>
        </div>
      </div>

      {/* Calendar */}
      <div className="bg-white dark:bg-gray-900 rounded-3xl p-5 shadow-sm border border-purple-100 dark:border-purple-900/30">
        {/* Month navigation */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
            className="p-1 rounded-xl hover:bg-purple-50 dark:hover:bg-purple-950/30 dark:bg-purple-950/30 transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-purple-400" />
          </button>
          <h3 className="font-semibold text-[#3d2b2b] dark:text-gray-100 capitalize">
            {format(currentMonth, "MMMM yyyy", { locale: fr })}
          </h3>
          <button
            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
            className="p-1 rounded-xl hover:bg-purple-50 dark:hover:bg-purple-950/30 dark:bg-purple-950/30 transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-purple-400" />
          </button>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 gap-1 mb-1">
          {["Lu", "Ma", "Me", "Je", "Ve", "Sa", "Di"].map((d) => (
            <div key={d} className="text-center text-xs font-medium text-gray-400 dark:text-gray-500">{d}</div>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7 gap-1">
          {/* Empty slots for first week */}
          {Array.from({ length: firstDayOfWeek }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}
          {days.map((day) => {
            const dateStr = format(day, "yyyy-MM-dd");
            const entry = entryMap.get(dateStr);
            const isToday = isSameDay(day, new Date());

            return (
              <div
                key={dateStr}
                className={`aspect-square flex flex-col items-center justify-center rounded-xl text-xs transition-all ${
                  entry
                    ? `${MOOD_DAY_COLORS[entry.mood_emoji] || "bg-pink-100 dark:bg-pink-900/30"}`
                    : isToday
                    ? "bg-pink-50 dark:bg-pink-950/30 border border-pink-200 dark:border-pink-800/30"
                    : "bg-gray-50 dark:bg-gray-800"
                }`}
                title={entry ? `${entry.mood_emoji} ${entry.mood_label}${entry.note ? ` — ${entry.note}` : ""}` : undefined}
              >
                {entry ? (
                  <>
                    <span className="text-base leading-none">{entry.mood_emoji}</span>
                    <span className="text-[8px] text-gray-500 dark:text-gray-400 leading-tight">{day.getDate()}</span>
                  </>
                ) : (
                  <span className={`text-[10px] font-medium ${isToday ? "text-pink-500" : "text-gray-400 dark:text-gray-500"}`}>
                    {day.getDate()}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {MOODS.map((mood) => (
            <div key={mood.emoji} className="flex items-center gap-1 text-[10px] text-gray-500 dark:text-gray-400">
              <span>{mood.emoji}</span>
              <span>{mood.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent entries list */}
      {!loading && entries.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-[#3d2b2b] dark:text-gray-100 px-1">Dernières entrées</h3>
          {[...entries].reverse().slice(0, 7).map((entry) => (
            <div
              key={entry.id}
              className={`rounded-2xl px-4 py-3 border flex items-center gap-3 ${
                MOOD_DAY_COLORS[entry.mood_emoji]
                  ? MOOD_DAY_COLORS[entry.mood_emoji].replace("bg-", "bg-").replace("-200", "-50") + " border-" + MOOD_DAY_COLORS[entry.mood_emoji].split("-")[1] + "-200"
                  : "bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800"
              }`}
            >
              <span className="text-2xl">{entry.mood_emoji}</span>
              <div>
                <p className="text-sm font-semibold text-[#3d2b2b] dark:text-gray-100">{entry.mood_label}</p>
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  {format(new Date(entry.date), "d MMMM yyyy", { locale: fr })}
                  {entry.note && ` — ${entry.note}`}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
