"use client";

import { useSyncExternalStore } from "react";

interface CapacitorWindow {
  Capacitor?: {
    isNativePlatform?: () => boolean;
    getPlatform?: () => string;
  };
}

function detectIOSNative(): boolean {
  if (typeof window === "undefined") return false;
  const w = window as unknown as CapacitorWindow;
  const cap = w.Capacitor;
  if (!cap || typeof cap.isNativePlatform !== "function") return false;
  try {
    return cap.isNativePlatform() && cap.getPlatform?.() === "ios";
  } catch {
    return false;
  }
}

const subscribe = () => () => {};
export function useIsIOSNative(): boolean { return useSyncExternalStore(subscribe, detectIOSNative, () => false); }
