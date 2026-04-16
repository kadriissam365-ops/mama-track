"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "@/lib/store";
import { format, isPast, isToday, isFuture } from "date-fns";
import { fr } from "date-fns/locale";
import { Plus, Calendar, Check, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import ConfirmDialog from "@/components/ConfirmDialog";

interface ChecklistExam {
  trimester: 1 | 2 | 3;
  label: string;
  week?: string;
}

const EXAM_CHECKLIST: ChecklistExam[] = [
  // T1
  { trimester: 1, label: "1ère consultation prénatale", week: "Avant 10 SA" },
  { trimester: 1, label: "Prise de sang 1er trimestre", week: "8-10 SA" },
  { trimester: 1, label: "Urine (BU)", week: "Chaque trimestre" },
  { trimester: 1, label: "Échographie T1 + clarté nucale", week: "11-13 SA" },
  { trimester: 1, label: "Dépistage trisomie 21", week: "11-13 SA" },
  // T2
  { trimester: 2, label: "Consultation 2ème trimestre", week: "16-18 SA" },
  { trimester: 2, label: "Prise de sang 2ème trimestre", week: "18-20 SA" },
  { trimester: 2, label: "Échographie morphologique T2", week: "20-25 SA" },
  { trimester: 2, label: "Test O'Sullivan (diabète)", week: "24-28 SA" },
  { trimester: 2, label: "Consultation 3ème trimestre", week: "28-30 SA" },
  // T3
  { trimester: 3, label: "Prise de sang 3ème trimestre", week: "28-32 SA" },
  { trimester: 3, label: "Échographie morphologique T3", week: "32-34 SA" },
  { trimester: 3, label: "Consultation mensuelle", week: "36 SA" },
  { trimester: 3, label: "Bilan pré-anesthésique", week: "36-38 SA" },
  { trimester: 3, label: "Consultation 38 SA", week: "38 SA" },
  { trimester: 3, label: "Consultation 40 SA", week: "40 SA" },
];

export default function AgendaPage() {
  const store = useStore();
  const [showForm, setShowForm] = useState(false);
  const [expandedExam, setExpandedExam] = useState<1 | 2 | 3 | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: "",
    date: "",
    time: "09:00",
    doctor: "",
    location: "",
    notes: "",
  });

  const handleSubmit = () => {
    if (!form.title || !form.date) return;
    store.addAppointment({
      ...form,
      done: false,
    });
    setForm({ title: "", date: "", time: "09:00", doctor: "", location: "", notes: "" });
    setShowForm(false);
  };

  // Parse dates as local midnight to avoid UTC off-by-one in non-UTC timezones
  const parseLocalDate = (dateStr: string) => new Date(dateStr + "T00:00:00");

  const upcoming = store.appointments.filter((a) => {
    if (a.done) return false;
    const d = parseLocalDate(a.date);
    return isToday(d) || isFuture(d);
  });
  const past = store.appointments.filter((a) => {
    const d = parseLocalDate(a.date);
    // Mutuellement exclusif avec upcoming : passé = done OU (date < aujourd'hui ET non aujourd'hui)
    return a.done || (!isToday(d) && isPast(d));
  });

  const trimesterColors: Record<1 | 2 | 3, string> = {
    1: "bg-pink-50 dark:bg-pink-950/30 border-pink-200 dark:border-pink-800/30",
    2: "bg-purple-50 dark:bg-purple-950/30 border-purple-200 dark:border-purple-800/30",
    3: "bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800/30",
  };

  const trimesterHeaderColors: Record<1 | 2 | 3, string> = {
    1: "text-pink-600 dark:text-pink-400 bg-pink-100 dark:bg-pink-900/30",
    2: "text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/30",
    3: "text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30",
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-6 space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-[#3d2b2b] dark:text-gray-100 flex items-center gap-2">
          <Calendar className="w-6 h-6 text-pink-400" />
          Agenda
        </h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1.5 bg-pink-400 text-white px-3 py-2 rounded-xl text-sm font-medium hover:bg-pink-50 dark:hover:bg-pink-600 dark:bg-pink-500 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Ajouter
        </button>
      </div>

      {/* Formulaire */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white dark:bg-gray-900 rounded-3xl p-5 shadow-sm border border-pink-100 dark:border-pink-900/30 overflow-hidden"
          >
            <h3 className="font-semibold text-[#3d2b2b] dark:text-gray-100 mb-4">Nouveau rendez-vous</h3>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Titre du RDV *"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full border border-pink-200 dark:border-pink-800/30 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  className="border border-pink-200 dark:border-pink-800/30 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300"
                />
                <input
                  type="time"
                  value={form.time}
                  onChange={(e) => setForm({ ...form, time: e.target.value })}
                  className="border border-pink-200 dark:border-pink-800/30 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300"
                />
              </div>
              <input
                type="text"
                placeholder="Médecin / Praticien"
                value={form.doctor}
                onChange={(e) => setForm({ ...form, doctor: e.target.value })}
                className="w-full border border-pink-200 dark:border-pink-800/30 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300"
              />
              <input
                type="text"
                placeholder="Lieu"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                className="w-full border border-pink-200 dark:border-pink-800/30 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300"
              />
              <textarea
                placeholder="Notes..."
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                rows={2}
                className="w-full border border-pink-200 dark:border-pink-800/30 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300 resize-none"
              />
              <button
                onClick={handleSubmit}
                disabled={!form.title || !form.date}
                className="w-full py-3 bg-pink-400 text-white rounded-xl font-medium disabled:opacity-50 hover:bg-pink-50 dark:hover:bg-pink-600 dark:bg-pink-500 transition-colors"
              >
                Enregistrer
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* RDV à venir */}
      <div>
        <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
          À venir ({upcoming.length})
        </h2>
        {upcoming.length === 0 ? (
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 text-center text-gray-400 dark:text-gray-500 border border-pink-100 dark:border-pink-900/30 shadow-sm">
            <Calendar className="w-10 h-10 mx-auto mb-2 text-pink-200" />
            <p className="text-sm">Aucun rendez-vous à venir</p>
          </div>
        ) : (
          <div className="space-y-3">
            {upcoming.map((appt) => (
              <motion.div
                key={appt.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-sm border border-pink-100 dark:border-pink-900/30"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {isToday(new Date(appt.date)) && (
                        <span className="text-xs bg-pink-100 dark:bg-pink-900/30 text-pink-600 px-2 py-0.5 rounded-full font-medium">
                          Aujourd&apos;hui
                        </span>
                      )}
                      <h3 className="font-semibold text-[#3d2b2b] dark:text-gray-100">{appt.title}</h3>
                    </div>
                    <p className="text-sm text-pink-500 font-medium">
                      {format(new Date(appt.date + "T00:00:00"), "EEEE d MMMM yyyy", { locale: fr })} à {appt.time}
                    </p>
                    {appt.doctor && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">👨‍⚕️ {appt.doctor}</p>
                    )}
                    {appt.location && (
                      <p className="text-xs text-gray-500 dark:text-gray-400">📍 {appt.location}</p>
                    )}
                    {appt.notes && (
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 italic">{appt.notes}</p>
                    )}
                  </div>
                  <div className="flex gap-2 ml-3">
                    <button
                      onClick={() => store.updateAppointment(appt.id, { done: true })}
                      className="w-8 h-8 flex items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30 text-green-500 hover:bg-green-200 transition-colors"
                      aria-label="Marquer comme fait"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setConfirmDelete(appt.id)}
                      className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 hover:bg-red-100 dark:bg-red-900/30 hover:text-red-400 transition-colors"
                      aria-label="Supprimer le rendez-vous"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Checklist examens par trimestre */}
      <div>
        <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
          Examens par trimestre
        </h2>
        {([1, 2, 3] as const).map((t) => {
          const exams = EXAM_CHECKLIST.filter((e) => e.trimester === t);
          const isExpanded = expandedExam === t;
          return (
            <div key={t} className={`mb-3 rounded-2xl border overflow-hidden ${trimesterColors[t]}`}>
              <button
                onClick={() => setExpandedExam(isExpanded ? null : t)}
                className="w-full flex items-center justify-between p-4"
              >
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${trimesterHeaderColors[t]}`}>
                    {t === 1 ? "1er" : t === 2 ? "2ème" : "3ème"} trimestre
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">{exams.length} examens</span>
                </div>
                {isExpanded ? (
                  <ChevronUp className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                )}
              </button>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: "auto" }}
                    exit={{ height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 space-y-2">
                      {exams.map((exam, i) => (
                        <div key={i} className="flex items-center justify-between bg-white/70 dark:bg-gray-800/70 rounded-xl p-2.5">
                          <div>
                            <p className="text-sm text-[#3d2b2b] dark:text-gray-100">{exam.label}</p>
                            {exam.week && (
                              <p className="text-xs text-gray-400 dark:text-gray-500">{exam.week}</p>
                            )}
                          </div>
                          <button
                            onClick={() => {
                              const title = exam.label;
                              const exists = store.appointments.some(
                                (a) => a.title === title
                              );
                              if (!exists) {
                                store.addAppointment({
                                  title,
                                  date: format(new Date(), "yyyy-MM-dd"),
                                  time: "09:00",
                                  done: false,
                                });
                              }
                            }}
                            className="text-xs bg-pink-100 dark:bg-pink-900/30 text-pink-600 px-2 py-1 rounded-lg hover:bg-pink-200 transition-colors"
                          >
                            + RDV
                          </button>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* RDV passés */}
      {past.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
            Passés ({past.length})
          </h2>
          <div className="space-y-2">
            {past.slice().reverse().map((appt) => (
              <div
                key={appt.id}
                className="bg-white dark:bg-gray-900 rounded-2xl px-4 py-3 shadow-sm border border-gray-100 dark:border-gray-800 opacity-60 flex items-center justify-between"
              >
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 line-through">{appt.title}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    {format(new Date(appt.date + "T00:00:00"), "d MMM yyyy", { locale: fr })}
                  </p>
                </div>
                <button
                  onClick={() => setConfirmDelete(appt.id)}
                  className="text-gray-300 dark:text-gray-500 hover:text-red-400"
                  aria-label="Supprimer le rendez-vous"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={confirmDelete !== null}
        title="Supprimer ce rendez-vous ?"
        message="Cette action est irréversible."
        onConfirm={() => { store.removeAppointment(confirmDelete!); setConfirmDelete(null); }}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
}
