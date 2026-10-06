export type JourneyPhase = "pregnancy" | "baby" | "child";

export const JOURNEY_PHASES = {
  pregnancy: {
    label: "Grossesse",
    shortLabel: "Grossesse",
    chapter: "Avant la rencontre",
    range: "Semaine après semaine",
    home: "/?espace=grossesse",
  },
  baby: {
    label: "Les premières années",
    shortLabel: "0–3 ans",
    chapter: "Ses premières découvertes",
    range: "De la naissance à 3 ans",
    home: "/enfant/dashboard",
  },
  child: {
    label: "Les grandes aventures",
    shortLabel: "3–6 ans",
    chapter: "Le monde s’ouvre à lui",
    range: "De 3 à 6 ans",
    home: "/enfant/dashboard",
  },
} as const;

export function calendarDate(now = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Paris",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

export function parseCalendarDate(value: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const date = new Date(`${value}T12:00:00Z`);
  return Number.isNaN(date.getTime()) ||
    date.toISOString().slice(0, 10) !== value
    ? null
    : date;
}

/** Calendar arithmetic keeps birthdays and month-end dates stable across DST. */
export function addCalendarMonths(date: Date, months: number): Date {
  const target = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + months, 1, 12),
  );
  const lastDay = new Date(
    Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0),
  ).getUTCDate();
  target.setUTCDate(Math.min(date.getUTCDate(), lastDay));
  return target;
}

export function childAgeMonths(birthDate: string, now = new Date()): number {
  const birth = parseCalendarDate(birthDate);
  const today = parseCalendarDate(calendarDate(now));
  if (!birth || !today || birth > today) return 0;
  let months =
    (today.getUTCFullYear() - birth.getUTCFullYear()) * 12 +
    today.getUTCMonth() -
    birth.getUTCMonth();
  if (addCalendarMonths(birth, months) > today) months--;
  return Math.max(0, months);
}

export function childPhase(
  birthDate: string,
  now = new Date(),
): "baby" | "child" {
  return childAgeMonths(birthDate, now) >= 36 ? "child" : "baby";
}

export function childAgeLabel(birthDate: string, now = new Date()): string {
  const birth = parseCalendarDate(birthDate);
  const today = parseCalendarDate(calendarDate(now));
  if (!birth || !today) return "Âge à renseigner";
  if (birth > today) return "À naître";
  const days = Math.round((today.getTime() - birth.getTime()) / 86400000);
  const months = childAgeMonths(birthDate, now);
  if (months === 0) return `${days} jour${days > 1 ? "s" : ""}`;
  if (months < 24) return `${months} mois`;
  const years = Math.floor(months / 12),
    extra = months % 12;
  return `${years} an${years > 1 ? "s" : ""}${extra ? ` et ${extra} mois` : ""}`;
}

export function pregnancyMoment(
  dueDate: string | null,
  now = new Date(),
): "expecting" | "approaching" | "term" {
  const due = dueDate ? parseCalendarDate(dueDate) : null;
  const today = parseCalendarDate(calendarDate(now));
  if (!due || !today) return "expecting";
  const remaining = Math.round((due.getTime() - today.getTime()) / 86400000);
  return remaining <= 0
    ? "term"
    : remaining <= 21
      ? "approaching"
      : "expecting";
}

export function resolveFamilyPhase(
  stage: "pregnancy" | "baby",
  birthDate?: string | null,
  now = new Date(),
): JourneyPhase {
  return stage === "pregnancy" || !birthDate
    ? "pregnancy"
    : childPhase(birthDate, now);
}
