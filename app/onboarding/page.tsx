"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/lib/auth";
import { Heart, Baby, Calendar, Sparkles, ArrowRight, ArrowLeft, Loader2 } from "lucide-react";

type Step = 1 | 2 | 3;

export default function OnboardingPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [step, setStep] = useState<Step>(1);
  const [mamaName, setMamaName] = useState("");
  const [babyName, setBabyName] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleNext = () => {
    if (step === 1 && !mamaName.trim()) {
      setError("Veuillez entrer votre prénom");
      return;
    }
    if (step === 2 && !dueDate) {
      setError("Veuillez sélectionner une date");
      return;
    }
    setError(null);
    if (step < 3) {
      setStep((s) => (s + 1) as Step);
    }
  };

  const handleBack = () => {
    setError(null);
    if (step > 1) {
      setStep((s) => (s - 1) as Step);
    }
  };

  const handleComplete = async () => {
    setLoading(true);
    setError(null);

    try {
      const { createClient } = await import('@/lib/supabase');
      const supabase = createClient();
      
      // Récupérer l'utilisateur actuel (peut ne pas être dans le contexte encore)
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      
      if (currentUser) {
        // Sauvegarder le profil en Supabase
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase.from('profiles') as any).upsert({
          id: currentUser.id,
          due_date: dueDate || null,
          baby_name: babyName.trim() || null,
          mama_name: mamaName.trim(),
        });
      }

      // Toujours sauvegarder en localStorage pour le mode offline
      const existingData = localStorage.getItem('pregnancy-tracker');
      const data = existingData ? JSON.parse(existingData) : {};
      data.dueDate = dueDate;
      data.mamaName = mamaName.trim();
      data.babyName = babyName.trim() || null;
      localStorage.setItem('pregnancy-tracker', JSON.stringify(data));

      router.push('/');
    } catch (err) {
      console.error('Onboarding error:', err);
      // Même en cas d'erreur Supabase, on redirige quand même
      const existingData = localStorage.getItem('pregnancy-tracker');
      const data = existingData ? JSON.parse(existingData) : {};
      data.dueDate = dueDate;
      data.mamaName = mamaName.trim();
      data.babyName = babyName.trim() || null;
      localStorage.setItem('pregnancy-tracker', JSON.stringify(data));
      router.push('/');
    }
  };

  const stepVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 100 : -100,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 100 : -100,
      opacity: 0,
    }),
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8 bg-gradient-to-b from-pink-50 via-white to-purple-50">
      <div className="w-full max-w-md">
        {/* Progress indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[1, 2, 3].map((s) => (
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

        <AnimatePresence mode="wait" custom={step}>
          {/* Step 1: Names */}
          {step === 1 && (
            <motion.div
              key="step1"
              custom={1}
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="bg-white rounded-3xl shadow-xl p-8 border border-pink-100"
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
                <h2 className="text-2xl font-bold text-gray-800">Bienvenue ! 🌸</h2>
                <p className="text-gray-500 mt-2">Comment vous appelez-vous ?</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1.5">
                    Votre prénom *
                  </label>
                  <input
                    type="text"
                    value={mamaName}
                    onChange={(e) => setMamaName(e.target.value)}
                    placeholder="Ex: Marie"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-transparent transition-all"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1.5">
                    Prénom du bébé (si vous l&apos;avez choisi)
                  </label>
                  <div className="relative">
                    <Baby className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={babyName}
                      onChange={(e) => setBabyName(e.target.value)}
                      placeholder="Optionnel"
                      className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-transparent transition-all"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 2: Due Date */}
          {step === 2 && (
            <motion.div
              key="step2"
              custom={1}
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="bg-white rounded-3xl shadow-xl p-8 border border-pink-100"
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
                <h2 className="text-2xl font-bold text-gray-800">
                  Quand bébé arrive ? 📅
                </h2>
                <p className="text-gray-500 mt-2">
                  Entrez votre date prévue d&apos;accouchement (DPA)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1.5">
                  Date prévue d&apos;accouchement *
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-transparent transition-all text-center text-lg"
                />
                <p className="text-xs text-gray-400 mt-2 text-center">
                  Cette date est calculée à environ 40 semaines de grossesse
                </p>
              </div>
            </motion.div>
          )}

          {/* Step 3: Confirmation */}
          {step === 3 && (
            <motion.div
              key="step3"
              custom={1}
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="bg-white rounded-3xl shadow-xl p-8 border border-pink-100"
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
                <h2 className="text-2xl font-bold text-gray-800">
                  Tout est prêt ! ✨
                </h2>
                <p className="text-gray-500 mt-2">
                  Vérifiez vos informations
                </p>
              </div>

              <div className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Prénom</span>
                  <span className="font-semibold text-gray-800">{mamaName}</span>
                </div>
                {babyName && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Bébé</span>
                    <span className="font-semibold text-gray-800">{babyName}</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">DPA</span>
                  <span className="font-semibold text-gray-800">
                    {new Date(dueDate).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </span>
                </div>
              </div>

              <p className="text-sm text-gray-500 text-center mt-4">
                Vous pourrez modifier ces informations à tout moment dans les paramètres.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 bg-red-50 text-red-600 text-sm p-3 rounded-xl text-center"
          >
            {error}
          </motion.div>
        )}

        {/* Navigation buttons */}
        <div className="flex items-center justify-between mt-6 gap-3">
          {step > 1 ? (
            <button
              onClick={handleBack}
              className="flex items-center gap-2 px-5 py-3 text-gray-600 font-medium hover:text-gray-800 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Retour
            </button>
          ) : (
            <div />
          )}

          {step < 3 ? (
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
