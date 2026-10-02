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
    isPremium: isPremium && (!premiumUntil || new Date(premiumUntil).getTime() > new Date().getTime()),
    loading,
    until: premiumUntil ? new Date(premiumUntil) : null,
  };
}
