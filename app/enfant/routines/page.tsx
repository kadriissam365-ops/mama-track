import { redirect } from "next/navigation";
import {
  Check,
  Plus,
  Archive,
  RotateCcw,
  Sun,
  Moon,
  Sparkles,
} from "lucide-react";
import { ModuleShell } from "@/components/enfant/ModuleShell";
import ActionButton from "@/components/enfant/ActionButton";
import { requireUserAndBaby, getUserRole } from "@/lib/enfant/baby";
import { calendarDate, parseCalendarDate } from "@/lib/family-journey";
import { addRoutine, toggleRoutine, archiveRoutine } from "./actions";
export const metadata = { title: "Nos petits rituels" };
const PERIODS = [
  { key: "morning", label: "Un bon départ", Icon: Sun },
  { key: "anytime", label: "Au fil de la journée", Icon: Sparkles },
  { key: "evening", label: "Une douce fin de journée", Icon: Moon },
];
const PRESETS = [
  { title: "Se brosser les dents", period: "morning" },
  { title: "Un moment pour jouer ensemble", period: "anytime" },
  { title: "Préparer les affaires du lendemain", period: "evening" },
  { title: "Une histoire avant de dormir", period: "evening" },
];
export default async function RoutinesPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { user, baby, supabase } = await requireUserAndBaby();
  if (!user) redirect("/auth/login");
  if (!baby) redirect("/enfant/naissance");
  const today = calendarDate();
  const historyStart = parseCalendarDate(today)!;
  historyStart.setUTCDate(historyStart.getUTCDate() - 7);
  const since = historyStart.toISOString().slice(0, 10);
  const [routines, checks, role, params] = await Promise.all([
    supabase
      .from("child_routines")
      .select("id,title,period,active")
      .eq("baby_id", baby.id)
      .order("sort_order")
      .order("created_at"),
    supabase
      .from("routine_completions")
      .select("routine_id,completed_on")
      .eq("baby_id", baby.id)
      .gte("completed_on", since)
      .lte("completed_on", today),
    getUserRole(user, baby),
    searchParams,
  ]);
  if (routines.error || checks.error)
    throw new Error("Les routines sont momentanément indisponibles.");
  const active = (routines.data ?? []).filter((r) => r.active),
    archived = (routines.data ?? []).filter((r) => !r.active),
    done = new Set(
      (checks.data ?? [])
        .filter((r) => r.completed_on === today)
        .map((r) => r.routine_id),
    );
  const pastDays = [
    ...new Set(
      (checks.data ?? [])
        .filter((r) => r.completed_on < today)
        .map((r) => r.completed_on),
    ),
  ]
    .sort()
    .reverse();
  const writable = role === "owner" || role === "caregiver",
    count = active.filter((r) => done.has(r.id)).length;
  const fields = (id?: string) => (
    <>
      <input type="hidden" name="baby_id" value={baby.id} />
      {id && <input type="hidden" name="routine_id" value={id} />}
    </>
  );
  return (
    <ModuleShell
      slug="routines"
      title="Nos petits rituels"
      subtitle={`${baby.name} · Aujourd’hui, ${new Date(`${today}T12:00:00Z`).toLocaleDateString("fr-FR", { day: "numeric", month: "long" })}`}
      viewerBadge={role === "viewer"}
    >
      {params.error && (
        <p role="alert" className="mt-note mb-5">
          {params.error === "access"
            ? "Ce carnet est accessible en lecture seule, ou l’enfant sélectionné a changé."
            : params.error === "invalid"
              ? "Donnez un nom de 1 à 100 caractères à votre routine."
              : "L’enregistrement a échoué. Réessayez dans un instant."}
        </p>
      )}
      <section className="mt-care-card mb-6">
        <Sparkles size={22} />
        <h2 className="mt-3">Les habitudes qui font du bien.</h2>
        <p>
          Choisissez vos rituels, cochez ensemble. Chaque nouveau jour repart de
          zéro ; les journées passées restent dans votre carnet et votre export.
        </p>
        {active.length > 0 && (
          <>
            <p className="!text-sm !mt-4">
              {count} petit{count > 1 ? "s" : ""} rituel{count > 1 ? "s" : ""}{" "}
              accompli{count > 1 ? "s" : ""} sur {active.length}
            </p>
            <div className="mt-progress">
              <div style={{ width: `${(count / active.length) * 100}%` }} />
            </div>
          </>
        )}
      </section>
      <div className="grid gap-5 lg:grid-cols-2">
        {PERIODS.map(({ key, label, Icon }) => {
          const rows = active.filter((r) => r.period === key);
          return (
            rows.length > 0 && (
              <section key={key} className="mt-card">
                <div className="mt-card-header">
                  <h2>{label}</h2>
                  <Icon size={18} />
                </div>
                <div className="space-y-3">
                  {rows.map((r) => (
                    <div
                      key={r.id}
                      className="flex items-center gap-3 rounded-2xl border border-border p-3"
                    >
                      <form action={toggleRoutine}>
                        {fields(r.id)}
                        <input
                          type="hidden"
                          name="done"
                          value={String(done.has(r.id))}
                        />
                        {writable ? (
                          <ActionButton
                            label={`${done.has(r.id) ? "Décocher" : "Cocher"} ${r.title}`}
                            className={`inline-flex size-11 shrink-0 items-center justify-center rounded-xl border ${done.has(r.id) ? "bg-[var(--forest)] text-white border-transparent" : "border-border bg-surface"}`}
                          >
                            {done.has(r.id) ? (
                              <Check size={18} />
                            ) : (
                              <span className="size-3 rounded-full border border-border" />
                            )}
                          </ActionButton>
                        ) : (
                          <span className="mt-icon-soft">
                            {done.has(r.id) ? (
                              <Check size={18} />
                            ) : (
                              <span>—</span>
                            )}
                          </span>
                        )}
                      </form>
                      <span
                        className={`flex-1 text-sm ${done.has(r.id) ? "text-foreground-muted" : ""}`}
                      >
                        {r.title}
                      </span>
                      {writable && (
                        <form action={archiveRoutine}>
                          {fields(r.id)}
                          <ActionButton
                            label={`Archiver ${r.title}`}
                            className="inline-flex size-11 items-center justify-center rounded-xl text-foreground-muted hover:bg-surface-alt"
                          >
                            <Archive size={15} />
                          </ActionButton>
                        </form>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )
          );
        })}
      </div>
      {!active.length && (
        <p className="mt-empty mb-5">
          Votre tableau est prêt. Ajoutez les rituels qui ressemblent à votre
          famille.
        </p>
      )}
      {writable && (
        <section className="mt-card mt-6">
          <div className="mt-card-header">
            <h2>Créer notre rituel</h2>
            <Plus size={18} />
          </div>
          <form action={addRoutine} className="space-y-4">
            {fields()}
            <label className="block text-xs font-medium">
              Le petit geste
              <input
                name="title"
                required
                maxLength={100}
                placeholder="Par exemple : choisir les vêtements ensemble"
                className="mt-2 block min-h-12 w-full rounded-xl border border-border bg-surface px-3 text-sm"
              />
            </label>
            <label className="block text-xs font-medium">
              Le moment
              <select
                name="period"
                className="mt-2 block min-h-12 w-full rounded-xl border border-border bg-surface px-3 text-sm"
              >
                <option value="anytime">Dans la journée</option>
                <option value="morning">Le matin</option>
                <option value="evening">Le soir</option>
              </select>
            </label>
            <ActionButton>
              Ajouter ce rituel <Plus size={15} />
            </ActionButton>
          </form>
          <p className="mt-6 mb-3 text-xs text-foreground-muted">
            Un peu d’inspiration
          </p>
          <div className="flex flex-wrap gap-2">
            {PRESETS.filter(
              (p) => !active.some((r) => r.title === p.title),
            ).map((p) => (
              <form action={addRoutine} key={p.title}>
                {fields()}
                <input name="title" type="hidden" value={p.title} />
                <input name="period" type="hidden" value={p.period} />
                <ActionButton className="mt-button mt-button-secondary !text-xs">
                  <Plus size={13} />
                  {p.title}
                </ActionButton>
              </form>
            ))}
          </div>
        </section>
      )}
      {archived.length > 0 && (
        <details className="mt-card mt-5">
          <summary className="cursor-pointer text-sm font-semibold">
            Rituels archivés ({archived.length})
          </summary>
          <div className="mt-4 space-y-3">
            {archived.map((r) => (
              <div
                className="flex items-center justify-between gap-3"
                key={r.id}
              >
                <span className="text-sm">{r.title}</span>
                {writable && (
                  <form action={archiveRoutine}>
                    {fields(r.id)}
                    <input type="hidden" name="restore" value="true" />
                    <ActionButton
                      className="mt-button mt-button-secondary"
                      label={`Restaurer ${r.title}`}
                    >
                      <RotateCcw size={14} />
                      Restaurer
                    </ActionButton>
                  </form>
                )}
              </div>
            ))}
          </div>
        </details>
      )}
      <details className="mt-card mt-5">
        <summary className="cursor-pointer text-sm font-semibold">
          Nos derniers jours · une semaine
        </summary>
        <div className="mt-4 space-y-4">
          {pastDays.length ? (
            pastDays.map((day) => (
              <div key={day}>
                <p className="text-xs font-semibold">
                  {parseCalendarDate(day)!.toLocaleDateString("fr-FR", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                  })}
                </p>
                <p className="mt-1 text-xs leading-6 text-foreground-muted">
                  {(checks.data ?? [])
                    .filter((check) => check.completed_on === day)
                    .map(
                      (check) =>
                        (routines.data ?? []).find(
                          (r) => r.id === check.routine_id,
                        )?.title ?? "Rituel archivé",
                    )
                    .join(" · ")}
                </p>
              </div>
            ))
          ) : (
            <p className="mt-empty">
              Les rituels cochés des jours précédents apparaîtront ici. Votre
              historique complet est conservé dans l’export de vos données.
            </p>
          )}
        </div>
      </details>
    </ModuleShell>
  );
}
