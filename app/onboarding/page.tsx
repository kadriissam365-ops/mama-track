"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/lib/toast";
import { Heart, Baby, Calendar, Sparkles, ArrowRight, ArrowLeft, Loader2, FlaskConical, Bell } from "lucide-react";
import {
  calculateDueDateFromDDR,
  calculateDueDateFromConception,
  calculateDueDateFIV,
  calculateDueDateFromPonction,
  calculateDueDateFromCurrentWeek,
} from "@/lib/pregnancy-data";

type Step = 1 | 2 | 3 | 4 | 5;
type ConceptionMode = "naturelle" | "fiv_frais" | "fiv_tec";
type DpaMethod = "direct" | "ddr" | "conception" | "fiv" | "current_week";
type FivStade = "J3" | "J5";
type WeekMode = "SA" | "GA";

export default function OnboardingPage() {
  const router = useRouter();
  const { user } = useAuth();
  const toast = useToast();
  const [step, setStep] = useState<Step>(1);

  // Step 1: Names
  const [mamaName, setMamaName] = useState("");
  const [babyName, setBabyName] = useState("");

  // Step 2: Conception mode
  const [conceptionMode, setConceptionMode] = useState<ConceptionMode>("naturelle");

  // Step 3: DPA calculation
  const [dpaMethod, setDpaMethod] = useState<DpaMethod>("direct");
  const [dueDate, setDueDate] = useState("");
  const [ddrDate, setDdrDate] = useState("");
  const [conceptionDate, setConceptionDate] = useState("");
  const [ponctionDate, setPonctionDate] = useState("");
  const [transfertDate, setTransfertDate] = useState("");
  const [fivStade, setFivStade] = useState<FivStade>("J5");
  const [currentWeeks, setCurrentWeeks] = useState("");
  const [currentDays, setCurrentDays] = useState("0");
  const [weekMode, setWeekMode] = useState<WeekMode>("SA");

  const [notifRdv, setNotifRdv] = useState(true);
  const [notifDaily, setNotifDaily] = useState(true);
  const [notifMeds, setNotifMeds] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Compute effective DPA
  const computedDueDate = (): string => {
    try {
      if (dpaMethod === "direct" && dueDate) return dueDate;
      if (dpaMethod === "ddr" && ddrDate) {
        return calculateDueDateFromDDR(new Date(ddrDate)).toISOString().split("T")[0];
      }
      if (dpaMethod === "conception" && conceptionDate) {
        return calculateDueDateFromConception(new Date(conceptionDate)).toISOString().split("T")[0];
      }
      if (dpaMethod === "fiv") {
        if (conceptionMode === "fiv_frais" && ponctionDate) {
          return calculateDueDateFromPonction(new Date(ponctionDate)).toISOString().split("T")[0];
        }
        if (conceptionMode === "fiv_tec" && transfertDate) {
          return calculateDueDateFIV(new Date(transfertDate), fivStade).toISOString().split("T")[0];
        }
      }
      if (dpaMethod === "current_week" && currentWeeks) {
        const w = parseInt(currentWeeks, 10);
        const d = parseInt(currentDays || "0", 10);
        if (!isNaN(w) && w >= 0 && w <= 42 && !isNaN(d) && d >= 0 && d <= 6) {
          return calculateDueDateFromCurrentWeek(w, d, weekMode).toISOString().split("T")[0];
        }
      }
    } catch {
      // pass
    }
    return dueDate;
  };

  const handleNext = () => {
    setError(null);
    if (step === 1 && !mamaName.trim()) {
      setError("Veuillez entrer votre prénom");
      return;
    }
    if (step === 3) {
      const computed = computedDueDate();
      if (!computed) {
        setError("Veuillez renseigner les informations de date");
        return;
      }
    }
    if (step < 5) setStep((s) => (s + 1) as Step);
  };

  const handleBack = () => {
    setError(null);
    if (step > 1) setStep((s) => (s - 1) as Step);
  };

  const handleComplete = async () => {
    setLoading(true);
    setError(null);
    const finalDueDate = computedDueDate();

    try {
      const { createClient } = await import("@/lib/supabase");
      const supabase = createClient();
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();

      if (currentUser) {
        // Écriture Supabase bloquante : si elle échoue, on n'écrit PAS localStorage
        // et on ne navigue PAS pour éviter toute divergence entre cloud et local.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error: upsertError } = await (supabase.from("profiles") as any).upsert({
          id: currentUser.id,
          due_date: finalDueDate || null,
          baby_name: babyName.trim() || null,
          mama_name: mamaName.trim(),
          conception_mode: conceptionMode,
        });

        if (upsertError) {
          console.error("Onboarding Supabase error:", upsertError);
          toast.error("Impossible d'enregistrer votre profil. Veuillez réessayer.");
          setError("Impossible d'enregistrer votre profil. Veuillez réessayer.");
          setLoading(false);
          return;
        }
      }

      const existingData = localStorage.getItem("pregnancy-tracker");
      const data = existingData ? JSON.parse(existingData) : {};
      data.dueDate = finalDueDate;
      data.mamaName = mamaName.trim();
      data.babyName = babyName.trim() || null;
      data.conceptionMode = conceptionMode;
      data.notifications = { rdv: notifRdv, daily: notifDaily, meds: notifMeds };
      localStorage.setItem("pregnancy-tracker", JSON.stringify(data));

      router.push("/");
    } catch (err) {
      console.error("Onboarding error:", err);
      toast.error("Impossible d'enregistrer votre profil. Veuillez réessayer.");
      setError("Impossible d'enregistrer votre profil. Veuillez réessayer.");
      setLoading(false);
    }
  };

  const stepVariants = {
    enter: { x: 100, opacity: 0 },
    center: { x: 0, opacity: 1 },
    exit: { x: -100, opacity: 0 },
  };

  // Determine DPA method options
  const currentWeekOption = {
    value: "current_week" as DpaMethod,
    label: "🤰 Depuis ma semaine de grossesse actuelle",
    desc: "Vous savez à quelle semaine vous êtes (SA ou GA)",
  };
  const dpaOptions: Array<{ value: DpaMethod; label: string; desc: string }> =
    conceptionMode === "naturelle"
      ? [
          { value: "direct", label: "📅 Saisir ma DPA directement", desc: "Vous connaissez déjà votre date prévue" },
          { value: "ddr", label: "🗓️ Depuis ma DDR", desc: "Date de début de vos dernières règles + 280 jours" },
          { value: "conception", label: "💕 Depuis la date de conception", desc: "Date de conception + 266 jours" },
          currentWeekOption,
        ]
      : conceptionMode === "fiv_frais"
      ? [
          { value: "direct", label: "📅 Saisir ma DPA directement", desc: "Vous connaissez déjà votre date prévue" },
          { value: "fiv", label: "🔬 Depuis la date de ponction", desc: "Date ponction + 266 jours" },
          currentWeekOption,
        ]
      : [
          { value: "direct", label: "📅 Saisir ma DPA directement", desc: "Vous connaissez déjà votre date prévue" },
          { value: "fiv", label: "🧊 Depuis la date de transfert", desc: "Selon le stade de l'embryon (J3 ou J5)" },
          currentWeekOption,
        ];

  const finalDueDate = computedDueDate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8 bg-gradient-to-b from-pink-50 via-white to-purple-50 dark:from-[#0f0f1a] dark:via-[#0f0f1a] dark:to-[#1a1a2e]">
      <div className="w-full max-w-md">
        {/* Progress indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[1, 2, 3, 4, 5].map((s) => (
            <motion.div
              key={s}
              initial={false}
              animate={{
                scale: step === s ? 1.2 : 1,
                backgroundColor: step >= s ? "#f472b6" : "#fce7f3",
              }}
              className="w-3 h-3 rounded-full"
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* Step 1: Names */}
          {step === 1 && (
            <motion.div
              key="step1"
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="bg-white dark:bg-[#1a1a2e] rounded-3xl shadow-xl p-8 border border-pink-100 dark:border-pink-900"
            >
              <div className="text-center mb-6">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", delay: 0.1 }}
                  className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-pink-400 to-pink-500 rounded-2xl shadow-lg mb-4"
                >
                  <Heart className="w-8 h-8 text-white fill-white" />
                </motion.div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Bienvenue ! 🌸</h2>
                <p className="text-gray-500 dark:text-gray-400 mt-2">Comment vous appelez-vous ?</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1.5">
                    Votre prénom *
                  </label>
                  <input
                    type="text"
                    value={mamaName}
                    onChange={(e) => setMamaName(e.target.value)}
                    placeholder="Ex: Marie"
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-[#0f0f1a] border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-300 text-gray-800 dark:text-gray-100 transition-all"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1.5">
                    Prénom du bébé (si vous l&apos;avez choisi)
                  </label>
                  <div className="relative">
                    <Baby className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                    <input
                      type="text"
                      value={babyName}
                      onChange={(e) => setBabyName(e.target.value)}
                      placeholder="Optionnel"
                      className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-[#0f0f1a] border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-300 text-gray-800 dark:text-gray-100 transition-all"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 2: Conception mode */}
          {step === 2 && (
            <motion.div
              key="step2"
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="bg-white dark:bg-[#1a1a2e] rounded-3xl shadow-xl p-8 border border-pink-100 dark:border-pink-900"
            >
              <div className="text-center mb-6">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", delay: 0.1 }}
                  className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-400 to-purple-500 rounded-2xl shadow-lg mb-4"
                >
                  <FlaskConical className="w-8 h-8 text-white" />
                </motion.div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Mode de conception 🌸</h2>
                <p className="text-gray-500 dark:text-gray-400 mt-2">Pour calculer votre DPA avec précision</p>
              </div>

              <div className="space-y-3">
                {[
                  { value: "naturelle" as ConceptionMode, icon: "🌸", label: "Naturelle", desc: "Conception naturelle — calcul classique" },
                  { value: "fiv_frais" as ConceptionMode, icon: "🔬", label: "FIV transfert frais", desc: "Date ponction → DPA = ponction + 266 jours" },
                  { value: "fiv_tec" as ConceptionMode, icon: "🧊", label: "FIV TEC (embryon congelé)", desc: "Date transfert + stade embryonnaire (J3/J5)" },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => {
                      setConceptionMode(opt.value);
                      if (opt.value === "fiv_frais" || opt.value === "fiv_tec") {
                        setDpaMethod("fiv");
                      } else {
                        setDpaMethod("direct");
                      }
                    }}
                    className={`w-full text-left p-4 rounded-2xl border-2 transition-all ${
                      conceptionMode === opt.value
                        ? "border-pink-400 bg-pink-50 dark:bg-pink-950/30"
                        : "border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#0f0f1a]"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{opt.icon}</span>
                      <div>
                        <p className="font-semibold text-gray-800 dark:text-gray-100">{opt.label}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{opt.desc}</p>
                      </div>
                      {conceptionMode === opt.value && (
                        <span className="ml-auto text-pink-500 dark:text-pink-400">✓</span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Step 3: DPA calculation */}
          {step === 3 && (
            <motion.div
              key="step3"
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="bg-white dark:bg-[#1a1a2e] rounded-3xl shadow-xl p-8 border border-pink-100 dark:border-pink-900"
            >
              <div className="text-center mb-6">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", delay: 0.1 }}
                  className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-400 to-purple-500 rounded-2xl shadow-lg mb-4"
                >
                  <Calendar className="w-8 h-8 text-white" />
                </motion.div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Quand bébé arrive ? 📅</h2>
                <p className="text-gray-500 dark:text-gray-400 mt-2">Choisissez votre méthode de calcul</p>
              </div>

              {/* Method selector */}
              <div className="space-y-2 mb-4">
                {dpaOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setDpaMethod(opt.value)}
                    className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-all ${
                      dpaMethod === opt.value
                        ? "border-purple-400 bg-purple-50 dark:bg-purple-950/30"
                        : "border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#0f0f1a]"
                    }`}
                  >
                    <p className="font-medium text-gray-800 dark:text-gray-100 text-sm">{opt.label}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{opt.desc}</p>
                  </button>
                ))}
              </div>

              {/* Adaptive input */}
              <div className="space-y-3 mt-4">
                {dpaMethod === "direct" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1.5">
                      Date prévue d&apos;accouchement *
                    </label>
                    <input
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      min={new Date().toISOString().split("T")[0]}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-[#0f0f1a] border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-300 text-center text-gray-800 dark:text-gray-100"
                    />
                  </div>
                )}
                {dpaMethod === "ddr" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1.5">
                      Date de vos dernières règles (DDR)
                    </label>
                    <input
                      type="date"
                      value={ddrDate}
                      onChange={(e) => setDdrDate(e.target.value)}
                      max={new Date().toISOString().split("T")[0]}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-[#0f0f1a] border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-300 text-center text-gray-800 dark:text-gray-100"
                    />
                  </div>
                )}
                {dpaMethod === "conception" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1.5">
                      Date de conception estimée
                    </label>
                    <input
                      type="date"
                      value={conceptionDate}
                      onChange={(e) => setConceptionDate(e.target.value)}
                      max={new Date().toISOString().split("T")[0]}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-[#0f0f1a] border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-300 text-center text-gray-800 dark:text-gray-100"
                    />
                  </div>
                )}
                {dpaMethod === "fiv" && conceptionMode === "fiv_frais" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1.5">
                      🔬 Date de ponction ovocytaire
                    </label>
                    <input
                      type="date"
                      value={ponctionDate}
                      onChange={(e) => setPonctionDate(e.target.value)}
                      max={new Date().toISOString().split("T")[0]}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-[#0f0f1a] border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-300 text-center text-gray-800 dark:text-gray-100"
                    />
                  </div>
                )}
                {dpaMethod === "fiv" && conceptionMode === "fiv_tec" && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1.5">
                        🧊 Date de transfert embryonnaire
                      </label>
                      <input
                        type="date"
                        value={transfertDate}
                        onChange={(e) => setTransfertDate(e.target.value)}
                        max={new Date().toISOString().split("T")[0]}
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-[#0f0f1a] border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-300 text-center text-gray-800 dark:text-gray-100"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1.5">
                        Stade embryonnaire
                      </label>
                      <div className="flex gap-3">
                        {(["J3", "J5"] as FivStade[]).map((stade) => (
                          <button
                            key={stade}
                            onClick={() => setFivStade(stade)}
                            className={`flex-1 py-2.5 rounded-xl border-2 font-semibold text-sm transition-all ${
                              fivStade === stade
                                ? "border-purple-400 bg-purple-50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-300"
                                : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400"
                            }`}
                          >
                            {stade} {stade === "J3" ? "(+263j)" : "(+261j)"}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {dpaMethod === "current_week" && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1.5">
                        Votre semaine actuelle
                      </label>
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
                            className="w-full px-4 py-3 bg-gray-50 dark:bg-[#0f0f1a] border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-300 text-center text-gray-800 dark:text-gray-100"
                          />
                          <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1 text-center">Semaines</p>
                        </div>
                        <div className="flex-1">
                          <input
                            type="number"
                            inputMode="numeric"
                            min="0"
                            max="6"
                            value={currentDays}
                            onChange={(e) => setCurrentDays(e.target.value)}
                            placeholder="0"
                            className="w-full px-4 py-3 bg-gray-50 dark:bg-[#0f0f1a] border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-300 text-center text-gray-800 dark:text-gray-100"
                          />
                          <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1 text-center">Jours (0–6)</p>
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1.5">
                        Unité de mesure
                      </label>
                      <div className="flex gap-3">
                        {(["SA", "GA"] as WeekMode[]).map((m) => (
                          <button
                            key={m}
                            onClick={() => setWeekMode(m)}
                            className={`flex-1 py-2.5 rounded-xl border-2 font-semibold text-sm transition-all ${
                              weekMode === m
                                ? "border-purple-400 bg-purple-50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-300"
                                : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400"
                            }`}
                          >
                            {m === "SA" ? "SA (aménorrhée)" : "GA (grossesse)"}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="bg-pink-50 dark:bg-pink-950/20 rounded-xl p-3 text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                      <p className="font-semibold text-pink-600 dark:text-pink-400 mb-1">💡 SA vs GA</p>
                      <p>
                        <strong>SA</strong> = semaines d&apos;aménorrhée, comptées depuis le 1<sup>er</sup> jour des dernières règles (utilisées en France, grossesse = 40 SA).
                      </p>
                      <p className="mt-1">
                        <strong>GA</strong> = semaines de grossesse, comptées depuis la conception (grossesse = 38 GA).
                      </p>
                      <p className="mt-1 italic">
                        Relation : <strong>SA = GA + 2</strong>. Ex : 20 GA = 22 SA.
                      </p>
                    </div>
                  </div>
                )}

                {/* Computed DPA preview */}
                {finalDueDate && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-purple-50 dark:bg-purple-950/30 rounded-xl p-3 text-center"
                  >
                    <p className="text-xs text-purple-500 dark:text-purple-400 font-medium">DPA calculée</p>
                    <p className="text-base font-bold text-purple-700 dark:text-purple-300">
                      {new Date(finalDueDate).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}

          {/* Step 4: Notifications */}
          {step === 4 && (
            <motion.div
              key="step4"
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="bg-white dark:bg-[#1a1a2e] rounded-3xl shadow-xl p-8 border border-pink-100 dark:border-pink-900"
            >
              <div className="text-center mb-6">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", delay: 0.1 }}
                  className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-400 to-orange-500 rounded-2xl shadow-lg mb-4"
                >
                  <Bell className="w-8 h-8 text-white" />
                </motion.div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Notifications 🔔</h2>
                <p className="text-gray-500 dark:text-gray-400 mt-2">Choisissez ce que vous voulez recevoir</p>
              </div>

              <div className="space-y-3">
                {[
                  { key: "rdv", label: "Rappels de rendez-vous", desc: "Notification avant chaque RDV medical", emoji: "📅", value: notifRdv, onChange: setNotifRdv },
                  { key: "daily", label: "Suivi quotidien", desc: "Rappel pour noter vos symptomes et votre humeur", emoji: "✨", value: notifDaily, onChange: setNotifDaily },
                  { key: "meds", label: "Medicaments & vitamines", desc: "Rappel pour prendre vos complements", emoji: "💊", value: notifMeds, onChange: setNotifMeds },
                ].map((notif) => (
                  <button
                    key={notif.key}
                    onClick={() => notif.onChange(!notif.value)}
                    className={`w-full text-left p-4 rounded-2xl border-2 transition-all ${
                      notif.value
                        ? "border-orange-400 bg-orange-50 dark:bg-orange-950/30"
                        : "border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#0f0f1a]"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{notif.emoji}</span>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-800 dark:text-gray-100">{notif.label}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{notif.desc}</p>
                      </div>
                      <div className={`w-12 h-7 rounded-full transition-colors flex items-center ${
                        notif.value ? "bg-orange-400 justify-end" : "bg-gray-300 justify-start"
                      }`}>
                        <div className="w-5 h-5 bg-white dark:bg-gray-900 rounded-full shadow mx-1" />
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              <p className="text-xs text-gray-400 dark:text-gray-500 text-center mt-4">
                Vous pourrez modifier ces preferences a tout moment dans les parametres.
              </p>
            </motion.div>
          )}

          {/* Step 5: Confirmation */}
          {step === 5 && (
            <motion.div
              key="step5"
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="bg-white dark:bg-[#1a1a2e] rounded-3xl shadow-xl p-8 border border-pink-100 dark:border-pink-900"
            >
              <div className="text-center mb-6">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", delay: 0.1 }}
                  className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-400 to-green-500 rounded-2xl shadow-lg mb-4"
                >
                  <Sparkles className="w-8 h-8 text-white" />
                </motion.div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Tout est prêt ! ✨</h2>
                <p className="text-gray-500 dark:text-gray-400 mt-2">Vérifiez vos informations</p>
              </div>

              <div className="bg-gradient-to-br from-pink-50 to-purple-50 dark:from-pink-950/30 dark:to-purple-950/30 rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Prénom</span>
                  <span className="font-semibold text-gray-800 dark:text-gray-100">{mamaName}</span>
                </div>
                {babyName && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Bébé</span>
                    <span className="font-semibold text-gray-800 dark:text-gray-100">{babyName}</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Mode</span>
                  <span className="font-semibold text-gray-800 dark:text-gray-100">
                    {conceptionMode === "naturelle" ? "🌸 Naturelle" : conceptionMode === "fiv_frais" ? "🔬 FIV frais" : "🧊 FIV TEC"}
                  </span>
                </div>
                {finalDueDate && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 dark:text-gray-400">DPA</span>
                    <span className="font-semibold text-gray-800 dark:text-gray-100">
                      {new Date(finalDueDate).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                )}
              </div>

              <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-4">
                Vous pourrez modifier ces informations à tout moment dans les paramètres.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 text-sm p-3 rounded-xl text-center"
          >
            {error}
          </motion.div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-6 gap-3">
          {step > 1 ? (
            <button
              onClick={handleBack}
              type="button"
              className="flex items-center gap-2 px-5 py-3 text-gray-600 dark:text-gray-300 font-medium hover:text-gray-800 dark:hover:text-gray-100 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Retour
            </button>
          ) : (
            <div />
          )}

          {step < 5 ? (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleNext}
              className="flex items-center gap-2 bg-gradient-to-r from-pink-400 to-pink-500 text-white font-semibold px-6 py-3 rounded-xl hover:from-pink-500 hover:to-pink-600 transition-all"
            >
              Continuer
              <ArrowRight className="w-5 h-5" />
            </motion.button>
          ) : (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleComplete}
              disabled={loading}
              className="flex items-center gap-2 bg-gradient-to-r from-green-400 to-green-500 text-white font-semibold px-6 py-3 rounded-xl hover:from-green-500 hover:to-green-600 transition-all disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Création...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  C&apos;est parti !
                </>
              )}
            </motion.button>
          )}
        </div>
      </div>
    </div>
  );
}
