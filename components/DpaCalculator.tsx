"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Calculator, ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { useStore } from "@/lib/store";
import { useToast } from "@/lib/toast";
import {
  calculateDueDateFromDDR,
  calculateDueDateFromConception,
  calculateDueDateFIV,
  calculateDueDateFromPonction,
  calculateDueDateFromCurrentWeek,
} from "@/lib/pregnancy-data";

type DpaMethod = "ddr" | "conception" | "fiv_frais" | "fiv_tec" | "current_week";
type FivStade = "J3" | "J5";
type WeekMode = "SA" | "GA";

type Props = {
  defaultOpen?: boolean;
  onSaved?: (dueDate: string) => void;
};

export default function DpaCalculator({ defaultOpen = false, onSaved }: Props) {
  const store = useStore();
  const toast = useToast();

  const [open, setOpen] = useState(defaultOpen);
  const [method, setMethod] = useState<DpaMethod>("current_week");
  const [ddrDate, setDdrDate] = useState("");
  const [conceptionDate, setConceptionDate] = useState("");
  const [ponctionDate, setPonctionDate] = useState("");
  const [transfertDate, setTransfertDate] = useState("");
  const [fivStade, setFivStade] = useState<FivStade>("J5");
  const [currentWeeks, setCurrentWeeks] = useState("");
  const [currentDays, setCurrentDays] = useState("0");
  const [weekMode, setWeekMode] = useState<WeekMode>("SA");
  const [applying, setApplying] = useState(false);

  const computedDpa = (): string => {
    try {
      if (method === "ddr" && ddrDate) {
        return calculateDueDateFromDDR(new Date(ddrDate)).toISOString().split("T")[0];
      }
      if (method === "conception" && conceptionDate) {
        return calculateDueDateFromConception(new Date(conceptionDate)).toISOString().split("T")[0];
      }
      if (method === "fiv_frais" && ponctionDate) {
        return calculateDueDateFromPonction(new Date(ponctionDate)).toISOString().split("T")[0];
      }
      if (method === "fiv_tec" && transfertDate) {
        return calculateDueDateFIV(new Date(transfertDate), fivStade).toISOString().split("T")[0];
      }
      if (method === "current_week" && currentWeeks) {
        const w = parseInt(currentWeeks, 10);
        const d = parseInt(currentDays || "0", 10);
        if (!isNaN(w) && w >= 0 && w <= 42 && !isNaN(d) && d >= 0 && d <= 6) {
          return calculateDueDateFromCurrentWeek(w, d, weekMode).toISOString().split("T")[0];
        }
      }
    } catch {
      // ignore
    }
    return "";
  };

  const previewDpa = computedDpa();

  const apply = async () => {
    if (!previewDpa) return;
    setApplying(true);
    try {
      await store.setProfile({ dueDate: previewDpa });
      setOpen(false);
      toast.success("DPA enregistrée ✓");
      onSaved?.(previewDpa);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Enregistrement impossible";
      toast.error(msg);
    } finally {
      setApplying(false);
    }
  };

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl border border-purple-200 dark:border-purple-800/30 bg-purple-50/50 dark:bg-purple-950/20 hover:bg-purple-50 transition-colors text-sm"
      >
        <span className="flex items-center gap-2 text-purple-700 dark:text-purple-300 font-medium">
          <Calculator className="w-4 h-4" />
          Calculer ma DPA autrement
        </span>
        {open ? <ChevronUp className="w-4 h-4 text-purple-500" /> : <ChevronDown className="w-4 h-4 text-purple-500" />}
      </button>

      {open && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="mt-3 space-y-3 p-4 rounded-xl bg-purple-50/30 dark:bg-purple-950/10 border border-purple-100 dark:border-purple-900/20"
        >
          <div className="grid grid-cols-1 gap-2">
            {[
              { value: "current_week" as DpaMethod, label: "🤰 Depuis ma semaine actuelle", desc: "SA ou GA" },
              { value: "ddr" as DpaMethod, label: "🗓️ Depuis ma DDR", desc: "Dernières règles + 280 j" },
              { value: "conception" as DpaMethod, label: "💕 Date de conception", desc: "Conception + 266 j" },
              { value: "fiv_frais" as DpaMethod, label: "🔬 FIV — ponction", desc: "Ponction + 266 j" },
              { value: "fiv_tec" as DpaMethod, label: "🧊 FIV TEC — transfert", desc: "Selon J3 / J5" },
            ].map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setMethod(opt.value)}
                className={`text-left px-3 py-2 rounded-lg border-2 text-xs transition-all ${
                  method === opt.value
                    ? "border-purple-400 bg-white dark:bg-gray-900"
                    : "border-transparent bg-white/50 dark:bg-gray-900/50"
                }`}
              >
                <p className="font-medium text-gray-800 dark:text-gray-100">{opt.label}</p>
                <p className="text-[10px] text-gray-500 dark:text-gray-400">{opt.desc}</p>
              </button>
            ))}
          </div>

          {method === "current_week" && (
            <div className="space-y-2">
              <div className="flex gap-2">
                <div className="flex-1">
                  <input
                    type="number"
                    inputMode="numeric"
                    min="0"
                    max="42"
                    value={currentWeeks}
                    onChange={(e) => setCurrentWeeks(e.target.value)}
                    placeholder="ex: 20"
                    className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300 text-center text-sm text-gray-800 dark:text-gray-100"
                  />
                  <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5 text-center">Semaines</p>
                </div>
                <div className="flex-1">
                  <input
                    type="number"
                    inputMode="numeric"
                    min="0"
                    max="6"
                    value={currentDays}
                    onChange={(e) => setCurrentDays(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300 text-center text-sm text-gray-800 dark:text-gray-100"
                  />
                  <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5 text-center">Jours 0–6</p>
                </div>
              </div>
              <div className="flex gap-2">
                {(["SA", "GA"] as WeekMode[]).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setWeekMode(m)}
                    className={`flex-1 py-2 rounded-lg border-2 font-semibold text-xs transition-all ${
                      weekMode === m
                        ? "border-purple-400 bg-purple-50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-300"
                        : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800"
                    }`}
                  >
                    {m === "SA" ? "SA (aménorrhée)" : "GA (grossesse)"}
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-snug bg-pink-50 dark:bg-pink-950/20 rounded-lg p-2">
                <strong>SA</strong> (depuis la DDR, 40 SA) vs <strong>GA</strong> (depuis la conception, 38 GA). Relation : <strong>SA = GA + 2</strong>.
              </p>
            </div>
          )}

          {method === "ddr" && (
            <input
              type="date"
              value={ddrDate}
              onChange={(e) => setDdrDate(e.target.value)}
              max={new Date().toISOString().split("T")[0]}
              className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300 text-sm text-gray-800 dark:text-gray-100"
            />
          )}
          {method === "conception" && (
            <input
              type="date"
              value={conceptionDate}
              onChange={(e) => setConceptionDate(e.target.value)}
              max={new Date().toISOString().split("T")[0]}
              className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300 text-sm text-gray-800 dark:text-gray-100"
            />
          )}
          {method === "fiv_frais" && (
            <input
              type="date"
              value={ponctionDate}
              onChange={(e) => setPonctionDate(e.target.value)}
              max={new Date().toISOString().split("T")[0]}
              className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300 text-sm text-gray-800 dark:text-gray-100"
            />
          )}
          {method === "fiv_tec" && (
            <div className="space-y-2">
              <input
                type="date"
                value={transfertDate}
                onChange={(e) => setTransfertDate(e.target.value)}
                max={new Date().toISOString().split("T")[0]}
                className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300 text-sm text-gray-800 dark:text-gray-100"
              />
              <div className="flex gap-2">
                {(["J3", "J5"] as FivStade[]).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setFivStade(s)}
                    className={`flex-1 py-2 rounded-lg border-2 font-semibold text-xs transition-all ${
                      fivStade === s
                        ? "border-purple-400 bg-purple-50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-300"
                        : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800"
                    }`}
                  >
                    {s} {s === "J3" ? "(+263j)" : "(+261j)"}
                  </button>
                ))}
              </div>
            </div>
          )}

          {previewDpa && (
            <div className="bg-white dark:bg-gray-900 rounded-lg p-2.5 border border-purple-200 dark:border-purple-800/30 text-center">
              <p className="text-[10px] text-purple-500 dark:text-purple-400 font-medium uppercase tracking-wide">DPA calculée</p>
              <p className="text-sm font-bold text-purple-700 dark:text-purple-300">
                {new Date(previewDpa).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
              </p>
              <button
                type="button"
                onClick={apply}
                disabled={applying}
                className="mt-2 w-full py-1.5 bg-purple-500 text-white rounded-lg text-xs font-medium hover:bg-purple-600 transition-colors disabled:opacity-60 flex items-center justify-center gap-1.5"
              >
                {applying ? <><Loader2 className="w-3 h-3 animate-spin" />Enregistrement…</> : "Utiliser et enregistrer"}
              </button>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
