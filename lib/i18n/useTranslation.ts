"use client";

import { useContext } from "react";
import { I18nContext } from "@/lib/i18n/provider";
import type { I18nContextType } from "@/lib/i18n/provider";

export type { I18nContextType };

export function useTranslation(): I18nContextType {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error("useTranslation must be used within an I18nProvider");
  }
  return ctx;
}
