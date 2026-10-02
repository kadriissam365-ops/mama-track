"use client";

import { useHydrated } from "@/lib/client-state";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";

export function HeaderThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useHydrated();



  if (!mounted) {
    return (
      <span
        aria-hidden
        className="inline-block h-9 w-9 rounded-full border border-border bg-surface-muted"
      />
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Passer en mode clair" : "Passer en mode sombre"}
      aria-pressed={isDark}
      title={isDark ? "Mode clair" : "Mode sombre"}
      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-surface text-foreground-muted transition hover:border-border-strong hover:text-foreground"
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}
