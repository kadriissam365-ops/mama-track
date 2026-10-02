"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Baby, Heart, Loader2 } from "lucide-react";
import { useFamily } from "@/lib/family";

export default function FamilySwitcher() {
  const pathname = usePathname();
  const router = useRouter();
  const family = useFamily();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inBaby = pathname.startsWith("/enfant");
  const switchTo = async (stage: "pregnancy" | "baby") => {
    setPending(true); setError(null);
    try {
      await family.select(stage);
      router.push(stage === "baby" ? "/enfant/dashboard" : "/?espace=grossesse");
      router.refresh();
    } catch (error) { setError(error instanceof Error ? error.message : "Réessaie dans un instant."); }
    finally { setPending(false); }
  };
  return <div className="max-w-lg mx-auto mt-3">
    <div className="flex gap-1 rounded-2xl bg-pink-50/80 dark:bg-gray-800 p-1 border border-pink-100 dark:border-gray-700" aria-label="Choisir un espace">
      {[{ stage: "pregnancy" as const, label: "Grossesse", icon: Heart }, { stage: "baby" as const, label: "Bébé · 0–3 ans", icon: Baby }].map(({ stage, label, icon: Icon }) => {
        const active = stage === "baby" ? inBaby : !inBaby;
        return <button key={stage} type="button" onClick={() => switchTo(stage)} disabled={pending} aria-pressed={active} className={`flex-1 flex items-center justify-center gap-2 min-h-10 rounded-xl text-xs font-semibold transition ${active ? "bg-white dark:bg-gray-900 text-pink-700 dark:text-pink-200 shadow-sm" : "text-gray-500 dark:text-gray-400 hover:text-pink-600"}`}><Icon className="w-4 h-4" />{label}{pending && active && <Loader2 className="w-3 h-3 animate-spin" />}</button>;
      })}
    </div>
    {error && <p role="alert" className="mt-2 text-xs text-red-600 dark:text-red-300">{error}</p>}
  </div>;
}
