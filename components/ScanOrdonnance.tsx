"use client";

import { useRef, useState } from "react";
import { m as motion, AnimatePresence } from "framer-motion";
import { Camera, Loader2, X, Check, AlertTriangle, Sparkles } from "lucide-react";
import { useStore } from "@/lib/store";
import { useToast } from "@/lib/toast";

interface ParsedMedication {
  name: string;
  dosage: string;
  frequency: string;
  duration?: string | null;
  instructions?: string | null;
}

interface ParseResult {
  medications: ParsedMedication[];
  warning?: string | null;
  confidence: "high" | "medium" | "low";
}

const FREQ_TO_TIME: Record<string, string> = {
  matin: "08:00",
  midi: "12:00",
  soir: "20:00",
  nuit: "22:00",
};

function guessTime(freq: string): string {
  const f = freq.toLowerCase();
  for (const [k, v] of Object.entries(FREQ_TO_TIME)) {
    if (f.includes(k)) return v;
  }
  return "08:00";
}

const MED_COLORS = [
  "bg-pink-100 dark:bg-pink-900/30 border-pink-300 text-pink-700 dark:text-pink-300",
  "bg-purple-100 dark:bg-purple-900/30 border-purple-300 text-purple-700 dark:text-purple-300",
  "bg-blue-100 dark:bg-blue-900/30 border-blue-300 text-blue-700 dark:text-blue-300",
  "bg-green-100 dark:bg-green-900/30 border-green-300 text-green-700 dark:text-green-300",
];

export default function ScanOrdonnance() {
  const fileRef = useRef<HTMLInputElement>(null);
  const { addMedicationEntry } = useStore();
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<ParseResult | null>(null);
  const [added, setAdded] = useState<Set<number>>(new Set());

  const onPick = () => fileRef.current?.click();

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Format non supporté");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      toast.error("Image trop grande (max 8 Mo)");
      return;
    }
    setBusy(true);
    setResult(null);
    setAdded(new Set());
    try {
      const reader = new FileReader();
      const dataUrl = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error("Lecture impossible"));
        reader.readAsDataURL(file);
      });
      const base64 = dataUrl.replace(/^data:image\/[a-zA-Z0-9+]+;base64,/, "");
      const res = await fetch("/api/vision/ordonnance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: base64, mimeType: file.type }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Analyse impossible");
      if (!json.medications || json.medications.length === 0) {
        toast.info(json.warning || "Aucun médicament détecté");
      }
      setResult(json);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur");
    } finally {
      setBusy(false);
    }
  };

  const addOne = async (med: ParsedMedication, idx: number) => {
    try {
      await addMedicationEntry({
        name: med.name,
        dosage: med.dosage,
        frequency: med.frequency,
        time: guessTime(med.frequency),
        notes: [med.duration, med.instructions].filter(Boolean).join(" · ") || "",
        color: MED_COLORS[idx % MED_COLORS.length],
        active: true,
      });
      setAdded((prev) => new Set(prev).add(idx));
      toast.success(`${med.name} ajouté`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur");
    }
  };

  const close = () => {
    setResult(null);
    setAdded(new Set());
  };

  return (
    <>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={onFile}
        className="hidden"
      />
      <button
        type="button"
        onClick={onPick}
        disabled={busy}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-60"
      >
        {busy ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Analyse en cours…
          </>
        ) : (
          <>
            <Camera className="w-4 h-4" />
            <Sparkles className="w-3.5 h-3.5" />
            Scanner une ordonnance
          </>
        )}
      </button>

      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-4"
            onClick={(e) => { if (e.target === e.currentTarget) close(); }}
          >
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 30, opacity: 0 }}
              className="bg-white dark:bg-gray-900 rounded-3xl w-full max-w-md max-h-[85vh] overflow-y-auto p-5 shadow-xl"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-[#3d2b2b] dark:text-gray-100 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-500" />
                  Ordonnance analysée
                </h3>
                <button onClick={close} className="text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {result.warning && (
                <div className="mb-3 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 flex gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-800 dark:text-amber-200">{result.warning}</p>
                </div>
              )}

              {result.confidence === "low" && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                  ⚠️ Confiance faible — vérifie chaque ligne avant d&apos;ajouter.
                </p>
              )}

              {result.medications.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-6">
                  Aucun médicament détecté.
                </p>
              ) : (
                <div className="space-y-2">
                  {result.medications.map((m, i) => (
                    <div
                      key={i}
                      className="border border-gray-200 dark:border-gray-700 rounded-xl p-3 flex items-start justify-between gap-2"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-[#3d2b2b] dark:text-gray-100">{m.name}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                          {m.dosage} · {m.frequency}
                        </p>
                        {(m.duration || m.instructions) && (
                          <p className="text-[11px] text-gray-500 dark:text-gray-500 mt-0.5">
                            {[m.duration, m.instructions].filter(Boolean).join(" · ")}
                          </p>
                        )}
                      </div>
                      {added.has(i) ? (
                        <div className="px-3 py-1.5 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs font-semibold flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" />
                          Ajouté
                        </div>
                      ) : (
                        <button
                          onClick={() => addOne(m, i)}
                          className="px-3 py-1.5 rounded-lg bg-purple-500 text-white text-xs font-semibold hover:bg-purple-600 transition-colors"
                        >
                          Ajouter
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <p className="text-[10px] text-gray-400 dark:text-gray-500 text-center mt-4">
                Analyse IA · vérifie toujours avec ton médecin avant de prendre un traitement.
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
