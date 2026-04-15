"use client";

// Re-export everything from the i18n module directory for backward compatibility.
// The canonical sources are now:
//   - lib/i18n/provider.tsx  (I18nProvider, I18nContext, Locale)
//   - lib/i18n/useTranslation.ts  (useTranslation hook)
//   - lib/i18n/fr.json / en.json  (translation dictionaries)

export { I18nProvider, I18nContext } from "@/lib/i18n/provider";
export type { Locale, I18nContextType } from "@/lib/i18n/provider";
export { useTranslation } from "@/lib/i18n/useTranslation";

// LanguageSwitcher stays here to avoid circular imports between provider and hook
import React from "react";
import { useTranslation } from "@/lib/i18n/useTranslation";
import type { Locale } from "@/lib/i18n/provider";

export function LanguageSwitcher() {
  const { locale, setLocale, t } = useTranslation();

  const languages: { code: Locale; flag: string; label: string }[] = [
    { code: "fr", flag: "\u{1F1EB}\u{1F1F7}", label: "Fran\u00e7ais" },
    { code: "en", flag: "\u{1F1EC}\u{1F1E7}", label: "English" },
    { code: "es", flag: "\u{1F1EA}\u{1F1F8}", label: "Espa\u00f1ol" },
    { code: "ar", flag: "\u{1F1F2}\u{1F1E6}", label: "\u0627\u0644\u0639\u0631\u0628\u064a\u0629" },
  ];

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
        <span className="text-lg">{"\u{1F310}"}</span>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {languages.map(({ code, flag, label }) => (
          <button
            key={code}
            onClick={() => setLocale(code)}
            className={`py-2.5 text-sm font-medium rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              locale === code
                ? "bg-pink-400 text-white shadow-sm"
                : "bg-pink-50 text-gray-500 hover:bg-pink-100"
            }`}
          >
            {flag} {label}
          </button>
        ))}
      </div>
    </div>
  );
}
