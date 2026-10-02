"use client";

import { useEffect } from "react";

/**
 * Enregistre le service worker au montage (côté client uniquement).
 * Auto-update : déclenche update() à chaque visite + sur reconnexion.
 */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;
    if (process.env.NODE_ENV !== "production") return;

    const register = async () => {
      try {
        const reg = await navigator.serviceWorker.register("/sw.js", {
          scope: "/",
        });
        reg.update().catch(() => {});
        // Re-check pour update à chaque retour online
        window.addEventListener("online", () => reg.update().catch(() => {}));
      } catch {
        // ignore — soft fail
      }
    };

    if (document.readyState === "complete") {
      register();
    } else {
      window.addEventListener("load", register, { once: true });
    }
  }, []);

  return null;
}
