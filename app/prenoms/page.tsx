"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Search, Shuffle, Star, Filter, X } from "lucide-react";
import { prenoms, origines, type Prenom } from "@/lib/prenoms-data";

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

export default function PrenomsPage() {
  const [search, setSearch] = useState("");
  const [genreFilter, setGenreFilter] = useState<"tous" | "M" | "F" | "mixte">("tous");
  const [origineFilter, setOrigineFilter] = useState("");
  const [lettreFilter, setLettreFilter] = useState("");
  const [activeTab, setActiveTab] = useState<"tous" | "favoris">("tous");
  const [favoris, setFavoris] = useState<string[]>([]);
  const [surprise, setSurprise] = useState<Prenom | null>(null);
  const [showSurprise, setShowSurprise] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("mamatrack-prenoms-favoris");
    if (stored) setFavoris(JSON.parse(stored));
  }, []);

  const toggleFavori = (nom: string) => {
    setFavoris(prev => {
      const next = prev.includes(nom) ? prev.filter(n => n !== nom) : [...prev, nom];
      localStorage.setItem("mamatrack-prenoms-favoris", JSON.stringify(next));
      return next;
    });
  };

  const filtered = useMemo(() => {
    let list = prenoms;
    if (activeTab === "favoris") {
      list = list.filter(p => favoris.includes(p.nom));
    }
    if (search) {
      list = list.filter(p =>
        p.nom.toLowerCase().includes(search.toLowerCase()) ||
        p.signification.toLowerCase().includes(search.toLowerCase())
      );
    }
    if (genreFilter !== "tous") {
      list = list.filter(p => p.genre === genreFilter);
    }
    if (origineFilter) {
      list = list.filter(p => p.origine === origineFilter);
    }
    if (lettreFilter) {
      list = list.filter(p => p.nom.toUpperCase().startsWith(lettreFilter));
    }
    return list.sort((a, b) => a.nom.localeCompare(b.nom, "fr"));
  }, [search, genreFilter, origineFilter, lettreFilter, activeTab, favoris]);

  const tirerAuSort = () => {
    let pool = prenoms;
    if (genreFilter !== "tous") pool = pool.filter(p => p.genre === genreFilter);
    if (pool.length === 0) pool = prenoms;
    const random = pool[Math.floor(Math.random() * pool.length)];
    setSurprise(random);
    setShowSurprise(true);
  };

  const resetFilters = () => {
    setSearch("");
    setGenreFilter("tous");
    setOrigineFilter("");
    setLettreFilter("");
  };

  const hasFilters = search || genreFilter !== "tous" || origineFilter || lettreFilter;

  const populariteStars = (p: 1 | 2 | 3) => {
    return Array.from({ length: 3 }, (_, i) => (
      <Star key={i} className={`w-3 h-3 ${i < p ? "fill-yellow-400 text-yellow-400" : "text-gray-200"}`} />
    ));
  };

  const genreBadge = (genre: Prenom["genre"]) => {
    if (genre === "M") return <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-600">Garçon</span>;
    if (genre === "F") return <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-pink-100 text-pink-600">Fille</span>;
    return <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-purple-100 text-purple-600">Mixte</span>;
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#3d2b2b]">💝 Prénoms</h1>
          <p className="text-sm text-gray-500">{prenoms.length} prénoms • {favoris.length} favoris</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={tirerAuSort}
          className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-pink-400 to-purple-400 text-white rounded-xl text-sm font-medium shadow-sm"
        >
          <Shuffle className="w-4 h-4" />
          Surprise
        </motion.button>
      </div>

      {/* Tabs */}
      <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
        {(["tous", "favoris"] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab
                ? "bg-white text-pink-600 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab === "tous" ? "Tous les prénoms" : `❤️ Mes favoris (${favoris.length})`}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Rechercher un prénom ou une signification..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-200"
        />
        {search && (
          <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2">
            <X className="w-4 h-4 text-gray-400" />
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="space-y-3">
        {/* Genre */}
        <div className="flex gap-2">
          {(["tous", "M", "F", "mixte"] as const).map(g => (
            <button
              key={g}
              onClick={() => setGenreFilter(g)}
              className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all ${
                genreFilter === g
                  ? g === "M"
                    ? "bg-blue-100 text-blue-600"
                    : g === "F"
                    ? "bg-pink-100 text-pink-600"
                    : g === "mixte"
                    ? "bg-purple-100 text-purple-600"
                    : "bg-gray-800 text-white"
                  : "bg-gray-100 text-gray-500 hover:bg-gray-200"
              }`}
            >
              {g === "tous" ? "Tous" : g === "M" ? "👦 Garçon" : g === "F" ? "👧 Fille" : "🌈 Mixte"}
            </button>
          ))}
        </div>

        {/* Origine */}
        <select
          value={origineFilter}
          onChange={e => setOrigineFilter(e.target.value)}
          className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-200 text-gray-700"
        >
          <option value="">Toutes les origines</option>
          {origines.map(o => (
            <option key={o} value={o}>{o}</option>
          ))}
        </select>

        {/* Alphabet */}
        <div className="flex flex-wrap gap-1">
          {ALPHABET.map(l => (
            <button
              key={l}
              onClick={() => setLettreFilter(lettreFilter === l ? "" : l)}
              className={`w-7 h-7 text-xs font-medium rounded-lg transition-all ${
                lettreFilter === l
                  ? "bg-pink-400 text-white"
                  : "bg-gray-100 text-gray-500 hover:bg-gray-200"
              }`}
            >
              {l}
            </button>
          ))}
        </div>

        {/* Reset */}
        {hasFilters && (
          <button
            onClick={resetFilters}
            className="flex items-center gap-1 text-xs text-pink-500 hover:text-pink-600"
          >
            <X className="w-3 h-3" />
            Réinitialiser les filtres
          </button>
        )}
      </div>

      {/* Results count */}
      <p className="text-xs text-gray-500">
        {filtered.length} prénom{filtered.length > 1 ? "s" : ""} trouvé{filtered.length > 1 ? "s" : ""}
      </p>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <p className="text-4xl mb-3">🔍</p>
          <p className="font-medium">Aucun prénom trouvé</p>
          <p className="text-sm">Essaye d&apos;autres filtres</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          <AnimatePresence>
            {filtered.map(prenom => (
              <motion.div
                key={prenom.nom}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-2xl p-3.5 shadow-sm border border-gray-100 hover:border-pink-200 transition-colors"
              >
                <div className="flex items-start justify-between mb-1.5">
                  <h3 className="text-lg font-bold text-[#3d2b2b]">{prenom.nom}</h3>
                  <button onClick={() => toggleFavori(prenom.nom)} className="mt-0.5">
                    <Heart
                      className={`w-5 h-5 transition-colors ${
                        favoris.includes(prenom.nom)
                          ? "fill-pink-400 text-pink-400"
                          : "text-gray-300 hover:text-pink-300"
                      }`}
                    />
                  </button>
                </div>
                <div className="flex items-center gap-1.5 mb-2">
                  {genreBadge(prenom.genre)}
                  <span className="text-[10px] text-gray-400">{prenom.origine}</span>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed mb-2 line-clamp-2">{prenom.signification}</p>
                <div className="flex items-center gap-0.5">
                  {populariteStars(prenom.popularite)}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Surprise Modal */}
      <AnimatePresence>
        {showSurprise && surprise && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-6"
            onClick={() => setShowSurprise(false)}
          >
            <motion.div
              initial={{ scale: 0.8, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 20 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-3xl p-8 text-center max-w-xs w-full shadow-2xl"
            >
              <p className="text-5xl mb-4">🎲</p>
              <h2 className="text-4xl font-bold text-[#3d2b2b] mb-2">{surprise.nom}</h2>
              <div className="flex items-center justify-center gap-2 mb-3">
                {genreBadge(surprise.genre)}
                <span className="text-sm text-gray-400">{surprise.origine}</span>
              </div>
              <p className="text-gray-500 text-sm mb-5">{surprise.signification}</p>
              <div className="flex gap-3">
                <button
                  onClick={() => { toggleFavori(surprise.nom); setShowSurprise(false); }}
                  className={`flex-1 py-2.5 rounded-xl font-medium text-sm ${
                    favoris.includes(surprise.nom)
                      ? "bg-pink-400 text-white"
                      : "bg-pink-50 text-pink-500 hover:bg-pink-100"
                  }`}
                >
                  {favoris.includes(surprise.nom) ? "❤️ Retiré" : "❤️ Ajouter"}
                </button>
                <button
                  onClick={tirerAuSort}
                  className="flex-1 py-2.5 bg-gray-100 text-gray-600 rounded-xl font-medium text-sm hover:bg-gray-200"
                >
                  🎲 Autre
                </button>
              </div>
              <button
                onClick={() => setShowSurprise(false)}
                className="mt-3 text-xs text-gray-400 hover:text-gray-500"
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
