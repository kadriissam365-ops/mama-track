import { VACCINES_FR } from "./vaccines-fr";
import {
  addCalendarMonths,
  calendarDate,
  parseCalendarDate,
} from "@/lib/family-journey";
export function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
export function vaccineCode(age: number, label: string): string {
  return slugify(`${age}-${label}`);
}
const OLD_CODES: Record<string, string[]> = {
  [vaccineCode(3, "Méningocoque B (1ère dose)")]: [
    vaccineCode(5, "Méningocoque B (1ère dose)"),
  ],
  [vaccineCode(5, "Méningocoque B (2e dose)")]: [
    vaccineCode(6, "Méningocoque B (2e dose)"),
  ],
  [vaccineCode(12, "Méningocoque B (rappel)")]: [
    vaccineCode(11, "Méningocoque B (rappel)"),
  ],
  [vaccineCode(12, "Méningocoque ACWY (rappel)")]: [
    vaccineCode(12, "Méningocoque ACWY"),
  ],
};
/** Match only the same historical dose. Never infer other injections or rewrite history. */
export function vaccineRecorded(codes: Set<string>, code: string): boolean {
  return (
    codes.has(code) || (OLD_CODES[code] ?? []).some((alias) => codes.has(alias))
  );
}
export type DueVaccine = {
  code: string;
  label: string;
  ageMonths: number;
  dueDate: Date;
  daysUntil: number;
};
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
  if (Number.isNaN(birthDate.getTime())) return [];
  const today = parseCalendarDate(calendarDate(now))!;
  const due: DueVaccine[] = [];
  for (const schedule of VACCINES_FR) {
    const dueDate = addCalendarMonths(birthDate, schedule.ageMonths);
    const daysUntil = Math.round(
      (dueDate.getTime() - today.getTime()) / 86400000,
    );
    if (daysUntil < 0 || daysUntil > windowDays) continue;
    for (const label of schedule.vaccines) {
      const code = vaccineCode(schedule.ageMonths, label);
      if (!vaccineRecorded(givenCodes, code))
        due.push({
          code,
          label,
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
    timeZone: "Europe/Paris",
  });
}
