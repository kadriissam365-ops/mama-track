"use client";
import { useSyncExternalStore } from "react";
const emptySubscribe = () => () => {};
export function useHydrated() { return useSyncExternalStore(emptySubscribe, () => true, () => false); }
function subscribeStorage(listener: () => void) {
  window.addEventListener("storage", listener);
  window.addEventListener("mamatrack-storage", listener);
  return () => { window.removeEventListener("storage", listener); window.removeEventListener("mamatrack-storage", listener); };
}
export function useStoredString(key: string, fallback = "") {
  return useSyncExternalStore(subscribeStorage, () => {
    try { return localStorage.getItem(key) ?? fallback; } catch { return fallback; }
  }, () => fallback);
}
export function notifyStorageChange() { window.dispatchEvent(new Event("mamatrack-storage")); }
