"use client";

import { useEffect, useState } from "react";

export function useIsIOSNative(): boolean {
  const [isIOS, setIsIOS] = useState(false);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { Capacitor } = await import("@capacitor/core");
        if (!cancelled) {
          setIsIOS(Capacitor.getPlatform() === "ios" && Capacitor.isNativePlatform());
        }
      } catch {
        if (!cancelled) setIsIOS(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);
  return isIOS;
}
