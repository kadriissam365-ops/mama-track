"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, ChevronDown, ChevronUp, Trash2, ShoppingCart, DollarSign, CheckCircle2 } from "lucide-react";

interface AchatItem {
  id: string;
  categorie: string;
  nom: string;
  quantite: number;
  priorite: 'Essentiel' | 'Pratique' | 'Bonus';
  budgetEstime: number;
  coche: boolean;
  custom: boolean;
}

const ACHATS_DEFAUT: AchatItem[] = [
  { id: 'c1', categorie: '🛏️ Chambre', nom: 'Lit bébé / berceau', quantite: 1, priorite: 'Essentiel', budgetEstime: 150, coche: false, custom: false },
  { id: 'c2', categorie: '🛏️ Chambre', nom: 'Matelas bébé', quantite: 1, priorite: 'Essentiel', budgetEstime: 80, coche: false, custom: false },
  { id: 'c3', categorie: '🛏️ Chambre', nom: 'Babyphone', quantite: 1, priorite: 'Pratique', budgetEstime: 60, coche: false, custom: false },
  { id: 'c4', categorie: '🛏️ Chambre', nom: 'Table à langer', quantite: 1, priorite: 'Pratique', budgetEstime: 70, coche: false, custom: false },
  { id: 'c5', categorie: '🛏️ Chambre', nom: 'Veilleuse', quantite: 1, priorite: 'Pratique', budgetEstime: 25, coche: false, custom: false },
  { id: 'v1', categorie: '👕 Vêtements', nom: 'Bodies naissance x6', quantite: 6, priorite: 'Essentiel', budgetEstime: 30, coche: false, custom: false },
  { id: 'v2', categorie: '👕 Vêtements', nom: 'Grenouillères x4', quantite: 4, priorite: 'Essentiel', budgetEstime: 40, coche: false, custom: false },
  { id: 'v3', categorie: '👕 Vêtements', nom: 'Bonnet naissance x2', quantite: 2, priorite: 'Essentiel', budgetEstime: 10, coche: false, custom: false },
  { id: 'b1', categorie: '🚿 Bain & Soin', nom: 'Baignoire bébé', quantite: 1, priorite: 'Essentiel', budgetEstime: 30, coche: false, custom: false },
  { id: 'b2', categorie: '🚿 Bain & Soin', nom: 'Thermomètre de bain', quantite: 1, priorite: 'Essentiel', budgetEstime: 10, coche: false, custom: false },
  { id: 'b3', categorie: '🚿 Bain & Soin', nom: 'Sérum physiologique', quantite: 3, priorite: 'Essentiel', budgetEstime: 8, coche: false, custom: false },
  { id: 'a1', categorie: '🍼 Alimentation', nom: 'Biberons x4', quantite: 4, priorite: 'Essentiel', budgetEstime: 40, coche: false, custom: false },
  { id: 'a2', categorie: '🍼 Alimentation', nom: 'Stérilisateur', quantite: 1, priorite: 'Pratique', budgetEstime: 50, coche: false, custom: false },
  { id: 'a3', categorie: '🍼 Alimentation', nom: 'Bavoirs x6', quantite: 6, priorite: 'Essentiel', budgetEstime: 15, coche: false, custom: false },
  { id: 't1', categorie: '🚗 Transport', nom: 'Siège auto groupe 0+', quantite: 1, priorite: 'Essentiel', budgetEstime: 120, coche: false, custom: false },
  { id: 't2', categorie: '🚗 Transport', nom: 'Poussette', quantite: 1, priorite: 'Essentiel', budgetEstime: 300, coche: false, custom: false },
  { id: 't3', categorie: '🚗 Transport', nom: 'Porte-bébé', quantite: 1, priorite: 'Pratique', budgetEstime: 60, coche: false, custom: false },
  { id: 'd1', categorie: '🎁 Divers', nom: 'Thermomètre rectal', quantite: 1, priorite: 'Essentiel', budgetEstime: 15, coche: false, custom: false },
  { id: 'd2', categorie: '🎁 Divers', nom: 'Mouche-bébé', quantite: 1, priorite: 'Essentiel', budgetEstime: 20, coche: false, custom: false },
];

const CATEGORIES_ORDER = ['🛏️ Chambre', '👕 Vêtements', '🚿 Bain & Soin', '🍼 Alimentation', '🚗 Transport', '🎁 Divers'];

const PRIORITE_COLORS: Record<string, string> = {
  'Essentiel': 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800/30',
  'Pratique': 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border border-orange-200',
  'Bonus': 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700',
};

export default function AchatsPage() {
  const [items, setItems] = useState<AchatItem[]>([]);
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({});
  const [budgetUser, setBudgetUser] = useState<string>('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItem, setNewItem] = useState({
    nom: '',
    categorie: '🎁 Divers',
    priorite: 'Pratique' as 'Essentiel' | 'Pratique' | 'Bonus',
    budgetEstime: '',
    quantite: '1',
  });

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('achats-bebe');
    if (saved) {
      try {
        setItems(JSON.parse(saved));
      } catch {
        setItems(ACHATS_DEFAUT);
      }
    } else {
      setItems(ACHATS_DEFAUT);
    }
    const savedBudget = localStorage.getItem('achats-bebe-budget');
    if (savedBudget) setBudgetUser(savedBudget);

    // Open all categories by default
    const open: Record<string, boolean> = {};
    CATEGORIES_ORDER.forEach(c => { open[c] = true; });
    setOpenCategories(open);
  }, []);

  // Save to localStorage whenever items change
  useEffect(() => {
    if (items.length > 0) {
      localStorage.setItem('achats-bebe', JSON.stringify(items));
    }
  }, [items]);

  useEffect(() => {
    localStorage.setItem('achats-bebe-budget', budgetUser);
  }, [budgetUser]);

  const toggleItem = (id: string) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, coche: !item.coche } : item));
  };

  const deleteItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const toggleCategorie = (cat: string) => {
    setOpenCategories(prev => ({ ...prev, [cat]: !prev[cat] }));
  };

  const addCustomItem = () => {
    if (!newItem.nom.trim()) return;
    const item: AchatItem = {
      id: `custom-${Date.now()}`,
      categorie: newItem.categorie,
      nom: newItem.nom,
      quantite: parseInt(newItem.quantite) || 1,
      priorite: newItem.priorite,
      budgetEstime: parseFloat(newItem.budgetEstime) || 0,
      coche: false,
      custom: true,
    };
    setItems(prev => [...prev, item]);
    setNewItem({ nom: '', categorie: '🎁 Divers', priorite: 'Pratique', budgetEstime: '', quantite: '1' });
    setShowAddForm(false);
  };

  // Compute categories (include custom ones too)
  const allCategories = [...new Set([...CATEGORIES_ORDER, ...items.map(i => i.categorie)])];

  const totalEstime = items.reduce((sum, item) => sum + item.budgetEstime, 0);
  const totalCoche = items.filter(i => i.coche).reduce((sum, item) => sum + item.budgetEstime, 0);
  const budgetNum = parseFloat(budgetUser) || 0;
  const difference = budgetNum - totalEstime;
  const diffColor = difference >= 0 ? 'text-green-600' : 'text-red-500';
  const progress = items.length > 0 ? Math.round((items.filter(i => i.coche).length / items.length) * 100) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 dark:from-[#0f0f1a] dark:via-[#0f0f1a] dark:to-purple-950/20 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-r from-pink-400 to-purple-500 text-white px-4 pt-12 pb-6">
        <h1 className="text-2xl font-bold mb-1">🛒 Liste d&apos;achats bébé</h1>
        <p className="text-pink-100 text-sm">Tout ce qu&apos;il faut préparer avant l&apos;arrivée</p>

        {/* Progress */}
        <div className="mt-4 bg-white/20 rounded-full h-2">
          <div
            className="bg-white rounded-full h-2 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-xs text-pink-100 mt-1">{items.filter(i => i.coche).length}/{items.length} articles cochés ({progress}%)</p>
      </div>

      {/* Budget summary */}
      <div className="mx-4 mt-4 bg-white dark:bg-gray-900 rounded-2xl shadow-sm p-4">
        <div className="flex items-center gap-2 mb-3">
          <DollarSign className="w-5 h-5 text-pink-400" />
          <h2 className="font-semibold text-gray-700 dark:text-gray-300">Résumé budget</h2>
        </div>
        <div className="grid grid-cols-3 gap-3 mb-3">
          <div className="text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">Budget estimé</p>
            <p className="text-lg font-bold text-gray-700 dark:text-gray-300">{totalEstime}€</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">Déjà coché</p>
            <p className="text-lg font-bold text-pink-500">{totalCoche}€</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">Restant</p>
            <p className="text-lg font-bold text-purple-500">{totalEstime - totalCoche}€</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600 dark:text-gray-300 whitespace-nowrap">Mon budget :</label>
          <div className="relative flex-1">
            <input
              type="number"
              value={budgetUser}
              onChange={e => setBudgetUser(e.target.value)}
              placeholder="ex: 1500"
              className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 text-sm">€</span>
          </div>
          {budgetNum > 0 && (
            <div className={`text-sm font-bold whitespace-nowrap ${diffColor}`}>
              {difference >= 0 ? '+' : ''}{Math.round(difference)}€
            </div>
          )}
        </div>
      </div>

      {/* Add custom item button */}
      <div className="mx-4 mt-3">
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="w-full flex items-center justify-center gap-2 bg-white dark:bg-gray-900 border-2 border-dashed border-pink-300 text-pink-500 font-medium py-3 rounded-2xl hover:bg-pink-50 dark:hover:bg-pink-950/30 dark:bg-pink-950/30 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Ajouter un article personnalisé
        </button>
      </div>

      {/* Add form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mx-4 mt-2 bg-white dark:bg-gray-900 rounded-2xl shadow-sm p-4 overflow-hidden"
          >
            <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-3">Nouvel article</h3>
            <div className="space-y-3">
              <input
                type="text"
                value={newItem.nom}
                onChange={e => setNewItem(p => ({ ...p, nom: e.target.value }))}
                placeholder="Nom de l'article"
                className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300"
              />
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={newItem.categorie}
                  onChange={e => setNewItem(p => ({ ...p, categorie: e.target.value }))}
                  className="border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300"
                >
                  {CATEGORIES_ORDER.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <select
                  value={newItem.priorite}
                  onChange={e => setNewItem(p => ({ ...p, priorite: e.target.value as 'Essentiel' | 'Pratique' | 'Bonus' }))}
                  className="border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300"
                >
                  <option value="Essentiel">Essentiel</option>
                  <option value="Pratique">Pratique</option>
                  <option value="Bonus">Bonus</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  value={newItem.budgetEstime}
                  onChange={e => setNewItem(p => ({ ...p, budgetEstime: e.target.value }))}
                  placeholder="Budget (€)"
                  className="border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300"
                />
                <input
                  type="number"
                  value={newItem.quantite}
                  onChange={e => setNewItem(p => ({ ...p, quantite: e.target.value }))}
                  placeholder="Quantité"
                  min="1"
                  className="border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={addCustomItem}
                  className="flex-1 bg-pink-50 dark:bg-pink-500 text-white py-2 rounded-xl text-sm font-medium hover:bg-pink-600 transition-colors"
                >
                  Ajouter
                </button>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="px-4 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 py-2 rounded-xl text-sm hover:bg-gray-200 dark:bg-gray-700 transition-colors"
                >
                  Annuler
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Categories */}
      <div className="mx-4 mt-3 space-y-3 pb-8">
        {allCategories.map(cat => {
          const catItems = items.filter(i => i.categorie === cat);
          if (catItems.length === 0) return null;
          const isOpen = openCategories[cat];
          const cocheCount = catItems.filter(i => i.coche).length;
          const catBudget = catItems.reduce((sum, i) => sum + i.budgetEstime, 0);

          return (
            <div key={cat} className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm overflow-hidden">
              {/* Category header */}
              <button
                onClick={() => toggleCategorie(cat)}
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-800 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-700 dark:text-gray-300">{cat}</span>
                  <span className="text-xs bg-pink-100 dark:bg-pink-900/30 text-pink-600 px-2 py-0.5 rounded-full">
                    {cocheCount}/{catItems.length}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-400 dark:text-gray-500">{catBudget}€</span>
                  {isOpen ? <ChevronUp className="w-4 h-4 text-gray-400 dark:text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-400 dark:text-gray-500" />}
                </div>
              </button>

              {/* Items */}
              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="divide-y divide-gray-50">
                      {catItems.map(item => (
                        <div
                          key={item.id}
                          className={`flex items-center gap-3 px-4 py-3 transition-colors ${item.coche ? 'bg-green-50 dark:bg-green-950/30' : 'hover:bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-800'}`}
                        >
                          {/* Checkbox */}
                          <button
                            onClick={() => toggleItem(item.id)}
                            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                              item.coche
                                ? 'bg-green-50 dark:bg-green-500 border-green-500'
                                : 'border-gray-300 dark:border-gray-600 hover:border-pink-400'
                            }`}
                          >
                            {item.coche && <CheckCircle2 className="w-4 h-4 text-white" />}
                          </button>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-medium ${item.coche ? 'line-through text-gray-400 dark:text-gray-500' : 'text-gray-700 dark:text-gray-300'}`}>
                              {item.nom}
                              {item.quantite > 1 && <span className="text-gray-400 dark:text-gray-500 ml-1">x{item.quantite}</span>}
                            </p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${PRIORITE_COLORS[item.priorite]}`}>
                                {item.priorite}
                              </span>
                              {item.budgetEstime > 0 && (
                                <span className="text-xs text-gray-400 dark:text-gray-500">~{item.budgetEstime}€</span>
                              )}
                            </div>
                          </div>

                          {/* Delete custom items */}
                          {item.custom && (
                            <button
                              onClick={() => deleteItem(item.id)}
                              className="p-1 text-gray-300 dark:text-gray-500 hover:text-red-400 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
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

      {/* Bottom summary */}
      <div className="fixed bottom-16 left-0 right-0 px-4">
        <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-2xl shadow-lg px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
            <ShoppingCart className="w-4 h-4 text-pink-400" />
            <span className="text-sm font-medium">{items.filter(i => !i.coche).length} restants</span>
          </div>
          <div className="text-sm font-bold text-gray-700 dark:text-gray-300">
            Total estimé : <span className="text-pink-500">{totalEstime}€</span>
          </div>
        </div>
      </div>
    </div>
  );
}
