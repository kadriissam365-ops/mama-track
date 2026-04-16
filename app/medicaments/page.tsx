"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Pill, Plus, Check, Trash2, Clock, Bell } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import ConfirmDialog from "@/components/ConfirmDialog";

interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  time: string;
  notes: string;
  color: string;
  active: boolean;
}

interface MedLog {
  medId: string;
  date: string;
  taken: boolean;
}

const PRESET_MEDS = [
  { name: "Acide folique", dosage: "400 µg", emoji: "💊", desc: "Prévention anomalies du tube neural" },
  { name: "Fer", dosage: "30 mg", emoji: "🩸", desc: "Prévention anémie" },
  { name: "Vitamine D", dosage: "1000 UI", emoji: "☀️", desc: "Fixation du calcium" },
  { name: "Calcium", dosage: "500 mg", emoji: "🦴", desc: "Os et dents de bébé" },
  { name: "Oméga-3 (DHA)", dosage: "200 mg", emoji: "🐟", desc: "Développement cérébral" },
  { name: "Iode", dosage: "150 µg", emoji: "🧂", desc: "Thyroïde et développement" },
  { name: "Magnésium", dosage: "300 mg", emoji: "✨", desc: "Crampes et fatigue" },
  { name: "Vitamine B12", dosage: "2.6 µg", emoji: "🧬", desc: "Formation globules rouges" },
  { name: "Zinc", dosage: "11 mg", emoji: "🛡️", desc: "Système immunitaire" },
  { name: "Vitamine C", dosage: "85 mg", emoji: "🍊", desc: "Absorption du fer" },
];

const MED_COLORS = [
  "bg-pink-100 dark:bg-pink-900/30 border-pink-300 text-pink-700 dark:text-pink-300",
  "bg-purple-100 dark:bg-purple-900/30 border-purple-300 text-purple-700 dark:text-purple-300",
  "bg-blue-100 dark:bg-blue-900/30 border-blue-300 text-blue-700 dark:text-blue-300",
  "bg-green-100 dark:bg-green-900/30 border-green-300 text-green-700 dark:text-green-300",
  "bg-orange-100 dark:bg-orange-900/30 border-orange-300 text-orange-700 dark:text-orange-300",
  "bg-indigo-100 dark:bg-indigo-900/30 border-indigo-300 text-indigo-700 dark:text-indigo-300",
  "bg-rose-100 dark:bg-rose-900/30 border-rose-300 text-rose-700",
  "bg-teal-100 dark:bg-teal-900/30 border-teal-300 text-teal-700",
];

const FREQUENCIES = [
  { id: "1x", label: "1x/jour" },
  { id: "2x", label: "2x/jour" },
  { id: "3x", label: "3x/jour" },
  { id: "semaine", label: "1x/semaine" },
];

function loadMeds(): Medication[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem("mt-medications") || "[]");
  } catch { return []; }
}

function saveMeds(meds: Medication[]) {
  localStorage.setItem("mt-medications", JSON.stringify(meds));
}

function loadLogs(): MedLog[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem("mt-med-logs") || "[]");
  } catch { return []; }
}

function saveLogs(logs: MedLog[]) {
  localStorage.setItem("mt-med-logs", JSON.stringify(logs));
}

export default function MedicamentsPage() {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [logs, setLogs] = useState<MedLog[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [showPresets, setShowPresets] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const [newName, setNewName] = useState("");
  const [newDosage, setNewDosage] = useState("");
  const [newFrequency, setNewFrequency] = useState("1x");
  const [newTime, setNewTime] = useState("08:00");
  const [newNotes, setNewNotes] = useState("");

  const today = format(new Date(), "yyyy-MM-dd");

  useEffect(() => {
    setMedications(loadMeds());
    setLogs(loadLogs());
  }, []);

  function addMedication(name: string, dosage: string) {
    const med: Medication = {
      id: crypto.randomUUID(),
      name,
      dosage,
      frequency: newFrequency,
      time: newTime,
      notes: newNotes,
      color: MED_COLORS[medications.length % MED_COLORS.length],
      active: true,
    };
    const updated = [...medications, med];
    setMedications(updated);
    saveMeds(updated);
    setNewName("");
    setNewDosage("");
    setNewNotes("");
    setShowAdd(false);
  }

  function removeMedication(id: string) {
    const updated = medications.filter((m) => m.id !== id);
    setMedications(updated);
    saveMeds(updated);
    const updatedLogs = logs.filter((l) => l.medId !== id);
    setLogs(updatedLogs);
    saveLogs(updatedLogs);
    setConfirmDelete(null);
  }

  function toggleTaken(medId: string) {
    const existing = logs.find((l) => l.medId === medId && l.date === today);
    let updated: MedLog[];
    if (existing) {
      updated = logs.filter((l) => !(l.medId === medId && l.date === today));
    } else {
      updated = [...logs, { medId, date: today, taken: true }];
    }
    setLogs(updated);
    saveLogs(updated);
  }

  function isTakenToday(medId: string): boolean {
    return logs.some((l) => l.medId === medId && l.date === today && l.taken);
  }

  const activeMeds = medications.filter((m) => m.active);
  const takenCount = activeMeds.filter((m) => isTakenToday(m.id)).length;
  const totalCount = activeMeds.length;
  const pct = totalCount > 0 ? Math.round((takenCount / totalCount) * 100) : 0;

  const last7 = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dateStr = format(d, "yyyy-MM-dd");
    const taken = activeMeds.filter((m) =>
      logs.some((l) => l.medId === m.id && l.date === dateStr && l.taken)
    ).length;
    return { date: dateStr, day: format(d, "EEE", { locale: fr }).slice(0, 2), taken, total: totalCount };
  });

  return (
    <div className="max-w-lg mx-auto px-4 py-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Pill className="w-6 h-6 text-purple-500" />
          <h1 className="text-xl font-bold text-[#3d2b2b] dark:text-gray-100">Mes médicaments</h1>
        </div>
        <button
          onClick={() => { setShowAdd(true); setShowPresets(true); }}
          className="w-9 h-9 bg-purple-400 rounded-xl flex items-center justify-center text-white hover:bg-purple-50 dark:hover:bg-purple-600 dark:bg-purple-500 transition-colors"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {/* Today's progress */}
      {totalCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl p-5 border border-purple-100 dark:border-purple-900/30"
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-[#3d2b2b] dark:text-gray-100">Aujourd&apos;hui</h3>
            <span className="text-sm text-purple-500 font-semibold">{takenCount}/{totalCount}</span>
          </div>
          <div className="w-full bg-purple-100 dark:bg-purple-900/30 rounded-full h-3 mb-2">
            <motion.div
              className="h-3 rounded-full bg-purple-400"
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.8 }}
            />
          </div>
          <p className="text-xs text-gray-400 dark:text-gray-500">
            {pct === 100
              ? "🎉 Tous vos médicaments sont pris !"
              : `${totalCount - takenCount} médicament${totalCount - takenCount > 1 ? "s" : ""} restant${totalCount - takenCount > 1 ? "s" : ""}`}
          </p>
        </motion.div>
      )}

      {/* Active medications */}
      {activeMeds.length > 0 && (
        <div className="space-y-2">
          {activeMeds.map((med) => {
            const taken = isTakenToday(med.id);
            return (
              <motion.div
                key={med.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`rounded-2xl px-4 py-3 border-2 flex items-center justify-between transition-all ${
                  taken
                    ? "bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800/30"
                    : `${med.color}`
                }`}
              >
                <button
                  onClick={() => toggleTaken(med.id)}
                  className="flex items-center gap-3 flex-1 text-left"
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                      taken ? "bg-green-400" : "bg-white/60 border border-gray-200 dark:border-gray-700"
                    }`}
                  >
                    {taken && <Check className="w-5 h-5 text-white" />}
                  </div>
                  <div>
                    <p className={`text-sm font-semibold ${taken ? "text-green-700 dark:text-green-300 line-through" : "text-[#3d2b2b] dark:text-gray-100"}`}>
                      {med.name}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      {med.dosage} · {FREQUENCIES.find((f) => f.id === med.frequency)?.label} · {med.time}
                    </p>
                  </div>
                </button>
                <button
                  onClick={() => setConfirmDelete(med.id)}
                  className="text-gray-300 dark:text-gray-500 hover:text-red-400 transition-colors ml-2"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Weekly adherence chart */}
      {totalCount > 0 && (
        <div className="bg-white dark:bg-gray-900 rounded-3xl p-4 shadow-sm border border-purple-100 dark:border-purple-900/30">
          <h3 className="text-sm font-semibold text-[#3d2b2b] dark:text-gray-100 mb-3">Adhérence (7 jours)</h3>
          <div className="flex gap-1.5 items-end justify-around">
            {last7.map((d) => {
              const barPct = d.total > 0 ? (d.taken / d.total) * 100 : 0;
              const barH = Math.max(8, (barPct / 100) * 80);
              const isToday = d.date === today;
              return (
                <div key={d.date} className="flex flex-col items-center flex-1">
                  {d.taken > 0 && (
                    <span className="text-[9px] text-gray-500 dark:text-gray-400 mb-0.5">{d.taken}/{d.total}</span>
                  )}
                  <div
                    className={`w-full rounded-t-lg ${
                      barPct === 100 ? "bg-green-300" : barPct > 0 ? "bg-purple-200" : "bg-gray-100 dark:bg-gray-800"
                    }`}
                    style={{ height: `${barH}px` }}
                  />
                  <span className={`text-[9px] mt-0.5 ${isToday ? "text-purple-500 font-bold" : "text-gray-400 dark:text-gray-500"}`}>
                    {d.day}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty state */}
      {activeMeds.length === 0 && !showAdd && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <Pill className="w-16 h-16 text-purple-200 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-[#3d2b2b] dark:text-gray-100 mb-2">Aucun médicament</h3>
          <p className="text-sm text-gray-400 dark:text-gray-500 mb-4">
            Ajoutez vos vitamines prénatales et suppléments pour suivre vos prises quotidiennes
          </p>
          <button
            onClick={() => { setShowAdd(true); setShowPresets(true); }}
            className="bg-purple-400 text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-purple-50 dark:hover:bg-purple-600 dark:bg-purple-500 transition-colors"
          >
            Ajouter un médicament
          </button>
        </motion.div>
      )}

      {/* Add modal */}
      <AnimatePresence>
        {showAdd && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center p-4"
            onClick={(e) => { if (e.target === e.currentTarget) setShowAdd(false); }}
          >
            <motion.div
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              exit={{ y: 100 }}
              className="bg-white dark:bg-gray-900 rounded-3xl p-5 w-full max-w-md max-h-[80vh] overflow-y-auto"
            >
              <h3 className="font-semibold text-[#3d2b2b] dark:text-gray-100 mb-4">Ajouter un médicament</h3>

              {/* Quick presets */}
              {showPresets && (
                <div className="mb-4">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Suggestions grossesse :</p>
                  <div className="grid grid-cols-2 gap-2">
                    {PRESET_MEDS.map((preset) => {
                      const alreadyAdded = medications.some((m) => m.name === preset.name);
                      return (
                        <button
                          key={preset.name}
                          disabled={alreadyAdded}
                          onClick={() => addMedication(preset.name, preset.dosage)}
                          className={`flex items-start gap-2 p-2.5 rounded-xl border text-left transition-all ${
                            alreadyAdded
                              ? "bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 opacity-50"
                              : "bg-purple-50 dark:bg-purple-950/30 border-purple-100 dark:border-purple-900/30 hover:border-purple-300"
                          }`}
                        >
                          <span className="text-lg">{preset.emoji}</span>
                          <div>
                            <p className="text-xs font-semibold text-[#3d2b2b] dark:text-gray-100">{preset.name}</p>
                            <p className="text-[10px] text-gray-400 dark:text-gray-500">{preset.dosage}</p>
                            <p className="text-[10px] text-gray-400 dark:text-gray-500">{preset.desc}</p>
                          </div>
                          {alreadyAdded && <Check className="w-3 h-3 text-green-400 mt-0.5 ml-auto flex-shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Divider */}
              <div className="flex items-center gap-2 my-3">
                <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
                <button
                  onClick={() => setShowPresets(!showPresets)}
                  className="text-xs text-gray-400 dark:text-gray-500 hover:text-purple-400"
                >
                  {showPresets ? "Ajouter manuellement ↓" : "Voir suggestions ↑"}
                </button>
                <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
              </div>

              {/* Manual form */}
              {!showPresets && (
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Nom</label>
                    <input
                      type="text"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      placeholder="Ex: Spasfon, Gaviscon..."
                      className="w-full border border-purple-200 dark:border-purple-800/30 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Dosage</label>
                      <input
                        type="text"
                        value={newDosage}
                        onChange={(e) => setNewDosage(e.target.value)}
                        placeholder="Ex: 500 mg"
                        className="w-full border border-purple-200 dark:border-purple-800/30 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Heure</label>
                      <input
                        type="time"
                        value={newTime}
                        onChange={(e) => setNewTime(e.target.value)}
                        className="w-full border border-purple-200 dark:border-purple-800/30 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Fréquence</label>
                    <div className="flex gap-2">
                      {FREQUENCIES.map((f) => (
                        <button
                          key={f.id}
                          onClick={() => setNewFrequency(f.id)}
                          className={`flex-1 py-2 rounded-xl border-2 text-xs transition-all ${
                            newFrequency === f.id
                              ? "bg-purple-100 dark:bg-purple-900/30 border-purple-300 text-purple-700 dark:text-purple-300"
                              : "border-gray-100 dark:border-gray-800 text-gray-400 dark:text-gray-500"
                          }`}
                        >
                          {f.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <textarea
                    placeholder="Notes (optionnel)"
                    value={newNotes}
                    onChange={(e) => setNewNotes(e.target.value.slice(0, 200))}
                    rows={2}
                    className="w-full border border-purple-200 dark:border-purple-800/30 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 resize-none"
                  />
                  <button
                    onClick={() => { if (newName.trim()) addMedication(newName.trim(), newDosage.trim()); }}
                    disabled={!newName.trim()}
                    className="w-full bg-purple-400 text-white py-2.5 rounded-xl text-sm font-medium disabled:opacity-50 hover:bg-purple-50 dark:hover:bg-purple-600 dark:bg-purple-500 transition-colors"
                  >
                    Ajouter
                  </button>
                </div>
              )}

              <button
                onClick={() => setShowAdd(false)}
                className="w-full text-gray-400 dark:text-gray-500 text-sm mt-3 hover:text-gray-600 dark:text-gray-300"
              >
                Fermer
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Info card */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-3xl p-5 border border-purple-100 dark:border-purple-900/30">
        <div className="flex items-start gap-3">
          <span className="text-2xl">💡</span>
          <div>
            <h3 className="font-semibold text-[#3d2b2b] dark:text-gray-100 text-sm mb-1">Vitamines essentielles</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
              L&apos;acide folique (vitamine B9) est recommandé dès le projet de grossesse et pendant tout le 1er trimestre.
              Le fer et la vitamine D sont souvent prescrits au 2ème et 3ème trimestre. Demandez conseil à votre médecin ou sage-femme.
            </p>
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={confirmDelete !== null}
        title="Supprimer ce médicament ?"
        message="L'historique de prises sera aussi supprimé."
        onConfirm={() => confirmDelete && removeMedication(confirmDelete)}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
}
