"use client";

import { useStore } from "./store";

export interface PremiumStatus {
  isPremium: boolean;
  loading: boolean;
  until: Date | null;
}

export function useIsPremium(): PremiumStatus {
  const { isPremium, premiumUntil, loading } = useStore();
  return {
    isPremium,
    loading,
    until: premiumUntil ? new Date(premiumUntil) : null,
  };
}
