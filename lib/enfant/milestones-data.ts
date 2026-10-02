// Milestones clés 0-36 mois (sélection large, affichage par période)
// Source : Haute Autorité de Santé / CAMSP — repères de développement

export type Milestone = {
  slug: string;
  label: string;
  emoji: string;
  typicalAgeMonths: number; // âge typique où ça survient
  category: "motor" | "language" | "social" | "cognitive";
};

export const MILESTONES: Milestone[] = [
  { slug: "first-smile", label: "Premier sourire", emoji: "😊", typicalAgeMonths: 2, category: "social" },
  { slug: "head-control", label: "Tient sa tête", emoji: "🙆", typicalAgeMonths: 3, category: "motor" },
  { slug: "rollover", label: "Premier retournement", emoji: "🤸", typicalAgeMonths: 4, category: "motor" },
  { slug: "babbling", label: "Premier babillage", emoji: "🗣️", typicalAgeMonths: 6, category: "language" },
  { slug: "sits-alone", label: "S'assoit seul", emoji: "🧘", typicalAgeMonths: 7, category: "motor" },
  { slug: "first-tooth", label: "Première dent", emoji: "🦷", typicalAgeMonths: 7, category: "motor" },
  { slug: "crawling", label: "Premiers 4 pattes", emoji: "🐾", typicalAgeMonths: 9, category: "motor" },
  { slug: "first-word", label: "Premier mot", emoji: "💬", typicalAgeMonths: 11, category: "language" },
  { slug: "standing", label: "Debout sans appui", emoji: "🧍", typicalAgeMonths: 11, category: "motor" },
  { slug: "first-steps", label: "Premiers pas", emoji: "👶", typicalAgeMonths: 13, category: "motor" },
  { slug: "two-words", label: "Associe deux mots", emoji: "🗨️", typicalAgeMonths: 18, category: "language" },
  { slug: "running", label: "Premier galop", emoji: "🏃", typicalAgeMonths: 20, category: "motor" },
  { slug: "uses-spoon", label: "Mange à la cuillère", emoji: "🥄", typicalAgeMonths: 18, category: "motor" },
  { slug: "potty", label: "Propreté de jour", emoji: "🚽", typicalAgeMonths: 28, category: "social" },
  { slug: "full-sentences", label: "Phrases complètes", emoji: "📖", typicalAgeMonths: 30, category: "language" },
];
