// General French calendar, September 2026. Individual catch-up is decided by a clinician.
export type VaccineSchedule = {
  ageMonths: number;
  label: string;
  vaccines: string[];
  required: boolean;
};
export const VACCINE_SOURCE =
  "https://www.santepubliquefrance.fr/sites/default/files/cadic_files/documents/spf00006840.pdf";
export const VACCINES_FR: VaccineSchedule[] = [
  {
    ageMonths: 2,
    label: "2 mois",
    vaccines: [
      "DTP-Coq-Polio-Hib-HépB (1ère dose)",
      "Pneumocoque (1ère dose)",
      "Rotavirus (1ère dose)",
    ],
    required: true,
  },
  {
    ageMonths: 3,
    label: "3 mois",
    vaccines: ["Méningocoque B (1ère dose)", "Rotavirus (2e dose)"],
    required: true,
  },
  {
    ageMonths: 4,
    label: "4 mois",
    vaccines: [
      "DTP-Coq-Polio-Hib-HépB (2e dose)",
      "Pneumocoque (2e dose)",
      "Rotavirus (3e dose)",
    ],
    required: true,
  },
  {
    ageMonths: 5,
    label: "5 mois",
    vaccines: ["Méningocoque B (2e dose)"],
    required: true,
  },
  {
    ageMonths: 6,
    label: "6 mois",
    vaccines: ["Méningocoque ACWY (1ère dose)"],
    required: true,
  },
  {
    ageMonths: 11,
    label: "11 mois",
    vaccines: ["DTP-Coq-Polio-Hib-HépB (rappel)", "Pneumocoque (rappel)"],
    required: true,
  },
  {
    ageMonths: 12,
    label: "12 mois",
    vaccines: [
      "ROR (1ère dose)",
      "Méningocoque B (rappel)",
      "Méningocoque ACWY (rappel)",
    ],
    required: true,
  },
  {
    ageMonths: 16,
    label: "16–18 mois",
    vaccines: ["ROR (2e dose)"],
    required: true,
  },
  {
    ageMonths: 72,
    label: "6 ans",
    vaccines: ["DTP-Coqueluche-Polio (rappel 6 ans)"],
    required: false,
  },
];
export function vaccineRequirement(label: string, birthDate: string): string {
  if (label.startsWith("Rotavirus"))
    return label.includes("3e") ? "Selon le vaccin utilisé" : "Recommandé";
  if (label.includes("6 ans")) return "Rappel recommandé";
  if (label.startsWith("Méningocoque"))
    return birthDate >= "2023-01-01"
      ? "Obligatoire pour cette génération"
      : "À vérifier avec le médecin";
  return birthDate >= "2018-01-01"
    ? "Obligatoire pour cette génération"
    : "À vérifier avec le médecin";
}
