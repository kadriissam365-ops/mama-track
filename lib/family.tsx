"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth";

export type FamilyBaby = { id: string; name: string; birth_date: string; user_id: string };
export type FamilyState = { activeStage: "pregnancy" | "baby"; activeBabyId: string | null; babies: FamilyBaby[] };
const EMPTY: FamilyState = { activeStage: "pregnancy", activeBabyId: null, babies: [] };
const FamilyContext = createContext<(FamilyState & { loading: boolean; error: string | null; refresh: () => Promise<void>; select: (stage: FamilyState["activeStage"], babyId?: string) => Promise<void> }) | null>(null);

export function FamilyProvider({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const userId = user?.id;
  const pathname = usePathname();
  const [state, setState] = useState<{ owner?: string; family: FamilyState; loading: boolean; error: string | null }>({ family: EMPTY, loading: true, error: null });
  const refresh = useCallback(async () => {
    if (!userId) return;
    const response = await fetch("/api/family", { cache: "no-store" });
    if (!response.ok) throw new Error("Le suivi familial est momentanément indisponible.");
    const family: FamilyState = await response.json();
    setState({ owner: userId, family, loading: false, error: null });
  }, [userId]);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    fetch("/api/family", { cache: "no-store" }).then(async response => {
      if (!response.ok) throw new Error("Le suivi familial est momentanément indisponible.");
      const family: FamilyState = await response.json();
      if (!cancelled) setState({ owner: userId, family, loading: false, error: null });
    }).catch(error => {
      if (!cancelled) setState({ owner: userId, family: EMPTY, loading: false, error: error.message });
    });
    return () => { cancelled = true; };
  }, [userId, pathname]);

  const select = useCallback(async (stage: FamilyState["activeStage"], babyId?: string) => {
    const response = await fetch("/api/family", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ activeStage: stage, activeBabyId: babyId }) });
    if (!response.ok) throw new Error("Impossible de changer d’espace. Réessaie.");
    await refresh();
  }, [refresh]);

  const current = state.owner === userId ? state : { family: EMPTY, loading: Boolean(userId), error: null };
  return <FamilyContext.Provider value={{ ...current.family, loading: authLoading || current.loading, error: current.error, refresh, select }}>{children}</FamilyContext.Provider>;
}

export function useFamily() {
  const value = useContext(FamilyContext);
  if (!value) throw new Error("FamilyProvider is required");
  return value;
}
