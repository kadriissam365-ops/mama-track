"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ShieldCheck, ShieldAlert, ShieldX, Info } from "lucide-react";

type Safety = "ok" | "caution" | "avoid";

interface FoodItem {
  name: string;
  category: string;
  safety: Safety;
  detail: string;
  tip?: string;
}

const FOOD_DATABASE: FoodItem[] = [
  // Fromages
  { name: "Comté", category: "Fromages", safety: "ok", detail: "Pâte pressée cuite, sans risque de listeria" },
  { name: "Emmental", category: "Fromages", safety: "ok", detail: "Pâte pressée cuite, sûr pendant la grossesse" },
  { name: "Parmesan", category: "Fromages", safety: "ok", detail: "Pâte dure, très faible risque" },
  { name: "Gruyère", category: "Fromages", safety: "ok", detail: "Pâte pressée cuite, autorisé" },
  { name: "Mozzarella pasteurisée", category: "Fromages", safety: "ok", detail: "Vérifiez qu'elle est bien pasteurisée" },
  { name: "Fromage râpé industriel", category: "Fromages", safety: "ok", detail: "Pasteurisé, sûr à consommer" },
  { name: "Camembert au lait cru", category: "Fromages", safety: "avoid", detail: "Risque de listeria — fromage à pâte molle au lait cru", tip: "Préférez le camembert pasteurisé" },
  { name: "Brie", category: "Fromages", safety: "avoid", detail: "Pâte molle à croûte fleurie — risque de listeria" },
  { name: "Roquefort", category: "Fromages", safety: "avoid", detail: "Fromage à pâte persillée au lait cru — risque listeria" },
  { name: "Chèvre frais", category: "Fromages", safety: "caution", detail: "OK si pasteurisé et consommé rapidement", tip: "Vérifiez l'étiquette : 'lait pasteurisé'" },
  { name: "Feta", category: "Fromages", safety: "caution", detail: "Autorisée si pasteurisée — vérifiez l'emballage" },
  { name: "Fromage blanc", category: "Fromages", safety: "ok", detail: "Pasteurisé, excellent apport en calcium" },
  { name: "Raclette", category: "Fromages", safety: "ok", detail: "Sûr si bien cuit et chaud — la chaleur élimine les bactéries" },
  { name: "Fondue", category: "Fromages", safety: "ok", detail: "La cuisson élimine les risques — à consommer bien chaude" },

  // Viandes
  { name: "Bœuf bien cuit", category: "Viandes", safety: "ok", detail: "La cuisson à cœur élimine toxoplasmose et bactéries" },
  { name: "Poulet bien cuit", category: "Viandes", safety: "ok", detail: "Toujours cuire le poulet à cœur (pas de rose)" },
  { name: "Steak tartare", category: "Viandes", safety: "avoid", detail: "Viande crue — risque de toxoplasmose et E. coli" },
  { name: "Carpaccio", category: "Viandes", safety: "avoid", detail: "Viande crue — risque de toxoplasmose" },
  { name: "Jambon blanc", category: "Viandes", safety: "ok", detail: "Cuit, autorisé pendant la grossesse" },
  { name: "Jambon cru / Serrano", category: "Viandes", safety: "avoid", detail: "Non cuit — risque de toxoplasmose si non immune", tip: "Autorisé seulement si vous êtes immunisée contre la toxoplasmose" },
  { name: "Saucisson / Charcuterie crue", category: "Viandes", safety: "avoid", detail: "Risque de toxoplasmose et listeria" },
  { name: "Pâté / Rillettes", category: "Viandes", safety: "avoid", detail: "Risque de listeria — même réfrigéré" },
  { name: "Foie gras", category: "Viandes", safety: "caution", detail: "Riche en vitamine A (risque en excès). Mi-cuit à éviter", tip: "Préférez le foie gras en conserve (stérilisé)" },
  { name: "Lardons bien cuits", category: "Viandes", safety: "ok", detail: "La cuisson élimine les risques" },

  // Poissons & Fruits de mer
  { name: "Saumon cuit", category: "Poissons", safety: "ok", detail: "Riche en oméga-3, excellent pour bébé" },
  { name: "Saumon fumé", category: "Poissons", safety: "avoid", detail: "Risque de listeria — non cuit", tip: "Autorisé si cuit dans un plat (quiche, gratin)" },
  { name: "Thon en boîte", category: "Poissons", safety: "caution", detail: "Limiter à 1 boîte/semaine — mercure", tip: "Éviter le thon frais (plus de mercure que le thon en conserve)" },
  { name: "Sushi / Sashimi", category: "Poissons", safety: "avoid", detail: "Poisson cru — risque de parasites et bactéries" },
  { name: "Crevettes cuites", category: "Poissons", safety: "ok", detail: "Cuites, sûres à consommer" },
  { name: "Huîtres", category: "Poissons", safety: "avoid", detail: "Fruits de mer crus — risque d'hépatite A et norovirus" },
  { name: "Moules cuites", category: "Poissons", safety: "ok", detail: "Bien cuites, riches en fer" },
  { name: "Sardines", category: "Poissons", safety: "ok", detail: "Excellente source d'oméga-3, calcium et vitamine D" },
  { name: "Surimi", category: "Poissons", safety: "ok", detail: "Cuit et pasteurisé — à consommer rapidement après ouverture" },
  { name: "Tarama", category: "Poissons", safety: "avoid", detail: "Œufs de poisson non cuits — risque de listeria" },

  // Œufs & Produits laitiers
  { name: "Œuf dur / bien cuit", category: "Œufs & Laitages", safety: "ok", detail: "Source de protéines, sûr si bien cuit" },
  { name: "Œuf à la coque / mollet", category: "Œufs & Laitages", safety: "caution", detail: "Jaune pas totalement cuit — risque de salmonelle", tip: "Préférez les œufs bien cuits pendant la grossesse" },
  { name: "Mayonnaise maison", category: "Œufs & Laitages", safety: "avoid", detail: "Œuf cru — risque de salmonelle", tip: "La mayo industrielle est pasteurisée, donc OK" },
  { name: "Tiramisu maison", category: "Œufs & Laitages", safety: "avoid", detail: "Contient des œufs crus + mascarpone", tip: "Choisissez une version sans œufs crus" },
  { name: "Mousse au chocolat maison", category: "Œufs & Laitages", safety: "avoid", detail: "Œufs crus non cuits" },
  { name: "Lait pasteurisé / UHT", category: "Œufs & Laitages", safety: "ok", detail: "Pasteurisé, sûr — bonne source de calcium" },
  { name: "Lait cru", category: "Œufs & Laitages", safety: "avoid", detail: "Non pasteurisé — risque de listeria et brucellose" },
  { name: "Yaourt", category: "Œufs & Laitages", safety: "ok", detail: "Pasteurisé, riche en probiotiques et calcium" },
  { name: "Crème fraîche pasteurisée", category: "Œufs & Laitages", safety: "ok", detail: "Pasteurisée, autorisée" },

  // Fruits & Légumes
  { name: "Salade / Crudités", category: "Fruits & Légumes", safety: "caution", detail: "Bien laver avant consommation — toxoplasmose", tip: "Lavez à l'eau vinaigrée ou au bicarbonate" },
  { name: "Fruits frais", category: "Fruits & Légumes", safety: "ok", detail: "Lavez-les bien avant consommation", tip: "Excellente source de vitamines et fibres" },
  { name: "Herbes aromatiques fraîches", category: "Fruits & Légumes", safety: "caution", detail: "Bien laver — risque de terre contaminée" },
  { name: "Graines germées", category: "Fruits & Légumes", safety: "avoid", detail: "Risque de bactéries (E. coli, Salmonelle) — même lavées" },
  { name: "Soja / Phyto-estrogènes", category: "Fruits & Légumes", safety: "caution", detail: "Limiter à 1 portion/jour — contient des phyto-estrogènes", tip: "L'ANSES recommande de limiter les produits à base de soja" },
  { name: "Légumes cuits", category: "Fruits & Légumes", safety: "ok", detail: "La cuisson élimine les risques — mangez-en à volonté !" },

  // Boissons
  { name: "Eau", category: "Boissons", safety: "ok", detail: "2L/jour recommandés pendant la grossesse" },
  { name: "Café", category: "Boissons", safety: "caution", detail: "Max 200 mg de caféine/jour (≈ 2 expressos)", tip: "La caféine traverse le placenta" },
  { name: "Thé", category: "Boissons", safety: "caution", detail: "Contient de la caféine + réduit l'absorption du fer", tip: "Boire entre les repas, pas pendant" },
  { name: "Tisane de gingembre", category: "Boissons", safety: "ok", detail: "Aide contre les nausées — 2-3 tasses/jour max" },
  { name: "Tisane de menthe", category: "Boissons", safety: "ok", detail: "Aide à la digestion — sans danger" },
  { name: "Alcool", category: "Boissons", safety: "avoid", detail: "ZÉRO alcool pendant la grossesse — aucune dose sûre", tip: "L'alcool traverse le placenta et peut causer le SAF" },
  { name: "Sodas / Boissons sucrées", category: "Boissons", safety: "caution", detail: "Limiter — sucre et caféine (Coca, Pepsi)", tip: "Préférez l'eau, les infusions ou les eaux aromatisées maison" },
  { name: "Jus de fruits frais pasteurisé", category: "Boissons", safety: "ok", detail: "Source de vitamines — attention au sucre" },
  { name: "Jus frais non pasteurisé", category: "Boissons", safety: "caution", detail: "Risque de bactéries — préférez les jus pasteurisés" },
  { name: "Kombucha", category: "Boissons", safety: "avoid", detail: "Non pasteurisé, contient de l'alcool résiduel et des bactéries" },

  // Autres
  { name: "Miel", category: "Autres", safety: "ok", detail: "Sans danger pour la mère (le botulisme ne concerne que les bébés <1 an)" },
  { name: "Réglisse", category: "Autres", safety: "caution", detail: "Limiter la consommation — peut augmenter la tension", tip: "La glycyrrhizine peut affecter le développement" },
  { name: "Chocolat noir", category: "Autres", safety: "ok", detail: "Riche en magnésium — 1-2 carrés/jour", tip: "Contient un peu de caféine, modérez" },
  { name: "Cacahuètes / Fruits à coque", category: "Autres", safety: "ok", detail: "Sauf allergie, aucune restriction pendant la grossesse" },
  { name: "Glace industrielle", category: "Autres", safety: "ok", detail: "Pasteurisée, autorisée" },
  { name: "Glace artisanale", category: "Autres", safety: "caution", detail: "Peut contenir des œufs crus — demandez au glacier" },
];

const CATEGORIES = Array.from(new Set(FOOD_DATABASE.map((f) => f.category)));

const SAFETY_CONFIG: Record<Safety, { icon: typeof ShieldCheck; label: string; bg: string; text: string; border: string }> = {
  ok: { icon: ShieldCheck, label: "Autorisé", bg: "bg-green-50", text: "text-green-600", border: "border-green-200" },
  caution: { icon: ShieldAlert, label: "Avec précaution", bg: "bg-yellow-50", text: "text-yellow-600", border: "border-yellow-200" },
  avoid: { icon: ShieldX, label: "À éviter", bg: "bg-red-50", text: "text-red-600", border: "border-red-200" },
};

export default function AlimentationPage() {
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<Safety | "all">("all");
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let items = FOOD_DATABASE;
    if (search.trim()) {
      const q = search.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      items = items.filter((f) =>
        f.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes(q) ||
        f.category.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes(q)
      );
    }
    if (activeFilter !== "all") {
      items = items.filter((f) => f.safety === activeFilter);
    }
    if (activeCategory) {
      items = items.filter((f) => f.category === activeCategory);
    }
    return items;
  }, [search, activeFilter, activeCategory]);

  const counts = useMemo(() => ({
    ok: FOOD_DATABASE.filter((f) => f.safety === "ok").length,
    caution: FOOD_DATABASE.filter((f) => f.safety === "caution").length,
    avoid: FOOD_DATABASE.filter((f) => f.safety === "avoid").length,
  }), []);

  return (
    <div className="max-w-lg mx-auto px-4 py-6 space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-[#3d2b2b] flex items-center gap-2">
          🥗 Guide alimentaire
        </h1>
        <p className="text-sm text-gray-400 mt-1">Puis-je manger... ? Recherchez un aliment</p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher un aliment..."
          className="w-full pl-10 pr-4 py-3 border border-pink-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-300 bg-white"
        />
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveFilter("all")}
          className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
            activeFilter === "all" ? "bg-pink-400 text-white" : "bg-white border border-pink-100 text-gray-500"
          }`}
        >
          Tous ({FOOD_DATABASE.length})
        </button>
        {(["ok", "caution", "avoid"] as Safety[]).map((s) => {
          const config = SAFETY_CONFIG[s];
          return (
            <button
              key={s}
              onClick={() => setActiveFilter(activeFilter === s ? "all" : s)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1 ${
                activeFilter === s
                  ? `${config.bg} ${config.text} ${config.border} border`
                  : "bg-white border border-pink-100 text-gray-500"
              }`}
            >
              <config.icon className="w-3 h-3" />
              {counts[s]}
            </button>
          );
        })}
      </div>

      {/* Category pills */}
      <div className="flex gap-1.5 overflow-x-auto scrollbar-hide pb-1">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
            className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
              activeCategory === cat
                ? "bg-pink-400 text-white"
                : "bg-pink-50 text-pink-500 hover:bg-pink-100"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Results */}
      <div className="space-y-2">
        {filtered.length === 0 && (
          <div className="text-center py-8">
            <Search className="w-10 h-10 text-gray-200 mx-auto mb-2" />
            <p className="text-sm text-gray-400">Aucun résultat pour &quot;{search}&quot;</p>
          </div>
        )}

        <AnimatePresence initial={false}>
          {filtered.map((food) => {
            const config = SAFETY_CONFIG[food.safety];
            const isExpanded = expandedItem === food.name;
            return (
              <motion.div
                key={food.name}
                layout
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={`${config.bg} border ${config.border} rounded-2xl overflow-hidden`}
              >
                <button
                  onClick={() => setExpandedItem(isExpanded ? null : food.name)}
                  className="w-full px-4 py-3 flex items-center justify-between text-left"
                >
                  <div className="flex items-center gap-3">
                    <config.icon className={`w-5 h-5 ${config.text} flex-shrink-0`} />
                    <div>
                      <p className="text-sm font-semibold text-[#3d2b2b]">{food.name}</p>
                      <p className="text-xs text-gray-400">{food.category}</p>
                    </div>
                  </div>
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${config.bg} ${config.text}`}>
                    {config.label}
                  </span>
                </button>
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-3 pt-0">
                        <p className="text-sm text-gray-600">{food.detail}</p>
                        {food.tip && (
                          <div className="flex items-start gap-1.5 mt-2 bg-white/60 rounded-xl p-2">
                            <Info className="w-3.5 h-3.5 text-blue-400 mt-0.5 flex-shrink-0" />
                            <p className="text-xs text-blue-600">{food.tip}</p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Footer info */}
      <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-3xl p-5 border border-pink-100">
        <div className="flex items-start gap-3">
          <span className="text-2xl">⚠️</span>
          <div>
            <h3 className="font-semibold text-[#3d2b2b] text-sm mb-1">Rappel important</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Ce guide est indicatif. Chaque grossesse est unique. En cas de doute, consultez votre médecin ou sage-femme. Si vous n&apos;êtes pas immunisée contre la toxoplasmose, soyez particulièrement vigilante avec les aliments crus.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
