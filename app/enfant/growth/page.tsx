import { saveMutation } from "@/lib/enfant/mutations";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { ModuleShell } from "@/components/enfant/ModuleShell";
import { requireUserAndBaby, getUserUnits, getUserRole } from "@/lib/enfant/baby";
import {
  formatLength,
  formatWeight,
  lengthUnitLabel,
  weightUnitLabel,
  type UnitSystem,
} from "@/lib/enfant/units";
import { GrowthForm } from "./GrowthForm";
import {
  estimatePercentile,
  resolveSex,
  type OmsMetric,
} from "@/lib/enfant/oms-curves";
import {
  GrowthCharts,
  type BabyMeasurePoint,
} from "@/components/enfant/growth/GrowthCharts";

export const metadata = { title: "Croissance — MamaTrack" };

type Measurement = {
  id: string;
  measured_at: string;
  weight_g: number | null;
  height_cm: number | null;
  head_cm: number | null;
  notes: string | null;
};

const KG_PER_LB = 0.45359237;
const CM_PER_IN = 2.54;

async function addMeasurement(formData: FormData) {
  "use server";
  const { user, baby, supabase } = await requireUserAndBaby();
  if (!user) redirect("/auth/login");
  if (!baby) redirect("/enfant/onboarding");

  const inputUnits =
    String(formData.get("_input_units") ?? "metric") === "imperial"
      ? "imperial"
      : "metric";

  const measured_at_raw = String(formData.get("measured_at") ?? "");
  const parsedDate = measured_at_raw ? new Date(measured_at_raw) : null;
  const measured_at =
    parsedDate && !Number.isNaN(parsedDate.getTime())
      ? measured_at_raw.slice(0, 10)
      : new Date().toISOString().slice(0, 10);

  const toFiniteNumber = (raw: FormDataEntryValue | null): number | null => {
    if (raw === null || raw === "") return null;
    const n = Number(raw);
    return Number.isFinite(n) ? n : null;
  };

  const clamp = (n: number | null, min: number, max: number): number | null =>
    n === null ? null : n < min || n > max ? null : n;

  const weightIn = toFiniteNumber(formData.get("weight"));
  const heightIn = toFiniteNumber(formData.get("height"));
  const headIn = toFiniteNumber(formData.get("head"));

  const weight_g = clamp(
    weightIn === null
      ? null
      : inputUnits === "imperial"
        ? Math.round(weightIn * KG_PER_LB * 1000)
        : Math.round(weightIn * 1000),
    500,
    40000,
  );
  const height_cm = clamp(
    heightIn === null
      ? null
      : inputUnits === "imperial"
        ? Number((heightIn * CM_PER_IN).toFixed(1))
        : heightIn,
    20,
    150,
  );
  const head_cm = clamp(
    headIn === null
      ? null
      : inputUnits === "imperial"
        ? Number((headIn * CM_PER_IN).toFixed(1))
        : headIn,
    20,
    70,
  );
  const notes = String(formData.get("notes") ?? "").trim().slice(0, 500) || null;

  if (weight_g === null && height_cm === null && head_cm === null) return;

  await saveMutation(supabase.from("measurements").insert({
    baby_id: baby.id,
    user_id: user.id,
    measured_at,
    weight_g,
    height_cm,
    head_cm,
    notes,
  }));
  revalidatePath("/enfant/growth");
}

async function deleteMeasurement(formData: FormData) {
  "use server";
  const { user, supabase } = await requireUserAndBaby();
  if (!user) redirect("/auth/login");
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await saveMutation(supabase
    .from("measurements")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id));
  revalidatePath("/enfant/growth");
}

export default async function GrowthPage() {
  const { user, baby, supabase } = await requireUserAndBaby();
  if (!user) redirect("/auth/login");
  if (!baby) redirect("/enfant/onboarding");

  const role = await getUserRole(user, baby);
  const canWrite = role === "owner" || role === "caregiver";

  const units = await getUserUnits();
  const wLbl = weightUnitLabel(units);
  const lLbl = lengthUnitLabel(units);

  const { data: measurementsRaw } = await supabase
    .from("measurements")
    .select("id, measured_at, weight_g, height_cm, head_cm, notes")
    .eq("baby_id", baby.id)
    .order("measured_at", { ascending: false })
    .limit(50);

  const list = (measurementsRaw as Measurement[] | null) ?? [];
  const birth = new Date(baby.birth_date);
  const now = new Date();
  const currentAgeMonths = monthsBetween(birth, now);
  const sex = resolveSex(baby.sex);

  // Build chart data per metric (ascending by age) — keep metric (kg/cm) for OMS,
  // plus display value already converted to user units.
  const weightFactor = units === "imperial" ? 1 / KG_PER_LB : 1;
  const lengthFactor = units === "imperial" ? 1 / CM_PER_IN : 1;

  const ascending = [...list].sort(
    (a, b) =>
      new Date(a.measured_at).getTime() - new Date(b.measured_at).getTime(),
  );

  const buildSeries = (
    pick: (m: Measurement) => number | null,
    factor: number,
  ): BabyMeasurePoint[] =>
    ascending
      .map((m): BabyMeasurePoint | null => {
        const v = pick(m);
        if (v === null) return null;
        return {
          ageMonths: monthsBetween(birth, new Date(m.measured_at)),
          metricValue: v,
          displayValue: v * factor,
          measuredAt: m.measured_at,
        };
      })
      .filter((x): x is BabyMeasurePoint => x !== null);

  const weightSeries = buildSeries(
    (m) => (m.weight_g != null ? m.weight_g / 1000 : null),
    weightFactor,
  );
  const heightSeries = buildSeries(
    (m) => (m.height_cm != null ? Number(m.height_cm) : null),
    lengthFactor,
  );
  const headSeries = buildSeries(
    (m) => (m.head_cm != null ? Number(m.head_cm) : null),
    lengthFactor,
  );

  const chartData: Record<OmsMetric, BabyMeasurePoint[]> = {
    weight: weightSeries,
    height: heightSeries,
    head: headSeries,
  };

  // Summary stats — latest measurement per metric + delta vs previous
  const summary = {
    weight: summaryFor(weightSeries),
    height: summaryFor(heightSeries),
    head: summaryFor(headSeries),
  };

  return (
    <ModuleShell
      slug="growth"
      title="Croissance"
      subtitle={`${baby.name} — courbes OMS ${sex === "F" ? "filles" : "garçons"}`}
      viewerBadge={role === "viewer"}
    >
      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <SummaryCard
          label="Poids actuel"
          metric="weight"
          sex={sex}
          summary={summary.weight}
          unitLabel={wLbl}
          formatter={(v) => formatWeight(v == null ? null : v * 1000, units)}
          deltaFormatter={(v) => formatWeight(v * 1000, units)}
        />
        <SummaryCard
          label="Taille"
          metric="height"
          sex={sex}
          summary={summary.height}
          unitLabel={lLbl}
          formatter={(v) => formatLength(v ?? null, units)}
          deltaFormatter={(v) => formatLength(v, units)}
        />
        <SummaryCard
          label="Périmètre crânien"
          metric="head"
          sex={sex}
          summary={summary.head}
          unitLabel={lLbl}
          formatter={(v) => formatLength(v ?? null, units)}
          deltaFormatter={(v) => formatLength(v, units)}
        />
      </div>

      <GrowthCharts
        sex={baby.sex}
        currentAgeMonths={currentAgeMonths}
        data={chartData}
        weightFactor={weightFactor}
        lengthFactor={lengthFactor}
        weightUnitLabel={wLbl}
        lengthUnitLabel={lLbl}
      />

      {canWrite && (
        <>
          <div className="mt-6 flex justify-center">
            <a
              href="#growth-form"
              className="inline-flex items-center gap-1.5 rounded-full border border-brand bg-brand px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-strong focus-visible:outline-2 focus-visible:outline-brand focus-visible:outline-offset-2"
            >
              + Ajouter une mesure
            </a>
          </div>

          <div id="growth-form" className="mt-6 scroll-mt-24">
            <GrowthForm action={addMeasurement} units={units} />
          </div>
        </>
      )}

      <div className="mt-8">
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-foreground-muted">
          Historique
        </h2>
        {list.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-surface p-8 text-center text-sm text-foreground-muted">
            Aucune mesure enregistrée.
          </div>
        ) : (
          <ul className="bt-stagger space-y-2">
            {list.map((m) => (
              <MeasurementRow
                key={m.id}
                m={m}
                units={units}
                onDelete={canWrite ? deleteMeasurement : undefined}
              />
            ))}
          </ul>
        )}
      </div>
    </ModuleShell>
  );
}

// =============================================================
// Summary card (stats)
// =============================================================
type Summary = {
  latest: BabyMeasurePoint | null;
  previous: BabyMeasurePoint | null;
};

function summaryFor(series: BabyMeasurePoint[]): Summary {
  if (series.length === 0) return { latest: null, previous: null };
  const latest = series[series.length - 1];
  const previous = series.length > 1 ? series[series.length - 2] : null;
  return { latest, previous };
}

function SummaryCard({
  label,
  metric,
  sex,
  summary,
  unitLabel,
  formatter,
  deltaFormatter,
}: {
  label: string;
  metric: OmsMetric;
  sex: "M" | "F" | "X" | null;
  summary: Summary;
  unitLabel: string;
  // formatter receives the metric value (kg or cm) — falls back to "—" when null.
  formatter: (metricValue: number | null) => string;
  deltaFormatter: (metricDelta: number) => string;
}) {
  const { latest, previous } = summary;
  const value = latest ? formatter(latest.metricValue) : "—";
  const pct = latest
    ? estimatePercentile(metric, resolveSex(sex), latest.ageMonths, latest.metricValue)
    : null;
  const delta = latest && previous ? latest.metricValue - previous.metricValue : null;

  return (
    <div className="rounded-2xl border border-border bg-surface p-4 shadow-sm transition hover:border-border-strong">
      <div className="text-[11px] font-medium uppercase tracking-wide text-foreground-muted">
        {label}
      </div>
      <div className="mt-1 text-xl font-bold text-foreground sm:text-2xl">
        {value}
      </div>
      <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs">
        {pct ? (
          <span className="rounded-full bg-brand-soft px-2 py-0.5 font-medium text-brand-strong">
            {pct.label}
          </span>
        ) : (
          <span className="text-foreground-subtle">
            Pas encore de mesure
          </span>
        )}
        {delta !== null && (
          <span
            className={
              delta > 0
                ? "text-success"
                : delta < 0
                  ? "text-danger"
                  : "text-foreground-subtle"
            }
          >
            {delta > 0 ? "+" : delta < 0 ? "−" : ""}
            {deltaFormatter(Math.abs(delta)).replace(` ${unitLabel}`, "")}{" "}
            <span className="text-foreground-subtle">vs préc.</span>
          </span>
        )}
      </div>
    </div>
  );
}

// =============================================================
// Measurement row (history)
// =============================================================
function MeasurementRow({
  m,
  units,
  onDelete,
}: {
  m: Measurement;
  units: UnitSystem;
  onDelete?: (formData: FormData) => void;
}) {
  return (
    <li className="flex items-center gap-3 rounded-xl border border-border bg-surface px-4 py-3 shadow-sm transition hover:border-border-strong">
      <div aria-hidden className="text-2xl">📏</div>
      <div className="min-w-0 flex-1">
        <div className="text-sm font-medium text-foreground">
          {new Date(m.measured_at).toLocaleDateString("fr-FR", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </div>
        <div className="truncate text-xs text-foreground-muted">
          {[
            m.weight_g ? formatWeight(m.weight_g, units) : null,
            m.height_cm ? formatLength(m.height_cm, units) : null,
            m.head_cm ? `PC ${formatLength(m.head_cm, units)}` : null,
          ]
            .filter(Boolean)
            .join(" · ")}
          {m.notes && ` — ${m.notes}`}
        </div>
      </div>
      {onDelete && (
        <form action={onDelete}>
          <input type="hidden" name="id" value={m.id} />
          <button
            type="submit"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-foreground-subtle transition hover:bg-danger-soft hover:text-danger focus-visible:outline-2 focus-visible:outline-brand focus-visible:outline-offset-2"
            aria-label="Supprimer"
          >
            ✕
          </button>
        </form>
      )}
    </li>
  );
}

function monthsBetween(from: Date, to: Date): number {
  const ms = to.getTime() - from.getTime();
  return Math.max(0, ms / (1000 * 60 * 60 * 24 * 30.44));
}
