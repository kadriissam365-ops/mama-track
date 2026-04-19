"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Heart, Shuffle, X } from "lucide-react";
import { prenoms, type Prenom } from "@/lib/prenoms-data";
import { useStore } from "@/lib/store";

const GENRE_CONFIG = {
  F: { label: "Fille 💗", border: "border-pink-300", bg: "bg-pink-50 dark:bg-pink-950/30", badge: "bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400", dot: "bg-pink-400" },
  M: { label: "Garçon 💙", border: "border-blue-300", bg: "bg-blue-50 dark:bg-blue-950/30", badge: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400", dot: "bg-blue-400" },
  mixte: { label: "Mixte 💛", border: "border-yellow-300", bg: "bg-yellow-50 dark:bg-yellow-950/30", badge: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400", dot: "bg-yellow-400" },
};

const ORIGINES = Array.from(new Set(prenoms.map((p) => p.origine))).sort();

function PrenomsCard({
  prenom,
  isFavori,
  onToggle,
}: {
  prenom: Prenom;
  isFavori: boolean;
  onToggle: (nom: string) => void;
}) {
  const config = GENRE_CONFIG[prenom.genre];
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className={`bg-white dark:bg-gray-900 rounded-3xl p-4 shadow-sm border-l-4 ${config.border} border border-gray-100 dark:border-gray-800 flex flex-col gap-2`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h3 className="text-xl font-bold text-[#3d2b2b] dark:text-gray-100 truncate">{prenom.nom}</h3>
          <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full mt-1 ${config.badge}`}>
            {prenom.genre === "F" ? "Fille" : prenom.genre === "M" ? "Garçon" : "Mixte"}
          </span>
        </div>
        <button
          onClick={() => onToggle(prenom.nom)}
          className={`w-9 h-9 flex-shrink-0 rounded-full flex items-center justify-center transition-all ${
            isFavori ? "bg-pink-100 dark:bg-pink-900/30 text-pink-500" : "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 hover:bg-pink-50 dark:hover:bg-pink-950/30 dark:bg-pink-950/30 hover:text-pink-400"
          }`}
        >
          <Heart className={`w-4 h-4 ${isFavori ? "fill-pink-400" : ""}`} />
        </button>
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">{prenom.origine}</p>
      <p className="text-xs text-gray-400 dark:text-gray-500 leading-relaxed line-clamp-2">{prenom.signification}</p>
      <div className="flex items-center gap-1 mt-1">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className={`w-1.5 h-1.5 rounded-full ${i <= prenom.popularite ? config.dot : "bg-gray-200 dark:bg-gray-700"}`}
          />
        ))}
        <span className="text-xs text-gray-400 dark:text-gray-500 ml-1">popularité</span>
      </div>
    </motion.div>
  );
}

export default function PrenomsPage() {
  const { babyNameFavorites, toggleBabyNameFavorite } = useStore();
  const [tab, setTab] = useState<"tous" | "favoris">("tous");
  const [genreFilter, setGenreFilter] = useState<"" | "M" | "F" | "mixte">("");
  const [origineFilter, setOrigineFilter] = useState("");
  const [lettreFilter, setLettreFilter] = useState("");
  const [search, setSearch] = useState("");
  const [surprisePrenom, setSurprisePrenom] = useState<Prenom | null>(null);

  const favoris = babyNameFavorites;
  const toggleFavori = (nom: string) => {
    void toggleBabyNameFavorite(nom);
  };

  const filtered = useMemo(() => {
    let list = prenoms;
    if (genreFilter) list = list.filter((p) => p.genre === genreFilter);
    if (origineFilter) list = list.filter((p) => p.origine === origineFilter);
    if (lettreFilter) list = list.filter((p) => p.nom.toUpperCase().startsWith(lettreFilter));
    if (search) list = list.filter((p) => p.nom.toLowerCase().includes(search.toLowerCase()));
    return list;
  }, [genreFilter, origineFilter, lettreFilter, search]);

  const favorisData = useMemo(() => prenoms.filter((p) => favoris.includes(p.nom)), [favoris]);

  const handleSurprise = () => {
    if (filtered.length === 0) return;
    const random = filtered[Math.floor(Math.random() * filtered.length)];
    setSurprisePrenom(random);
  };

  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

  return (
    <div className="max-w-lg mx-auto px-4 py-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#3d2b2b] dark:text-gray-100">💛 Prénoms</h1>
          <p className="text-sm text-gray-400 dark:text-gray-500">{prenoms.length} prénoms disponibles</p>
        </div>
        <button
          onClick={handleSurprise}
          className="flex items-center gap-2 bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-800/30 text-yellow-700 dark:text-yellow-300 rounded-2xl px-3 py-2 text-sm font-medium hover:bg-yellow-100 dark:hover:bg-yellow-900/30 dark:bg-yellow-900/30 transition-colors"
        >
          <Shuffle className="w-4 h-4" />
          Surprise
        </button>
      </div>

      {/* Tabs */}
      <div className="flex bg-gray-100 dark:bg-gray-800 rounded-2xl p-1">
        <button
          onClick={() => setTab("tous")}
          className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${
            tab === "tous" ? "bg-white dark:bg-gray-900 shadow-sm text-[#3d2b2b] dark:text-gray-100" : "text-gray-500 dark:text-gray-400"
          }`}
        >
          Tous ({filtered.length})
        </button>
        <button
          onClick={() => setTab("favoris")}
          className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${
            tab === "favoris" ? "bg-white dark:bg-gray-900 shadow-sm text-[#3d2b2b] dark:text-gray-100" : "text-gray-500 dark:text-gray-400"
          }`}
        >
          ❤️ Favoris ({favoris.length})
        </button>
      </div>

      {tab === "tous" && (
        <>
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              placeholder="Rechercher un prénom..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-200"
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2">
                <X className="w-4 h-4 text-gray-400 dark:text-gray-500" />
              </button>
            )}
          </div>

          {/* Genre filter */}
          <div className="flex gap-2 flex-wrap">
            {(["", "M", "F", "mixte"] as const).map((g) => (
              <button
                key={g}
                onClick={() => setGenreFilter(g)}
                className={`px-3 py-1.5 rounded-2xl text-sm font-medium transition-all ${
                  genreFilter === g
                    ? "bg-[#3d2b2b] text-white"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:bg-gray-700"
                }`}
              >
                {g === "" ? "Tous" : g === "M" ? "Garçon 💙" : g === "F" ? "Fille 💗" : "Mixte 💛"}
              </button>
            ))}
          </div>

          {/* Origine filter */}
          <select
            value={origineFilter}
            onChange={(e) => setOrigineFilter(e.target.value)}
            className="w-full bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl px-4 py-2.5 text-sm text-gray-600 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-200"
          >
            <option value="">Toutes les origines</option>
            {ORIGINES.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>

          {/* Lettre filter */}
          <div className="flex gap-1 flex-wrap">
            {letters.map((l) => (
              <button
                key={l}
                onClick={() => setLettreFilter(lettreFilter === l ? "" : l)}
                className={`w-7 h-7 rounded-lg text-xs font-medium transition-all ${
                  lettreFilter === l
                    ? "bg-pink-400 text-white"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:bg-gray-700"
                }`}
              >
                {l}
              </button>
            ))}
          </div>

          {/* Grid */}
          <div className="grid grid-cols-2 gap-3">
            <AnimatePresence mode="popLayout">
              {filtered.map((prenom) => (
                <PrenomsCard
                  key={prenom.nom}
                  prenom={prenom}
                  isFavori={favoris.includes(prenom.nom)}
                  onToggle={toggleFavori}
                />
              ))}
            </AnimatePresence>
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-12 text-gray-400 dark:text-gray-500">
              <p className="text-4xl mb-3">🔍</p>
              <p className="text-sm">Aucun prénom trouvé</p>
            </div>
          )}
        </>
      )}

      {tab === "favoris" && (
        <>
          {favorisData.length === 0 ? (
            <div className="text-center py-16 text-gray-400 dark:text-gray-500">
              <p className="text-5xl mb-4">💔</p>
              <p className="text-sm font-medium">Aucun favori pour l'instant</p>
              <p className="text-xs mt-1">Appuie sur ❤️ pour sauvegarder un prénom</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <AnimatePresence mode="popLayout">
                {favorisData.map((prenom) => (
                  <PrenomsCard
                    key={prenom.nom}
                    prenom={prenom}
                    isFavori={true}
                    onToggle={toggleFavori}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}
        </>
      )}

      {/* Surprise Modal */}
      <AnimatePresence>
        {surprisePrenom && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-6"
            onClick={() => setSurprisePrenom(null)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className={`bg-white dark:bg-gray-900 rounded-3xl p-8 max-w-xs w-full shadow-2xl border-t-4 ${GENRE_CONFIG[surprisePrenom.genre].border}`}
            >
              <p className="text-center text-4xl mb-2">🎲</p>
              <h2 className="text-3xl font-bold text-[#3d2b2b] dark:text-gray-100 text-center mb-1">{surprisePrenom.nom}</h2>
              <p className={`text-center text-sm font-medium mb-4 ${GENRE_CONFIG[surprisePrenom.genre].badge.split(" ")[1]}`}>
                {surprisePrenom.origine}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-6">{surprisePrenom.signification}</p>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    toggleFavori(surprisePrenom.nom);
                    setSurprisePrenom(null);
                  }}
                  className="flex-1 bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 rounded-2xl py-3 text-sm font-medium hover:bg-pink-200 transition-colors"
                >
                  ❤️ Ajouter aux favoris
                </button>
                <button
                  onClick={handleSurprise}
                  className="flex-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 rounded-2xl py-3 text-sm font-medium hover:bg-yellow-200 transition-colors"
                >
                  🎲 Autre
                </button>
              </div>
              <button
                onClick={() => setSurprisePrenom(null)}
                className="w-full mt-3 text-gray-400 dark:text-gray-500 text-sm py-2"
              >
                Fermer
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
