// Milestones clés 0-36 mois (sélection large, affichage par période)
// Personal memory suggestions; ages are orientation, not a diagnostic scale.
// Added 3–5 year landmarks paraphrase CDC Learn the Signs (May 2026).

export type Milestone = {
  slug: string;
  label: string;
  emoji: string;
  typicalAgeMonths: number; // âge typique où ça survient
  category: "motor" | "language" | "social" | "cognitive";
  memoryOnly?: boolean;
};

export const MILESTONES: Milestone[] = [
  {
    slug: "first-smile",
    label: "Premier sourire",
    emoji: "😊",
    typicalAgeMonths: 2,
    category: "social",
  },
  {
    slug: "head-control",
    label: "Tient sa tête",
    emoji: "🙆",
    typicalAgeMonths: 3,
    category: "motor",
  },
  {
    slug: "rollover",
    label: "Premier retournement",
    emoji: "🤸",
    typicalAgeMonths: 4,
    category: "motor",
  },
  {
    slug: "babbling",
    label: "Premier babillage",
    emoji: "🗣️",
    typicalAgeMonths: 6,
    category: "language",
  },
  {
    slug: "sits-alone",
    label: "S'assoit seul",
    emoji: "🧘",
    typicalAgeMonths: 7,
    category: "motor",
  },
  {
    slug: "first-tooth",
    label: "Première dent",
    emoji: "🦷",
    typicalAgeMonths: 7,
    category: "motor",
  },
  {
    slug: "crawling",
    label: "Premiers 4 pattes",
    emoji: "🐾",
    typicalAgeMonths: 9,
    category: "motor",
  },
  {
    slug: "first-word",
    label: "Premier mot",
    emoji: "💬",
    typicalAgeMonths: 11,
    category: "language",
  },
  {
    slug: "standing",
    label: "Debout sans appui",
    emoji: "🧍",
    typicalAgeMonths: 11,
    category: "motor",
  },
  {
    slug: "first-steps",
    label: "Premiers pas",
    emoji: "👶",
    typicalAgeMonths: 13,
    category: "motor",
  },
  {
    slug: "two-words",
    label: "Associe deux mots",
    emoji: "🗨️",
    typicalAgeMonths: 18,
    category: "language",
  },
  {
    slug: "running",
    label: "Premier galop",
    emoji: "🏃",
    typicalAgeMonths: 20,
    category: "motor",
  },
  {
    slug: "uses-spoon",
    label: "Mange à la cuillère",
    emoji: "🥄",
    typicalAgeMonths: 18,
    category: "motor",
  },
  {
    slug: "potty",
    label: "Propreté de jour",
    emoji: "🚽",
    typicalAgeMonths: 28,
    category: "social",
  },
  {
    slug: "full-sentences",
    label: "Phrases complètes",
    emoji: "📖",
    typicalAgeMonths: 30,
    category: "language",
  },
  {
    slug: "asks-questions",
    label: "Les grands pourquoi",
    emoji: "💬",
    typicalAgeMonths: 36,
    category: "language",
  },
  {
    slug: "joins-play",
    label: "Joue avec d’autres enfants",
    emoji: "🧸",
    typicalAgeMonths: 36,
    category: "social",
  },
  {
    slug: "draws-circle",
    label: "Dessine un cercle après un exemple",
    emoji: "🎨",
    typicalAgeMonths: 36,
    category: "motor",
  },
  {
    slug: "names-colors",
    label: "Nomme plusieurs couleurs",
    emoji: "🌈",
    typicalAgeMonths: 48,
    category: "cognitive",
  },
  {
    slug: "tells-day",
    label: "Raconte un moment de sa journée",
    emoji: "📖",
    typicalAgeMonths: 48,
    category: "language",
  },
  {
    slug: "comforts-friend",
    label: "Réconforte un proche triste",
    emoji: "💛",
    typicalAgeMonths: 48,
    category: "social",
  },
  {
    slug: "takes-turns",
    label: "Attend son tour dans un jeu",
    emoji: "🎲",
    typicalAgeMonths: 60,
    category: "social",
  },
  {
    slug: "counts-ten",
    label: "Compte jusqu’à dix",
    emoji: "🔢",
    typicalAgeMonths: 60,
    category: "cognitive",
  },
  {
    slug: "hops-one-foot",
    label: "Saute sur un pied",
    emoji: "🦶",
    typicalAgeMonths: 60,
    category: "motor",
  },
  {
    slug: "first-school-day",
    label: "Une rentrée à garder en souvenir",
    emoji: "🎒",
    typicalAgeMonths: 36,
    category: "social",
    memoryOnly: true,
  },
  {
    slug: "first-personal-project",
    label: "Son premier grand projet",
    emoji: "🌟",
    typicalAgeMonths: 72,
    category: "cognitive",
    memoryOnly: true,
  },
];
