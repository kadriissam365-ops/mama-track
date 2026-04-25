"use client";

import { useState } from "react";
import { m as motion } from "framer-motion";
import { useStore } from "@/lib/store";
import type { BloodPressureEntry } from "@/lib/supabase-api";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Plus, Trash2, Heart } from "lucide-react";
import ConfirmDialog from "@/components/ConfirmDialog";
import { useTheme } from "next-themes";

function getBPZone(sys: number, dias: number): { label: string; color: string; bg: string } {
  if (sys >= 140 || dias >= 90) {
    return { label: "Haute ⚠️", color: "text-red-600 dark:text-red-400", bg: "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800/30" };
  } else if (sys >= 120 || dias >= 80) {
    return { label: "Élevée", color: "text-orange-600", bg: "bg-orange-50 dark:bg-orange-950/30 border-orange-200" };
  }
  return { label: "Normale ✓", color: "text-green-600", bg: "bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800/30" };
}

function BPChart({ entries }: { entries: BloodPressureEntry[] }) {
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

  const sysPath = data.map((e, i) => `${i === 0 ? "M" : "L"} ${toX(i)} ${toY(e.systolic)}`).join(" ");
  const diasPath = data.map((e, i) => `${i === 0 ? "M" : "L"} ${toX(i)} ${toY(e.diastolic)}`).join(" ");

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
        {data.map((e, i) => (
          <text
            key={i}
            x={toX(i)}
            y={height - 2}
            textAnchor="middle"
            fontSize="7"
            fill={isDark ? "#9ca3af" : "#9b7b8a"}
          >
            {format(new Date(e.date), "dd/MM")}
          </text>
        ))}
        <path d={sysPath} fill="none" stroke="#f87171" strokeWidth="2" strokeLinejoin="round" />
        {data.map((e, i) => (
          <circle key={`s${i}`} cx={toX(i)} cy={toY(e.systolic)} r="3" fill="#f87171" />
        ))}
        <path d={diasPath} fill="none" stroke="#60a5fa" strokeWidth="2" strokeLinejoin="round" />
        {data.map((e, i) => (
          <circle key={`d${i}`} cx={toX(i)} cy={toY(e.diastolic)} r="3" fill="#60a5fa" />
        ))}
      </svg>
    </div>
  );
}

export default function BloodPressureTab() {
  const store = useStore();
  const entries = store.bloodPressureEntries;
  const loading = store.loading;

  const [systolic, setSystolic] = useState("");
  const [diastolic, setDiastolic] = useState("");
  const [pulse, setPulse] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Chart expects ascending order
  const chronological = [...entries].sort((a, b) => a.date.localeCompare(b.date));

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
    const err = validate();
    if (err) { setError(err); return; }
    setError(null);
    setSaving(true);

    const trimmedNotes = notes.trim();
    try {
      await store.addBloodPressureEntry({
        date: format(new Date(), "yyyy-MM-dd"),
        systolic: parseInt(systolic),
        diastolic: parseInt(diastolic),
        pulse: pulse ? parseInt(pulse) : undefined,
        note: trimmedNotes || undefined,
      });
      setSystolic(""); setDiastolic(""); setPulse(""); setNotes("");
    } catch {
      setError("Erreur lors de l'enregistrement. Veuillez réessayer.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    await store.deleteBloodPressureEntry(id);
  }

  const latest = chronological[chronological.length - 1];
  const latestZone = latest ? getBPZone(latest.systolic, latest.diastolic) : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="space-y-4"
    >
      {latest && latestZone && (
        <div className={`rounded-2xl px-4 py-3 border ${latestZone.bg} flex items-center gap-3`}>
          <Heart className="w-5 h-5 flex-shrink-0 text-pink-400" />
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Dernière mesure</p>
            <p className={`text-sm font-semibold ${latestZone.color}`}>
              {latest.systolic}/{latest.diastolic} mmHg
              {" — "}{latestZone.label}
            </p>
          </div>
        </div>
      )}

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
              min="60"
              max="200"
              step="1"
              inputMode="numeric"
              placeholder="ex: 120"
              value={systolic}
              onChange={(e) => setSystolic(e.target.value)}
              className="w-full border border-pink-200 dark:border-pink-800/30 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300 dark:bg-gray-800 dark:text-white"
            />
          </div>
          <div>
            <label className="text-xs text-gray-400 dark:text-gray-500 mb-1 block">Diastolique (mmHg)</label>
            <input
              type="number"
              min="40"
              max="130"
              step="1"
              inputMode="numeric"
              placeholder="ex: 80"
              value={diastolic}
              onChange={(e) => setDiastolic(e.target.value)}
              className="w-full border border-pink-200 dark:border-pink-800/30 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300 dark:bg-gray-800 dark:text-white"
            />
          </div>
        </div>
        <div className="flex gap-2 mb-2">
          <input
            type="number"
            min="30"
            max="250"
            step="1"
            inputMode="numeric"
            placeholder="Pouls (bpm, optionnel)"
            value={pulse}
            onChange={(e) => setPulse(e.target.value)}
            className="flex-1 border border-pink-200 dark:border-pink-800/30 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300 dark:bg-gray-800 dark:text-white"
          />
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Notes (optionnel)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="flex-1 border border-pink-200 dark:border-pink-800/30 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300 dark:bg-gray-800 dark:text-white"
          />
          <button
            onClick={handleAdd}
            disabled={!systolic || !diastolic || saving}
            className="bg-pink-400 text-white px-4 py-2 rounded-xl text-sm font-medium disabled:opacity-50 hover:bg-pink-500 dark:hover:bg-pink-600 dark:bg-pink-500 transition-colors"
            aria-label="Ajouter la mesure"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

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

      {chronological.length >= 2 && <BPChart entries={chronological} />}

      {loading ? (
        <div className="text-center text-sm text-gray-400 dark:text-gray-500 py-4">Chargement…</div>
      ) : entries.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 rounded-2xl px-4 py-6 text-center border border-pink-100 dark:border-pink-900/30">
          <Heart className="w-6 h-6 mx-auto mb-2 text-pink-300" />
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Aucune mesure enregistrée. Ajoutez votre première tension ci-dessus.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {entries.map((entry) => {
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
                    {entry.pulse !== undefined && (
                      <span className="text-xs text-gray-400 dark:text-gray-500">💓 {entry.pulse} bpm</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    {format(new Date(entry.date), "d MMMM yyyy", { locale: fr })}
                    {entry.note && ` — ${entry.note}`}
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
