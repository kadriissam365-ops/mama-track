"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import { useStore } from "@/lib/store";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Plus, Trash2 } from "lucide-react";
import ConfirmDialog from "@/components/ConfirmDialog";
import { useTheme } from "next-themes";

const BarChart = dynamic(() => import("recharts").then((m) => ({ default: m.BarChart })), { ssr: false });
const Bar = dynamic(() => import("recharts").then((m) => ({ default: m.Bar })), { ssr: false });
const XAxis = dynamic(() => import("recharts").then((m) => ({ default: m.XAxis })), { ssr: false });
const YAxis = dynamic(() => import("recharts").then((m) => ({ default: m.YAxis })), { ssr: false });
const CartesianGrid = dynamic(() => import("recharts").then((m) => ({ default: m.CartesianGrid })), { ssr: false });
const Tooltip = dynamic(() => import("recharts").then((m) => ({ default: m.Tooltip })), { ssr: false });
const ResponsiveContainer = dynamic(() => import("recharts").then((m) => ({ default: m.ResponsiveContainer })), { ssr: false });

const SYMPTOM_OPTIONS = [
  "Nausées", "Fatigue", "Douleurs dos", "Brûlures d'estomac",
  "Vertiges", "Gonflement", "Insomnies", "Maux de tête",
  "Crampes", "Constipation", "Saignements des gencives", "Essoufflement",
];

export default function SymptomTab() {
  const store = useStore();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [severity, setSeverity] = useState(3);
  const [note, setNote] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const toggleSymptom = (s: string) => {
    setSelectedSymptoms((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );
  };

  const handleSubmit = () => {
    if (selectedSymptoms.length === 0) return;
    store.addSymptomEntry({
      date: format(new Date(), "yyyy-MM-dd"),
      symptoms: selectedSymptoms,
      severity,
      note: note || undefined,
    });
    setSelectedSymptoms([]);
    setSeverity(3);
    setNote("");
    setShowForm(false);
  };

  const chartData = store.symptomEntries.slice(-14).map((e) => ({
    date: format(new Date(e.date), "dd/MM"),
    sévérité: e.severity,
    count: e.symptoms.length,
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="space-y-4"
    >
      <button
        onClick={() => setShowForm(!showForm)}
        className="w-full py-3 bg-pink-400 text-white rounded-2xl font-medium flex items-center justify-center gap-2 hover:bg-pink-50 dark:hover:bg-pink-950/30 dark:bg-pink-950/300 transition-colors shadow-sm"
      >
        <Plus className="w-4 h-4" />
        Ajouter des symptômes
      </button>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white dark:bg-gray-900 rounded-3xl p-5 shadow-sm border border-pink-100 dark:border-pink-900/30 overflow-hidden"
          >
            <h3 className="font-semibold text-[#3d2b2b] dark:text-gray-100 mb-3">Symptômes aujourd&apos;hui</h3>
            <div className="flex flex-wrap gap-2 mb-4">
              {SYMPTOM_OPTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => toggleSymptom(s)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    selectedSymptoms.includes(s)
                      ? "bg-pink-400 text-white shadow-sm"
                      : "bg-pink-50 dark:bg-pink-950/30 text-pink-600 hover:bg-pink-100 dark:hover:bg-pink-900/30 dark:bg-pink-900/30"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>

            <div className="mb-4">
              <label className="text-xs text-gray-500 dark:text-gray-400 block mb-2">
                Sévérité : {severity}/5
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((v) => (
                  <button
                    key={v}
                    onClick={() => setSeverity(v)}
                    className={`flex-1 h-8 rounded-xl text-sm font-bold transition-all ${
                      v <= severity
                        ? "bg-pink-400 text-white"
                        : "bg-pink-50 dark:bg-pink-950/30 text-pink-300"
                    }`}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>

            <textarea
              placeholder="Note (optionnel)..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full border border-pink-200 dark:border-pink-800/30 rounded-xl p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-pink-300 mb-3"
              rows={2}
            />

            <button
              onClick={handleSubmit}
              disabled={selectedSymptoms.length === 0}
              className="w-full py-2.5 bg-pink-400 text-white rounded-xl font-medium disabled:opacity-50 hover:bg-pink-50 dark:hover:bg-pink-950/30 dark:bg-pink-950/300 transition-colors"
            >
              Enregistrer
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {chartData.length > 1 && (
        <div className="bg-white dark:bg-gray-900 rounded-3xl p-4 shadow-sm border border-pink-100 dark:border-pink-900/30">
          <h3 className="text-sm font-semibold text-[#3d2b2b] dark:text-gray-100 mb-3">Évolution (14 derniers jours)</h3>
          <ResponsiveContainer width="100%" height={150}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#374151" : "#fce7f3"} />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: isDark ? "#9ca3af" : "#9b7b8a" }} />
              <YAxis tick={{ fontSize: 10, fill: isDark ? "#9ca3af" : "#9b7b8a" }} domain={[0, 5]} />
              <Tooltip contentStyle={{ borderRadius: "12px", border: isDark ? "1px solid #374151" : "1px solid #fce7f3", backgroundColor: isDark ? "#1f2937" : "#fff", color: isDark ? "#e5e7eb" : "#1f2937" }} />
              <Bar dataKey="sévérité" fill={isDark ? "#f472b6" : "#F9A8D4"} radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="space-y-3">
        {store.symptomEntries
          .slice()
          .reverse()
          .map((entry) => (
            <div
              key={entry.id}
              className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-sm border border-pink-100 dark:border-pink-900/30 flex items-start justify-between"
            >
              <div>
                <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">
                  {format(new Date(entry.date), "d MMMM yyyy", { locale: fr })}
                </p>
                <div className="flex flex-wrap gap-1 mb-1">
                  {entry.symptoms.map((s) => (
                    <span
                      key={s}
                      className="text-xs bg-pink-100 dark:bg-pink-900/30 text-pink-600 px-2 py-0.5 rounded-full"
                    >
                      {s}
                    </span>
                  ))}
                </div>
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((v) => (
                    <span
                      key={v}
                      className={`w-4 h-1.5 rounded-full ${
                        v <= entry.severity ? "bg-pink-400" : "bg-pink-100 dark:bg-pink-900/30"
                      }`}
                    />
                  ))}
                </div>
                {entry.note && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{entry.note}</p>
                )}
              </div>
              <button
                onClick={() => setConfirmDelete(entry.id)}
                className="text-gray-300 dark:text-gray-500 hover:text-red-400 transition-colors ml-2"
                aria-label="Supprimer le symptôme"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
      </div>

      <ConfirmDialog
        isOpen={confirmDelete !== null}
        title="Supprimer cette entrée ?"
        message="Cette action est irréversible."
        onConfirm={() => {
          store.removeSymptomEntry(confirmDelete!);
          setConfirmDelete(null);
        }}
        onCancel={() => setConfirmDelete(null)}
      />
    </motion.div>
  );
}
