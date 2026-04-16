"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "@/lib/store";
import { CheckSquare, Plus, Trash2, ChevronDown, ChevronUp } from "lucide-react";

const CATEGORY_COLORS: Record<string, { bg: string; border: string; text: string; check: string }> = {
  Administratif: { bg: "bg-blue-50 dark:bg-blue-950/30", border: "border-blue-200 dark:border-blue-800/30", text: "text-blue-600 dark:text-blue-400", check: "bg-blue-400" },
  Médical: { bg: "bg-pink-50 dark:bg-pink-950/30", border: "border-pink-200 dark:border-pink-800/30", text: "text-pink-600 dark:text-pink-400", check: "bg-pink-400" },
  "Chambre bébé": { bg: "bg-purple-50 dark:bg-purple-950/30", border: "border-purple-200 dark:border-purple-800/30", text: "text-purple-600 dark:text-purple-400", check: "bg-purple-400" },
  "Valise maternité": { bg: "bg-green-50 dark:bg-green-950/30", border: "border-green-200 dark:border-green-800/30", text: "text-green-600 dark:text-green-400", check: "bg-green-400" },
};

const DEFAULT_COLORS = { bg: "bg-orange-50 dark:bg-orange-950/30", border: "border-orange-200 dark:border-orange-800/30", text: "text-orange-600 dark:text-orange-400", check: "bg-orange-400" };

export default function ChecklistPage() {
  const store = useStore();
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(["Administratif", "Médical", "Chambre bébé", "Valise maternité"])
  );
  const [showAddForm, setShowAddForm] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [newCategory, setNewCategory] = useState("Divers");

  const toggleCategory = (cat: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  };

  const categories = Array.from(
    new Set(store.checklistItems.map((i) => i.category))
  );

  const totalDone = store.checklistItems.filter((i) => i.done).length;
  const totalItems = store.checklistItems.length;
  const globalProgress = totalItems > 0 ? Math.round((totalDone / totalItems) * 100) : 0;

  const handleAddItem = () => {
    if (!newLabel.trim()) return;
    store.addChecklistItem({
      category: newCategory || "Divers",
      label: newLabel.trim(),
      done: false,
      custom: true,
    });
    setNewLabel("");
    setShowAddForm(false);
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-6 space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-[#3d2b2b] dark:text-gray-100 flex items-center gap-2">
          <CheckSquare className="w-6 h-6 text-pink-400" />
          Ma liste
        </h1>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-1.5 bg-pink-400 text-white px-3 py-2 rounded-xl text-sm font-medium hover:bg-pink-50 dark:hover:bg-pink-600 dark:bg-pink-500 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Ajouter
        </button>
      </div>

      {/* Progression globale */}
      <div className="bg-white dark:bg-gray-900 rounded-3xl p-5 shadow-sm border border-pink-100 dark:border-pink-900/30">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-[#3d2b2b] dark:text-gray-100">Progression globale</span>
          <span className="text-2xl font-bold text-pink-500">{globalProgress}%</span>
        </div>
        <div className="w-full bg-pink-50 dark:bg-pink-950/30 rounded-full h-3 overflow-hidden">
          <motion.div
            className="h-3 rounded-full bg-gradient-to-r from-pink-400 to-purple-400"
            initial={{ width: 0 }}
            animate={{ width: `${globalProgress}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </div>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">{totalDone} / {totalItems} éléments complétés</p>
        {globalProgress === 100 && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm text-center mt-2 font-semibold text-pink-500"
          >
            🎉 Tout est prêt ! Bravo maman !
          </motion.p>
        )}
      </div>

      {/* Formulaire ajout */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white dark:bg-gray-900 rounded-3xl p-5 shadow-sm border border-pink-100 dark:border-pink-900/30 overflow-hidden"
          >
            <h3 className="font-semibold text-[#3d2b2b] dark:text-gray-100 mb-3">Ajouter un élément</h3>
            <input
              type="text"
              placeholder="Description..."
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddItem()}
              className="w-full border border-pink-200 dark:border-pink-800/30 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300 mb-2 dark:bg-gray-800 dark:text-white dark:border-gray-600"
            />
            <div className="flex gap-2">
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="flex-1 border border-pink-200 dark:border-pink-800/30 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300 bg-white dark:bg-gray-800 dark:text-white dark:border-gray-600"
              >
                {["Administratif", "Médical", "Chambre bébé", "Valise maternité", "Divers"].map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <button
                onClick={handleAddItem}
                disabled={!newLabel.trim()}
                className="bg-pink-400 text-white px-4 py-2 rounded-xl text-sm font-medium disabled:opacity-50 hover:bg-pink-50 dark:hover:bg-pink-600 dark:bg-pink-500 transition-colors"
              >
                OK
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Catégories */}
      {categories.map((category) => {
        const items = store.checklistItems.filter((i) => i.category === category);
        const done = items.filter((i) => i.done).length;
        const pct = items.length > 0 ? Math.round((done / items.length) * 100) : 0;
        const colors = CATEGORY_COLORS[category] ?? DEFAULT_COLORS;
        const isExpanded = expandedCategories.has(category);

        return (
          <div key={category} className={`rounded-3xl border overflow-hidden ${colors.bg} ${colors.border}`}>
            {/* Header catégorie */}
            <button
              onClick={() => toggleCategory(category)}
              className="w-full flex items-center justify-between p-4"
            >
              <div className="flex items-center gap-3 flex-1">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-sm font-semibold ${colors.text}`}>{category}</span>
                    <span className="text-xs text-gray-400 dark:text-gray-500">{done}/{items.length}</span>
                  </div>
                  <div className="w-full bg-white/60 dark:bg-gray-800/60 rounded-full h-1.5 overflow-hidden">
                    <motion.div
                      className={`h-1.5 rounded-full ${colors.check}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                </div>
                <span className={`text-sm font-bold ${colors.text}`}>{pct}%</span>
              </div>
              <div className="ml-3">
                {isExpanded ? (
                  <ChevronUp className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                )}
              </div>
            </button>

            {/* Items */}
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: "auto" }}
                  exit={{ height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="px-4 pb-4 space-y-2">
                    {items.map((item) => (
                      <motion.div
                        key={item.id}
                        layout
                        className="flex items-center gap-3 bg-white/80 dark:bg-gray-800/80 rounded-2xl px-3 py-2.5"
                      >
                        <button
                          onClick={() => store.toggleChecklistItem(item.id)}
                          className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                            item.done
                              ? `${colors.check} border-transparent`
                              : `border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900`
                          }`}
                        >
                          {item.done && (
                            <motion.svg
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="w-3 h-3 text-white"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth={3}
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </motion.svg>
                          )}
                        </button>
                        <span
                          className={`flex-1 text-sm transition-all ${
                            item.done ? "line-through text-gray-400 dark:text-gray-500" : "text-[#3d2b2b] dark:text-gray-100"
                          }`}
                        >
                          {item.label}
                        </span>
                        {item.custom && (
                          <button
                            onClick={() => store.removeChecklistItem(item.id)}
                            className="text-gray-300 dark:text-gray-500 hover:text-red-400 transition-colors"
                            aria-label="Supprimer l'élément"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
