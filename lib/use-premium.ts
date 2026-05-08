"use client";

import { useStore } from "./store";
import { useIsIOSNative } from "./use-platform";

export interface PremiumStatus {
  isPremium: boolean;
  loading: boolean;
  until: Date | null;
}

export function useIsPremium(): PremiumStatus {
  const { isPremium, premiumUntil, loading } = useStore();
  const isIOSNative = useIsIOSNative();
  return {
    isPremium: isIOSNative || isPremium,
    loading,
    until: premiumUntil ? new Date(premiumUntil) : null,
  };
}
