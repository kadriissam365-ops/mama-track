"use client";

import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

const DISMISS_KEY = "babytrack:install-dismissed-at";
const DISMISS_COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000;

export function InstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const last = Number(
      typeof window !== "undefined" ? window.localStorage.getItem(DISMISS_KEY) : 0,
    );
    if (last && Date.now() - last < DISMISS_COOLDOWN_MS) return;

    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
      setVisible(true);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);

  if (!visible || !deferred) return null;

  async function install() {
    if (!deferred) return;
    await deferred.prompt();
    await deferred.userChoice;
    setVisible(false);
    setDeferred(null);
  }

  function dismiss() {
    window.localStorage.setItem(DISMISS_KEY, String(Date.now()));
    setVisible(false);
  }

  return (
    <div className="fixed inset-x-3 bottom-24 z-50 mx-auto max-w-md animate-[bt-fade-up_0.4s_ease-out]">
      <div className="glass-strong rounded-3xl border border-border-strong/60 p-4 shadow-[var(--shadow-float)]">
        <div className="flex items-start gap-3">
          <div className="bt-bg-gradient flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl shadow-[var(--shadow-glow)]">
            <Download className="h-5 w-5 text-white" strokeWidth={2.2} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-display text-base font-medium tracking-[-0.01em] text-foreground">
              Installer MamaTrack
            </p>
            <p className="mt-0.5 text-xs text-foreground-muted">
              Accès rapide depuis ton écran d&apos;accueil, hors-ligne inclus.
            </p>
            <div className="mt-3 flex gap-2">
              <button
                onClick={install}
                className="bt-bg-gradient rounded-full px-4 py-1.5 text-xs font-semibold text-white shadow-[var(--shadow-glow)] transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-float)]"
              >
                Installer
              </button>
              <button
                onClick={dismiss}
                className="rounded-full px-3 py-1.5 text-xs font-medium text-foreground-muted transition hover:bg-surface-muted hover:text-foreground"
              >
                Plus tard
              </button>
            </div>
          </div>
          <button
            onClick={dismiss}
            aria-label="Fermer"
            className="text-foreground-subtle transition hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
