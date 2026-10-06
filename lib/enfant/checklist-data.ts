import {
  addCalendarMonths,
  parseCalendarDate,
  calendarDate,
} from "@/lib/family-journey";
// French medical visits, calendar in force since January 2025, verified October 2026.
// Legacy codes remain stable so previous records are not lost.
export type HASVisit = {
  code: string;
  ageMonths: number;
  ageDays?: number;
  toleranceDays: number;
  label: string;
  emoji: string;
  type: "visite" | "depistage" | "vaccin";
  exam: string;
  reminderDays: number;
};
const visit = (
  code: string,
  ageMonths: number,
  label: string,
  exam: string,
  toleranceDays = 30,
): HASVisit => ({
  code,
  ageMonths,
  label,
  exam,
  toleranceDays,
  emoji: "🩺",
  type: "visite",
  reminderDays: 14,
});
export const HAS_VISITS: HASVisit[] = [
  {
    ...visit(
      "j8",
      0,
      "Dans les 8 jours après la naissance",
      "Premier examen et certificat de santé.",
      7,
    ),
    ageDays: 0,
  },
  {
    ...visit(
      "j14",
      0,
      "Au cours de la deuxième semaine",
      "Suivi du nourrisson et échanges avec les parents.",
      6,
    ),
    ageDays: 7,
  },
  visit(
    "m1",
    1,
    "Visite du 1er mois",
    "Suivi de la croissance et du nourrisson.",
  ),
  visit(
    "m2",
    2,
    "Visite du 2e mois",
    "Suivi médical et vérification des vaccinations.",
  ),
  visit(
    "m3",
    3,
    "Visite du 3e mois",
    "Développement, croissance et échanges avec les parents.",
  ),
  visit(
    "m4",
    4,
    "Visite du 4e mois",
    "Suivi médical et vérification des vaccinations.",
  ),
  visit(
    "m5",
    5,
    "Visite du 5e mois",
    "Suivi du nourrisson, alimentation et développement.",
  ),
  visit(
    "m9",
    8,
    "Visite des 8 mois · certificat",
    "Examen complet et deuxième certificat de santé.",
  ),
  visit(
    "m11",
    11,
    "Visite des 11 mois",
    "Croissance, développement et vérification des vaccinations.",
  ),
  visit(
    "m12",
    12,
    "Visite des 12 mois",
    "Bilan de santé, développement et vaccinations.",
  ),
  visit(
    "m17",
    16,
    "Visite entre 16 et 18 mois",
    "Développement, alimentation, sommeil et santé.",
    61,
  ),
  visit(
    "m24",
    23,
    "Visite entre 23 et 24 mois · certificat",
    "Examen complet et troisième certificat de santé.",
    61,
  ),
  visit(
    "a2",
    24,
    "Examen entre 2 et 3 ans",
    "Suivi annuel, croissance et développement.",
    365,
  ),
  visit(
    "m36",
    36,
    "Examen entre 3 et 4 ans",
    "Suivi annuel et préparation des échanges avec l’école.",
    365,
  ),
  visit(
    "m48",
    48,
    "Examen entre 4 et 5 ans",
    "Croissance, vue, audition, langage et bien-être.",
    365,
  ),
  visit(
    "m60",
    60,
    "Examen entre 5 et 6 ans",
    "Bilan de santé ; vérifiez aussi les examens réalisés à l’école.",
    365,
  ),
  visit(
    "m72",
    72,
    "Examen entre 6 et 7 ans",
    "Suivi annuel et préparation du rappel vaccinal des 6 ans.",
    365,
  ),
];
export function visitDueDate(birthDate: string, ageMonths: number): Date {
  const birth = parseCalendarDate(birthDate);
  return birth ? addCalendarMonths(birth, ageMonths) : new Date(NaN);
}
export function scheduledVisitDate(birthDate: string, visit: HASVisit): Date {
  const date = visitDueDate(birthDate, visit.ageMonths);
  if (visit.ageDays) date.setUTCDate(date.getUTCDate() + visit.ageDays);
  return date;
}
export type HASVisitStatus = "done" | "due" | "upcoming" | "overdue";
export function visitStatus(
  birthDate: string,
  visit: HASVisit,
  done: boolean,
  now = new Date(),
): HASVisitStatus {
  if (done) return "done";
  const diffDays = Math.round(
    (parseCalendarDate(calendarDate(now))!.getTime() -
      scheduledVisitDate(birthDate, visit).getTime()) /
      86400000,
  );
  return diffDays > visit.toleranceDays
    ? "overdue"
    : diffDays >= -visit.reminderDays
      ? "due"
      : "upcoming";
}
