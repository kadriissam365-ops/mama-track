"use client";

import Link from "next/link";
import { Sparkles, Lock } from "lucide-react";
import { useIsPremium } from "@/lib/use-premium";

interface PaywallProps {
  feature: string;
  children: React.ReactNode;
  compact?: boolean;
}

export default function Paywall({ feature, children, compact = false }: PaywallProps) {
  const { isPremium, loading } = useIsPremium();

  if (loading || isPremium) return <>{children}</>;

  if (compact) {
    return (
      <Link
        href="/plus"
        className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-dashed border-purple-300 dark:border-purple-700/50 bg-gradient-to-r from-amber-50 via-pink-50 to-purple-50 dark:from-amber-950/20 dark:via-pink-950/20 dark:to-purple-950/20 text-purple-700 dark:text-purple-300 text-sm font-semibold hover:opacity-90 transition-opacity"
      >
        <Lock className="w-4 h-4" />
        <span>{feature}</span>
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-gradient-to-r from-amber-200 via-pink-200 to-purple-200 text-[#3d2b2b]">
          <Sparkles className="w-3 h-3" />
          Premium
        </span>
      </Link>
    );
  }

  return (
    <div className="relative">
      <div className="pointer-events-none select-none blur-sm opacity-50">
        {children}
      </div>
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border border-purple-200 dark:border-purple-800/40 rounded-2xl shadow-lg px-5 py-4 max-w-xs text-center">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-amber-200 via-pink-200 to-purple-200 mb-2">
            <Lock className="w-5 h-5 text-purple-700" />
          </div>
          <p className="text-sm font-semibold text-[#3d2b2b] dark:text-gray-100 mb-1">
            {feature} — Premium
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
            Débloquez cette fonctionnalité avec MamaTrack Premium.
          </p>
          <Link
            href="/plus"
            className="inline-flex items-center gap-1.5 bg-gradient-to-r from-pink-400 to-purple-400 text-white text-xs font-semibold px-4 py-2 rounded-xl hover:opacity-90 transition-opacity"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Passer Premium
          </Link>
        </div>
      </div>
    </div>
  );
}
