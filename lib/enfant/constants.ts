export const APP_NAME = "MamaTrack";
export const APP_TAGLINE = "Grossesse et enfance, jusqu’à 6 ans";
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
  {
    slug: "routines",
    icon: "☀️",
    title: "Routines",
    desc: "Les petits rituels de la famille",
  },
  {
    slug: "activities",
    icon: "🎨",
    title: "Éveil & jeux",
    desc: "Des idées à partager de 3 à 6 ans",
  },
  { slug: "feed", icon: "🍼", title: "Repas", desc: "Tétées, biberons, repas" },
  {
    slug: "diversification",
    icon: "🥕",
    title: "Diversification",
    desc: "Aliments 4-36 mois & allergènes",
  },
  {
    slug: "sleep",
    icon: "😴",
    title: "Sommeil",
    desc: "Siestes + nuits, patterns",
  },
  {
    slug: "diapers",
    icon: "💩",
    title: "Couches",
    desc: "Fréquence, type, anomalies",
  },
  {
    slug: "growth",
    icon: "📏",
    title: "Croissance",
    desc: "Poids, taille et historique",
  },
  {
    slug: "vaccines",
    icon: "💉",
    title: "Vaccins",
    desc: "Calendrier FR + rappels",
  },
  { slug: "health", icon: "🌡️", title: "Santé", desc: "Fièvre, médocs, RDV" },
  {
    slug: "agenda",
    icon: "📅",
    title: "Agenda",
    desc: "Rendez-vous de 0 à 6 ans",
  },
  {
    slug: "diary",
    icon: "📸",
    title: "Journal",
    desc: "Photos + notes du jour",
  },
  {
    slug: "milestones",
    icon: "🏆",
    title: "Petites fiertés",
    desc: "Étapes clés + partage",
  },
  {
    slug: "conseils",
    icon: "💡",
    title: "Conseils",
    desc: "Repères de 0 à 6 ans",
  },
  {
    slug: "urgences",
    icon: "🚨",
    title: "Urgences",
    desc: "Numéros + fiches secours",
  },
  {
    slug: "timeline",
    icon: "🕒",
    title: "Notre histoire",
    desc: "Frise complète",
  },
  { slug: "reports", icon: "📊", title: "Rapports", desc: "PDF mensuel récap" },
  { slug: "coach", icon: "✨", title: "Coach IA", desc: "Assistant parental" },
  {
    slug: "pediatrician",
    icon: "🩺",
    title: "Mode pédiatre",
    desc: "Partage QR sécurisé",
  },
  { slug: "duo", icon: "💑", title: "Mode duo", desc: "Partenaire ou nounou" },
  { slug: "settings", icon: "⚙️", title: "Réglages", desc: "Compte, paiement" },
] as const;

export type BabyModule = (typeof BABY_MODULES)[number];

export function getModule(slug: string): BabyModule | undefined {
  return BABY_MODULES.find((m) => m.slug === slug);
}
