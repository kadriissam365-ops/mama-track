"use client";

import { useTransition } from "react";
import { useHydrated } from "@/lib/client-state";
import { useTheme } from "next-themes";

type Props = {
  savePreference?: (theme: "light" | "dark" | "system") => Promise<void>;
};

const OPTIONS: Array<{ value: "light" | "dark" | "system"; label: string; icon: string }> = [
  { value: "light", label: "Clair", icon: "☀️" },
  { value: "dark", label: "Sombre", icon: "🌙" },
  { value: "system", label: "Auto", icon: "🖥️" },
];

export function ThemeToggle({ savePreference }: Props) {
  const { theme, setTheme } = useTheme();
  const mounted = useHydrated();
  const [pending, startTransition] = useTransition();



  if (!mounted) {
    return (
      <div className="inline-flex h-10 w-48 animate-pulse rounded-lg bg-surface-muted" />
    );
  }

  const current = (theme as "light" | "dark" | "system") ?? "system";

  return (
    <div className="inline-flex rounded-lg border border-border bg-surface p-1">
      {OPTIONS.map((opt) => {
        const active = current === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            disabled={pending}
            onClick={() => {
              setTheme(opt.value);
              if (savePreference) {
                startTransition(async () => {
                  try {
                    await savePreference(opt.value);
                  } catch {
                    /* ignore persistence error */
                  }
                });
              }
            }}
            className={
              "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm transition " +
              (active
                ? "bg-brand text-white shadow-sm"
                : "text-foreground-muted hover:bg-surface-muted")
            }
          >
            <span aria-hidden>{opt.icon}</span>
            <span>{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}
