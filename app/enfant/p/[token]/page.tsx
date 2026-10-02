import Link from "next/link";
import { Heart, ShieldCheck } from "lucide-react";
import { createServiceClient } from "@/lib/enfant/supabase/service";
import { ageInDays, formatAge } from "@/lib/enfant/baby";
import { APP_NAME } from "@/lib/enfant/constants";
import { FOODS } from "@/lib/enfant/diversification-data";
import {
  GrowthCharts,
  type BabyMeasurePoint,
} from "@/components/enfant/growth/GrowthCharts";
import type { OmsMetric } from "@/lib/enfant/oms-curves";
import { PrintButton } from "./PrintButton";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Params = { token: string };

type TokenRow = {
  id: string;
  baby_id: string;
  token: string;
  scope_months: number;
  include_diary: boolean;
  label: string | null;
  expires_at: string;
  revoked_at: string | null;
  last_accessed_at: string | null;
  access_count: number;
};

type BabyRow = {
  id: string;
  name: string;
  sex: "M" | "F" | "X" | null;
  birth_date: string;
};

type Measurement = {
  measured_at: string;
  weight_g: number | null;
  height_cm: number | null;
  head_cm: number | null;
};
type Vaccine = {
  vaccine_code: string;
  vaccine_label: string | null;
  given_at: string;
  dose_number: number | null;
  location: string | null;
};
type FoodIntro = {
  food_code: string;
  first_tried_at: string;
  status: "ok" | "reaction" | "avoid";
  reaction: string | null;
  notes: string | null;
};
type HealthEvent = {
  kind: "fever" | "medicine" | "appointment" | "symptom" | "other";
  occurred_at: string;
  temperature_c: number | null;
  medicine_name: string | null;
  dose: string | null;
  title: string | null;
  description: string | null;
};
type Milestone = {
  code: string;
  label: string | null;
  achieved_at: string;
  notes: string | null;
};
type DiaryEntry = {
  entry_date: string;
  title: string | null;
  body: string | null;
  mood: string | null;
};

// PAS d'indexation Google : l'URL contient un secret.
export const metadata = {
  title: "Vue pédiatre — MamaTrack",
  description: "Lien temporaire sécurisé pour partage avec un pédiatre.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export default async function PediatricianPublicPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { token } = await params;

  // Validation basique avant tout query DB.
  if (!token || token.length < 32 || token.length > 128 || !/^[A-Za-z0-9_-]+$/.test(token)) {
    return <InvalidLink />;
  }

  const service = createServiceClient();
  const nowIso = new Date().toISOString();

  // 1) Token valide ?
  const { data: tokenRowRaw } = await service
    .from("pediatrician_tokens")
    .select(
      "id, baby_id, token, scope_months, include_diary, label, expires_at, revoked_at, last_accessed_at, access_count",
    )
    .eq("token", token)
    .is("revoked_at", null)
    .gt("expires_at", nowIso)
    .maybeSingle();

  const tokenRow = tokenRowRaw as TokenRow | null;
  if (!tokenRow) return <InvalidLink />;

  // 2) Baby
  const { data: babyRaw } = await service
    .from("babies")
    .select("id, name, sex, birth_date")
    .eq("id", tokenRow.baby_id)
    .maybeSingle();
  const baby = babyRaw as BabyRow | null;
  if (!baby) return <InvalidLink />;

  // 3) Audit access (best-effort, non bloquant)
  await service
    .from("pediatrician_tokens")
    .update({
      last_accessed_at: nowIso,
      access_count: tokenRow.access_count + 1,
    })
    .eq("id", tokenRow.id);

  // 4) Fenêtre temporelle
  const sinceDate = new Date();
  sinceDate.setMonth(sinceDate.getMonth() - tokenRow.scope_months);
  const sinceIso = sinceDate.toISOString();
  const sinceDateStr = sinceIso.slice(0, 10);

  // 5) Données médicales en parallèle
  const queries: PromiseLike<unknown>[] = [
    service
      .from("measurements")
      .select("measured_at, weight_g, height_cm, head_cm")
      .eq("baby_id", baby.id)
      .order("measured_at", { ascending: true }),
    service
      .from("vaccines_given")
      .select("vaccine_code, vaccine_label, given_at, dose_number, location")
      .eq("baby_id", baby.id)
      .order("given_at", { ascending: false }),
    service
      .from("food_intros")
      .select("food_code, first_tried_at, status, reaction, notes")
      .eq("baby_id", baby.id)
      .in("status", ["reaction", "avoid"])
      .order("first_tried_at", { ascending: false }),
    service
      .from("health_events")
      .select(
        "kind, occurred_at, temperature_c, medicine_name, dose, title, description",
      )
      .eq("baby_id", baby.id)
      .gte("occurred_at", sinceIso)
      .order("occurred_at", { ascending: false }),
    service
      .from("milestones")
      .select("code, label, achieved_at, notes")
      .eq("baby_id", baby.id)
      .order("achieved_at", { ascending: false }),
  ];

  if (tokenRow.include_diary) {
    queries.push(
      service
        .from("diary_entries")
        .select("entry_date, title, body, mood")
        .eq("baby_id", baby.id)
        .gte("entry_date", sinceDateStr)
        .order("entry_date", { ascending: false })
        .limit(50),
    );
  }

  const results = await Promise.all(queries);
  const measurements = ((results[0] as { data?: Measurement[] | null }).data ??
    []) as Measurement[];
  const vaccines = ((results[1] as { data?: Vaccine[] | null }).data ??
    []) as Vaccine[];
  const foodIssues = ((results[2] as { data?: FoodIntro[] | null }).data ??
    []) as FoodIntro[];
  const healthEvents = ((results[3] as { data?: HealthEvent[] | null }).data ??
    []) as HealthEvent[];
  const milestones = ((results[4] as { data?: Milestone[] | null }).data ??
    []) as Milestone[];
  const diary = tokenRow.include_diary
    ? (((results[5] as { data?: DiaryEntry[] | null }).data ??
        []) as DiaryEntry[])
    : [];

  const ageLabel = formatAge(baby.birth_date);
  const ageMonths = ageInDays(baby.birth_date) / 30.44;
  const sexLabel =
    baby.sex === "M" ? "Garçon" : baby.sex === "F" ? "Fille" : "Non précisé";
  const expiresLabel = new Date(tokenRow.expires_at).toLocaleDateString(
    "fr-FR",
    { day: "numeric", month: "long", year: "numeric" },
  );

  // Build chart series (kg / cm)
  const birth = new Date(baby.birth_date);
  const monthsBetween = (from: Date, to: Date) =>
    Math.max(0, (to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24 * 30.44));

  const buildSeries = (
    pick: (m: Measurement) => number | null,
  ): BabyMeasurePoint[] =>
    measurements
      .map((m): BabyMeasurePoint | null => {
        const v = pick(m);
        if (v === null) return null;
        return {
          ageMonths: monthsBetween(birth, new Date(m.measured_at)),
          metricValue: v,
          displayValue: v,
          measuredAt: m.measured_at,
        };
      })
      .filter((x): x is BabyMeasurePoint => x !== null);

  const chartData: Record<OmsMetric, BabyMeasurePoint[]> = {
    weight: buildSeries((m) => (m.weight_g != null ? m.weight_g / 1000 : null)),
    height: buildSeries((m) => (m.height_cm != null ? Number(m.height_cm) : null)),
    head: buildSeries((m) => (m.head_cm != null ? Number(m.head_cm) : null)),
  };

  return (
    <div className="min-h-[100dvh] bg-gradient-to-b from-accent-emerald-soft via-background to-background print:bg-white">
      <header className="border-b border-border bg-surface/90 backdrop-blur print:hidden">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2">
            <span className="bt-bg-gradient flex h-8 w-8 items-center justify-center rounded-xl shadow-sm shadow-brand/30">
              <Heart className="h-3.5 w-3.5 fill-white text-white" />
            </span>
            <div className="leading-tight">
              <div className="text-sm font-bold text-foreground">{APP_NAME}</div>
              <div className="text-[10px] uppercase tracking-wider text-foreground-muted">
                Vue pédiatre
              </div>
            </div>
          </div>
          <PrintButton />
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-8 print:max-w-none print:py-2">
        {/* Bandeau lien sécurisé */}
        <div className="mb-5 flex flex-wrap items-center gap-2 rounded-xl border border-info/30 bg-info-soft px-3 py-2 text-xs text-info-text">
          <ShieldCheck className="h-4 w-4 flex-shrink-0" />
          <span>
            Lien sécurisé temporaire — expire le <strong>{expiresLabel}</strong>.
            Lecture seule, pas de modification possible.
          </span>
        </div>

        {/* Hero baby */}
        <section className="mb-6 rounded-2xl border border-border bg-surface p-5 shadow-sm sm:p-6 print:border-2">
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
              {baby.name}
            </h1>
            <span className="text-sm font-medium text-brand">{ageLabel}</span>
          </div>
          <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-sm sm:grid-cols-3">
            <div>
              <dt className="text-[11px] uppercase tracking-wider text-foreground-subtle">
                Sexe
              </dt>
              <dd className="font-medium text-foreground">{sexLabel}</dd>
            </div>
            <div>
              <dt className="text-[11px] uppercase tracking-wider text-foreground-subtle">
                Date de naissance
              </dt>
              <dd className="font-medium text-foreground">
                {new Date(baby.birth_date).toLocaleDateString("fr-FR", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </dd>
            </div>
            <div>
              <dt className="text-[11px] uppercase tracking-wider text-foreground-subtle">
                Période partagée
              </dt>
              <dd className="font-medium text-foreground">
                {tokenRow.scope_months} dernier{tokenRow.scope_months > 1 ? "s" : ""} mois
              </dd>
            </div>
          </dl>
        </section>

        {/* Mesures + courbes */}
        <Section title="Mesures & croissance" subtitle={`${measurements.length} mesure${measurements.length > 1 ? "s" : ""} enregistrée${measurements.length > 1 ? "s" : ""}`}>
          {measurements.length === 0 ? (
            <EmptyRow text="Aucune mesure enregistrée." />
          ) : (
            <>
              <div className="overflow-x-auto rounded-xl border border-border bg-surface print:break-inside-avoid">
                <table className="w-full text-xs sm:text-sm">
                  <thead className="bg-background text-left text-foreground-muted">
                    <tr>
                      <th className="px-3 py-2 font-medium">Date</th>
                      <th className="px-3 py-2 font-medium">Poids</th>
                      <th className="px-3 py-2 font-medium">Taille</th>
                      <th className="px-3 py-2 font-medium">PC</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...measurements].reverse().slice(0, 12).map((m) => (
                      <tr key={m.measured_at + (m.weight_g ?? "") + (m.height_cm ?? "")} className="border-t border-border">
                        <td className="px-3 py-2 text-foreground">
                          {new Date(m.measured_at).toLocaleDateString("fr-FR")}
                        </td>
                        <td className="px-3 py-2 text-foreground-muted">
                          {m.weight_g ? `${(m.weight_g / 1000).toFixed(2)} kg` : "—"}
                        </td>
                        <td className="px-3 py-2 text-foreground-muted">
                          {m.height_cm ? `${Number(m.height_cm).toFixed(1)} cm` : "—"}
                        </td>
                        <td className="px-3 py-2 text-foreground-muted">
                          {m.head_cm ? `${Number(m.head_cm).toFixed(1)} cm` : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 print:hidden">
                <GrowthCharts
                  sex={baby.sex}
                  currentAgeMonths={ageMonths}
                  data={chartData}
                  weightFactor={1}
                  lengthFactor={1}
                  weightUnitLabel="kg"
                  lengthUnitLabel="cm"
                />
              </div>
            </>
          )}
        </Section>

        {/* Vaccins */}
        <Section title="Vaccins effectués" subtitle={`${vaccines.length} dose${vaccines.length > 1 ? "s" : ""}`}>
          {vaccines.length === 0 ? (
            <EmptyRow text="Aucun vaccin enregistré." />
          ) : (
            <div className="overflow-x-auto rounded-xl border border-border bg-surface">
              <table className="w-full text-xs sm:text-sm">
                <thead className="bg-background text-left text-foreground-muted">
                  <tr>
                    <th className="px-3 py-2 font-medium">Vaccin</th>
                    <th className="px-3 py-2 font-medium">Date</th>
                    <th className="px-3 py-2 font-medium">Dose</th>
                    <th className="px-3 py-2 font-medium">Lieu</th>
                  </tr>
                </thead>
                <tbody>
                  {vaccines.map((v, i) => (
                    <tr key={i} className="border-t border-border">
                      <td className="px-3 py-2 text-foreground">
                        {v.vaccine_label ?? v.vaccine_code}
                      </td>
                      <td className="px-3 py-2 text-foreground-muted">
                        {new Date(v.given_at).toLocaleDateString("fr-FR")}
                      </td>
                      <td className="px-3 py-2 text-foreground-muted">
                        {v.dose_number ? `n°${v.dose_number}` : "—"}
                      </td>
                      <td className="px-3 py-2 text-foreground-muted">
                        {v.location ?? "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Section>

        {/* Allergies / réactions */}
        <Section
          title="Allergies & réactions alimentaires"
          subtitle={`${foodIssues.length} aliment${foodIssues.length > 1 ? "s" : ""} signalé${foodIssues.length > 1 ? "s" : ""}`}
        >
          {foodIssues.length === 0 ? (
            <EmptyRow text="Aucune allergie ou réaction signalée." />
          ) : (
            <ul className="space-y-2">
              {foodIssues.map((f, i) => {
                const food = FOODS.find((x) => x.code === f.food_code);
                const isReaction = f.status === "reaction";
                return (
                  <li
                    key={i}
                    className={`rounded-xl border px-3 py-2.5 text-sm ${
                      isReaction
                        ? "border-danger/40 bg-danger-soft"
                        : "border-warning/40 bg-warning-soft"
                    }`}
                  >
                    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                      <span className="font-semibold text-foreground">
                        {food?.label ?? f.food_code}
                      </span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ${
                          isReaction
                            ? "bg-danger-soft text-danger-text"
                            : "bg-warning-soft text-warning-text"
                        }`}
                      >
                        {isReaction ? "Réaction" : "À éviter"}
                      </span>
                      <span className="text-[11px] text-foreground-subtle">
                        {new Date(f.first_tried_at).toLocaleDateString("fr-FR")}
                      </span>
                    </div>
                    {f.reaction && (
                      <p className="mt-1 text-xs text-foreground-muted">
                        <span className="font-medium">Réaction :</span> {f.reaction}
                      </p>
                    )}
                    {f.notes && (
                      <p className="mt-0.5 text-xs text-foreground-muted">
                        {f.notes}
                      </p>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </Section>

        {/* Événements santé */}
        <Section
          title={`Événements santé (${tokenRow.scope_months} derniers mois)`}
          subtitle={`${healthEvents.length} événement${healthEvents.length > 1 ? "s" : ""}`}
        >
          {healthEvents.length === 0 ? (
            <EmptyRow text="Aucun événement santé sur la période." />
          ) : (
            <ul className="space-y-2">
              {healthEvents.map((h, i) => (
                <li
                  key={i}
                  className="rounded-xl border border-border bg-surface px-3 py-2.5 text-sm"
                >
                  <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                    <span className="rounded-full bg-brand-soft px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-brand-strong">
                      {kindLabel(h.kind)}
                    </span>
                    <span className="font-medium text-foreground">
                      {h.title ?? defaultTitle(h)}
                    </span>
                    <span className="text-[11px] text-foreground-subtle">
                      {new Date(h.occurred_at).toLocaleString("fr-FR", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  {h.kind === "fever" && h.temperature_c != null && (
                    <p className="mt-1 text-xs text-foreground-muted">
                      Température : <strong>{Number(h.temperature_c).toFixed(1)} °C</strong>
                    </p>
                  )}
                  {h.kind === "medicine" && h.medicine_name && (
                    <p className="mt-1 text-xs text-foreground-muted">
                      <strong>{h.medicine_name}</strong>
                      {h.dose ? ` — ${h.dose}` : ""}
                    </p>
                  )}
                  {h.description && (
                    <p className="mt-1 text-xs text-foreground-muted">
                      {h.description}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </Section>

        {/* Étapes */}
        <Section title="Étapes du développement" subtitle={`${milestones.length} étape${milestones.length > 1 ? "s" : ""}`}>
          {milestones.length === 0 ? (
            <EmptyRow text="Aucune étape enregistrée." />
          ) : (
            <ul className="space-y-1.5">
              {milestones.map((m, i) => (
                <li
                  key={i}
                  className="flex flex-wrap items-baseline justify-between gap-2 rounded-xl border border-border bg-surface px-3 py-2 text-sm"
                >
                  <span className="font-medium text-foreground">
                    {m.label ?? m.code}
                  </span>
                  <span className="text-[11px] text-foreground-subtle">
                    {new Date(m.achieved_at).toLocaleDateString("fr-FR")}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Section>

        {/* Journal (optionnel) */}
        {tokenRow.include_diary && (
          <Section
            title={`Journal personnel (${tokenRow.scope_months} derniers mois)`}
            subtitle={`${diary.length} entrée${diary.length > 1 ? "s" : ""}`}
          >
            {diary.length === 0 ? (
              <EmptyRow text="Aucune entrée de journal sur la période." />
            ) : (
              <ul className="space-y-2">
                {diary.map((d, i) => (
                  <li
                    key={i}
                    className="rounded-xl border border-border bg-surface px-3 py-2.5 text-sm"
                  >
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <span className="font-medium text-foreground">
                        {d.title ?? "Note du jour"}
                      </span>
                      <span className="text-[11px] text-foreground-subtle">
                        {new Date(d.entry_date).toLocaleDateString("fr-FR")}
                      </span>
                    </div>
                    {d.body && (
                      <p className="mt-1 whitespace-pre-line text-xs text-foreground-muted">
                        {d.body}
                      </p>
                    )}
                    {d.mood && (
                      <p className="mt-1 text-[11px] text-foreground-subtle">
                        Humeur : {d.mood}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </Section>
        )}

        <footer className="mt-10 border-t border-border pt-5 text-center text-[11px] text-foreground-subtle print:mt-6">
          <p>
            <strong>{APP_NAME}</strong> — Vue pédiatre temporaire · Aucune
            modification possible.
          </p>
          <p className="mt-1">
            Ce lien a été généré par le parent et expire automatiquement le{" "}
            {expiresLabel}. Le parent peut révoquer l&apos;accès à tout moment
            depuis son application.
          </p>
          <p className="mt-2">
            <Link href="/" className="underline hover:text-foreground-muted">
              {APP_NAME}
            </Link>
          </p>
        </footer>
      </div>
    </div>
  );
}

function Section({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-6 print:break-inside-avoid">
      <header className="mb-2.5 flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-base font-bold tracking-tight text-foreground sm:text-lg">
          {title}
        </h2>
        {subtitle && (
          <span className="text-[11px] text-foreground-subtle">{subtitle}</span>
        )}
      </header>
      {children}
    </section>
  );
}

function EmptyRow({ text }: { text: string }) {
  return (
    <div className="rounded-xl border border-dashed border-border bg-surface px-4 py-3 text-center text-xs text-foreground-subtle">
      {text}
    </div>
  );
}

function kindLabel(k: HealthEvent["kind"]): string {
  switch (k) {
    case "fever":
      return "Fièvre";
    case "medicine":
      return "Médicament";
    case "appointment":
      return "RDV";
    case "symptom":
      return "Symptôme";
    default:
      return "Autre";
  }
}

function defaultTitle(h: HealthEvent): string {
  if (h.kind === "fever") return "Épisode fébrile";
  if (h.kind === "medicine") return h.medicine_name ?? "Médicament";
  if (h.kind === "appointment") return "Consultation";
  if (h.kind === "symptom") return "Symptôme";
  return "Événement";
}

function InvalidLink() {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-gradient-to-b from-accent-emerald-soft via-background to-background px-4">
      <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-8 text-center shadow-sm">
        <div className="bt-bg-gradient mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl shadow-sm shadow-brand/30">
          <Heart className="h-5 w-5 fill-white text-white" />
        </div>
        <h1 className="mb-2 text-xl font-bold text-foreground">
          Lien invalide ou expiré
        </h1>
        <p className="text-sm text-foreground-muted">
          Ce lien de partage n&apos;est plus valable. Il a peut-être été révoqué
          ou expiré. Demande un nouveau lien au parent.
        </p>
        <div className="mt-5">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground-muted transition hover:border-border-strong hover:text-foreground"
          >
            <Heart className="h-3 w-3" />
            {APP_NAME}
          </Link>
        </div>
      </div>
    </div>
  );
}
