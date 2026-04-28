"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { m as motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Info, X, Sparkles } from "lucide-react";
import { useAuth } from "@/lib/auth";

interface CoachAlert {
  level: "info" | "warn" | "red";
  message: string;
  source: string;
}

const STORAGE_KEY = "mamacoach-dismissed-alerts";

function getDismissed(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function saveDismissed(keys: string[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(keys));
  } catch {
    // ignore
  }
}

function alertKey(a: CoachAlert): string {
  // Daily key: same alert dismissed on the same day stays dismissed,
  // but reappears the next day if the underlying signal is still present.
  const today = new Date().toISOString().slice(0, 10);
  return `${today}:${a.source}:${a.level}`;
}

export default function MamaCoachAlerts() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [alerts, setAlerts] = useState<CoachAlert[]>([]);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  useEffect(() => {
    setDismissed(new Set(getDismissed()));
  }, []);

  useEffect(() => {
    if (authLoading || !isAuthenticated) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/coach", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "signal_check" }),
        });
        if (!res.ok) return;
        const data = (await res.json()) as { alerts?: CoachAlert[] };
        if (!cancelled && Array.isArray(data.alerts)) {
          setAlerts(data.alerts);
        }
      } catch {
        // silent — alerts are non-critical
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [authLoading, isAuthenticated]);

  function dismiss(a: CoachAlert) {
    const key = alertKey(a);
    const next = new Set(dismissed);
    next.add(key);
    setDismissed(next);
    saveDismissed(Array.from(next));
  }

  const visible = alerts.filter((a) => !dismissed.has(alertKey(a)));
  if (visible.length === 0) return null;

  return (
    <div className="space-y-2">
      <AnimatePresence initial={false}>
        {visible.map((a) => {
          const isRed = a.level === "red";
          const isWarn = a.level === "warn";
          const palette = isRed
            ? "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900/50 text-red-800 dark:text-red-200"
            : isWarn
              ? "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900/50 text-amber-800 dark:text-amber-200"
              : "bg-pink-50 dark:bg-pink-950/30 border-pink-200 dark:border-pink-900/40 text-pink-800 dark:text-pink-200";
          const Icon = isRed ? AlertTriangle : isWarn ? AlertTriangle : Info;
          return (
            <motion.div
              key={`${a.source}-${a.level}`}
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
              className={`relative rounded-3xl border p-4 shadow-sm ${palette}`}
            >
              <div className="flex items-start gap-3 pr-6">
                <Icon className="w-5 h-5 shrink-0 mt-0.5" />
                <div className="flex-1 text-sm leading-relaxed">
                  <p className="whitespace-pre-wrap">{a.message}</p>
                  <Link
                    href="/coach"
                    className="inline-flex items-center gap-1 mt-2 text-xs font-medium underline-offset-4 hover:underline"
                  >
                    <Sparkles className="w-3 h-3" />
                    En parler à MamaCoach
                  </Link>
                </div>
              </div>
              <button
                type="button"
                onClick={() => dismiss(a)}
                className="absolute top-2.5 right-2.5 opacity-60 hover:opacity-100 transition-opacity"
                aria-label="Masquer cette alerte"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
