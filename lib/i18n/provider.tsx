"use client";

import React, { createContext, useState, useEffect, useCallback } from "react";

import fr from "@/lib/i18n/fr.json";
import en from "@/lib/i18n/en.json";
import esLocale from "@/locales/es.json";
import arLocale from "@/locales/ar.json";

export type Locale = "fr" | "en" | "es" | "ar";

const RTL_LOCALES: Locale[] = ["ar"];

type TranslationDict = Record<string, Record<string, string>>;

const translations: Record<Locale, TranslationDict> = {
  fr: fr as unknown as TranslationDict,
  en: en as unknown as TranslationDict,
  es: esLocale as unknown as TranslationDict,
  ar: arLocale as unknown as TranslationDict,
};

const STORAGE_KEY = "mamatrack-locale";

export interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
  isRTL: boolean;
}

export const I18nContext = createContext<I18nContextType | null>(null);

function resolve(dict: TranslationDict, key: string): string {
  const parts = key.split(".");
  if (parts.length === 2) {
    const section = dict[parts[0]];
    if (section && typeof section === "object") {
      const value = section[parts[1]];
      if (typeof value === "string") return value;
    }
  }
  return key;
}

const VALID_LOCALES: Locale[] = ["fr", "en", "es", "ar"];

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("fr");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as Locale;
      if (VALID_LOCALES.includes(stored)) {
        setLocaleState(stored);
      }
    } catch {
      // ignore
    }
    setMounted(true);
  }, []);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    try {
      localStorage.setItem(STORAGE_KEY, newLocale);
    } catch {
      // ignore
    }
    document.documentElement.lang = newLocale;
    document.documentElement.dir = RTL_LOCALES.includes(newLocale) ? "rtl" : "ltr";
  }, []);

  const t = useCallback(
    (key: string): string => {
      const result = resolve(translations[locale], key);
      if (result === key && locale !== "fr") {
        return resolve(translations.fr, key);
      }
      return result;
    },
    [locale]
  );

  const isRTL = RTL_LOCALES.includes(locale);

  useEffect(() => {
    if (mounted) {
      document.documentElement.lang = locale;
      document.documentElement.dir = isRTL ? "rtl" : "ltr";
    }
  }, [locale, mounted, isRTL]);

  return (
    <I18nContext.Provider value={{ locale, setLocale, t, isRTL }}>
      {children}
    </I18nContext.Provider>
  );
}
