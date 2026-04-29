"use client";

import { useRef, useState } from "react";
import { m as motion, AnimatePresence } from "framer-motion";
import { Loader2, X, Check, AlertTriangle, Sparkles, Droplet } from "lucide-react";
import { createClient } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/lib/toast";

type ResultStatus = "low" | "normal" | "high" | "unknown";

interface BloodResult {
  name: string;
  value: string;
  unit: string;
  refMin?: string | null;
  refMax?: string | null;
  status: ResultStatus;
}

interface ParseResult {
  testDate?: string | null;
  results: BloodResult[];
  warnings?: string | null;
  confidence: "high" | "medium" | "low";
}

const STATUS_BADGE: Record<ResultStatus, string> = {
  normal: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300",
  low: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300",
  high: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300",
  unknown: "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400",
};

const STATUS_LABEL: Record<ResultStatus, string> = {
  normal: "Normal",
  low: "Bas",
  high: "Haut",
  unknown: "—",
};

function formatRef(r: BloodResult): string | null {
  if (r.refMin && r.refMax) return `Réf. ${r.refMin} – ${r.refMax}${r.unit ? ` ${r.unit}` : ""}`;
  if (r.refMin) return `Réf. ≥ ${r.refMin}${r.unit ? ` ${r.unit}` : ""}`;
  if (r.refMax) return `Réf. ≤ ${r.refMax}${r.unit ? ` ${r.unit}` : ""}`;
  return null;
}

export default function ScanAnalysesSang() {
  const fileRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<ParseResult | null>(null);
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
      const res = await fetch("/api/vision/analyses-sang", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: base64, mimeType: file.type }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Analyse impossible");
      if (!json.results || json.results.length === 0) {
        toast.info(json.warnings || "Aucun résultat détecté");
      }
      setResult(json);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur");
    } finally {
      setBusy(false);
    }
  };

  const saveResults = async () => {
    if (!result || !user) return;
    if (!result.results || result.results.length === 0) {
      toast.error("Rien à enregistrer");
      return;
    }
    setSaving(true);
    try {
      const testDate = result.testDate || new Date().toISOString().slice(0, 10);
      const supabase = createClient();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase.from as any)("blood_test_entries").insert({
        user_id: user.id,
        test_date: testDate,
        results: result.results,
        warnings: result.warnings ?? null,
        source: "scan",
      });
      if (error) throw new Error(error.message);
      setSaved(true);
      toast.success("Analyses enregistrées");
      setTimeout(() => {
        setResult(null);
        setSaved(false);
      }, 900);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur");
    } finally {
      setSaving(false);
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
        className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-gradient-to-r from-rose-500 to-red-500 text-white text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-60"
      >
        {busy ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Analyse en cours…
          </>
        ) : (
          <>
            <Droplet className="w-4 h-4" />
            <Sparkles className="w-3.5 h-3.5" />
            Scanner mes analyses sanguines
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
                <div>
                  <h3 className="font-bold text-[#3d2b2b] dark:text-gray-100 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-rose-500" />
                    Analyses sanguines
                  </h3>
                  {result.testDate && (
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                      Prélèvement du {result.testDate}
                    </p>
                  )}
                </div>
                <button onClick={close} className="text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {result.warnings && (
                <div className="mb-3 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 flex gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-800 dark:text-amber-200">{result.warnings}</p>
                </div>
              )}

              {result.confidence === "low" && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                  ⚠️ Confiance faible — relis les valeurs sur la photo originale.
                </p>
              )}

              {result.results.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-6">
                  Aucun résultat détecté.
                </p>
              ) : (
                <div className="space-y-2">
                  {result.results.map((r, i) => {
                    const ref = formatRef(r);
                    return (
                      <div
                        key={i}
                        className="border border-gray-200 dark:border-gray-700 rounded-xl p-3"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm text-[#3d2b2b] dark:text-gray-100 truncate">
                              {r.name}
                            </p>
                            <p className="text-xs text-gray-700 dark:text-gray-300 mt-0.5">
                              <span className="font-semibold">{r.value}</span>
                              {r.unit ? ` ${r.unit}` : ""}
                            </p>
                            {ref && (
                              <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">
                                {ref}
                              </p>
                            )}
                          </div>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold whitespace-nowrap ${STATUS_BADGE[r.status]}`}
                          >
                            {STATUS_LABEL[r.status]}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {result.results.length > 0 && (
                saved ? (
                  <div className="mt-4 w-full py-2.5 rounded-xl bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-sm font-semibold flex items-center justify-center gap-1.5">
                    <Check className="w-4 h-4" />
                    Enregistré
                  </div>
                ) : (
                  <button
                    onClick={saveResults}
                    disabled={saving}
                    className="mt-4 w-full py-2.5 rounded-xl bg-rose-500 text-white text-sm font-semibold hover:bg-rose-600 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Enregistrement…
                      </>
                    ) : (
                      "Enregistrer ces résultats"
                    )}
                  </button>
                )
              )}

              <p className="text-[10px] text-gray-400 dark:text-gray-500 text-center mt-3">
                Analyse IA — à montrer à ta sage-femme ou à ton médecin pour interprétation.
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
