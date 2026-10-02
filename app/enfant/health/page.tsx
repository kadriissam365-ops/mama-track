import { saveMutation } from "@/lib/enfant/mutations";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { ModuleShell } from "@/components/enfant/ModuleShell";
import { requireUserAndBaby, getUserUnits, getUserRole } from "@/lib/enfant/baby";
import {
  formatTemperature,
  temperatureToCelsius,
  temperatureUnitLabel,
} from "@/lib/enfant/units";
import { HealthForm } from "./HealthForm";
import { Alert, StatCard } from "@/components/enfant/ui";

export const metadata = { title: "Santé — MamaTrack" };

type HealthKind = "fever" | "medicine" | "appointment" | "symptom" | "other";
const HEALTH_KINDS: readonly HealthKind[] = [
  "fever",
  "medicine",
  "appointment",
  "symptom",
  "other",
];

type HealthEvent = {
  id: string;
  kind: HealthKind;
  occurred_at: string;
  temperature_c: number | null;
  medicine_name: string | null;
  dose: string | null;
  title: string | null;
  description: string | null;
};

const MAX_LEN = 500;
function cap(v: FormDataEntryValue | null, n = MAX_LEN): string | null {
  const s = String(v ?? "").trim();
  if (!s) return null;
  return s.slice(0, n);
}

async function addHealth(formData: FormData) {
  "use server";
  const { user, baby, supabase } = await requireUserAndBaby();
  if (!user) redirect("/auth/login");
  if (!baby) redirect("/enfant/onboarding");

  const units = await getUserUnits();

  const kindRaw = String(formData.get("kind") ?? "other");
  const kind: HealthKind = (HEALTH_KINDS as readonly string[]).includes(kindRaw)
    ? (kindRaw as HealthKind)
    : "other";

  const occurred_at_raw = String(formData.get("occurred_at") ?? "");
  let occurred_at = new Date().toISOString();
  if (occurred_at_raw) {
    const d = new Date(occurred_at_raw);
    if (!Number.isNaN(d.getTime())) occurred_at = d.toISOString();
  }

  // Temperature: accept in user's unit, store always in Celsius.
  let temperature_c: number | null = null;
  const tempRaw = formData.get("temperature_c");
  if (tempRaw !== null && String(tempRaw).length > 0) {
    const n = Number(tempRaw);
    if (Number.isFinite(n)) {
      const c = temperatureToCelsius(n, units);
      // Clamp to physiologically plausible range (30–45 °C).
      if (c >= 30 && c <= 45) temperature_c = Math.round(c * 100) / 100;
    }
  }

  const medicine_name = cap(formData.get("medicine_name"), 120);
  const dose = cap(formData.get("dose"), 60);
  const title = cap(formData.get("title"), 120);
  const description = cap(formData.get("description"), 1000);

  await saveMutation(supabase.from("health_events").insert({
    baby_id: baby.id,
    user_id: user.id,
    kind,
    occurred_at,
    temperature_c,
    medicine_name,
    dose,
    title,
    description,
  }));
  revalidatePath("/enfant/health");
}

async function deleteHealth(formData: FormData) {
  "use server";
  const { user, supabase } = await requireUserAndBaby();
  if (!user) redirect("/auth/login");
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await saveMutation(supabase
    .from("health_events")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id));
  revalidatePath("/enfant/health");
}

export default async function HealthPage() {
  const { user, baby, supabase } = await requireUserAndBaby();
  if (!user) redirect("/auth/login");
  if (!baby) redirect("/enfant/onboarding");
  const requestNow = new Date().getTime();

  const role = await getUserRole(user, baby);
  const canWrite = role === "owner" || role === "caregiver";

  const units = await getUserUnits();

  const { data: eventsRaw } = await supabase
    .from("health_events")
    .select("id, kind, occurred_at, temperature_c, medicine_name, dose, title, description")
    .eq("baby_id", baby.id)
    .order("occurred_at", { ascending: false })
    .limit(80);

  const list = (eventsRaw as HealthEvent[] | null) ?? [];

  const fevers = list.filter((e) => e.kind === "fever").slice(0, 5);
  const latestFever = fevers[0];
  const feverAgeMs = latestFever
    ? requestNow - new Date(latestFever.occurred_at).getTime()
    : Infinity;
  const feverIsRecent = feverAgeMs < 12 * 60 * 60 * 1000;
  // High fever threshold is always measured in °C regardless of display unit.
  const isFeverHigh =
    feverIsRecent &&
    latestFever?.temperature_c !== null &&
    latestFever?.temperature_c !== undefined &&
    Number(latestFever.temperature_c) >= 38.5;

  const last24h = requestNow - 24 * 60 * 60 * 1000;
  const meds24h = list.filter(
    (e) =>
      e.kind === "medicine" && new Date(e.occurred_at).getTime() > last24h,
  ).length;

  const upcomingAppts = list
    .filter(
      (e) =>
        e.kind === "appointment" &&
        new Date(e.occurred_at).getTime() > requestNow,
    )
    .sort(
      (a, b) =>
        new Date(a.occurred_at).getTime() - new Date(b.occurred_at).getTime(),
    );

  return (
    <ModuleShell
      slug="health"
      title="Santé"
      subtitle={`${baby.name} — santé & suivi`}
      viewerBadge={role === "viewer"}
    >
      <div className="mb-6 grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3">
        <StatCard
          icon="🌡️"
          label="Dernière fièvre"
          value={formatTemperature(latestFever?.temperature_c ?? null, units)}
          className={isFeverHigh ? "border-danger/40 bg-danger-soft" : undefined}
        />
        <StatCard icon="💊" label="Médocs 24h" value={meds24h} />
        <StatCard icon="👩‍⚕️" label="RDV à venir" value={upcomingAppts.length} />
      </div>

      {isFeverHigh && (
        <Alert tone="danger" icon="🚨" className="mb-6" title="Fièvre ≥ 38,5°C">
          Si la fièvre dure &gt; 48h, s&apos;accompagne de vomissements,
          léthargie, ou si bébé a moins de 3 mois → appelle le 15 / ton
          pédiatre.
        </Alert>
      )}

      {upcomingAppts.length > 0 && (
        <Alert tone="info" icon="📅" className="mb-6" title="Prochains RDV">
          <ul className="mt-1 space-y-1">
            {upcomingAppts.map((a) => (
              <li key={a.id} className="text-sm">
                {new Date(a.occurred_at).toLocaleDateString("fr-FR", {
                  weekday: "short",
                  day: "numeric",
                  month: "long",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
                {" — "}
                {a.title ?? "RDV"}
              </li>
            ))}
          </ul>
        </Alert>
      )}

      {canWrite && (
        <HealthForm action={addHealth} tempUnitLabel={temperatureUnitLabel(units)} />
      )}

      <div className="mt-8">
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-foreground-muted">
          Historique
        </h2>
        {list.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-surface p-8 text-center text-sm text-foreground-muted">
            Aucun événement santé enregistré. Remplis le formulaire ci-dessus
            pour commencer le suivi.
          </div>
        ) : (
          <ul className="bt-stagger space-y-2">
            {list.map((e) => (
              <HealthRow
                key={e.id}
                e={e}
                units={units}
                onDelete={canWrite ? deleteHealth : undefined}
              />
            ))}
          </ul>
        )}
      </div>
    </ModuleShell>
  );
}

function HealthRow({
  e,
  units,
  onDelete,
}: {
  e: HealthEvent;
  units: "metric" | "imperial";
  onDelete?: (formData: FormData) => void;
}) {
  const emoji =
    e.kind === "fever"
      ? "🌡️"
      : e.kind === "medicine"
        ? "💊"
        : e.kind === "appointment"
          ? "👩‍⚕️"
          : e.kind === "symptom"
            ? "🤒"
            : "📝";

  const title =
    e.kind === "fever"
      ? `Fièvre ${e.temperature_c != null ? formatTemperature(e.temperature_c, units) : ""}`.trim()
      : e.kind === "medicine"
        ? `${e.medicine_name ?? "Médicament"}${e.dose ? ` — ${e.dose}` : ""}`
        : e.kind === "appointment"
          ? e.title ?? "RDV"
          : e.kind === "symptom"
            ? e.description ?? "Symptôme"
            : e.title ?? e.description ?? "Événement";

  return (
    <li className="flex items-center gap-3 rounded-xl border border-border bg-surface px-4 py-3 shadow-sm transition hover:border-border-strong">
      <div aria-hidden className="text-2xl">{emoji}</div>
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-medium text-foreground">{title}</div>
        <div className="truncate text-xs text-foreground-muted">
          {new Date(e.occurred_at).toLocaleDateString("fr-FR", {
            weekday: "short",
            day: "numeric",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
          })}
          {e.description &&
            e.kind !== "symptom" &&
            ` · ${e.description.slice(0, 80)}`}
        </div>
      </div>
      {onDelete && (
        <form action={onDelete}>
          <input type="hidden" name="id" value={e.id} />
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
