"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { useStore } from "@/lib/store";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Plus, Minus, Trash2, Baby } from "lucide-react";

type Tab = "symptoms" | "weight" | "water" | "kicks";

const SYMPTOM_OPTIONS = [
  "Nausées", "Fatigue", "Douleurs dos", "Brûlures d'estomac",
  "Vertiges", "Gonflement", "Insomnies", "Maux de tête",
  "Crampes", "Constipation", "Saignements des gencives", "Essoufflement",
];

export default function TrackingPage() {
  const [activeTab, setActiveTab] = useState<Tab>("symptoms");
  const store = useStore();

  const today = format(new Date(), "yyyy-MM-dd");

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      {/* Tabs */}
      <div className="flex gap-1 bg-pink-50 rounded-2xl p-1 mb-6">
        {([
          { id: "symptoms", label: "😣 Symptômes" },
          { id: "weight", label: "⚖️ Poids" },
          { id: "water", label: "💧 Eau" },
          { id: "kicks", label: "👶 Mouvements" },
        ] as { id: Tab; label: string }[]).map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-1.5 text-xs font-medium rounded-xl transition-all ${
              activeTab === tab.id
                ? "bg-white text-pink-600 shadow-sm"
                : "text-gray-500 hover:text-pink-400"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === "symptoms" && (
          <SymptomTab key="symptoms" store={store} />
        )}
        {activeTab === "weight" && (
          <WeightTab key="weight" store={store} />
        )}
        {activeTab === "water" && (
          <WaterTab key="water" store={store} today={today} />
        )}
        {activeTab === "kicks" && (
          <KicksTab key="kicks" store={store} today={today} />
        )}
      </AnimatePresence>
    </div>
  );
}

// ---- SYMPTOM TAB ----
function SymptomTab({ store }: { store: ReturnType<typeof useStore> }) {
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [severity, setSeverity] = useState(3);
  const [note, setNote] = useState("");
  const [showForm, setShowForm] = useState(false);

  const toggleSymptom = (s: string) => {
    setSelectedSymptoms((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );
  };

  const handleSubmit = () => {
    if (selectedSymptoms.length === 0) return;
    store.addSymptomEntry({
      date: format(new Date(), "yyyy-MM-dd"),
      symptoms: selectedSymptoms,
      severity,
      note: note || undefined,
    });
    setSelectedSymptoms([]);
    setSeverity(3);
    setNote("");
    setShowForm(false);
  };

  const chartData = store.symptomEntries.slice(-14).map((e) => ({
    date: format(new Date(e.date), "dd/MM"),
    sévérité: e.severity,
    count: e.symptoms.length,
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="space-y-4"
    >
      <button
        onClick={() => setShowForm(!showForm)}
        className="w-full py-3 bg-pink-400 text-white rounded-2xl font-medium flex items-center justify-center gap-2 hover:bg-pink-500 transition-colors shadow-sm"
      >
        <Plus className="w-4 h-4" />
        Ajouter des symptômes
      </button>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white rounded-3xl p-5 shadow-sm border border-pink-100 overflow-hidden"
          >
            <h3 className="font-semibold text-[#3d2b2b] mb-3">Symptômes aujourd&apos;hui</h3>
            <div className="flex flex-wrap gap-2 mb-4">
              {SYMPTOM_OPTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => toggleSymptom(s)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    selectedSymptoms.includes(s)
                      ? "bg-pink-400 text-white shadow-sm"
                      : "bg-pink-50 text-pink-600 hover:bg-pink-100"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>

            <div className="mb-4">
              <label className="text-xs text-gray-500 block mb-2">
                Sévérité : {severity}/5
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((v) => (
                  <button
                    key={v}
                    onClick={() => setSeverity(v)}
                    className={`flex-1 h-8 rounded-xl text-sm font-bold transition-all ${
                      v <= severity
                        ? "bg-pink-400 text-white"
                        : "bg-pink-50 text-pink-300"
                    }`}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>

            <textarea
              placeholder="Note (optionnel)..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full border border-pink-200 rounded-xl p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-pink-300 mb-3"
              rows={2}
            />

            <button
              onClick={handleSubmit}
              disabled={selectedSymptoms.length === 0}
              className="w-full py-2.5 bg-pink-400 text-white rounded-xl font-medium disabled:opacity-50 hover:bg-pink-500 transition-colors"
            >
              Enregistrer
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {chartData.length > 1 && (
        <div className="bg-white rounded-3xl p-4 shadow-sm border border-pink-100">
          <h3 className="text-sm font-semibold text-[#3d2b2b] mb-3">Évolution (14 derniers jours)</h3>
          <ResponsiveContainer width="100%" height={150}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#fce7f3" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#9b7b8a" }} />
              <YAxis tick={{ fontSize: 10, fill: "#9b7b8a" }} domain={[0, 5]} />
              <Tooltip
                contentStyle={{ borderRadius: "12px", border: "1px solid #fce7f3" }}
              />
              <Bar dataKey="sévérité" fill="#F9A8D4" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="space-y-3">
        {store.symptomEntries.slice().reverse().map((entry) => (
          <div
            key={entry.id}
            className="bg-white rounded-2xl p-4 shadow-sm border border-pink-100 flex items-start justify-between"
          >
            <div>
              <p className="text-xs text-gray-400 mb-1">
                {format(new Date(entry.date), "d MMMM yyyy", { locale: fr })}
              </p>
              <div className="flex flex-wrap gap-1 mb-1">
                {entry.symptoms.map((s) => (
                  <span key={s} className="text-xs bg-pink-100 text-pink-600 px-2 py-0.5 rounded-full">
                    {s}
                  </span>
                ))}
              </div>
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((v) => (
                  <span
                    key={v}
                    className={`w-4 h-1.5 rounded-full ${v <= entry.severity ? "bg-pink-400" : "bg-pink-100"}`}
                  />
                ))}
              </div>
              {entry.note && <p className="text-xs text-gray-500 mt-1">{entry.note}</p>}
            </div>
            <button
              onClick={() => store.removeSymptomEntry(entry.id)}
              className="text-gray-300 hover:text-red-400 transition-colors ml-2"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

// ---- WEIGHT TAB ----
function WeightTab({ store }: { store: ReturnType<typeof useStore> }) {
  const [weight, setWeight] = useState("");
  const [note, setNote] = useState("");

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
              <YAxis
                tick={{ fontSize: 10, fill: "#9b7b8a" }}
                domain={["auto", "auto"]}
              />
              <Tooltip
                contentStyle={{ borderRadius: "12px", border: "1px solid #ede9fe" }}
              />
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
        {store.weightEntries.slice().reverse().map((entry) => (
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
              onClick={() => store.removeWeightEntry(entry.id)}
              className="text-gray-300 hover:text-red-400 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

// ---- WATER TAB ----
function WaterTab({ store, today }: { store: ReturnType<typeof useStore>; today: string }) {
  const waterToday = store.waterIntake[today] ?? 0;
  const goal = 2000;
  const pct = Math.min(100, (waterToday / goal) * 100);

  const amounts = [250, 500, 750, 1000];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="space-y-5"
    >
      {/* Jauge principale */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-blue-100 text-center">
        <div className="relative w-40 h-40 mx-auto mb-4">
          <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
            <circle cx="60" cy="60" r="50" fill="none" stroke="#e0f2fe" strokeWidth="10" />
            <motion.circle
              cx="60"
              cy="60"
              r="50"
              fill="none"
              stroke="#7dd3fc"
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 50}
              animate={{ strokeDashoffset: 2 * Math.PI * 50 * (1 - pct / 100) }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold text-blue-500">{waterToday}</span>
            <span className="text-xs text-gray-400">ml / {goal} ml</span>
          </div>
        </div>

        <div className="flex justify-center gap-2 flex-wrap">
          {["💧", "💧💧", "💧💧💧"].map((drops, i) => {
            const ml = (i + 1) * 8;
            void ml;
            return null;
          })}
        </div>

        <p className="text-sm font-medium text-gray-600">
          {pct >= 100 ? "🎉 Objectif atteint !" : `Encore ${goal - waterToday} ml pour atteindre l'objectif`}
        </p>
      </div>

      {/* Boutons rapides */}
      <div className="grid grid-cols-2 gap-3">
        {amounts.map((ml) => (
          <button
            key={ml}
            onClick={() => store.addWater(today, ml)}
            className="bg-white rounded-2xl py-4 shadow-sm border border-blue-100 flex flex-col items-center gap-1 hover:bg-blue-50 transition-colors"
          >
            <span className="text-2xl">💧</span>
            <span className="text-sm font-semibold text-blue-500">+ {ml} ml</span>
          </button>
        ))}
      </div>

      <button
        onClick={() => store.removeWater(today, 250)}
        disabled={waterToday === 0}
        className="w-full py-3 bg-white border border-red-100 text-red-400 rounded-2xl font-medium flex items-center justify-center gap-2 disabled:opacity-30 hover:bg-red-50 transition-colors"
      >
        <Minus className="w-4 h-4" />
        Annuler 250 ml
      </button>

      {/* Historique */}
      <div className="bg-white rounded-3xl p-4 shadow-sm border border-blue-100">
        <h3 className="text-sm font-semibold text-[#3d2b2b] mb-3">7 derniers jours</h3>
        {Object.entries(store.waterIntake)
          .sort((a, b) => b[0].localeCompare(a[0]))
          .slice(0, 7)
          .map(([date, ml]) => (
            <div key={date} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
              <span className="text-sm text-gray-600">
                {format(new Date(date), "EEEE d MMM", { locale: fr })}
              </span>
              <div className="flex items-center gap-2">
                <div className="w-20 bg-blue-100 rounded-full h-2">
                  <div
                    className="bg-blue-400 h-2 rounded-full"
                    style={{ width: `${Math.min(100, ((ml as number) / goal) * 100)}%` }}
                  />
                </div>
                <span className="text-xs font-semibold text-blue-500">{ml as number} ml</span>
              </div>
            </div>
          ))}
      </div>
    </motion.div>
  );
}

// ---- KICKS TAB ----
function KicksTab({ store, today }: { store: ReturnType<typeof useStore>; today: string }) {
  const [counting, setCounting] = useState(false);
  const [count, setCount] = useState(0);
  const [startTime, setStartTime] = useState<string | null>(null);
  const [startTs, setStartTs] = useState<number | null>(null);

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
          <Baby className={`w-10 h-10 mb-1 ${counting ? "text-green-500" : "text-pink-400"}`} />
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
              Total aujourd&apos;hui : <span className="font-bold text-green-600">{totalToday} mouvements</span>
            </p>
          </div>
        )}
      </div>

      {/* Sessions du jour */}
      {todaySessions.length > 0 && (
        <div className="bg-white rounded-3xl p-4 shadow-sm border border-green-100">
          <h3 className="text-sm font-semibold text-[#3d2b2b] mb-3">Sessions aujourd&apos;hui</h3>
          {todaySessions.map((s) => (
            <div key={s.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
              <div>
                <span className="text-sm font-semibold text-[#3d2b2b]">{s.count} mouvements</span>
                <p className="text-xs text-gray-400">{s.startTime} — {s.duration} min</p>
              </div>
              <button
                onClick={() => store.removeKickSession(s.id)}
                className="text-gray-300 hover:text-red-400 transition-colors"
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
              <div key={date} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <span className="text-sm text-gray-600">
                  {format(new Date(date), "EEEE d MMM", { locale: fr })}
                </span>
                <span className="text-sm font-semibold text-green-500">{total} mvts</span>
              </div>
            ))
        )}
      </div>
    </motion.div>
  );
}
