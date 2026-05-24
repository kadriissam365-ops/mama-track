"use client";

import Link from "next/link";
import { useState } from "react";
import { Bot, Shield, Eye, AlertCircle } from "lucide-react";
import { useAiConsent } from "@/lib/use-ai-consent";

interface AiConsentGateProps {
  feature: string;
  description: string;
  dataSent: string[];
  children: React.ReactNode;
}

export function AiConsentGate({ feature, description, dataSent, children }: AiConsentGateProps) {
  const { hydrated, accepted, accept } = useAiConsent();
  const [checked, setChecked] = useState(false);

  if (!hydrated) {
    return (
      <div className="max-w-lg mx-auto px-4 py-12 text-center text-sm text-gray-400 dark:text-gray-500">
        Chargement…
      </div>
    );
  }

  if (accepted) {
    return <>{children}</>;
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-6 space-y-5">
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center shadow-sm">
          <Bot className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-lg font-semibold text-[#3d2b2b] dark:text-gray-100">{feature}</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">Activation requise</p>
        </div>
      </div>

      <div className="rounded-3xl border border-pink-100 dark:border-pink-900/40 bg-white dark:bg-gray-900 p-5 space-y-4 shadow-sm">
        <p className="text-sm text-gray-700 dark:text-gray-200 leading-relaxed">{description}</p>

        <div className="rounded-2xl bg-pink-50 dark:bg-pink-950/30 border border-pink-100 dark:border-pink-900/40 p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-pink-500 dark:text-pink-300" />
            <h2 className="text-sm font-semibold text-[#3d2b2b] dark:text-gray-100">
              Données transmises
            </h2>
          </div>
          <ul className="text-xs text-gray-600 dark:text-gray-300 space-y-1.5 list-disc list-inside leading-relaxed">
            {dataSent.map((d) => (
              <li key={d}>{d}</li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl bg-purple-50 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/40 p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-purple-500 dark:text-purple-300" />
            <h2 className="text-sm font-semibold text-[#3d2b2b] dark:text-gray-100">
              Destinataires & engagements
            </h2>
          </div>
          <ul className="text-xs text-gray-600 dark:text-gray-300 space-y-1.5 leading-relaxed">
            <li>
              <strong>Anthropic, PBC</strong> (USA) — modèle Claude. Données traitées
              uniquement pour générer la réponse, non utilisées pour l&apos;entraînement
              (politique « zero data retention » via API).
            </li>
            <li>
              <strong>Google LLC</strong> (USA) — modèle Gemini, en fallback uniquement
              si Claude est indisponible. Non utilisées pour l&apos;entraînement (API Gemini).
            </li>
            <li>
              Transferts hors UE encadrés par les <em>Clauses Contractuelles Types</em> de la
              Commission européenne.
            </li>
            <li>
              Aucune publicité, aucune revente, aucun partage avec d&apos;autres tiers.
              Conservation de 30 jours maximum côté MamaTrack.
            </li>
          </ul>
        </div>

        <div className="rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/40 p-4 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-amber-500 dark:text-amber-300 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-800 dark:text-amber-200 leading-relaxed">
            Cette fonctionnalité est <strong>informative</strong> et ne remplace jamais un avis
            médical. En cas d&apos;urgence : 15 (SAMU), 18 (Pompiers) ou le service de
            maternité de garde.
          </p>
        </div>

        <label className="flex items-start gap-2 text-xs text-gray-700 dark:text-gray-200 leading-relaxed cursor-pointer">
          <input
            type="checkbox"
            checked={checked}
            onChange={(e) => setChecked(e.target.checked)}
            className="mt-0.5 w-4 h-4 accent-pink-500"
          />
          <span>
            J&apos;ai lu et j&apos;accepte que mes messages et données de contexte soient envoyés
            à Anthropic (Claude) et, en secours, à Google (Gemini). J&apos;ai pris connaissance
            de la{" "}
            <Link
              href="/confidentialite"
              className="text-pink-500 dark:text-pink-300 underline"
            >
              politique de confidentialité
            </Link>
            .
          </span>
        </label>

        <button
          type="button"
          disabled={!checked}
          onClick={accept}
          className="w-full h-11 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 text-white text-sm font-medium shadow-sm hover:shadow-md disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          Activer {feature}
        </button>

        <p className="text-[11px] text-gray-500 dark:text-gray-400 text-center">
          Vous pouvez révoquer ce consentement à tout moment depuis les{" "}
          <Link href="/settings" className="underline">
            Réglages
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
