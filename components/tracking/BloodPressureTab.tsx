"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Plus, Trash2, Heart } from "lucide-react";
import ConfirmDialog from "@/components/ConfirmDialog";
import { useTheme } from "next-themes";

interface BPEntry {
  id: string;
  systolic: number;
  diastolic: number;
  pulse?: number;
  measured_at: string;
  notes?: string;
}

function getBPZone(sys: number, dias: number): { label: string; color: string; bg: string } {
  if (sys >= 140 || dias >= 90) {
    return { label: "Haute ⚠️", color: "text-red-600 dark:text-red-400", bg: "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800/30" };
  } else if (sys >= 120 || dias >= 80) {
    return { label: "Élevée", color: "text-orange-600", bg: "bg-orange-50 dark:bg-orange-950/30 border-orange-200" };
  }
  return { label: "Normale ✓", color: "text-green-600", bg: "bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800/30" };
}

// Simple SVG chart for blood pressure evolution
function BPChart({ entries }: { entries: BPEntry[] }) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  if (entries.length < 2) return null;

  const data = entries.slice(-10);
  const width = 300;
  const height = 150;
  const padX = 30;
  const padY = 15;

  const allValues = data.flatMap((e) => [e.systolic, e.diastolic]);
  const minVal = Math.min(...allValues) - 10;
  const maxVal = Math.max(...allValues) + 10;

  const xStep = (width - padX * 2) / (data.length - 1);

  const toX = (i: number) => padX + i * xStep;
  const toY = (v: number) => padY + ((maxVal - v) / (maxVal - minVal)) * (height - padY * 2);

  const sysPath = data
    .map((e, i) => `${i === 0 ? "M" : "L"} ${toX(i)} ${toY(e.systolic)}`)
    .join(" ");

  const diasPath = data
    .map((e, i) => `${i === 0 ? "M" : "L"} ${toX(i)} ${toY(e.diastolic)}`)
    .join(" ");

  return (
    <div className="bg-white dark:bg-gray-900 rounded-3xl p-4 shadow-sm border border-pink-100 dark:border-pink-900/30">
      <h3 className="text-sm font-semibold text-[#3d2b2b] dark:text-gray-100 mb-3 flex items-center gap-2">
        <Heart className="w-4 h-4 text-pink-400" />
        Évolution (dernières {data.length} mesures)
      </h3>
      <div className="flex gap-4 mb-2 text-xs">
        <span className="flex items-center gap-1">
          <span className="w-3 h-0.5 bg-red-400 inline-block" /> Systolique
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-0.5 bg-blue-400 inline-block" /> Diastolique
        </span>
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full">
        {/* Grid lines */}
        {[0, 1, 2, 3].map((i) => {
          const y = padY + (i / 3) * (height - padY * 2);
          const val = Math.round(maxVal - (i / 3) * (maxVal - minVal));
          return (
            <g key={i}>
              <line x1={padX} y1={y} x2={width - padX} y2={y} stroke={isDark ? "#374151" : "#f3e8ff"} strokeWidth="1" />
              <text x={padX - 3} y={y + 4} textAnchor="end" fontSize="8" fill={isDark ? "#9ca3af" : "#9b7b8a"}>
                {val}
              </text>
            </g>
          );
        })}
        {/* Date labels */}
        {data.map((e, i) => (
          <text
            key={i}
            x={toX(i)}
            y={height - 2}
            textAnchor="middle"
            fontSize="7"
            fill={isDark ? "#9ca3af" : "#9b7b8a"}
          >
            {format(new Date(e.measured_at), "dd/MM")}
          </text>
        ))}
        {/* Systolic line */}
        <path d={sysPath} fill="none" stroke={isDark ? "#f87171" : "#f87171"} strokeWidth="2" strokeLinejoin="round" />
        {data.map((e, i) => (
          <circle key={`s${i}`} cx={toX(i)} cy={toY(e.systolic)} r="3" fill={isDark ? "#f87171" : "#f87171"} />
        ))}
        {/* Diastolic line */}
        <path d={diasPath} fill="none" stroke={isDark ? "#60a5fa" : "#60a5fa"} strokeWidth="2" strokeLinejoin="round" />
        {data.map((e, i) => (
          <circle key={`d${i}`} cx={toX(i)} cy={toY(e.diastolic)} r="3" fill={isDark ? "#60a5fa" : "#60a5fa"} />
        ))}
      </svg>
    </div>
  );
}

// SQL to create table (run once in Supabase dashboard):
/*
CREATE TABLE IF NOT EXISTS blood_pressure_entries (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  systolic integer NOT NULL,
  diastolic integer NOT NULL,
  pulse integer,
  measured_at timestamptz DEFAULT now(),
  notes text
);
ALTER TABLE blood_pressure_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own bp" ON blood_pressure_entries FOR ALL USING (auth.uid() = user_id);
*/

export default function BloodPressureTab() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<BPEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [systolic, setSystolic] = useState("");
  const [diastolic, setDiastolic] = useState("");
  const [pulse, setPulse] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createClient() as any;

  useEffect(() => {
    if (user) loadEntries();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  async function loadEntries() {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from("blood_pressure_entries")
      .select("*")
      .eq("user_id", user.id)
      .order("measured_at", { ascending: true });
    setEntries(data ?? []);
    setLoading(false);
  }

  function validate(): string | null {
    const sys = parseInt(systolic);
    const dias = parseInt(diastolic);
    if (isNaN(sys) || sys < 60 || sys > 200) return "Systolique doit être entre 60 et 200 mmHg";
    if (isNaN(dias) || dias < 40 || dias > 130) return "Diastolique doit être entre 40 et 130 mmHg";
    if (pulse && (parseInt(pulse) < 30 || parseInt(pulse) > 250))
      return "Pouls doit être entre 30 et 250 bpm";
    return null;
  }

  async function handleAdd() {
    if (!user) return;
    const err = validate();
    if (err) { setError(err); return; }
    setError(null);
    setSaving(true);

    const { data, error: insertError } = await supabase
      .from("blood_pressure_entries")
      .insert({
        user_id: user.id,
        systolic: parseInt(systolic),
        diastolic: parseInt(diastolic),
        pulse: pulse ? parseInt(pulse) : null,
        measured_at: new Date().toISOString(),
        notes: notes || null,
      })
      .select()
      .single();

    setSaving(false);
    if (!insertError && data) {
      setEntries((prev) => [...prev, data]);
      setSystolic(""); setDiastolic(""); setPulse(""); setNotes("");
    } else {
      setError("Erreur lors de l'enregistrement. Veuillez réessayer.");
    }
  }

  async function handleDelete(id: string) {
    await supabase.from("blood_pressure_entries").delete().eq("id", id);
    setEntries((prev) => prev.filter((e) => e.id !== id));
  }

  const latestZone = entries.length > 0
    ? getBPZone(entries[entries.length - 1].systolic, entries[entries.length - 1].diastolic)
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="space-y-4"
    >
      {/* Last reading status */}
      {latestZone && (
        <div className={`rounded-2xl px-4 py-3 border ${latestZone.bg} flex items-center gap-3`}>
          <Heart className="w-5 h-5 flex-shrink-0 text-pink-400" />
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Dernière mesure</p>
            <p className={`text-sm font-semibold ${latestZone.color}`}>
              {entries[entries.length - 1].systolic}/{entries[entries.length - 1].diastolic} mmHg
              {" — "}{latestZone.label}
            </p>
          </div>
        </div>
      )}

      {/* Form */}
      <div className="bg-white dark:bg-gray-900 rounded-3xl p-5 shadow-sm border border-pink-100 dark:border-pink-900/30">
        <h3 className="font-semibold text-[#3d2b2b] dark:text-gray-100 mb-3">Ajouter une mesure</h3>
        {error && (
          <p className="text-xs text-red-500 mb-2 bg-red-50 dark:bg-red-950/30 rounded-xl px-3 py-2">{error}</p>
        )}
        <div className="grid grid-cols-2 gap-2 mb-2">
          <div>
            <label className="text-xs text-gray-400 dark:text-gray-500 mb-1 block">Systolique (mmHg)</label>
            <input
              type="number"
              placeholder="ex: 120"
              value={systolic}
              onChange={(e) => setSystolic(e.target.value)}
              className="w-full border border-pink-200 dark:border-pink-800/30 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300"
            />
          </div>
          <div>
            <label className="text-xs text-gray-400 dark:text-gray-500 mb-1 block">Diastolique (mmHg)</label>
            <input
              type="number"
              placeholder="ex: 80"
              value={diastolic}
              onChange={(e) => setDiastolic(e.target.value)}
              className="w-full border border-pink-200 dark:border-pink-800/30 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300"
            />
          </div>
        </div>
        <div className="flex gap-2 mb-2">
          <input
            type="number"
            placeholder="Pouls (bpm, optionnel)"
            value={pulse}
            onChange={(e) => setPulse(e.target.value)}
            className="flex-1 border border-pink-200 dark:border-pink-800/30 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300"
          />
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Notes (optionnel)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="flex-1 border border-pink-200 dark:border-pink-800/30 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300"
          />
          <button
            onClick={handleAdd}
            disabled={!systolic || !diastolic || saving}
            className="bg-pink-400 text-white px-4 py-2 rounded-xl text-sm font-medium disabled:opacity-50 hover:bg-pink-50 dark:hover:bg-pink-600 dark:bg-pink-500 transition-colors"
            aria-label="Ajouter la mesure"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* BP zones legend */}
        <div className="mt-3 grid grid-cols-3 gap-1 text-xs">
          <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800/30 rounded-xl px-2 py-1.5 text-center">
            <div className="font-semibold text-green-600">Normale</div>
            <div className="text-gray-400 dark:text-gray-500">&lt;120 / &lt;80</div>
          </div>
          <div className="bg-orange-50 dark:bg-orange-950/30 border border-orange-200 rounded-xl px-2 py-1.5 text-center">
            <div className="font-semibold text-orange-600">Élevée</div>
            <div className="text-gray-400 dark:text-gray-500">120-139 / 80-89</div>
          </div>
          <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/30 rounded-xl px-2 py-1.5 text-center">
            <div className="font-semibold text-red-600 dark:text-red-400">Haute</div>
            <div className="text-gray-400 dark:text-gray-500">≥140 / ≥90</div>
          </div>
        </div>
      </div>

      {/* Chart */}
      {entries.length >= 2 && <BPChart entries={entries} />}

      {/* History */}
      {loading ? (
        <div className="text-center text-sm text-gray-400 dark:text-gray-500 py-4">Chargement…</div>
      ) : (
        <div className="space-y-2">
          {[...entries].reverse().map((entry) => {
            const zone = getBPZone(entry.systolic, entry.diastolic);
            return (
              <div
                key={entry.id}
                className={`rounded-2xl px-4 py-3 border flex items-center justify-between ${zone.bg}`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-[#3d2b2b] dark:text-gray-100">
                      {entry.systolic}/{entry.diastolic}
                      <span className="text-sm font-normal text-gray-400 dark:text-gray-500"> mmHg</span>
                    </span>
                    {entry.pulse && (
                      <span className="text-xs text-gray-400 dark:text-gray-500">💓 {entry.pulse} bpm</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    {format(new Date(entry.measured_at), "d MMMM yyyy à HH:mm", { locale: fr })}
                    {entry.notes && ` — ${entry.notes}`}
                  </p>
                  <span className={`text-xs font-medium ${zone.color}`}>{zone.label}</span>
                </div>
                <button
                  onClick={() => setConfirmDelete(entry.id)}
                  className="text-gray-300 dark:text-gray-500 hover:text-red-400 transition-colors ml-2"
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
        title="Supprimer cette mesure ?"
        message="Cette action est irréversible."
        onConfirm={() => {
          if (confirmDelete) handleDelete(confirmDelete);
          setConfirmDelete(null);
        }}
        onCancel={() => setConfirmDelete(null)}
      />
    </motion.div>
  );
}
