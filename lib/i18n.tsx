"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

import fr from "@/locales/fr.json";
import en from "@/locales/en.json";

export type Locale = "fr" | "en";

type TranslationDict = Record<string, Record<string, string>>;

const translations: Record<Locale, TranslationDict> = { fr, en };

const STORAGE_KEY = "mamatrack-locale";

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nContextType | null>(null);

/**
 * Resolve a dotted key like "settings.title" from the translation dictionary.
 */
function resolve(dict: TranslationDict, key: string): string {
  const parts = key.split(".");
  if (parts.length === 2) {
    const section = dict[parts[0]];
    if (section && typeof section === "object") {
      const value = section[parts[1]];
      if (typeof value === "string") return value;
    }
  }
  // Fallback: return the key itself so missing translations are visible
  return key;
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("fr");
  const [mounted, setMounted] = useState(false);

  // Read from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === "en" || stored === "fr") {
        setLocaleState(stored);
      }
    } catch {
      // localStorage unavailable (SSR / private browsing)
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
    // Update the html lang attribute
    document.documentElement.lang = newLocale;
  }, []);

  const t = useCallback(
    (key: string): string => {
      const result = resolve(translations[locale], key);
      // If not found in current locale, try French as fallback
      if (result === key && locale !== "fr") {
        return resolve(translations.fr, key);
      }
      return result;
    },
    [locale]
  );

  // Update html lang on mount
  useEffect(() => {
    if (mounted) {
      document.documentElement.lang = locale;
    }
  }, [locale, mounted]);

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
}

/**
 * Hook to access translations.
 *
 * Usage:
 *   const { t } = useTranslation();
 *   t("settings.title") // => "Parametres" or "Settings"
 */
export function useTranslation() {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error("useTranslation must be used within an I18nProvider");
  }
  return ctx;
}

/**
 * A compact language switcher component.
 * Renders two buttons for FR / EN.
 */
export function LanguageSwitcher() {
  const { locale, setLocale, t } = useTranslation();

  return (
    <div className="bg-white dark:bg-[#1a1a2e] rounded-2xl p-4 border border-pink-100 dark:border-pink-900">
      <div className="flex items-center justify-between mb-3">
        <div>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
            {t("settings.language")}
          </span>
          <p className="text-xs text-gray-400 mt-0.5">
            {t("settings.languageDescription")}
          </p>
        </div>
        <span className="text-lg">🌐</span>
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => setLocale("fr")}
          className={`flex-1 py-2.5 text-sm font-medium rounded-xl transition-all flex items-center justify-center gap-2 ${
            locale === "fr"
              ? "bg-pink-400 text-white shadow-sm"
              : "bg-pink-50 text-gray-500 hover:bg-pink-100"
          }`}
        >
          🇫🇷 Francais
        </button>
        <button
          onClick={() => setLocale("en")}
          className={`flex-1 py-2.5 text-sm font-medium rounded-xl transition-all flex items-center justify-center gap-2 ${
            locale === "en"
              ? "bg-pink-400 text-white shadow-sm"
              : "bg-pink-50 text-gray-500 hover:bg-pink-100"
          }`}
        >
          🇬🇧 English
        </button>
      </div>
    </div>
  );
}
