"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";
import { haptic } from "@/lib/enfant/haptics";

type ToastTone = "success" | "danger" | "info";

type ToastItem = {
  id: string;
  tone: ToastTone;
  title: string;
  description?: string;
  durationMs: number;
};

type ToastContextValue = {
  show: (input: {
    tone?: ToastTone;
    title: string;
    description?: string;
    durationMs?: number;
  }) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const TONE_STYLE: Record<
  ToastTone,
  { bg: string; text: string; Icon: typeof CheckCircle2; iconColor: string }
> = {
  success: {
    bg: "bg-success-soft border-success/30",
    text: "text-success-text",
    Icon: CheckCircle2,
    iconColor: "text-success",
  },
  danger: {
    bg: "bg-danger-soft border-danger/30",
    text: "text-danger-text",
    Icon: AlertCircle,
    iconColor: "text-danger",
  },
  info: {
    bg: "bg-info-soft border-info/30",
    text: "text-info-text",
    Icon: Info,
    iconColor: "text-info",
  },
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const reduce = useReducedMotion();

  const dismiss = useCallback((id: string) => {
    setItems((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const show = useCallback<ToastContextValue["show"]>(
    ({ tone = "info", title, description, durationMs = 3800 }) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      setItems((prev) => [...prev, { id, tone, title, description, durationMs }]);
      haptic(tone === "danger" ? "error" : tone === "success" ? "success" : "light");
      window.setTimeout(() => dismiss(id), durationMs);
    },
    [dismiss],
  );

  const value = useMemo(() => ({ show }), [show]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="pointer-events-none fixed inset-x-0 top-3 z-[60] mx-auto flex max-w-md flex-col items-center gap-2 px-3 safe-pt"
      >
        <AnimatePresence initial={false}>
          {items.map((t) => {
            const s = TONE_STYLE[t.tone];
            return (
              <motion.div
                key={t.id}
                layout
                initial={reduce ? false : { opacity: 0, y: -12, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={reduce ? { opacity: 0 } : { opacity: 0, y: -8, scale: 0.96 }}
                transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                className={`pointer-events-auto w-full rounded-2xl border ${s.bg} px-4 py-3 shadow-[var(--shadow-elevated)] glass-strong`}
              >
                <div className="flex items-start gap-3">
                  <s.Icon className={`h-5 w-5 shrink-0 ${s.iconColor}`} strokeWidth={2} />
                  <div className="min-w-0 flex-1">
                    <p className={`text-sm font-semibold ${s.text}`}>{t.title}</p>
                    {t.description && (
                      <p className={`mt-0.5 text-xs ${s.text} opacity-80`}>
                        {t.description}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => dismiss(t.id)}
                    aria-label="Fermer"
                    className={`shrink-0 ${s.text} opacity-70 transition hover:opacity-100`}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    return {
      show: (input: Parameters<ToastContextValue["show"]>[0]) => {
        if (typeof console !== "undefined") {
          console.warn("[toast] ToastProvider absent — fallback console", input);
        }
      },
    } satisfies ToastContextValue;
  }
  return ctx;
}
