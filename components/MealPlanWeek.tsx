"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { m as motion, AnimatePresence } from "framer-motion";
import { ChefHat, RotateCcw, Loader2, ShoppingBasket, ChevronDown, Sun, Sandwich, Moon, Cookie, Lightbulb, Check } from "lucide-react";
import { Skeleton } from "./Skeleton";
import { useToast } from "@/lib/toast";

interface Meal {
  title: string;
  ingredients: string[];
  tip?: string;
}

interface DayPlan {
  day: string;
  breakfast: Meal;
  lunch: Meal;
  dinner: Meal;
  snacks: { title: string; ingredients: string[] }[];
}

interface ShoppingCategory {
  category: string;
  items: string[];
}

interface MealPlan {
  weekStart: string;
  trimester: 1 | 2 | 3;
  days: DayPlan[];
  shoppingList: ShoppingCategory[];
  weeklyFocus: string;
}

interface ApiResponse {
  plan?: MealPlan;
  cached?: boolean;
  weekStart?: string;
  trimester?: 1 | 2 | 3;
  error?: string;
}

const STORAGE_PREFIX = "mamatrack:meal-plan:checked:";

function formatWeekLabel(weekStart: string): string {
  try {
    const d = new Date(weekStart);
    if (isNaN(d.getTime())) return weekStart;
    return d.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
  } catch {
    return weekStart;
  }
}

function MealCard({ icon, label, meal, accent }: { icon: React.ReactNode; label: string; meal: Meal; accent: string }) {
  return (
    <div className={`rounded-2xl border ${accent} p-3 space-y-2`}>
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-full bg-white/70 dark:bg-gray-900/40 flex items-center justify-center">{icon}</div>
        <div className="flex-1">
          <p className="text-[10px] uppercase tracking-wider font-bold text-gray-500 dark:text-gray-400">{label}</p>
          <p className="text-sm font-semibold text-[#3d2b2b] dark:text-gray-100">{meal.title}</p>
        </div>
      </div>
      {meal.ingredients.length > 0 && (
        <ul className="text-xs text-gray-600 dark:text-gray-300 space-y-0.5 pl-1">
          {meal.ingredients.map((ing, i) => <li key={i}>• {ing}</li>)}
        </ul>
      )}
      {meal.tip && (
        <div className="flex items-start gap-1.5 bg-white/60 dark:bg-gray-900/40 rounded-lg p-2">
          <Lightbulb className="w-3 h-3 text-amber-500 mt-0.5 flex-shrink-0" />
          <p className="text-[11px] text-gray-600 dark:text-gray-300">{meal.tip}</p>
        </div>
      )}
    </div>
  );
}

function SnacksCard({ snacks }: { snacks: { title: string; ingredients: string[] }[] }) {
  if (snacks.length === 0) return null;
  return (
    <div className="rounded-2xl border border-pink-100 dark:border-pink-900/30 bg-pink-50/50 dark:bg-pink-950/20 p-3 space-y-2">
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-full bg-white/70 dark:bg-gray-900/40 flex items-center justify-center">
          <Cookie className="w-3.5 h-3.5 text-pink-500" />
        </div>
        <p className="text-[10px] uppercase tracking-wider font-bold text-gray-500 dark:text-gray-400">Collations</p>
      </div>
      <ul className="text-xs text-gray-600 dark:text-gray-300 space-y-1 pl-1">
        {snacks.map((s, i) => (
          <li key={i}>
            <span className="font-medium text-[#3d2b2b] dark:text-gray-100">{s.title}</span>
            {s.ingredients.length > 0 && <span className="text-gray-500 dark:text-gray-400"> — {s.ingredients.join(", ")}</span>}
          </li>
        ))}
      </ul>
    </div>
  );
}

function ShoppingItemRow({ label, isChecked, onToggle }: { label: string; isChecked: boolean; onToggle: () => void }) {
  return (
    <button onClick={onToggle} className="w-full flex items-center gap-3 text-left py-1 group">
      <span className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors flex-shrink-0 ${isChecked ? "bg-pink-400 border-pink-400" : "border-pink-200 dark:border-pink-800/50 group-hover:border-pink-400"}`}>
        {isChecked && <Check className="w-3 h-3 text-white" />}
      </span>
      <span className={`text-sm transition-all ${isChecked ? "line-through text-gray-400 dark:text-gray-600" : "text-gray-700 dark:text-gray-200"}`}>
        {label}
      </span>
    </button>
  );
}

export default function MealPlanWeek() {
  const toast = useToast();
  const [plan, setPlan] = useState<MealPlan | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [hidden, setHidden] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<"days" | "shopping">("days");
  const [expandedDay, setExpandedDay] = useState<string | null>("lundi");
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  // Charge les items cochés depuis localStorage (clé indexée par weekStart)
  useEffect(() => {
    if (!plan) return;
    try {
      const raw = typeof window !== "undefined" ? window.localStorage.getItem(STORAGE_PREFIX + plan.weekStart) : null;
      if (raw) setChecked(JSON.parse(raw) as Record<string, boolean>);
      else setChecked({});
    } catch {
      // ignore
    }
  }, [plan]);

  const persistChecked = useCallback((next: Record<string, boolean>) => {
    setChecked(next);
    if (!plan) return;
    try {
      window.localStorage.setItem(STORAGE_PREFIX + plan.weekStart, JSON.stringify(next));
    } catch {
      // ignore
    }
  }, [plan]);

  const fetchPlan = useCallback(async (regenerate: boolean) => {
    if (regenerate) setRefreshing(true);
    else setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/meal-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(regenerate ? { regenerate: true } : {}),
      });
      if (res.status === 402) { setHidden(true); return; }
      const data = (await res.json().catch(() => ({}))) as ApiResponse;
      if (!res.ok) { setError(data.error ?? "Impossible de charger ton plan repas."); return; }
      if (data.plan) {
        setPlan(data.plan);
        if (regenerate) toast.success("Nouveau plan repas généré ✨");
      } else {
        setError("Plan indisponible pour le moment.");
      }
    } catch {
      setError("Erreur réseau — réessaie plus tard.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchPlan(false);
  }, [fetchPlan]);

  const totalChecked = useMemo(() => {
    if (!plan) return { done: 0, total: 0 };
    let total = 0;
    let done = 0;
    for (const cat of plan.shoppingList) {
      for (const item of cat.items) {
        total += 1;
        const key = `${cat.category}::${item}`;
        if (checked[key]) done += 1;
      }
    }
    return { done, total };
  }, [plan, checked]);

  if (hidden) return null;

  if (loading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-20 w-full rounded-3xl" />
        <Skeleton className="h-12 w-full rounded-2xl" />
        <Skeleton className="h-48 w-full rounded-3xl" />
        <Skeleton className="h-48 w-full rounded-3xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/30 rounded-2xl p-4 text-sm text-red-600 dark:text-red-300">
        {error}
        <button
          onClick={() => fetchPlan(false)}
          className="block mt-2 text-xs underline hover:text-red-800"
        >
          Réessayer
        </button>
      </div>
    );
  }

  if (!plan) return null;

  const trimesterLabel = `T${plan.trimester}`;

  return (
    <div className="space-y-4">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-amber-50 via-pink-50 to-purple-50 dark:from-amber-950/30 dark:via-pink-950/30 dark:to-purple-950/30 rounded-3xl p-4 border border-pink-100 dark:border-pink-900/30"
      >
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-full bg-white/70 dark:bg-gray-900/40 flex items-center justify-center">
            <ChefHat className="w-4 h-4 text-purple-600 dark:text-purple-300" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-[#3d2b2b] dark:text-gray-100 text-sm truncate">
              Plan semaine du {formatWeekLabel(plan.weekStart)}
            </h3>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-300 bg-white/60 dark:bg-gray-900/40 px-2 py-0.5 rounded-full">
            {trimesterLabel}
          </span>
          <button
            type="button"
            onClick={() => {
              if (!refreshing) fetchPlan(true);
            }}
            disabled={refreshing}
            aria-label="Régénérer le plan repas"
            title="Régénérer"
            className="text-purple-400 hover:text-purple-600 dark:hover:text-purple-300 transition-colors disabled:opacity-50"
          >
            {refreshing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-4 h-4" />}
          </button>
        </div>
        {plan.weeklyFocus && (
          <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">{plan.weeklyFocus}</p>
        )}
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-1 bg-pink-50 dark:bg-pink-950/30 rounded-2xl p-1">
        <button
          onClick={() => setActiveTab("days")}
          className={`flex-1 py-2 text-xs font-medium rounded-xl transition-all flex items-center justify-center gap-1.5 ${
            activeTab === "days"
              ? "bg-white dark:bg-gray-900 text-pink-600 shadow-sm"
              : "text-gray-500 dark:text-gray-400 hover:text-pink-400"
          }`}
        >
          <ChefHat className="w-3.5 h-3.5" />
          7 jours
        </button>
        <button
          onClick={() => setActiveTab("shopping")}
          className={`flex-1 py-2 text-xs font-medium rounded-xl transition-all flex items-center justify-center gap-1.5 ${
            activeTab === "shopping"
              ? "bg-white dark:bg-gray-900 text-pink-600 shadow-sm"
              : "text-gray-500 dark:text-gray-400 hover:text-pink-400"
          }`}
        >
          <ShoppingBasket className="w-3.5 h-3.5" />
          Liste de courses
          {totalChecked.total > 0 && (
            <span className="text-[10px] text-pink-500 dark:text-pink-300">
              {totalChecked.done}/{totalChecked.total}
            </span>
          )}
        </button>
      </div>

      {activeTab === "days" && (
        <div className="space-y-2">
          {plan.days.map((day) => {
            const isOpen = expandedDay === day.day;
            return (
              <motion.div
                key={day.day}
                layout
                className="bg-white dark:bg-gray-900 rounded-2xl border border-pink-100 dark:border-pink-900/30 overflow-hidden"
              >
                <button
                  onClick={() => setExpandedDay(isOpen ? null : day.day)}
                  className="w-full px-4 py-3 flex items-center justify-between text-left"
                >
                  <span className="text-sm font-semibold capitalize text-[#3d2b2b] dark:text-gray-100">
                    {day.day}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
                  />
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="px-3 pb-3 space-y-2">
                        <MealCard
                          icon={<Sun className="w-3.5 h-3.5 text-amber-500" />}
                          label="Petit-déj"
                          meal={day.breakfast}
                          accent="border-amber-100 dark:border-amber-900/30 bg-amber-50/50 dark:bg-amber-950/20"
                        />
                        <MealCard
                          icon={<Sandwich className="w-3.5 h-3.5 text-orange-500" />}
                          label="Déjeuner"
                          meal={day.lunch}
                          accent="border-orange-100 dark:border-orange-900/30 bg-orange-50/50 dark:bg-orange-950/20"
                        />
                        <MealCard
                          icon={<Moon className="w-3.5 h-3.5 text-indigo-500" />}
                          label="Dîner"
                          meal={day.dinner}
                          accent="border-indigo-100 dark:border-indigo-900/30 bg-indigo-50/50 dark:bg-indigo-950/20"
                        />
                        <SnacksCard snacks={day.snacks} />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      )}

      {activeTab === "shopping" && (
        <div className="space-y-3">
          {plan.shoppingList.map((cat) => (
            <div
              key={cat.category}
              className="bg-white dark:bg-gray-900 rounded-2xl border border-pink-100 dark:border-pink-900/30 p-4"
            >
              <h4 className="text-sm font-semibold text-[#3d2b2b] dark:text-gray-100 mb-3">{cat.category}</h4>
              <ul className="space-y-1.5">
                {cat.items.map((item, i) => {
                  const key = `${cat.category}::${item}`;
                  const isChecked = Boolean(checked[key]);
                  return (
                    <li key={i}>
                      <ShoppingItemRow
                        label={item}
                        isChecked={isChecked}
                        onToggle={() => persistChecked({ ...checked, [key]: !isChecked })}
                      />
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
