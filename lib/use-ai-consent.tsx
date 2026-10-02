"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";

const AiConsentContext = createContext<{
  hydrated: boolean; accepted: boolean; acceptedAt: string | null; error: string | null;
  accept: () => Promise<void>; revoke: () => Promise<void>;
} | null>(null);

export function AiConsentProvider({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const userId = user?.id;
  const [state, setState] = useState<{ owner?: string; hydrated: boolean; acceptedAt: string | null; error: string | null }>({ hydrated: false, acceptedAt: null, error: null });
  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    fetch("/api/ai/consent", { cache: "no-store" }).then(async response => {
      if (!response.ok) throw new Error("Impossible de charger le consentement.");
      return response.json();
    }).then(data => {
      if (!cancelled) setState({ owner: userId, hydrated: true, acceptedAt: data.acceptedAt, error: null });
    }).catch(() => {
      if (!cancelled) setState({ owner: userId, hydrated: true, acceptedAt: null, error: "Le consentement est momentanément indisponible." });
    });
    return () => { cancelled = true; };
  }, [userId]);

  const change = useCallback(async (method: "POST" | "DELETE") => {
    if (!userId) return;
    try {
      const response = await fetch("/api/ai/consent", { method });
      if (!response.ok) throw new Error("Impossible d’enregistrer ton choix. Réessaie.");
      const data = await response.json();
      setState({ owner: userId, hydrated: true, acceptedAt: data.acceptedAt, error: null });
    } catch (error) {
      setState(previous => ({ ...previous, error: error instanceof Error ? error.message : "Réessaie." }));
    }
  }, [userId]);
  const current = state.owner === userId ? state : { hydrated: !userId && !loading, acceptedAt: null, error: null };
  return <AiConsentContext.Provider value={{ hydrated: current.hydrated, accepted: Boolean(current.acceptedAt), acceptedAt: current.acceptedAt, error: current.error, accept: () => change("POST"), revoke: () => change("DELETE") }}>{children}</AiConsentContext.Provider>;
}

export function useAiConsent() {
  const value = useContext(AiConsentContext);
  if (!value) throw new Error("AiConsentProvider is required");
  return value;
}
