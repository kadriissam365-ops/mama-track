"use client";

import { useCallback, useEffect, useState } from "react";
import { m as motion } from "framer-motion";
import { Salad, Loader2, X, Plus } from "lucide-react";
import { useToast } from "@/lib/toast";
import { createClient } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";

const DIET_OPTIONS: { value: string; label: string }[] = [
  { value: "aucune", label: "Aucune restriction" },
  { value: "vegetarien", label: "Végétarien" },
  { value: "vegan", label: "Végan" },
  { value: "sans_porc", label: "Sans porc" },
  { value: "halal", label: "Halal" },
  { value: "casher", label: "Casher" },
];

interface ProfileMealRow {
  food_allergies?: string[] | null;
  dietary_preferences?: string | null;
}

export default function MealPreferences() {
  const toast = useToast();
  const { user } = useAuth();
  const [allergies, setAllergies] = useState<string[]>([]);
  const [diet, setDiet] = useState<string>("aucune");
  const [draft, setDraft] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const supabase = createClient();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const sb = supabase as any;
      const { data } = await sb
        .from("profiles")
        .select("food_allergies, dietary_preferences")
        .eq("id", user.id)
        .maybeSingle();
      const row = (data as ProfileMealRow | null) ?? null;
      setAllergies(Array.isArray(row?.food_allergies) ? row?.food_allergies ?? [] : []);
      setDiet(row?.dietary_preferences ?? "aucune");
    } catch {
      // silencieux
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  const addAllergy = () => {
    const v = draft.trim();
    if (!v) return;
    if (allergies.map((a) => a.toLowerCase()).includes(v.toLowerCase())) {
      setDraft("");
      return;
    }
    setAllergies([...allergies, v]);
    setDraft("");
  };

  const removeAllergy = (a: string) => {
    setAllergies(allergies.filter((x) => x !== a));
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const supabase = createClient();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const sb = supabase as any;
      const { error } = await sb
        .from("profiles")
        .upsert(
          {
            id: user.id,
            food_allergies: allergies,
            dietary_preferences: diet,
          },
          { onConflict: "id" },
        );
      if (error) throw new Error(error.message);
      toast.success("Préférences alimentaires enregistrées ✓");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur d'enregistrement");
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-900 rounded-3xl p-5 shadow-sm border border-pink-100 dark:border-pink-900/30 space-y-4"
    >
      <h3 className="font-semibold text-[#3d2b2b] dark:text-gray-100 flex items-center gap-2">
        <Salad className="w-4 h-4 text-pink-400" />
        Préférences alimentaires
      </h3>
      <p className="text-xs text-gray-500 dark:text-gray-400 -mt-2">
        Utilisées par le plan repas IA pour personnaliser tes recettes.
      </p>

      {/* Régime */}
      <div>
        <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Régime alimentaire</label>
        <div className="grid grid-cols-2 gap-2">
          {DIET_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setDiet(opt.value)}
              disabled={loading}
              className={`py-2 rounded-xl border-2 text-xs font-semibold transition-all ${
                diet === opt.value
                  ? "border-pink-400 bg-pink-50 dark:bg-pink-950/30 text-pink-700 dark:text-pink-300"
                  : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Allergies */}
      <div>
        <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Allergies / aliments à exclure</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addAllergy();
              }
            }}
            placeholder="Ex : arachides, lactose, gluten..."
            disabled={loading}
            className="flex-1 border border-pink-200 dark:border-pink-800/30 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300 dark:bg-gray-800 dark:text-white"
          />
          <button
            type="button"
            onClick={addAllergy}
            disabled={loading || !draft.trim()}
            className="px-3 py-2 rounded-xl bg-pink-400 text-white text-sm font-medium hover:bg-pink-500 disabled:opacity-50 flex items-center gap-1"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
        {allergies.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {allergies.map((a) => (
              <span
                key={a}
                className="inline-flex items-center gap-1 bg-pink-50 dark:bg-pink-950/30 text-pink-700 dark:text-pink-300 text-xs px-2.5 py-1 rounded-full border border-pink-200 dark:border-pink-800/30"
              >
                {a}
                <button
                  type="button"
                  onClick={() => removeAllergy(a)}
                  aria-label={`Retirer ${a}`}
                  className="text-pink-400 hover:text-pink-600"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      <button
        onClick={handleSave}
        disabled={saving || loading}
        className="w-full py-2.5 bg-pink-400 text-white rounded-xl font-medium hover:bg-pink-500 dark:hover:bg-pink-600 dark:bg-pink-500 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
      >
        {saving ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Enregistrement…
          </>
        ) : (
          "Enregistrer"
        )}
      </button>
    </motion.div>
  );
}
