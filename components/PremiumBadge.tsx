"use client";

import { Sparkles } from "lucide-react";

interface PremiumBadgeProps {
  className?: string;
  label?: string;
}

export default function PremiumBadge({
  className = "",
  label = "Premium",
}: PremiumBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gradient-to-r from-amber-200 via-pink-200 to-purple-200 text-[#3d2b2b] dark:text-pink-100 dark:from-amber-500/30 dark:via-pink-500/30 dark:to-purple-500/30 ${className}`}
    >
      <Sparkles className="w-3 h-3" />
      {label}
    </span>
  );
}
