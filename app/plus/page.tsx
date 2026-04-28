"use client";

import { useState } from "react";
import Link from "next/link";
import { m as motion } from "framer-motion";
import {
  Calendar,
  CheckSquare,
  Users,
  MessageCircle,
  BookOpen,
  Camera,
  Timer,
  Heart,
  Baby,
  ShoppingBag,
  Salad,
  Pill,
  Wind,
  AlertTriangle,
  Clock,
  ImageIcon,
  Settings,
  Sparkles,
  Loader2,
  Check,
} from "lucide-react";
import { useIsPremium } from "@/lib/use-premium";
import { useToast } from "@/lib/toast";

const sections = [
  {
    title: "Suivi & Outils",
    items: [
      { href: "/agenda", label: "Agenda", icon: Calendar, color: "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400" },
      { href: "/checklist", label: "Ma liste", icon: CheckSquare, color: "bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400" },
      { href: "/contractions", label: "Contractions", icon: Timer, color: "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400" },
      { href: "/journal", label: "Journal", icon: Camera, color: "bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400" },
      { href: "/timeline", label: "Timeline", icon: Clock, color: "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400" },
      { href: "/bump", label: "Bump diary", icon: ImageIcon, color: "bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400" },
    ],
  },
  {
    title: "Préparer l'arrivée",
    items: [
      { href: "/prenoms", label: "Prénoms", icon: Heart, color: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400" },
      { href: "/naissance", label: "Projet naissance", icon: Baby, color: "bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400" },
      { href: "/achats", label: "Liste achats", icon: ShoppingBag, color: "bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400" },
    ],
  },
  {
    title: "Santé & Bien-être",
    items: [
      { href: "/alimentation", label: "Alimentation", icon: Salad, color: "bg-green-100 dark:bg-green-900/30 text-green-600 dark:bg-green-900/30 dark:text-green-400" },
      { href: "/medicaments", label: "Médicaments", icon: Pill, color: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400" },
      { href: "/respiration", label: "Respiration", icon: Wind, color: "bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400" },
      { href: "/urgences", label: "Urgences", icon: AlertTriangle, color: "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 dark:bg-red-900/30 dark:text-red-400" },
    ],
  },
  {
    title: "Communauté & Conseils",
    items: [
      { href: "/duo", label: "Mode duo", icon: Users, color: "bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400" },
      { href: "/communaute", label: "Communauté", icon: MessageCircle, color: "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400" },
      { href: "/conseils", label: "Guides", icon: BookOpen, color: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400" },
    ],
  },
  {
    title: "Paramètres",
    items: [
      { href: "/settings", label: "Paramètres", icon: Settings, color: "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 dark:bg-gray-800 dark:text-gray-400" },
    ],
  },
];

const PREMIUM_FEATURES = [
  "Mode duo illimité (papa + sage-femme + famille)",
  "Exports PDF illimités + Carnet de maternité",
  "MamaCoach IA — assistant personnalisé",
  "Alertes médicales avancées (préeclampsie, diabète)",
  "Sans publicités, à vie",
];

function PremiumCard() {
  const { isPremium, until, loading } = useIsPremium();
  const toast = useToast();
  const [busy, setBusy] = useState(false);

  const goCheckout = async () => {
    setBusy(true);
    try {
      const res = await fetch("/api/stripe/checkout", { method: "POST" });
      const json = await res.json();
      if (!res.ok || !json.url) throw new Error(json.error || "Erreur Stripe");
      window.location.href = json.url;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Impossible de démarrer le paiement");
      setBusy(false);
    }
  };

  const goPortal = async () => {
    setBusy(true);
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const json = await res.json();
      if (!res.ok || !json.url) throw new Error(json.error || "Erreur portail");
      window.location.href = json.url;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Impossible d'ouvrir le portail");
      setBusy(false);
    }
  };

  if (loading) return null;

  if (isPremium) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl p-5 border border-purple-200 dark:border-purple-800/40 bg-gradient-to-br from-amber-50 via-pink-50 to-purple-50 dark:from-amber-950/20 dark:via-pink-950/20 dark:to-purple-950/20"
      >
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-5 h-5 text-purple-500" />
          <h2 className="font-bold text-[#3d2b2b] dark:text-gray-100">Vous êtes Premium ✨</h2>
        </div>
        {until && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
            Renouvellement le {until.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
          </p>
        )}
        <button
          type="button"
          onClick={goPortal}
          disabled={busy}
          className="w-full bg-white dark:bg-gray-900 border border-purple-200 dark:border-purple-800/40 text-purple-700 dark:text-purple-300 text-sm font-semibold py-2.5 rounded-xl hover:bg-purple-50 dark:hover:bg-purple-950/30 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
          Gérer mon abonnement
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl p-5 border border-purple-200 dark:border-purple-800/40 bg-gradient-to-br from-amber-100 via-pink-100 to-purple-100 dark:from-amber-950/30 dark:via-pink-950/30 dark:to-purple-950/30"
    >
      <div className="flex items-center gap-2 mb-1">
        <Sparkles className="w-5 h-5 text-purple-600" />
        <h2 className="font-bold text-[#3d2b2b] dark:text-gray-100">MamaTrack Premium</h2>
      </div>
      <p className="text-2xl font-bold text-purple-700 dark:text-purple-300 mb-3">
        4,99 € <span className="text-sm font-normal text-gray-500 dark:text-gray-400">/ mois</span>
      </p>
      <ul className="space-y-1.5 mb-4">
        {PREMIUM_FEATURES.map((f) => (
          <li key={f} className="flex items-start gap-2 text-sm text-[#3d2b2b] dark:text-gray-200">
            <Check className="w-4 h-4 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-0.5" />
            <span>{f}</span>
          </li>
        ))}
      </ul>
      <button
        type="button"
        onClick={goCheckout}
        disabled={busy}
        className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white text-sm font-semibold py-3 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center justify-center gap-2"
      >
        {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
        Passer Premium
      </button>
      <p className="text-[10px] text-gray-500 dark:text-gray-400 text-center mt-2">
        Sans engagement — annulable à tout moment
      </p>
    </motion.div>
  );
}

export default function PlusPage() {
  return (
    <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
      <h1 className="text-2xl font-bold text-[#3d2b2b] dark:text-gray-100">Plus</h1>

      <PremiumCard />

      {sections.map((section, si) => (
        <motion.div
          key={section.title}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: si * 0.06 }}
          className="space-y-3"
        >
          <h2 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider px-1">
            {section.title}
          </h2>
          <div className="grid grid-cols-3 gap-3">
            {section.items.map(({ href, label, icon: Icon, color }) => (
              <Link
                key={href}
                href={href}
                className="flex flex-col items-center gap-2 p-4 bg-white dark:bg-gray-800 rounded-2xl border border-pink-100 dark:border-gray-700 hover:border-pink-200 dark:hover:border-pink-800 hover:shadow-sm transition-all duration-200 active:scale-95"
              >
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-xs font-medium text-[#3d2b2b] dark:text-gray-200 text-center leading-tight">
                  {label}
                </span>
              </Link>
            ))}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
