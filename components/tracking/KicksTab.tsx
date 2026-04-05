"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useStore } from "@/lib/store";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Baby, Trash2 } from "lucide-react";
import ConfirmDialog from "@/components/ConfirmDialog";

interface KicksTabProps {
  today: string;
}

export default function KicksTab({ today }: KicksTabProps) {
  const store = useStore();
  const [counting, setCounting] = useState(false);
  const [count, setCount] = useState(0);
  const [startTime, setStartTime] = useState<string | null>(null);
  const [startTs, setStartTs] = useState<number | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const handleStart = () => {
    setCounting(true);
    setCount(0);
    const now = new Date();
    setStartTime(format(now, "HH:mm"));
    setStartTs(now.getTime());
  };

  const handleKick = () => {
    if (!counting) return;
    setCount((c) => c + 1);
  };

  const handleStop = () => {
    if (!startTs || !startTime) return;
    const duration = Math.round((Date.now() - startTs) / 60000);
    store.addKickSession({
      date: today,
      startTime,
      count,
      duration: Math.max(1, duration),
    });
    setCounting(false);
    setCount(0);
    setStartTime(null);
    setStartTs(null);
  };

  const todaySessions = store.kickSessions.filter((k) => k.date === today);
  const totalToday = todaySessions.reduce((s, k) => s + k.count, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="space-y-5"
    >
      {/* Compteur principal */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-green-100 text-center">
        <motion.button
          onClick={counting ? handleKick : handleStart}
          whileTap={{ scale: 0.92 }}
          className={`w-40 h-40 rounded-full mx-auto flex flex-col items-center justify-center shadow-lg transition-all ${
            counting
              ? "bg-gradient-to-br from-green-100 to-emerald-200 border-4 border-green-300"
              : "bg-gradient-to-br from-pink-100 to-pink-200 border-4 border-pink-300"
          }`}
        >
          <Baby
            className={`w-10 h-10 mb-1 ${counting ? "text-green-500" : "text-pink-400"}`}
          />
          <span className="text-4xl font-bold text-[#3d2b2b]">{count}</span>
          <span className="text-xs text-gray-500 mt-1">
            {counting ? "Touchez !" : "Démarrer"}
          </span>
        </motion.button>

        {counting && (
          <button
            onClick={handleStop}
            className="mt-4 px-6 py-2 bg-red-100 text-red-500 rounded-xl font-medium hover:bg-red-200 transition-colors"
          >
            Terminer la session
          </button>
        )}

        {!counting && (
          <div className="mt-4">
            <p className="text-sm text-gray-500">
              Total aujourd&apos;hui :{" "}
              <span className="font-bold text-green-600">
                {totalToday} mouvements
              </span>
            </p>
          </div>
        )}
      </div>

      {/* Sessions du jour */}
      {todaySessions.length > 0 && (
        <div className="bg-white rounded-3xl p-4 shadow-sm border border-green-100">
          <h3 className="text-sm font-semibold text-[#3d2b2b] mb-3">
            Sessions aujourd&apos;hui
          </h3>
          {todaySessions.map((s) => (
            <div
              key={s.id}
              className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0"
            >
              <div>
                <span className="text-sm font-semibold text-[#3d2b2b]">
                  {s.count} mouvements
                </span>
                <p className="text-xs text-gray-400">
                  {s.startTime} — {s.duration} min
                </p>
              </div>
              <button
                onClick={() => setConfirmDelete(s.id)}
                className="text-gray-300 hover:text-red-400 transition-colors"
                aria-label="Supprimer la session de kicks"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Historique */}
      <div className="bg-white rounded-3xl p-4 shadow-sm border border-green-100">
        <h3 className="text-sm font-semibold text-[#3d2b2b] mb-3">Historique</h3>
        {store.kickSessions.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-3">
            Commencez à compter les mouvements de bébé ! 👶
          </p>
        ) : (
          Object.entries(
            store.kickSessions.reduce<Record<string, number>>((acc, s) => {
              acc[s.date] = (acc[s.date] ?? 0) + s.count;
              return acc;
            }, {})
          )
            .sort((a, b) => b[0].localeCompare(a[0]))
            .slice(0, 10)
            .map(([date, total]) => (
              <div
                key={date}
                className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0"
              >
                <span className="text-sm text-gray-600">
                  {format(new Date(date), "EEEE d MMM", { locale: fr })}
                </span>
                <span className="text-sm font-semibold text-green-500">
                  {total} mvts
                </span>
              </div>
            ))
        )}
      </div>

      <ConfirmDialog
        isOpen={confirmDelete !== null}
        title="Supprimer cette session ?"
        message="Cette action est irréversible."
        onConfirm={() => {
          store.removeKickSession(confirmDelete!);
          setConfirmDelete(null);
        }}
        onCancel={() => setConfirmDelete(null)}
      />
    </motion.div>
  );
}
