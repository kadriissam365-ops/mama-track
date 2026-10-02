export const APP_NAME = "MamaTrack";
export const APP_TAGLINE = "Suivi bébé 0-3 ans";
export const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ?? "https://mamatrack.fr";

export const PRICING = {
  monthly: { amount: 4.99, currency: "EUR", label: "4,99 € / mois" },
  yearly: {
    amount: 39,
    currency: "EUR",
    label: "39 € / an",
    savingsLabel: "Soit 3,25 € / mois — économise 35 %",
  },
  // TODO (post-Stripe S2) : à terme, cap collaborateurs en plan gratuit
  // (suggestion : 2 collab max gratuit / illimité Premium). Pour le MVP
  // mode famille étendue, AUCUN cap n'est appliqué — owner peut inviter N.
} as const;

export const BABY_MODULES = [
  { slug: "feed", icon: "🍼", title: "Alim", desc: "Tétées, biberons, repas" },
  { slug: "diversification", icon: "🥕", title: "Diversification", desc: "Aliments 4-36 mois & allergènes" },
  { slug: "sleep", icon: "😴", title: "Sommeil", desc: "Siestes + nuits, patterns" },
  { slug: "diapers", icon: "💩", title: "Couches", desc: "Fréquence, type, anomalies" },
  { slug: "growth", icon: "📏", title: "Croissance", desc: "Courbes OMS P/T/PC" },
  { slug: "vaccines", icon: "💉", title: "Vaccins", desc: "Calendrier FR + rappels" },
  { slug: "health", icon: "🌡️", title: "Santé", desc: "Fièvre, médocs, RDV" },
  { slug: "agenda", icon: "📅", title: "Agenda", desc: "RDV + visites HAS" },
  { slug: "diary", icon: "📸", title: "Journal", desc: "Photos + notes du jour" },
  { slug: "milestones", icon: "🏆", title: "Milestones", desc: "Étapes clés + partage" },
  { slug: "conseils", icon: "💡", title: "Conseils", desc: "Repères 0-36 mois" },
  { slug: "urgences", icon: "🚨", title: "Urgences", desc: "Numéros + fiches secours" },
  { slug: "timeline", icon: "🕒", title: "Timeline", desc: "Frise complète" },
  { slug: "reports", icon: "📊", title: "Rapports", desc: "PDF mensuel récap" },
  { slug: "coach", icon: "✨", title: "Coach IA", desc: "Assistant pédiatrique" },
  { slug: "pediatrician", icon: "🩺", title: "Mode pédiatre", desc: "Partage QR sécurisé" },
  { slug: "duo", icon: "💑", title: "Mode duo", desc: "Partenaire ou nounou" },
  { slug: "settings", icon: "⚙️", title: "Réglages", desc: "Compte, paiement" },
] as const;

export type BabyModule = (typeof BABY_MODULES)[number];

export function getModule(slug: string): BabyModule | undefined {
  return BABY_MODULES.find((m) => m.slug === slug);
}
