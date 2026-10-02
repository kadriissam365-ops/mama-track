import { VACCINES_FR } from "./vaccines-fr";

export function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export type DueVaccine = {
  code: string;
  label: string;
  ageMonths: number;
  dueDate: Date;
  daysUntil: number;
};

/** Add `n` months to a Date, snapping to last day if needed. */
function addMonths(date: Date, months: number): Date {
  const d = new Date(date.getTime());
  const targetMonth = d.getMonth() + months;
  d.setMonth(targetMonth);
  if (d.getMonth() !== ((targetMonth % 12) + 12) % 12) {
    d.setDate(0);
  }
  return d;
}

/**
 * Compute upcoming vaccines for a baby within the next `windowDays`.
 * - Excludes vaccines already given (codes present in `givenCodes`).
 * - Excludes vaccines whose due date is more than `windowDays` away or in the past.
 */
export function computeUpcomingVaccines({
  birthDate,
  givenCodes,
  windowDays,
  now = new Date(),
}: {
  birthDate: Date;
  givenCodes: Set<string>;
  windowDays: number;
  now?: Date;
}): DueVaccine[] {
  const due: DueVaccine[] = [];
  for (const schedule of VACCINES_FR) {
    const dueDate = addMonths(birthDate, schedule.ageMonths);
    const daysUntil = Math.floor(
      (dueDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000),
    );
    if (daysUntil < 0 || daysUntil > windowDays) continue;
    for (const v of schedule.vaccines) {
      const code = slugify(schedule.ageMonths + "-" + v);
      if (givenCodes.has(code)) continue;
      due.push({
        code,
        label: v,
        ageMonths: schedule.ageMonths,
        dueDate,
        daysUntil,
      });
    }
  }
  return due;
}

export function formatDueDateFR(d: Date): string {
  return d.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
