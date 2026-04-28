"use client";

import { useRef, useState } from "react";
import { m as motion, AnimatePresence } from "framer-motion";
import { Camera, Loader2, X, Check, Sparkles, Baby } from "lucide-react";
import { useStore } from "@/lib/store";
import { useToast } from "@/lib/toast";

interface UltrasoundResult {
  examDate?: string | null;
  gestationalAgeWeeks?: number | null;
  gestationalAgeDays?: number | null;
  ageUnit?: "SA" | "GA" | null;
  bpd?: number | null;
  hc?: number | null;
  ac?: number | null;
  fl?: number | null;
  estimatedWeight?: number | null;
  heartRate?: number | null;
  presentation?: string | null;
  sex?: string | null;
  warning?: string | null;
  confidence: "high" | "medium" | "low";
}

function fmtRow(label: string, value: string | number | null | undefined, unit?: string) {
  if (value === null || value === undefined || value === "") return null;
  return (
    <div className="flex justify-between text-sm py-1.5 border-b border-gray-100 dark:border-gray-800 last:border-0">
      <span className="text-gray-500 dark:text-gray-400">{label}</span>
      <span className="font-semibold text-[#3d2b2b] dark:text-gray-200">
        {value}{unit ? ` ${unit}` : ""}
      </span>
    </div>
  );
}

export default function ScanEchographie() {
  const fileRef = useRef<HTMLInputElement>(null);
  const { addAppointment } = useStore();
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<UltrasoundResult | null>(null);
  const [saved, setSaved] = useState(false);

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
    setSaved(false);
    try {
      const reader = new FileReader();
      const dataUrl = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error("Lecture impossible"));
        reader.readAsDataURL(file);
      });
      const base64 = dataUrl.replace(/^data:image\/[a-zA-Z0-9+]+;base64,/, "");
      const res = await fetch("/api/vision/echographie", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: base64, mimeType: file.type }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Analyse impossible");
      setResult(json);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur");
    } finally {
      setBusy(false);
    }
  };

  const saveToAgenda = async () => {
    if (!result) return;
    const date = result.examDate || new Date().toISOString().slice(0, 10);
    const ga = result.gestationalAgeWeeks
      ? `${result.gestationalAgeWeeks}${result.gestationalAgeDays ? `+${result.gestationalAgeDays}` : ""} ${result.ageUnit ?? "SA"}`
      : "";
    const measures = [
      result.bpd ? `BIP ${result.bpd}mm` : null,
      result.hc ? `PC ${result.hc}mm` : null,
      result.ac ? `PA ${result.ac}mm` : null,
      result.fl ? `LF ${result.fl}mm` : null,
      result.estimatedWeight ? `${result.estimatedWeight}g` : null,
      result.heartRate ? `${result.heartRate} bpm` : null,
      result.presentation ? `Présentation ${result.presentation}` : null,
    ].filter(Boolean).join(" · ");
    try {
      await addAppointment({
        date,
        time: "09:00",
        title: `Échographie${ga ? ` (${ga})` : ""}`,
        notes: measures,
        done: true,
      });
      setSaved(true);
      toast.success("Ajouté à l'agenda");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur");
    }
  };

  const close = () => {
    setResult(null);
    setSaved(false);
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
        className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-60"
      >
        {busy ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Analyse en cours…
          </>
        ) : (
          <>
            <Baby className="w-4 h-4" />
            <Sparkles className="w-3.5 h-3.5" />
            Analyser une échographie
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
                  <Sparkles className="w-4 h-4 text-indigo-500" />
                  Échographie analysée
                </h3>
                <button onClick={close} className="text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {result.warning && (
                <p className="mb-3 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 text-xs text-amber-800 dark:text-amber-200">
                  {result.warning}
                </p>
              )}

              {result.confidence === "low" && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                  ⚠️ Confiance faible — relis les valeurs sur la photo originale.
                </p>
              )}

              <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-3 mb-3">
                {fmtRow("Date", result.examDate)}
                {fmtRow(
                  "Âge",
                  result.gestationalAgeWeeks
                    ? `${result.gestationalAgeWeeks}${result.gestationalAgeDays ? `+${result.gestationalAgeDays}` : ""}`
                    : null,
                  result.ageUnit ?? "SA",
                )}
                {fmtRow("BIP", result.bpd, "mm")}
                {fmtRow("PC", result.hc, "mm")}
                {fmtRow("PA", result.ac, "mm")}
                {fmtRow("LF", result.fl, "mm")}
                {fmtRow("Poids estimé", result.estimatedWeight, "g")}
                {fmtRow("Rythme cardiaque", result.heartRate, "bpm")}
                {fmtRow("Présentation", result.presentation)}
                {fmtRow("Sexe", result.sex)}
              </div>

              {saved ? (
                <div className="w-full py-2.5 rounded-xl bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-sm font-semibold flex items-center justify-center gap-1.5">
                  <Check className="w-4 h-4" />
                  Ajouté à l&apos;agenda
                </div>
              ) : (
                <button
                  onClick={saveToAgenda}
                  className="w-full py-2.5 rounded-xl bg-indigo-500 text-white text-sm font-semibold hover:bg-indigo-600 transition-colors"
                >
                  Enregistrer dans l&apos;agenda
                </button>
              )}

              <p className="text-[10px] text-gray-400 dark:text-gray-500 text-center mt-3">
                Analyse IA — les données officielles font foi. Ne remplace pas l&apos;avis du médecin.
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
