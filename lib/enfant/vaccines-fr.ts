// Calendrier vaccinal français obligatoire pour bébés 0-36 mois
// Source : Santé Publique France / Service-Public.fr (2024)
// Âges en mois — les 11 vaccins obligatoires depuis 2018.

export type VaccineSchedule = {
  ageMonths: number;
  label: string;
  vaccines: string[];
  required: boolean;
};

export const VACCINES_FR: VaccineSchedule[] = [
  {
    ageMonths: 2,
    label: "2 mois",
    vaccines: ["DTP-Coq-Polio-Hib-HépB (1ère dose)", "Pneumocoque (1ère dose)", "Rotavirus (1ère dose)"],
    required: true,
  },
  {
    ageMonths: 3,
    label: "3 mois",
    vaccines: ["Rotavirus (2e dose)"],
    required: true,
  },
  {
    ageMonths: 4,
    label: "4 mois",
    vaccines: ["DTP-Coq-Polio-Hib-HépB (2e dose)", "Pneumocoque (2e dose)", "Rotavirus (3e dose)"],
    required: true,
  },
  {
    ageMonths: 5,
    label: "5 mois",
    vaccines: ["Méningocoque B (1ère dose)"],
    required: true,
  },
  {
    ageMonths: 6,
    label: "6 mois",
    vaccines: ["Méningocoque B (2e dose)"],
    required: true,
  },
  {
    ageMonths: 11,
    label: "11 mois",
    vaccines: [
      "DTP-Coq-Polio-Hib-HépB (rappel)",
      "Pneumocoque (rappel)",
      "Méningocoque B (rappel)",
    ],
    required: true,
  },
  {
    ageMonths: 12,
    label: "12 mois",
    vaccines: ["ROR (1ère dose)", "Méningocoque ACWY"],
    required: true,
  },
  {
    ageMonths: 16,
    label: "16-18 mois",
    vaccines: ["ROR (2e dose)"],
    required: true,
  },
];
