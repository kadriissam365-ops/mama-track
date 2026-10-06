"use client";

import { useMemo, useState } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  estimatePercentile,
  omsTable,
  resolveSex,
  type OmsMetric,
} from "@/lib/enfant/oms-curves";

export type BabyMeasurePoint = {
  ageMonths: number;
  /** Valeur métrique brute (kg / cm) — utilisée pour comparer aux courbes OMS. */
  metricValue: number;
  /** Valeur déjà convertie dans l'unité d'affichage (kg ou lb / cm ou in). */
  displayValue: number;
  /** ISO date de la mesure. */
  measuredAt: string;
};

export type GrowthChartsProps = {
  sex: "M" | "F" | "X" | null;
  /** Âge actuel du bébé (en mois). Définit le max de l'axe X. */
  currentAgeMonths: number;
  /** Mesures bébé par métrique, déjà filtrées (sans null). Triées asc par âge. */
  data: Record<OmsMetric, BabyMeasurePoint[]>;
  /** Facteurs unité d'affichage. P. ex. weightFactor=1 si kg, 1/0.45359237 si lb. */
  weightFactor: number;
  lengthFactor: number;
  weightUnitLabel: string;
  lengthUnitLabel: string;
};

type TabKey = OmsMetric;

const TABS: { key: TabKey; label: string; emoji: string }[] = [
  { key: "weight", label: "Poids", emoji: "⚖️" },
  { key: "height", label: "Taille", emoji: "📏" },
  { key: "head", label: "Périmètre crânien", emoji: "🧠" },
];

const PERCENTILE_STYLES: Record<
  "p3" | "p15" | "p50" | "p85" | "p97",
  { label: string; color: string; dash?: string; opacity: number }
> = {
  p3: { label: "P3", color: "#f87171", dash: "4 4", opacity: 0.55 },
  p15: { label: "P15", color: "#fb923c", dash: "3 5", opacity: 0.5 },
  p50: { label: "P50", color: "var(--foreground-muted)", opacity: 0.85 },
  p85: { label: "P85", color: "#fb923c", dash: "3 5", opacity: 0.5 },
  p97: { label: "P97", color: "#f87171", dash: "4 4", opacity: 0.55 },
};

export function GrowthCharts({
  sex,
  currentAgeMonths,
  data,
  weightFactor,
  lengthFactor,
  weightUnitLabel,
  lengthUnitLabel,
}: GrowthChartsProps) {
  const [active, setActive] = useState<TabKey>("weight");

  const resolvedSex = resolveSex(sex);
  const maxAgeMonths = Math.max(36, Math.ceil(currentAgeMonths) + 3);

  const unitLabel = active === "weight" ? weightUnitLabel : lengthUnitLabel;
  const factor = active === "weight" ? weightFactor : lengthFactor;
  const decimals = active === "weight" ? 2 : 1;

  // Build chart data for the active metric
  const chartData = useMemo(() => {
    const omsRows = omsTable(active, resolvedSex).filter(
      (r) => r.ageMonths <= maxAgeMonths,
    );
    const babyRows = data[active] ?? [];

    // Merge x-axis: union of OMS ages + baby ages, sorted asc
    const xs = new Set<number>();
    for (const r of omsRows) xs.add(round1(r.ageMonths));
    for (const b of babyRows) xs.add(round1(b.ageMonths));

    const sortedXs = [...xs].sort((a, b) => a - b);

    // Index baby rows by x for fast lookup
    const babyByX = new Map<number, BabyMeasurePoint>();
    for (const b of babyRows) babyByX.set(round1(b.ageMonths), b);

    return sortedXs.map((x) => {
      // Interpolate OMS values at x
      const at = sex === "M" || sex === "F" ? interpAtAge(omsRows, x) : null;
      const baby = babyByX.get(x);
      return {
        x,
        p3: at ? round(at.p3 * factor, decimals) : undefined,
        p15: at ? round(at.p15 * factor, decimals) : undefined,
        p50: at ? round(at.p50 * factor, decimals) : undefined,
        p85: at ? round(at.p85 * factor, decimals) : undefined,
        p97: at ? round(at.p97 * factor, decimals) : undefined,
        baby: baby ? round(baby.displayValue, decimals) : undefined,
        babyMetric: baby?.metricValue,
        measuredAt: baby?.measuredAt,
      };
    });
  }, [active, sex, resolvedSex, maxAgeMonths, data, factor, decimals]);

  const hasBaby = (data[active] ?? []).length > 0;

  return (
    <div>
      {/* Tabs */}
      <nav className="mb-4 flex flex-wrap gap-2" role="tablist">
        {TABS.map((t) => {
          const isActive = t.key === active;
          return (
            <button
              key={t.key}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setActive(t.key)}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition focus-visible:outline-2 focus-visible:outline-brand focus-visible:outline-offset-2 ${
                isActive
                  ? "border-brand bg-brand text-white"
                  : "border-border bg-surface text-foreground-muted hover:border-border-strong hover:text-foreground"
              }`}
            >
              <span aria-hidden>{t.emoji}</span>
              {t.label}
            </button>
          );
        })}
      </nav>

      {/* Chart card */}
      <div className="rounded-2xl border border-border bg-surface p-3 shadow-sm sm:p-5">
        {!hasBaby && (
          <div className="mb-3 rounded-xl border border-dashed border-border bg-background/40 px-4 py-3 text-center text-sm text-foreground-muted">
            Ajoute une première mesure pour voir la courbe de ton bébé
            apparaître.
          </div>
        )}
        <ResponsiveContainer width="100%" height={320}>
          <LineChart
            data={chartData}
            margin={{ top: 8, right: 12, left: -12, bottom: 4 }}
          >
            <CartesianGrid
              stroke="var(--border)"
              strokeDasharray="3 4"
              vertical={false}
            />
            <XAxis
              dataKey="x"
              type="number"
              domain={[0, maxAgeMonths]}
              ticks={tickArray(maxAgeMonths)}
              tick={{ fill: "var(--foreground-muted)", fontSize: 11 }}
              tickLine={{ stroke: "var(--border)" }}
              axisLine={{ stroke: "var(--border)" }}
              label={{
                value: "Âge (mois)",
                position: "insideBottom",
                offset: -2,
                fill: "var(--foreground-subtle)",
                fontSize: 11,
              }}
            />
            <YAxis
              tick={{ fill: "var(--foreground-muted)", fontSize: 11 }}
              tickLine={{ stroke: "var(--border)" }}
              axisLine={{ stroke: "var(--border)" }}
              width={48}
              label={{
                value: unitLabel,
                angle: -90,
                position: "insideLeft",
                offset: 16,
                fill: "var(--foreground-subtle)",
                fontSize: 11,
              }}
            />
            <Tooltip
              content={
                <ChartTooltip
                  metric={active}
                  referenceAvailable={sex === "M" || sex === "F"}
                  sex={resolvedSex}
                  unitLabel={unitLabel}
                  decimals={decimals}
                />
              }
              cursor={{ stroke: "var(--border-strong)", strokeWidth: 1 }}
            />
            <Legend
              verticalAlign="bottom"
              height={32}
              wrapperStyle={{ fontSize: 11, color: "var(--foreground-muted)" }}
            />
            {(["p3", "p15", "p50", "p85", "p97"] as const).map((p) => {
              const s = PERCENTILE_STYLES[p];
              return (
                <Line
                  key={p}
                  type="monotone"
                  dataKey={p}
                  name={s.label}
                  stroke={s.color}
                  strokeWidth={p === "p50" ? 1.75 : 1.25}
                  strokeDasharray={s.dash}
                  strokeOpacity={s.opacity}
                  dot={false}
                  activeDot={false}
                  isAnimationActive={false}
                />
              );
            })}
            <Line
              type="monotone"
              dataKey="baby"
              name="Bébé"
              stroke="var(--brand)"
              strokeWidth={3}
              dot={{ r: 4, fill: "var(--brand)", stroke: "var(--brand)" }}
              activeDot={{ r: 6 }}
              connectNulls
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// =============================================================
// Tooltip custom FR
// =============================================================
type TooltipPayloadEntry = {
  dataKey?: string | number;
  value?: number | string;
  payload?: Record<string, unknown>;
};
function ChartTooltip({
  active,
  payload,
  label,
  metric,
  sex,
  unitLabel,
  decimals,
  referenceAvailable,
}: {
  active?: boolean;
  payload?: TooltipPayloadEntry[];
  label?: number | string;
  metric: OmsMetric;
  referenceAvailable: boolean;
  sex: "M" | "F";
  unitLabel: string;
  decimals: number;
}) {
  if (!active || !payload || payload.length === 0) return null;
  const baby = payload.find((p) => p.dataKey === "baby");
  const ageMonths = typeof label === "number" ? label : Number(label) || 0;
  const ageLabel = formatAgeMonths(ageMonths);

  // Percentile sur la valeur brute métrique (kg/cm)
  let pctLabel: string | null = null;
  const babyMetric =
    baby && baby.payload && typeof baby.payload.babyMetric === "number"
      ? (baby.payload.babyMetric as number)
      : null;
  if (referenceAvailable && babyMetric !== null && ageMonths <= 36) {
    pctLabel = estimatePercentile(metric, sex, ageMonths, babyMetric).label;
  }

  return (
    <div className="rounded-xl border border-border bg-surface px-3 py-2 text-xs shadow-sm">
      <div className="font-semibold text-foreground">{ageLabel}</div>
      {baby && typeof baby.value === "number" ? (
        <div className="mt-0.5 text-foreground-muted">
          <span className="font-medium text-brand">
            {baby.value.toFixed(decimals)} {unitLabel}
          </span>
          {pctLabel && <span className="ml-1.5">({pctLabel})</span>}
        </div>
      ) : (
        <div className="mt-0.5 text-foreground-subtle">
          Pas de mesure à cet âge
        </div>
      )}
      <div className="mt-1.5 grid grid-cols-5 gap-1.5 text-[10px] text-foreground-subtle">
        {(["p3", "p15", "p50", "p85", "p97"] as const).map((p) => {
          const e = payload.find((x) => x.dataKey === p);
          if (!e || typeof e.value !== "number") return null;
          return (
            <div key={p} className="text-center">
              <div className="font-medium text-foreground-muted">
                {p.toUpperCase()}
              </div>
              <div>{e.value.toFixed(decimals)}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// =============================================================
// helpers
// =============================================================
function round(n: number, d: number): number {
  const f = Math.pow(10, d);
  return Math.round(n * f) / f;
}
function round1(n: number): number {
  return Math.round(n * 10) / 10;
}
function tickArray(max: number): number[] {
  // 0, 3, 6, 9, 12, 18, 24, 30, 36, ...
  const base = [0, 3, 6, 9, 12, 18, 24, 30, 36];
  const extra: number[] = [];
  for (let m = 42; m <= max; m += 6) extra.push(m);
  return [...base.filter((b) => b <= max), ...extra];
}
function interpAtAge(
  rows: {
    ageMonths: number;
    p3: number;
    p15: number;
    p50: number;
    p85: number;
    p97: number;
  }[],
  ageMonths: number,
) {
  if (!rows.length || ageMonths > rows[rows.length - 1].ageMonths) return null;
  if (ageMonths <= rows[0].ageMonths) return rows[0];
  if (ageMonths >= rows[rows.length - 1].ageMonths)
    return rows[rows.length - 1];
  for (let i = 0; i < rows.length - 1; i++) {
    const a = rows[i];
    const b = rows[i + 1];
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
  return rows[rows.length - 1];
}

function formatAgeMonths(m: number): string {
  if (m < 1) {
    const days = Math.round(m * 30.44);
    return `${days} j`;
  }
  if (m < 24) {
    const rounded = Math.round(m * 10) / 10;
    return `${rounded} mois`;
  }
  const years = Math.floor(m / 12);
  const rest = Math.round(m - years * 12);
  if (rest === 0) return `${years} an${years > 1 ? "s" : ""}`;
  return `${years} an${years > 1 ? "s" : ""} ${rest} mois`;
}
