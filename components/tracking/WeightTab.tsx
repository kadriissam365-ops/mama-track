"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import { useStore } from "@/lib/store";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Plus, Trash2 } from "lucide-react";
import ConfirmDialog from "@/components/ConfirmDialog";

const LineChart = dynamic(() => import("recharts").then((m) => ({ default: m.LineChart })), { ssr: false });
const Line = dynamic(() => import("recharts").then((m) => ({ default: m.Line })), { ssr: false });
const XAxis = dynamic(() => import("recharts").then((m) => ({ default: m.XAxis })), { ssr: false });
const YAxis = dynamic(() => import("recharts").then((m) => ({ default: m.YAxis })), { ssr: false });
const CartesianGrid = dynamic(() => import("recharts").then((m) => ({ default: m.CartesianGrid })), { ssr: false });
const Tooltip = dynamic(() => import("recharts").then((m) => ({ default: m.Tooltip })), { ssr: false });
const ResponsiveContainer = dynamic(() => import("recharts").then((m) => ({ default: m.ResponsiveContainer })), { ssr: false });

export default function WeightTab() {
  const store = useStore();
  const [weight, setWeight] = useState("");
  const [note, setNote] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const handleAdd = () => {
    const w = parseFloat(weight);
    if (isNaN(w) || w <= 0) return;
    store.addWeightEntry({
      date: format(new Date(), "yyyy-MM-dd"),
      weight: w,
      note: note || undefined,
    });
    setWeight("");
    setNote("");
  };

  const chartData = store.weightEntries.slice(-20).map((e) => ({
    date: format(new Date(e.date), "dd/MM"),
    poids: e.weight,
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="space-y-4"
    >
      <div className="bg-white rounded-3xl p-5 shadow-sm border border-purple-100">
        <h3 className="font-semibold text-[#3d2b2b] mb-3">Ajouter une mesure</h3>
        <div className="flex gap-2 mb-2">
          <input
            type="number"
            step="0.1"
            placeholder="Poids en kg"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            className="flex-1 border border-purple-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
          />
          <button
            onClick={handleAdd}
            disabled={!weight}
            className="bg-purple-400 text-white px-4 py-2 rounded-xl text-sm font-medium disabled:opacity-50 hover:bg-purple-500 transition-colors"
            aria-label="Ajouter le poids"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
        <input
          type="text"
          placeholder="Note (optionnel)"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="w-full border border-purple-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
        />
      </div>

      {chartData.length > 1 && (
        <div className="bg-white rounded-3xl p-4 shadow-sm border border-purple-100">
          <h3 className="text-sm font-semibold text-[#3d2b2b] mb-3">Courbe de poids</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ede9fe" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#9b7b8a" }} />
              <YAxis tick={{ fontSize: 10, fill: "#9b7b8a" }} domain={["auto", "auto"]} />
              <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid #ede9fe" }} />
              <Line
                type="monotone"
                dataKey="poids"
                stroke="#C4B5FD"
                strokeWidth={2.5}
                dot={{ fill: "#C4B5FD", r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="space-y-2">
        {store.weightEntries
          .slice()
          .reverse()
          .map((entry) => (
            <div
              key={entry.id}
              className="bg-white rounded-2xl px-4 py-3 shadow-sm border border-purple-100 flex items-center justify-between"
            >
              <div>
                <span className="text-lg font-bold text-[#3d2b2b]">{entry.weight} kg</span>
                <p className="text-xs text-gray-400">
                  {format(new Date(entry.date), "d MMMM yyyy", { locale: fr })}
                  {entry.note && ` — ${entry.note}`}
                </p>
              </div>
              <button
                onClick={() => setConfirmDelete(entry.id)}
                className="text-gray-300 hover:text-red-400 transition-colors"
                aria-label="Supprimer l'entrée de poids"
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
          store.removeWeightEntry(confirmDelete!);
          setConfirmDelete(null);
        }}
        onCancel={() => setConfirmDelete(null)}
      />
    </motion.div>
  );
}
