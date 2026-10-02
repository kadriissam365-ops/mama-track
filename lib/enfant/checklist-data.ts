// Visites obligatoires HAS / Carnet de santé (France) — 0-36 mois
// Source : Code de la santé publique (article R.2132-2) + recommandations HAS 2019.
// 20 examens médicaux obligatoires, dont 14 dans les 3 premières années.

export type HASVisit = {
  code: string; // unique, persisté dans health_events.checklist_code
  ageMonths: number; // âge théorique
  toleranceDays: number; // ± jours autour de la date prévue où la visite est "OK"
  label: string;
  emoji: string;
  type: "visite" | "depistage" | "vaccin"; // type d'examen
  exam: string; // résumé de ce qui est fait
  reminderDays: number; // J-X pour notifier l'utilisateur
};

// Calendrier officiel CNAM/HAS — visites prises en charge à 100 %.
// Note : les vaccins sont gérés à part dans /vaccines, mais on rappelle
// les rendez-vous combinés (la consultation 2m/4m/11m sert aussi à vacciner).
export const HAS_VISITS: HASVisit[] = [
  {
    code: "j8",
    ageMonths: 0,
    toleranceDays: 7,
    label: "Examen des 8 jours",
    emoji: "👶",
    type: "visite",
    exam:
      "Examen néonatal complet : poids, taille, périmètre crânien, hanches, cœur, dépistages auditif et visuel.",
    reminderDays: 3,
  },
  {
    code: "m1",
    ageMonths: 1,
    toleranceDays: 10,
    label: "Visite du 1er mois",
    emoji: "🩺",
    type: "visite",
    exam:
      "Suivi de croissance, alimentation (poids, courbes), réflexes archaïques, vitamine D.",
    reminderDays: 7,
  },
  {
    code: "m2",
    ageMonths: 2,
    toleranceDays: 10,
    label: "Visite du 2e mois + 1ère vaccination",
    emoji: "💉",
    type: "vaccin",
    exam:
      "Croissance, développement psychomoteur, audition. 1ère injection : DTP-Coqueluche-Hib-HepB + Pneumocoque + Méningocoque B.",
    reminderDays: 7,
  },
  {
    code: "m4",
    ageMonths: 4,
    toleranceDays: 10,
    label: "Visite du 4e mois + 2e vaccination",
    emoji: "💉",
    type: "vaccin",
    exam:
      "Tonus, motricité (tient sa tête), interaction. 2e injection : DTP-Coqueluche-Hib-HepB + Pneumocoque + Méningocoque B.",
    reminderDays: 7,
  },
  {
    code: "m9",
    ageMonths: 9,
    toleranceDays: 14,
    label: "Visite du 9e mois (obligatoire — certificat)",
    emoji: "📋",
    type: "visite",
    exam:
      "Examen approfondi : développement, vue, audition, langage, motricité (assis seul, pince fine). Certificat médical à transmettre à la PMI.",
    reminderDays: 14,
  },
  {
    code: "m11",
    ageMonths: 11,
    toleranceDays: 10,
    label: "Visite du 11e mois + rappel vaccins",
    emoji: "💉",
    type: "vaccin",
    exam:
      "Suivi croissance + rappel : DTP-Coqueluche-Hib-HepB + Pneumocoque + Méningocoque B (3e injection).",
    reminderDays: 7,
  },
  {
    code: "m12",
    ageMonths: 12,
    toleranceDays: 14,
    label: "Visite du 12e mois + ROR / Méningo C",
    emoji: "💉",
    type: "vaccin",
    exam:
      "Bilan 1 an : marche, premiers mots, alimentation diversifiée. 1ère injection ROR (rougeole-oreillons-rubéole) + Méningocoque C.",
    reminderDays: 7,
  },
  {
    code: "m13",
    ageMonths: 13,
    toleranceDays: 14,
    label: "Visite des 13 mois + 2e ROR",
    emoji: "💉",
    type: "vaccin",
    exam:
      "Suivi développement + 2e injection ROR (à au moins 1 mois d'intervalle de la 1ère).",
    reminderDays: 7,
  },
  {
    code: "m17",
    ageMonths: 17,
    toleranceDays: 21,
    label: "Visite des 16-18 mois",
    emoji: "🚶",
    type: "visite",
    exam:
      "Marche, langage (10-20 mots), socialisation, sommeil. Vaccins de rattrapage si besoin.",
    reminderDays: 14,
  },
  {
    code: "m24",
    ageMonths: 24,
    toleranceDays: 21,
    label: "Visite des 24 mois (obligatoire — certificat)",
    emoji: "📋",
    type: "visite",
    exam:
      "Bilan complet 2 ans : développement global, langage (associe 2 mots), motricité, propreté en cours, vue/audition. Certificat médical à transmettre à la PMI.",
    reminderDays: 14,
  },
  {
    code: "m36",
    ageMonths: 36,
    toleranceDays: 30,
    label: "Visite des 3 ans",
    emoji: "🎂",
    type: "visite",
    exam:
      "Bilan pré-école maternelle : développement psychomoteur, langage (phrases), socialisation, propreté, vue, audition.",
    reminderDays: 21,
  },
];

// Compute the due date for a HAS visit given the baby's birth_date (ISO YYYY-MM-DD).
export function visitDueDate(birthDate: string, ageMonths: number): Date {
  const birth = new Date(birthDate);
  const due = new Date(birth);
  due.setMonth(due.getMonth() + ageMonths);
  return due;
}

export type HASVisitStatus = "done" | "due" | "upcoming" | "overdue";

export function visitStatus(
  birthDate: string,
  visit: HASVisit,
  done: boolean,
  now: Date = new Date(),
): HASVisitStatus {
  if (done) return "done";
  const due = visitDueDate(birthDate, visit.ageMonths);
  const diffDays = Math.floor(
    (now.getTime() - due.getTime()) / (1000 * 60 * 60 * 24),
  );
  if (diffDays > visit.toleranceDays) return "overdue";
  if (diffDays >= -visit.reminderDays) return "due"; // dans la fenêtre de rappel
  return "upcoming";
}
