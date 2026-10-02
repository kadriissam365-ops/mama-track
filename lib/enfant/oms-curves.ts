// Courbes OMS 0-36 mois — Percentiles P3/P15/P50/P85/P97
// Source : WHO Child Growth Standards (tables P3/P15/P50/P85/P97)
// Valeurs publiques officielles (poids kg, taille cm, périmètre crânien cm)
// Par sex — M (garçons) / F (filles).
//
// Note MVP : table simplifiée (points clés par âge).
// L'interpolation linéaire entre deux âges donne une approximation suffisante
// pour la visualisation des courbes (sub-mensuel).

export type Sex = "M" | "F";

export type OmsPoint = {
  ageMonths: number;
  weightP50: number; // kg — gardé pour rétro-compat
  heightP50: number; // cm
  headP50: number; // cm
};

export type OmsPercentilePoint = {
  ageMonths: number;
  p3: number;
  p15: number;
  p50: number;
  p85: number;
  p97: number;
};

export type OmsMetric = "weight" | "height" | "head";

// =============================================================
// Tables OMS — Garçons (M)
// =============================================================
const WEIGHT_M: OmsPercentilePoint[] = [
  { ageMonths: 0,  p3: 2.5,  p15: 2.9,  p50: 3.3,  p85: 3.9,  p97: 4.4 },
  { ageMonths: 1,  p3: 3.4,  p15: 3.9,  p50: 4.5,  p85: 5.1,  p97: 5.8 },
  { ageMonths: 2,  p3: 4.4,  p15: 5.0,  p50: 5.6,  p85: 6.3,  p97: 7.1 },
  { ageMonths: 3,  p3: 5.1,  p15: 5.7,  p50: 6.4,  p85: 7.2,  p97: 8.0 },
  { ageMonths: 4,  p3: 5.6,  p15: 6.2,  p50: 7.0,  p85: 7.8,  p97: 8.7 },
  { ageMonths: 5,  p3: 6.1,  p15: 6.7,  p50: 7.5,  p85: 8.4,  p97: 9.3 },
  { ageMonths: 6,  p3: 6.4,  p15: 7.1,  p50: 7.9,  p85: 8.8,  p97: 9.8 },
  { ageMonths: 9,  p3: 7.2,  p15: 7.9,  p50: 8.9,  p85: 9.9,  p97: 11.0 },
  { ageMonths: 12, p3: 7.7,  p15: 8.6,  p50: 9.6,  p85: 10.8, p97: 12.0 },
  { ageMonths: 18, p3: 8.8,  p15: 9.7,  p50: 10.9, p85: 12.2, p97: 13.7 },
  { ageMonths: 24, p3: 9.7,  p15: 10.8, p50: 12.2, p85: 13.6, p97: 15.3 },
  { ageMonths: 30, p3: 10.5, p15: 11.8, p50: 13.3, p85: 14.9, p97: 16.9 },
  { ageMonths: 36, p3: 11.3, p15: 12.7, p50: 14.3, p85: 16.2, p97: 18.3 },
];

const HEIGHT_M: OmsPercentilePoint[] = [
  { ageMonths: 0,  p3: 46.3, p15: 48.0, p50: 49.9, p85: 51.8, p97: 53.4 },
  { ageMonths: 1,  p3: 51.1, p15: 52.8, p50: 54.7, p85: 56.7, p97: 58.4 },
  { ageMonths: 2,  p3: 54.7, p15: 56.4, p50: 58.4, p85: 60.4, p97: 62.2 },
  { ageMonths: 3,  p3: 57.6, p15: 59.4, p50: 61.4, p85: 63.5, p97: 65.3 },
  { ageMonths: 4,  p3: 60.0, p15: 61.8, p50: 63.9, p85: 66.0, p97: 67.8 },
  { ageMonths: 5,  p3: 61.9, p15: 63.8, p50: 65.9, p85: 68.0, p97: 69.9 },
  { ageMonths: 6,  p3: 63.6, p15: 65.5, p50: 67.6, p85: 69.8, p97: 71.6 },
  { ageMonths: 9,  p3: 67.7, p15: 69.7, p50: 72.0, p85: 74.2, p97: 76.2 },
  { ageMonths: 12, p3: 71.0, p15: 73.4, p50: 75.7, p85: 78.1, p97: 80.2 },
  { ageMonths: 18, p3: 76.9, p15: 79.6, p50: 82.3, p85: 85.0, p97: 87.4 },
  { ageMonths: 24, p3: 81.7, p15: 84.2, p50: 87.1, p85: 90.1, p97: 92.6 },
  { ageMonths: 30, p3: 85.5, p15: 88.6, p50: 91.9, p85: 95.2, p97: 97.9 },
  { ageMonths: 36, p3: 89.0, p15: 92.4, p50: 96.1, p85: 99.8, p97: 102.7 },
];

const HEAD_M: OmsPercentilePoint[] = [
  { ageMonths: 0,  p3: 32.6, p15: 33.6, p50: 34.5, p85: 35.5, p97: 36.4 },
  { ageMonths: 1,  p3: 35.4, p15: 36.4, p50: 37.3, p85: 38.4, p97: 39.2 },
  { ageMonths: 2,  p3: 37.0, p15: 38.1, p50: 39.1, p85: 40.2, p97: 41.0 },
  { ageMonths: 3,  p3: 38.4, p15: 39.5, p50: 40.5, p85: 41.6, p97: 42.5 },
  { ageMonths: 4,  p3: 39.5, p15: 40.6, p50: 41.6, p85: 42.7, p97: 43.6 },
  { ageMonths: 5,  p3: 40.4, p15: 41.5, p50: 42.6, p85: 43.7, p97: 44.5 },
  { ageMonths: 6,  p3: 41.2, p15: 42.3, p50: 43.3, p85: 44.5, p97: 45.4 },
  { ageMonths: 9,  p3: 42.7, p15: 43.8, p50: 44.9, p85: 46.0, p97: 47.0 },
  { ageMonths: 12, p3: 43.8, p15: 45.0, p50: 46.1, p85: 47.2, p97: 48.2 },
  { ageMonths: 18, p3: 45.1, p15: 46.3, p50: 47.4, p85: 48.6, p97: 49.6 },
  { ageMonths: 24, p3: 46.0, p15: 47.2, p50: 48.3, p85: 49.5, p97: 50.5 },
  { ageMonths: 30, p3: 46.7, p15: 47.9, p50: 49.0, p85: 50.2, p97: 51.2 },
  { ageMonths: 36, p3: 47.2, p15: 48.4, p50: 49.5, p85: 50.7, p97: 51.7 },
];

// =============================================================
// Tables OMS — Filles (F)
// =============================================================
const WEIGHT_F: OmsPercentilePoint[] = [
  { ageMonths: 0,  p3: 2.4,  p15: 2.8,  p50: 3.2,  p85: 3.7,  p97: 4.2 },
  { ageMonths: 1,  p3: 3.2,  p15: 3.6,  p50: 4.2,  p85: 4.8,  p97: 5.4 },
  { ageMonths: 2,  p3: 4.0,  p15: 4.5,  p50: 5.1,  p85: 5.8,  p97: 6.5 },
  { ageMonths: 3,  p3: 4.6,  p15: 5.2,  p50: 5.8,  p85: 6.6,  p97: 7.4 },
  { ageMonths: 4,  p3: 5.1,  p15: 5.7,  p50: 6.4,  p85: 7.3,  p97: 8.1 },
  { ageMonths: 5,  p3: 5.5,  p15: 6.1,  p50: 6.9,  p85: 7.8,  p97: 8.7 },
  { ageMonths: 6,  p3: 5.8,  p15: 6.5,  p50: 7.3,  p85: 8.2,  p97: 9.2 },
  { ageMonths: 9,  p3: 6.6,  p15: 7.3,  p50: 8.2,  p85: 9.3,  p97: 10.5 },
  { ageMonths: 12, p3: 7.1,  p15: 7.9,  p50: 8.9,  p85: 10.1, p97: 11.5 },
  { ageMonths: 18, p3: 8.1,  p15: 9.0,  p50: 10.2, p85: 11.6, p97: 13.2 },
  { ageMonths: 24, p3: 9.0,  p15: 10.1, p50: 11.5, p85: 13.0, p97: 14.8 },
  { ageMonths: 30, p3: 9.8,  p15: 11.0, p50: 12.5, p85: 14.2, p97: 16.2 },
  { ageMonths: 36, p3: 10.5, p15: 11.9, p50: 13.5, p85: 15.4, p97: 17.6 },
];

const HEIGHT_F: OmsPercentilePoint[] = [
  { ageMonths: 0,  p3: 45.6, p15: 47.3, p50: 49.1, p85: 50.9, p97: 52.5 },
  { ageMonths: 1,  p3: 50.0, p15: 51.7, p50: 53.7, p85: 55.6, p97: 57.3 },
  { ageMonths: 2,  p3: 53.2, p15: 55.0, p50: 57.1, p85: 59.1, p97: 60.9 },
  { ageMonths: 3,  p3: 55.8, p15: 57.7, p50: 59.8, p85: 61.9, p97: 63.7 },
  { ageMonths: 4,  p3: 58.0, p15: 59.9, p50: 62.1, p85: 64.3, p97: 66.1 },
  { ageMonths: 5,  p3: 59.9, p15: 61.8, p50: 64.0, p85: 66.2, p97: 68.1 },
  { ageMonths: 6,  p3: 61.5, p15: 63.5, p50: 65.7, p85: 68.0, p97: 69.9 },
  { ageMonths: 9,  p3: 65.5, p15: 67.6, p50: 70.0, p85: 72.3, p97: 74.4 },
  { ageMonths: 12, p3: 68.9, p15: 71.1, p50: 73.7, p85: 76.3, p97: 78.4 },
  { ageMonths: 18, p3: 74.9, p15: 77.5, p50: 80.5, p85: 83.5, p97: 86.0 },
  { ageMonths: 24, p3: 80.0, p15: 82.7, p50: 85.8, p85: 88.9, p97: 91.5 },
  { ageMonths: 30, p3: 84.0, p15: 87.0, p50: 90.4, p85: 93.7, p97: 96.5 },
  { ageMonths: 36, p3: 87.5, p15: 90.7, p50: 94.4, p85: 98.0, p97: 101.0 },
];

const HEAD_F: OmsPercentilePoint[] = [
  { ageMonths: 0,  p3: 32.0, p15: 33.0, p50: 33.9, p85: 34.9, p97: 35.7 },
  { ageMonths: 1,  p3: 34.6, p15: 35.6, p50: 36.5, p85: 37.6, p97: 38.4 },
  { ageMonths: 2,  p3: 36.0, p15: 37.0, p50: 38.0, p85: 39.1, p97: 39.9 },
  { ageMonths: 3,  p3: 37.2, p15: 38.3, p50: 39.3, p85: 40.4, p97: 41.2 },
  { ageMonths: 4,  p3: 38.2, p15: 39.3, p50: 40.4, p85: 41.5, p97: 42.4 },
  { ageMonths: 5,  p3: 39.0, p15: 40.2, p50: 41.2, p85: 42.4, p97: 43.3 },
  { ageMonths: 6,  p3: 39.7, p15: 40.9, p50: 42.0, p85: 43.2, p97: 44.0 },
  { ageMonths: 9,  p3: 41.2, p15: 42.4, p50: 43.5, p85: 44.7, p97: 45.6 },
  { ageMonths: 12, p3: 42.3, p15: 43.5, p50: 44.6, p85: 45.8, p97: 46.7 },
  { ageMonths: 18, p3: 43.6, p15: 44.8, p50: 46.0, p85: 47.2, p97: 48.2 },
  { ageMonths: 24, p3: 44.5, p15: 45.7, p50: 46.9, p85: 48.1, p97: 49.0 },
  { ageMonths: 30, p3: 45.1, p15: 46.4, p50: 47.5, p85: 48.7, p97: 49.7 },
  { ageMonths: 36, p3: 45.6, p15: 46.9, p50: 48.0, p85: 49.2, p97: 50.2 },
];

// =============================================================
// Rétro-compat — table P50 fusionnée (utilisée par l'ancienne page)
// =============================================================
export const OMS_P50: OmsPoint[] = WEIGHT_M.map((w, i) => ({
  ageMonths: w.ageMonths,
  weightP50: w.p50,
  heightP50: HEIGHT_M[i].p50,
  headP50: HEAD_M[i].p50,
}));

// =============================================================
// Sélection de la table par sex/metric
// =============================================================
function tableFor(metric: OmsMetric, sex: Sex): OmsPercentilePoint[] {
  if (metric === "weight") return sex === "F" ? WEIGHT_F : WEIGHT_M;
  if (metric === "height") return sex === "F" ? HEIGHT_F : HEIGHT_M;
  return sex === "F" ? HEAD_F : HEAD_M;
}

/**
 * Table complète (sortie ascendante par ageMonths) pour le sex/metric demandé.
 * Utile pour tracer les 5 lignes OMS sur le LineChart.
 */
export function omsTable(metric: OmsMetric, sex: Sex): OmsPercentilePoint[] {
  return [...tableFor(metric, sex)].sort((a, b) => a.ageMonths - b.ageMonths);
}

/** Interpole linéairement les 5 percentiles à un âge donné. */
export function omsAtAge(
  metric: OmsMetric,
  sex: Sex,
  ageMonths: number,
): OmsPercentilePoint {
  const t = omsTable(metric, sex);
  if (ageMonths <= t[0].ageMonths) return t[0];
  if (ageMonths >= t[t.length - 1].ageMonths) return t[t.length - 1];
  for (let i = 0; i < t.length - 1; i++) {
    const a = t[i];
    const b = t[i + 1];
    if (ageMonths >= a.ageMonths && ageMonths <= b.ageMonths) {
      const k = (ageMonths - a.ageMonths) / (b.ageMonths - a.ageMonths);
      return {
        ageMonths,
        p3: a.p3 + (b.p3 - a.p3) * k,
        p15: a.p15 + (b.p15 - a.p15) * k,
        p50: a.p50 + (b.p50 - a.p50) * k,
        p85: a.p85 + (b.p85 - a.p85) * k,
        p97: a.p97 + (b.p97 - a.p97) * k,
      };
    }
  }
  return t[t.length - 1];
}

/**
 * Estime le percentile (1-99) d'une valeur observée à un âge donné.
 * Approx. par interpolation linéaire entre les 5 percentiles connus.
 * - Sous P3 → "<3"
 * - Au-dessus P97 → ">97"
 * - Entre deux percentiles → interpolation linéaire sur [3,15,50,85,97].
 */
export function estimatePercentile(
  metric: OmsMetric,
  sex: Sex,
  ageMonths: number,
  value: number,
): { label: string; value: number | null } {
  const ref = omsAtAge(metric, sex, ageMonths);
  const stops: { p: number; v: number }[] = [
    { p: 3, v: ref.p3 },
    { p: 15, v: ref.p15 },
    { p: 50, v: ref.p50 },
    { p: 85, v: ref.p85 },
    { p: 97, v: ref.p97 },
  ];
  if (value <= stops[0].v) return { label: "<3", value: null };
  if (value >= stops[stops.length - 1].v) return { label: ">97", value: null };
  for (let i = 0; i < stops.length - 1; i++) {
    const a = stops[i];
    const b = stops[i + 1];
    if (value >= a.v && value <= b.v) {
      const k = (value - a.v) / (b.v - a.v);
      const p = a.p + (b.p - a.p) * k;
      return { label: `P${Math.round(p)}`, value: p };
    }
  }
  return { label: "P50", value: 50 };
}

/** Normalise le sex (X / null → garçons par défaut, hypothèse documentée). */
export function resolveSex(sex: "M" | "F" | "X" | null | undefined): Sex {
  return sex === "F" ? "F" : "M";
}
