"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useStore } from "@/lib/store";
import type { AbdomenMeasurement } from "@/lib/supabase-api";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Plus, Trash2 } from "lucide-react";
import ConfirmDialog from "@/components/ConfirmDialog";
import { useTheme } from "next-themes";

function AbdomenChart({ entries }: { entries: AbdomenMeasurement[] }) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  if (entries.length < 2) return null;

  const data = entries.slice(-12);
  const width = 300;
  const height = 150;
  const padX = 35;
  const padY = 15;

  const values = data.map((e) => e.circumferenceCm);
  const minVal = Math.min(...values) - 5;
  const maxVal = Math.max(...values) + 5;

  const xStep = (width - padX * 2) / (data.length - 1);
  const toX = (i: number) => padX + i * xStep;
  const toY = (v: number) => padY + ((maxVal - v) / (maxVal - minVal)) * (height - padY * 2);

  const path = data.map((e, i) => `${i === 0 ? "M" : "L"} ${toX(i)} ${toY(e.circumferenceCm)}`).join(" ");

  return (
    <div className="bg-white dark:bg-gray-900 rounded-3xl p-4 shadow-sm border border-purple-100 dark:border-purple-900/30">
      <h3 className="text-sm font-semibold text-[#3d2b2b] dark:text-gray-100 mb-3">
        📏 Évolution ({data.length} mesures)
      </h3>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full">
        {[0, 1, 2, 3].map((i) => {
          const y = padY + (i / 3) * (height - padY * 2);
          const val = Math.round(maxVal - (i / 3) * (maxVal - minVal));
          return (
            <g key={i}>
              <line x1={padX} y1={y} x2={width - padX} y2={y} stroke={isDark ? "#374151" : "#f3e8ff"} strokeWidth="1" />
              <text x={padX - 4} y={y + 4} textAnchor="end" fontSize="8" fill={isDark ? "#9ca3af" : "#9b7b8a"}>
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
        <path d={path} fill="none" stroke="#C084FC" strokeWidth="2.5" strokeLinejoin="round" />
        <path
          d={`${path} L ${toX(data.length - 1)} ${height - padY} L ${toX(0)} ${height - padY} Z`}
          fill="url(#abdomenGrad)"
          opacity="0.3"
        />
        <defs>
          <linearGradient id="abdomenGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#C084FC" />
            <stop offset="100%" stopColor="#C084FC" stopOpacity="0" />
          </linearGradient>
        </defs>
        {data.map((e, i) => (
          <circle key={i} cx={toX(i)} cy={toY(e.circumferenceCm)} r="3.5" fill="#C084FC" />
        ))}
      </svg>
    </div>
  );
}

export default function AbdomenTab() {
  const store = useStore();
  const entries = store.abdomenMeasurements;
  const loading = store.loading;

  const [circumference, setCircumference] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const chronological = [...entries].sort((a, b) => a.date.localeCompare(b.date));

  async function handleAdd() {
    const val = parseFloat(circumference);
    if (isNaN(val) || val < 50 || val > 200) {
      setError("Périmètre doit être entre 50 et 200 cm");
      return;
    }
    setError(null);
    setSaving(true);

    const trimmedNotes = notes.trim();
    try {
      await store.addAbdomenMeasurement({
        date: format(new Date(), "yyyy-MM-dd"),
        circumferenceCm: val,
        note: trimmedNotes || undefined,
      });
      setCircumference(""); setNotes("");
    } catch {
      setError("Erreur lors de l'enregistrement. Veuillez réessayer.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    await store.deleteAbdomenMeasurement(id);
  }

  const lastEntry = chronological[chronological.length - 1];
  const prevEntry = chronological[chronological.length - 2];
  const diff = lastEntry && prevEntry
    ? (lastEntry.circumferenceCm - prevEntry.circumferenceCm).toFixed(1)
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="space-y-4"
    >
      {lastEntry && (
        <div className="bg-purple-50 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/30 rounded-2xl px-4 py-3 flex items-center gap-3">
          <span className="text-2xl">📏</span>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Dernière mesure</p>
            <p className="text-lg font-bold text-purple-700 dark:text-purple-300">
              {lastEntry.circumferenceCm} cm
              {diff !== null && (
                <span className={`text-sm font-normal ml-2 ${parseFloat(diff) >= 0 ? "text-orange-500 dark:text-orange-400" : "text-green-500 dark:text-green-400"}`}>
                  ({parseFloat(diff) >= 0 ? "+" : ""}{diff} cm)
                </span>
              )}
            </p>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-gray-900 rounded-3xl p-5 shadow-sm border border-purple-100 dark:border-purple-900/30">
        <h3 className="font-semibold text-[#3d2b2b] dark:text-gray-100 mb-3">Ajouter une mesure</h3>
        {error && (
          <p className="text-xs text-red-500 mb-2 bg-red-50 dark:bg-red-950/30 rounded-xl px-3 py-2">{error}</p>
        )}
        <div className="flex gap-2 mb-2">
          <input
            type="number"
            step="0.5"
            min="50"
            max="200"
            inputMode="decimal"
            placeholder="Périmètre en cm (ex: 95)"
            value={circumference}
            onChange={(e) => setCircumference(e.target.value)}
            className="flex-1 border border-purple-200 dark:border-purple-800/30 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 dark:bg-gray-800 dark:text-white"
          />
          <button
            onClick={handleAdd}
            disabled={!circumference || saving}
            className="bg-purple-400 text-white px-4 py-2 rounded-xl text-sm font-medium disabled:opacity-50 hover:bg-purple-500 dark:hover:bg-purple-600 dark:bg-purple-500 transition-colors"
            aria-label="Ajouter la mesure"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
        <input
          type="text"
          placeholder="Notes (optionnel)"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full border border-purple-200 dark:border-purple-800/30 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 dark:bg-gray-800 dark:text-white"
        />
      </div>

      {chronological.length >= 2 && <AbdomenChart entries={chronological} />}

      {loading ? (
        <div className="text-center text-sm text-gray-400 dark:text-gray-500 py-4">Chargement…</div>
      ) : entries.length === 0 ? (
        <div className="text-center text-sm text-gray-400 dark:text-gray-500 py-6">
          <p className="text-2xl mb-2">📏</p>
          <p>Aucune mesure enregistrée</p>
        </div>
      ) : (
        <div className="space-y-2">
          {entries.map((entry) => (
            <div
              key={entry.id}
              className="bg-white dark:bg-gray-900 rounded-2xl px-4 py-3 shadow-sm border border-purple-100 dark:border-purple-900/30 flex items-center justify-between"
            >
              <div>
                <span className="text-lg font-bold text-[#3d2b2b] dark:text-gray-100">
                  {entry.circumferenceCm} cm
                </span>
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  {format(new Date(entry.date), "d MMMM yyyy", { locale: fr })}
                  {entry.note && ` — ${entry.note}`}
                </p>
              </div>
              <button
                onClick={() => setConfirmDelete(entry.id)}
                className="text-gray-300 dark:text-gray-500 hover:text-red-400 transition-colors"
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
