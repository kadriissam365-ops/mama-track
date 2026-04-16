"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "@/lib/store";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Timer, Trash2, AlertCircle, CheckCircle, MessageCircle } from "lucide-react";
import { useToast } from "@/lib/toast";
import type { ContractionEntry } from "@/lib/store";

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  return `${Math.floor(seconds / 60)}m${seconds % 60 > 0 ? ` ${seconds % 60}s` : ""}`;
}

function formatInterval(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return s > 0 ? `${m}min ${s}s` : `${m}min`;
}

function analyzeContractions(contractions: ContractionEntry[]): {
  regular: boolean;
  avgDuration: number;
  avgInterval: number;
  warning: string | null;
} {
  const completed = contractions.filter((c) => c.duration !== undefined);
  if (completed.length < 3) {
    return { regular: false, avgDuration: 0, avgInterval: 0, warning: null };
  }

  const durations = completed.map((c) => c.duration!);
  const intervals = completed
    .filter((c) => c.interval !== undefined)
    .map((c) => c.interval!);

  const avgDuration = Math.round(durations.reduce((a, b) => a + b, 0) / durations.length);
  const avgInterval = intervals.length > 0
    ? Math.round(intervals.reduce((a, b) => a + b, 0) / intervals.length)
    : 0;

  const durationVariance = durations.every((d) => Math.abs(d - avgDuration) < 30);
  const intervalVariance = intervals.length > 1 && intervals.every((i) => Math.abs(i - avgInterval) < 60);
  const regular = durationVariance && intervalVariance;

  let warning: string | null = null;
  if (avgInterval > 0 && avgInterval <= 5 * 60 && avgDuration >= 45) {
    warning = "⚠️ Contractions régulières intenses — contactez votre maternité !";
  } else if (avgInterval > 0 && avgInterval <= 10 * 60 && avgDuration >= 30) {
    warning = "🟡 Contractions rapprochées — surveillez et préparez-vous.";
  }

  return { regular, avgDuration, avgInterval, warning };
}

export default function ContractionsPage() {
  const store = useStore();
  const toast = useToast();
  const [isActive, setIsActive] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [currentContractionStart, setCurrentContractionStart] = useState<number | null>(null);
  const [inContraction, setInContraction] = useState(false);
  const [contractionElapsed, setContractionElapsed] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const contractionIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const sessionStartRef = useRef<number | null>(null);
  const lastContractionEndRef = useRef<number | null>(null);
  const [localContractions, setLocalContractions] = useState<ContractionEntry[]>([]);
  const [lastContraction, setLastContraction] = useState<ContractionEntry | null>(null);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (contractionIntervalRef.current) clearInterval(contractionIntervalRef.current);
    };
  }, []);

  const startSession = () => {
    const now = Date.now();
    sessionStartRef.current = now;
    setIsActive(true);
    setElapsed(0);
    setLocalContractions([]);
    lastContractionEndRef.current = null;

    const newSession = {
      date: format(new Date(), "yyyy-MM-dd"),
      contractions: [],
    };
    store.addContractionSession(newSession);
    // Get the last added session ID
    const sessions = store.contractionSessions;
    const lastId = sessions[sessions.length - 1]?.id ?? null;
    setCurrentSessionId(lastId);

    intervalRef.current = setInterval(() => {
      if (sessionStartRef.current) {
        setElapsed(Math.floor((Date.now() - sessionStartRef.current) / 1000));
      }
    }, 1000);
  };

  const stopSession = () => {
    setIsActive(false);
    setInContraction(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (contractionIntervalRef.current) clearInterval(contractionIntervalRef.current);
    if (currentSessionId) {
      store.updateContractionSession(currentSessionId, { contractions: localContractions });
    }
    setCurrentSessionId(null);
  };

  const startContraction = () => {
    if (inContraction) return;
    const now = Date.now();
    setCurrentContractionStart(now);
    setInContraction(true);
    setContractionElapsed(0);

    contractionIntervalRef.current = setInterval(() => {
      if (currentContractionStart !== null) {
        setContractionElapsed(Math.floor((Date.now() - now) / 1000));
      }
    }, 1000);
  };

  const stopContraction = () => {
    if (!inContraction || currentContractionStart === null) return;
    const now = Date.now();
    const duration = Math.round((now - currentContractionStart) / 1000);
    const interval = lastContractionEndRef.current
      ? Math.round((currentContractionStart - lastContractionEndRef.current) / 1000)
      : undefined;

    lastContractionEndRef.current = now;
    if (contractionIntervalRef.current) clearInterval(contractionIntervalRef.current);

    const newEntry: ContractionEntry = {
      id: Math.random().toString(36).slice(2),
      startTime: currentContractionStart,
      endTime: now,
      duration,
      interval,
    };

    setLocalContractions((prev) => [...prev, newEntry]);
    setLastContraction(newEntry);
    setInContraction(false);
    setCurrentContractionStart(null);
    setContractionElapsed(0);
  };

  const analysis = analyzeContractions(localContractions);

  const pastSessions = store.contractionSessions
    .filter((s) => s.id !== currentSessionId && s.contractions.length > 0)
    .slice()
    .reverse()
    .slice(0, 5);

  return (
    <div className="max-w-lg mx-auto px-4 py-6 space-y-5">
      <h1 className="text-xl font-bold text-[#3d2b2b] dark:text-gray-100 flex items-center gap-2">
        <Timer className="w-6 h-6 text-pink-400" />
        Contractions
      </h1>

      {/* Avertissement */}
      <AnimatePresence>
        {analysis.warning && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/30 rounded-2xl p-4 flex items-start gap-3"
          >
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-600 dark:text-red-400 font-medium">{analysis.warning}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Contrôle principal */}
      <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-sm border border-pink-100 dark:border-pink-900/30 text-center">
        {!isActive ? (
          <button
            onClick={startSession}
            className="w-full py-4 bg-pink-400 text-white rounded-2xl font-semibold text-lg hover:bg-pink-50 dark:hover:bg-pink-950/30 dark:bg-pink-950/300 transition-colors shadow-sm"
          >
            🤱 Démarrer le suivi
          </button>
        ) : (
          <div className="space-y-4">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Durée de session : <span className="font-semibold text-pink-500">{formatDuration(elapsed)}</span>
            </div>

            {/* Bouton contraction */}
            <motion.button
              onClick={inContraction ? stopContraction : startContraction}
              whileTap={{ scale: 0.95 }}
              className={`w-48 h-48 rounded-full mx-auto flex flex-col items-center justify-center shadow-lg transition-all ${
                inContraction
                  ? "bg-red-400 text-white"
                  : "bg-gradient-to-br from-pink-300 to-purple-300 text-white"
              }`}
            >
              {inContraction ? (
                <>
                  <motion.div
                    animate={{ scale: [1, 1.3, 1] }}
                    transition={{ repeat: Infinity, duration: 1 }}
                    className="text-4xl mb-1"
                  >
                    ⏱️
                  </motion.div>
                  <span className="text-3xl font-bold">{contractionElapsed}s</span>
                  <span className="text-sm opacity-80 mt-1">Appuyez pour stop</span>
                </>
              ) : (
                <>
                  <span className="text-4xl mb-2">🌊</span>
                  <span className="text-base font-semibold">Contraction</span>
                  <span className="text-xs opacity-80 mt-1">Appuyez pour démarrer</span>
                </>
              )}
            </motion.button>

            <button
              onClick={stopSession}
              className="w-full py-3 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-2xl font-medium hover:bg-gray-200 dark:bg-gray-700 transition-colors"
            >
              Terminer la session
            </button>

            {/* Notification partenaire */}
            {lastContraction && (
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => {
                  const msg = {
                    id: Date.now().toString(),
                    content: `🤰 Contraction enregistrée ! Durée : ${formatDuration(lastContraction.duration || 0)}. Je vais bien 💪`,
                    isOwn: true,
                    createdAt: new Date().toISOString(),
                  };
                  const saved = JSON.parse(localStorage.getItem('duo-messages') || '[]');
                  localStorage.setItem('duo-messages', JSON.stringify([...saved, msg]));
                  toast.success('Message envoyé à votre partenaire 💬');
                }}
                className="w-full flex items-center gap-3 bg-pink-50 dark:bg-pink-950/30 border border-pink-200 dark:border-pink-800/30 rounded-2xl px-4 py-3 hover:bg-pink-100 dark:hover:bg-pink-900/30 dark:bg-pink-900/30 transition-colors"
              >
                <MessageCircle className="w-5 h-5 text-pink-500" />
                <div className="text-left">
                  <p className="text-sm font-semibold text-pink-700 dark:text-pink-300">Prévenir mon partenaire</p>
                  <p className="text-xs text-pink-400">Envoie un message automatique au Duo</p>
                </div>
              </motion.button>
            )}
          </div>
        )}
      </div>

      {/* Stats en temps réel */}
      {isActive && localContractions.length >= 2 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-3 gap-3"
        >
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-3 text-center shadow-sm border border-pink-100 dark:border-pink-900/30">
            <p className="text-2xl font-bold text-pink-500">{localContractions.length}</p>
            <p className="text-xs text-gray-400 dark:text-gray-500">Contractions</p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-3 text-center shadow-sm border border-purple-100 dark:border-purple-900/30">
            <p className="text-lg font-bold text-purple-500">
              {analysis.avgDuration > 0 ? formatDuration(analysis.avgDuration) : "—"}
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500">Durée moy.</p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-3 text-center shadow-sm border border-green-100 dark:border-green-900/30">
            <p className="text-lg font-bold text-green-500">
              {analysis.avgInterval > 0 ? formatInterval(analysis.avgInterval) : "—"}
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500">Intervalle</p>
          </div>
        </motion.div>
      )}

      {/* Régularité */}
      {isActive && localContractions.length >= 3 && (
        <div
          className={`rounded-2xl p-3 flex items-center gap-2 ${
            analysis.regular ? "bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800/30" : "bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-800/30"
          }`}
        >
          {analysis.regular ? (
            <CheckCircle className="w-4 h-4 text-green-500" />
          ) : (
            <AlertCircle className="w-4 h-4 text-yellow-500 dark:text-yellow-400" />
          )}
          <span className="text-sm font-medium">
            {analysis.regular ? "Contractions régulières" : "Contractions irrégulières"}
          </span>
        </div>
      )}

      {/* Tableau contractions */}
      {isActive && localContractions.length > 0 && (
        <div className="bg-white dark:bg-gray-900 rounded-3xl p-4 shadow-sm border border-pink-100 dark:border-pink-900/30">
          <h3 className="text-sm font-semibold text-[#3d2b2b] dark:text-gray-100 mb-3">
            Session en cours ({localContractions.length} contraction{localContractions.length > 1 ? "s" : ""})
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-gray-400 dark:text-gray-500">
                  <th className="text-left pb-2 pr-3">#</th>
                  <th className="text-left pb-2 pr-3">Heure</th>
                  <th className="text-left pb-2 pr-3">Durée</th>
                  <th className="text-left pb-2">Intervalle</th>
                </tr>
              </thead>
              <tbody>
                {localContractions.slice().reverse().map((c, i) => (
                  <tr key={c.id} className="border-t border-gray-50 dark:border-gray-800">
                    <td className="py-2 pr-3 font-semibold text-pink-400">
                      {localContractions.length - i}
                    </td>
                    <td className="py-2 pr-3 text-gray-600 dark:text-gray-300">
                      {format(new Date(c.startTime), "HH:mm:ss")}
                    </td>
                    <td className="py-2 pr-3 font-semibold text-[#3d2b2b] dark:text-gray-100">
                      {c.duration ? formatDuration(c.duration) : "—"}
                    </td>
                    <td className="py-2 text-purple-500">
                      {c.interval ? formatInterval(c.interval) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Sessions passées */}
      {pastSessions.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Sessions passées
          </h2>
          {pastSessions.map((session) => {
            const sessionAnalysis = analyzeContractions(session.contractions);
            return (
              <div key={session.id} className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-sm border border-pink-100 dark:border-pink-900/30">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-semibold text-[#3d2b2b] dark:text-gray-100">
                    {format(new Date(session.date), "d MMMM yyyy", { locale: fr })}
                  </p>
                  <button
                    onClick={() => store.removeContractionSession(session.id)}
                    className="text-gray-300 dark:text-gray-500 hover:text-red-400"
                    aria-label="Supprimer la session"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex gap-4 text-xs text-gray-500 dark:text-gray-400">
                  <span>{session.contractions.length} contractions</span>
                  {sessionAnalysis.avgDuration > 0 && (
                    <span>Durée moy : {formatDuration(sessionAnalysis.avgDuration)}</span>
                  )}
                  {sessionAnalysis.avgInterval > 0 && (
                    <span>Intervalle : {formatInterval(sessionAnalysis.avgInterval)}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
