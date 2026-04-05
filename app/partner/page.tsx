"use client";
import { useStore } from "@/lib/store";
import { getCurrentWeek, getDaysRemaining, getWeekData } from "@/lib/pregnancy-data";
import { motion } from "framer-motion";
import { Heart } from "lucide-react";

export default function PartnerViewPage() {
  const store = useStore();

  const dueDate = store.dueDate ? new Date(store.dueDate) : null;
  const week = dueDate ? getCurrentWeek(dueDate) : 20;
  const days = dueDate ? getDaysRemaining(dueDate) : null;
  const weekData = getWeekData(week);

  return (
    <div className="max-w-lg mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-pink-400 to-purple-400 rounded-3xl flex items-center justify-center mx-auto mb-3 shadow-lg">
          <Heart className="w-8 h-8 text-white fill-white" />
        </div>
        <h1 className="text-2xl font-bold text-[#3d2b2b]">Vue Partenaire</h1>
        {store.mamaName && <p className="text-gray-400">La grossesse de {store.mamaName} 💕</p>}
      </div>

      {/* Semaine actuelle */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-pink-100 via-purple-50 to-indigo-50 rounded-3xl p-6 text-center border border-pink-100 shadow-sm">
        <motion.div animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
          transition={{ repeat: Infinity, duration: 4 }} className="text-7xl mb-3">
          {weekData.fruitEmoji}
        </motion.div>
        <h2 className="text-5xl font-bold text-[#3d2b2b]">{week} <span className="text-2xl text-pink-400">SA</span></h2>
        <p className="text-gray-500 mt-1">comme {weekData.fruit}</p>
        {days !== null && (
          <div className="mt-3 bg-white rounded-2xl px-4 py-2 inline-block shadow-sm">
            <span className="text-2xl font-bold text-purple-500">{days}</span>
            <span className="text-sm text-gray-400 ml-1">jours avant l&apos;arrivée{store.babyName ? ` de ${store.babyName}` : ''} 💕</span>
          </div>
        )}
      </motion.div>

      {/* Développement bébé */}
      <div className="bg-white rounded-3xl p-5 shadow-sm border border-green-100">
        <h3 className="font-semibold text-[#3d2b2b] mb-2 flex items-center gap-2">
          <span>🧬</span> Ce qui se passe cette semaine
        </h3>
        <p className="text-sm text-gray-600 leading-relaxed">{weekData.babyDevelopment}</p>
      </div>

      {/* Dernier poids */}
      {store.weightEntries.length > 0 && (
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-pink-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-pink-100 rounded-2xl flex items-center justify-center text-2xl">⚖️</div>
          <div>
            <p className="text-xs text-gray-400 font-medium">Dernier poids</p>
            <p className="text-2xl font-bold text-[#3d2b2b]">
              {store.weightEntries[store.weightEntries.length - 1].weight} <span className="text-sm font-normal text-gray-400">kg</span>
            </p>
          </div>
        </div>
      )}

      {/* Prochain RDV */}
      {(() => {
        const next = store.appointments
          .filter(a => !a.done && new Date(a.date) >= new Date())
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];
        if (!next) return null;
        return (
          <div className="bg-white rounded-3xl p-5 shadow-sm border border-orange-100 flex items-center gap-4">
            <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center text-2xl">📅</div>
            <div>
              <p className="text-xs text-gray-400 font-medium">Prochain rendez-vous</p>
              <p className="font-semibold text-[#3d2b2b]">{next.title}</p>
              <p className="text-xs text-gray-400">{next.date} à {next.time}</p>
            </div>
          </div>
        );
      })()}

      {/* Conseil de la semaine */}
      <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-3xl p-5 border border-pink-100">
        <p className="text-xs font-semibold text-pink-500 mb-1">💡 Conseil pour vous aussi</p>
        <p className="text-sm text-gray-600 leading-relaxed">
          {week < 14 ? "Soyez présent, rassurant. Les premiers mois peuvent être anxieux. Un câlin va loin." :
           week < 28 ? "C'est le moment idéal pour préparer ensemble la chambre et les achats essentiels." :
           week < 36 ? "Le sac de maternité ! Préparez-le ensemble et sachez où se trouve la maternité." :
           "L'accouchement peut arriver à tout moment. Restez joignable et gardez votre téléphone chargé 😊"}
        </p>
      </div>

      <p className="text-center text-xs text-gray-300 pb-4">MamaTrack 🌸 · Suivi de grossesse</p>
    </div>
  );
}
