"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { m as motion } from "framer-motion";
import { Sparkles, RotateCcw, Loader2, Lock } from "lucide-react";
import { Skeleton } from "./Skeleton";
import { useAiConsent } from "@/lib/use-ai-consent";

interface StoryResponse {
  story?: string;
  cached?: boolean;
  week_sa?: number | null;
  error?: string;
}

export default function DailyStory() {
  // 5.1.1(i) : la story est générée par une IA tierce. Aucun appel ne part
  // tant que le consentement explicite (écran AiConsentGate) n'a pas été donné.
  const { hydrated: consentHydrated, accepted: aiConsentAccepted } = useAiConsent();
  const [story, setStory] = useState<string | null>(null);
  const [weekSA, setWeekSA] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [hidden, setHidden] = useState<boolean>(false);

  const fetchStory = useCallback(async (regenerate: boolean) => {
    if (regenerate) setRefreshing(true);
    else setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/coach/daily-story", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(regenerate ? { regenerate: true } : {}),
      });
      if (res.status === 402) {
        setHidden(true);
        return;
      }
      const data = (await res.json().catch(() => ({}))) as StoryResponse;
      if (!res.ok) {
        setError(data.error ?? "Impossible de charger ta story du jour.");
        return;
      }
      if (data.story) {
        setStory(data.story);
        setWeekSA(typeof data.week_sa === "number" ? data.week_sa : null);
      } else {
        setError("Story indisponible pour le moment.");
      }
    } catch {
      setError("Erreur réseau — réessaie plus tard.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (!consentHydrated || !aiConsentAccepted) return;
    fetchStory(false);
  }, [fetchStory, consentHydrated, aiConsentAccepted]);

  if (hidden) return null;

  if (!consentHydrated) {
    return <Skeleton className="h-32 w-full rounded-3xl" />;
  }

  if (!aiConsentAccepted) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="relative bg-white dark:bg-gray-900 rounded-3xl p-5 shadow-sm border border-pink-100 dark:border-pink-900/30"
      >
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-200 via-pink-200 to-purple-200 flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4 text-purple-700" />
          </div>
          <h3 className="font-semibold text-[#3d2b2b] dark:text-gray-100 text-sm">
            Ta story du jour
          </h3>
          <span className="ml-auto inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
            <Lock className="w-3 h-3" />
            IA en pause
          </span>
        </div>
        <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed mb-3">
          Ta story du jour est r&eacute;dig&eacute;e par MamaCoach, une intelligence artificielle
          externe, &agrave; partir de ta semaine de grossesse et de tes derniers relev&eacute;s.
          Rien n&apos;est transmis tant que tu n&apos;as pas activ&eacute; l&apos;IA.
        </p>
        <Link
          href="/coach"
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-2xl border border-purple-200 dark:border-purple-900/40 bg-purple-50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-200 text-sm font-semibold hover:bg-purple-100 dark:hover:bg-purple-950/50 transition-colors"
        >
          <Sparkles className="w-4 h-4" />
          Activer MamaCoach IA
        </Link>
      </motion.div>
    );
  }

  if (loading) {
    return <Skeleton className="h-32 w-full rounded-3xl" />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="relative bg-gradient-to-br from-amber-50 via-pink-50 to-purple-50 dark:from-amber-950/30 dark:via-pink-950/30 dark:to-purple-950/30 rounded-3xl p-5 shadow-sm border border-pink-100 dark:border-pink-900/30 overflow-hidden"
    >
      <div className="flex items-center gap-2 mb-2">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-200 via-pink-200 to-purple-200 flex items-center justify-center shrink-0">
          <Sparkles className="w-4 h-4 text-purple-700" />
        </div>
        <h3 className="font-semibold text-[#3d2b2b] dark:text-gray-100 text-sm">
          Ta story du jour
        </h3>
        {typeof weekSA === "number" && weekSA > 0 && (
          <span className="ml-auto text-[10px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-300 bg-white/60 dark:bg-gray-900/40 px-2 py-0.5 rounded-full">
            Semaine {weekSA}
          </span>
        )}
        <button
          type="button"
          onClick={() => {
            if (!refreshing) fetchStory(true);
          }}
          disabled={refreshing}
          aria-label="Régénérer la story"
          title="Régénérer la story"
          className={`${typeof weekSA === "number" && weekSA > 0 ? "" : "ml-auto"} text-purple-400 hover:text-purple-600 dark:hover:text-purple-300 transition-colors disabled:opacity-50`}
        >
          {refreshing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-4 h-4" />}
        </button>
      </div>

      {error ? (
        <p className="text-xs text-gray-500 dark:text-gray-400 italic">{error}</p>
      ) : (
        <p className="text-sm text-gray-700 dark:text-gray-200 leading-relaxed whitespace-pre-wrap">
          {story}
        </p>
      )}
      <p className="mt-3 text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed">
        G&eacute;n&eacute;r&eacute;e par une IA &agrave; titre de bien-&ecirc;tre : ce n&apos;est pas un avis
        m&eacute;dical. Pour toute question de sant&eacute;, parle-en &agrave; ta sage-femme ou ton m&eacute;decin.
      </p>
    </motion.div>
  );
}
