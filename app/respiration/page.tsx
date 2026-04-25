"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { m as motion, AnimatePresence } from "framer-motion";
import { Play, Pause, RotateCcw, Wind, Timer, Heart, ChevronRight } from "lucide-react";
import { useStore } from "@/lib/store";

interface BreathingExercise {
  id: string;
  name: string;
  emoji: string;
  description: string;
  when: string;
  inhale: number;
  hold: number;
  exhale: number;
  holdAfter: number;
  rounds: number;
  color: string;
  bgColor: string;
  borderColor: string;
}

const EXERCISES: BreathingExercise[] = [
  {
    id: "calm",
    name: "Respiration calmante",
    emoji: "🌊",
    description: "Idéale pour réduire le stress et l'anxiété. Ralentit le rythme cardiaque et favorise la détente.",
    when: "À tout moment — stress, insomnie, anxiété",
    inhale: 4,
    hold: 4,
    exhale: 6,
    holdAfter: 0,
    rounds: 8,
    color: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-50 dark:bg-blue-950/30",
    borderColor: "border-blue-200 dark:border-blue-800/30",
  },
  {
    id: "labor",
    name: "Respiration accouchement",
    emoji: "🤱",
    description: "Technique de base pour gérer les contractions. Inspiration lente par le nez, expiration longue par la bouche comme si vous souffliez une bougie.",
    when: "Pendant le travail — entre et pendant les contractions",
    inhale: 4,
    hold: 0,
    exhale: 8,
    holdAfter: 0,
    rounds: 10,
    color: "text-pink-600 dark:text-pink-400",
    bgColor: "bg-pink-50 dark:bg-pink-950/30",
    borderColor: "border-pink-200 dark:border-pink-800/30",
  },
  {
    id: "energy",
    name: "Respiration énergisante",
    emoji: "⚡",
    description: "Boost d'énergie naturel quand la fatigue de grossesse vous rattrape. Inspire profondément pour oxygéner.",
    when: "Fatigue, besoin d'énergie, matin difficile",
    inhale: 4,
    hold: 7,
    exhale: 8,
    holdAfter: 0,
    rounds: 4,
    color: "text-orange-600 dark:text-orange-400",
    bgColor: "bg-orange-50 dark:bg-orange-950/30",
    borderColor: "border-orange-200 dark:border-orange-800/30",
  },
  {
    id: "sleep",
    name: "Respiration du sommeil",
    emoji: "🌙",
    description: "Méthode 4-7-8 adaptée pour la grossesse. Active le système nerveux parasympathique pour faciliter l'endormissement.",
    when: "Le soir au lit — insomnie de grossesse",
    inhale: 4,
    hold: 7,
    exhale: 8,
    holdAfter: 0,
    rounds: 4,
    color: "text-indigo-600 dark:text-indigo-400",
    bgColor: "bg-indigo-50 dark:bg-indigo-950/30",
    borderColor: "border-indigo-200 dark:border-indigo-800/30",
  },
  {
    id: "push",
    name: "Respiration de poussée",
    emoji: "💪",
    description: "Pour la phase d'expulsion. Inspiration profonde, bloquer, et pousser vers le bas en expirant lentement.",
    when: "Phase d'expulsion — quand la sage-femme le dit",
    inhale: 5,
    hold: 3,
    exhale: 7,
    holdAfter: 2,
    rounds: 6,
    color: "text-purple-600 dark:text-purple-400",
    bgColor: "bg-purple-50 dark:bg-purple-950/30",
    borderColor: "border-purple-200 dark:border-purple-800/30",
  },
  {
    id: "sophrologie",
    name: "Sophrologie prénatale",
    emoji: "🧘",
    description: "Relaxation profonde corps-esprit. Combinaison de respiration lente et visualisation positive pour se connecter à bébé.",
    when: "3ème trimestre — préparation mentale",
    inhale: 5,
    hold: 2,
    exhale: 5,
    holdAfter: 2,
    rounds: 10,
    color: "text-green-600 dark:text-green-400",
    bgColor: "bg-green-50 dark:bg-green-950/30",
    borderColor: "border-green-200 dark:border-green-800/30",
  },
];

type Phase = "inhale" | "hold" | "exhale" | "holdAfter" | "done";

const PHASE_LABELS: Record<Phase, string> = {
  inhale: "Inspirez",
  hold: "Retenez",
  exhale: "Expirez",
  holdAfter: "Pause",
  done: "Terminé !",
};

const PHASE_COLORS: Record<Phase, string> = {
  inhale: "from-blue-400 to-cyan-300",
  hold: "from-purple-400 to-pink-300",
  exhale: "from-pink-400 to-orange-300",
  holdAfter: "from-gray-400 to-gray-300",
  done: "from-green-400 to-emerald-300",
};

export default function RespirationPage() {
  const store = useStore();
  const [selectedExercise, setSelectedExercise] = useState<BreathingExercise | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [phase, setPhase] = useState<Phase>("inhale");
  const [phaseTime, setPhaseTime] = useState(0);
  const [currentRound, setCurrentRound] = useState(1);
  const [totalSeconds, setTotalSeconds] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const sessionStartRef = useRef<string | null>(null);
  const persistedRef = useRef<boolean>(false);

  const persistSession = useCallback((exercise: BreathingExercise, durationSec: number, rounds: number, completed: boolean) => {
    if (persistedRef.current) return;
    if (durationSec < 5) return;
    persistedRef.current = true;
    const pattern = `${exercise.inhale}-${exercise.hold}-${exercise.exhale}${exercise.holdAfter > 0 ? `-${exercise.holdAfter}` : ""}`;
    store.addBreathingSession({
      startedAt: sessionStartRef.current ?? new Date().toISOString(),
      durationSec,
      pattern,
      rounds,
      completed,
    }).catch(() => {});
  }, [store]);

  const getPhaseMax = useCallback(() => {
    if (!selectedExercise) return 0;
    switch (phase) {
      case "inhale": return selectedExercise.inhale;
      case "hold": return selectedExercise.hold;
      case "exhale": return selectedExercise.exhale;
      case "holdAfter": return selectedExercise.holdAfter;
      default: return 0;
    }
  }, [selectedExercise, phase]);

  const nextPhase = useCallback(() => {
    if (!selectedExercise) return;
    const phases: Phase[] = ["inhale", "hold", "exhale", "holdAfter"];
    const currentIdx = phases.indexOf(phase);
    let next = currentIdx + 1;

    while (next < phases.length) {
      const nextP = phases[next];
      const dur = nextP === "inhale" ? selectedExercise.inhale
        : nextP === "hold" ? selectedExercise.hold
        : nextP === "exhale" ? selectedExercise.exhale
        : selectedExercise.holdAfter;
      if (dur > 0) {
        setPhase(nextP);
        setPhaseTime(0);
        return;
      }
      next++;
    }

    if (currentRound < selectedExercise.rounds) {
      setCurrentRound((r) => r + 1);
      setPhase("inhale");
      setPhaseTime(0);
    } else {
      setPhase("done");
      setIsRunning(false);
      persistSession(selectedExercise, totalSeconds, selectedExercise.rounds, true);
    }
  }, [selectedExercise, phase, currentRound, totalSeconds, persistSession]);

  useEffect(() => {
    if (!isRunning || phase === "done") return;

    intervalRef.current = setInterval(() => {
      setTotalSeconds((t) => t + 1);
      setPhaseTime((t) => {
        const max = getPhaseMax();
        if (t + 1 >= max) {
          nextPhase();
          return 0;
        }
        return t + 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, phase, getPhaseMax, nextPhase]);

  function startExercise(exercise: BreathingExercise) {
    setSelectedExercise(exercise);
    setPhase("inhale");
    setPhaseTime(0);
    setCurrentRound(1);
    setTotalSeconds(0);
    sessionStartRef.current = new Date().toISOString();
    persistedRef.current = false;
    setIsRunning(true);
  }

  function dismissExercise() {
    if (selectedExercise && !persistedRef.current && totalSeconds > 0) {
      persistSession(selectedExercise, totalSeconds, currentRound, phase === "done");
    }
    setSelectedExercise(null);
    setIsRunning(false);
  }

  function togglePause() {
    if (phase === "done") {
      setPhase("inhale");
      setPhaseTime(0);
      setCurrentRound(1);
      setTotalSeconds(0);
    }
    setIsRunning(!isRunning);
  }

  function reset() {
    setIsRunning(false);
    setPhase("inhale");
    setPhaseTime(0);
    setCurrentRound(1);
    setTotalSeconds(0);
  }

  const circleProgress = getPhaseMax() > 0 ? phaseTime / getPhaseMax() : 0;
  const circleRadius = 80;
  const circumference = 2 * Math.PI * circleRadius;

  return (
    <div className="max-w-lg mx-auto px-4 py-6 space-y-4">
      <div>
        <h1 className="text-xl font-bold text-[#3d2b2b] dark:text-gray-100 flex items-center gap-2">
          <Wind className="w-6 h-6 text-blue-400" />
          Respiration
        </h1>
        <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Exercices de respiration pour la grossesse et l&apos;accouchement</p>
      </div>

      {/* Active exercise */}
      <AnimatePresence mode="wait">
        {selectedExercise && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-sm border border-pink-100 dark:border-pink-900/30"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{selectedExercise.emoji}</span>
                <h2 className="font-semibold text-[#3d2b2b] dark:text-gray-100">{selectedExercise.name}</h2>
              </div>
              <button
                onClick={dismissExercise}
                className="text-gray-300 hover:text-gray-500 dark:text-gray-400 text-sm"
              >
                ✕
              </button>
            </div>

            {/* Circle animation */}
            <div className="flex flex-col items-center mb-6">
              <div className="relative w-48 h-48">
                <svg width="192" height="192" className="-rotate-90">
                  <circle cx="96" cy="96" r={circleRadius} fill="none" stroke="#f3e8ff" strokeWidth="8" />
                  <motion.circle
                    cx="96"
                    cy="96"
                    r={circleRadius}
                    fill="none"
                    stroke="url(#breathGradient)"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={circumference - circleProgress * circumference}
                  />
                  <defs>
                    <linearGradient id="breathGradient">
                      <stop offset="0%" stopColor="#F9A8D4" />
                      <stop offset="100%" stopColor="#A78BFA" />
                    </linearGradient>
                  </defs>
                </svg>

                <motion.div
                  className="absolute inset-0 flex flex-col items-center justify-center"
                  animate={
                    isRunning && phase === "inhale"
                      ? { scale: [1, 1.15] }
                      : isRunning && phase === "exhale"
                      ? { scale: [1.15, 1] }
                      : {}
                  }
                  transition={{ duration: getPhaseMax(), ease: "easeInOut" }}
                >
                  <motion.p
                    key={phase}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`text-lg font-bold bg-gradient-to-r ${PHASE_COLORS[phase]} bg-clip-text text-transparent`}
                  >
                    {PHASE_LABELS[phase]}
                  </motion.p>
                  {phase !== "done" && (
                    <p className="text-3xl font-bold text-[#3d2b2b] dark:text-gray-100 mt-1">
                      {getPhaseMax() - phaseTime}
                    </p>
                  )}
                  {phase === "done" && <span className="text-3xl mt-1">🎉</span>}
                </motion.div>
              </div>

              <div className="flex items-center gap-4 mt-4 text-xs text-gray-400 dark:text-gray-500">
                <div className="flex items-center gap-1">
                  <Timer className="w-3 h-3" />
                  {Math.floor(totalSeconds / 60)}:{String(totalSeconds % 60).padStart(2, "0")}
                </div>
                <div className="flex items-center gap-1">
                  <Heart className="w-3 h-3" />
                  Cycle {currentRound}/{selectedExercise.rounds}
                </div>
              </div>
            </div>

            {/* Pattern display */}
            <div className="flex justify-center gap-3 mb-5">
              {[
                { label: "Inspire", val: selectedExercise.inhale, color: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400" },
                ...(selectedExercise.hold > 0 ? [{ label: "Retient", val: selectedExercise.hold, color: "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400" }] : []),
                { label: "Expire", val: selectedExercise.exhale, color: "bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400" },
                ...(selectedExercise.holdAfter > 0 ? [{ label: "Pause", val: selectedExercise.holdAfter, color: "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300" }] : []),
              ].map((step) => (
                <div key={step.label} className={`${step.color} px-3 py-1.5 rounded-xl text-center`}>
                  <p className="text-lg font-bold">{step.val}s</p>
                  <p className="text-[10px]">{step.label}</p>
                </div>
              ))}
            </div>

            {/* Controls */}
            <div className="flex gap-3 justify-center">
              <button
                onClick={reset}
                className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-200 dark:bg-gray-700 transition-colors"
              >
                <RotateCcw className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
              <button
                onClick={togglePause}
                className="w-16 h-16 bg-gradient-to-br from-pink-400 to-purple-400 rounded-full flex items-center justify-center hover:shadow-lg transition-all shadow-md"
              >
                {isRunning ? (
                  <Pause className="w-7 h-7 text-white" />
                ) : (
                  <Play className="w-7 h-7 text-white ml-1" />
                )}
              </button>
              <div className="w-12" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Exercise list */}
      <div className="space-y-2">
        <h2 className="font-semibold text-[#3d2b2b] dark:text-gray-100 text-sm">Choisir un exercice</h2>
        {EXERCISES.map((exercise) => (
          <motion.button
            key={exercise.id}
            onClick={() => startExercise(exercise)}
            whileTap={{ scale: 0.98 }}
            className={`w-full ${exercise.bgColor} border ${exercise.borderColor} rounded-2xl p-4 text-left transition-all hover:shadow-sm ${
              selectedExercise?.id === exercise.id ? "ring-2 ring-pink-300" : ""
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{exercise.emoji}</span>
                <div>
                  <p className="text-sm font-semibold text-[#3d2b2b] dark:text-gray-100">{exercise.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{exercise.when}</p>
                  <div className="flex gap-1 mt-1">
                    <span className="text-[10px] bg-white/60 dark:bg-gray-800/60 px-1.5 py-0.5 rounded-full text-gray-500 dark:text-gray-400">
                      {exercise.inhale}-{exercise.hold}-{exercise.exhale}
                      {exercise.holdAfter > 0 ? `-${exercise.holdAfter}` : ""}
                    </span>
                    <span className="text-[10px] bg-white/60 dark:bg-gray-800/60 px-1.5 py-0.5 rounded-full text-gray-500 dark:text-gray-400">
                      {exercise.rounds} cycles
                    </span>
                  </div>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-300 dark:text-gray-500" />
            </div>
          </motion.button>
        ))}
      </div>

      {/* Tips */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-3xl p-5 border border-blue-100 dark:border-blue-900/30">
        <div className="flex items-start gap-3">
          <span className="text-2xl">💡</span>
          <div>
            <h3 className="font-semibold text-[#3d2b2b] dark:text-gray-100 text-sm mb-1">Conseils respiration</h3>
            <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1.5 leading-relaxed">
              <li>• <strong>Position :</strong> Assise confortable ou allongée sur le côté gauche</li>
              <li>• <strong>Nez :</strong> Inspirez toujours par le nez</li>
              <li>• <strong>Bouche :</strong> Expirez par la bouche, lèvres légèrement entrouvertes</li>
              <li>• <strong>Ventre :</strong> Laissez votre ventre se gonfler à l&apos;inspiration</li>
              <li>• <strong>Pratique :</strong> 5-10 min par jour pour être prête le jour J</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
