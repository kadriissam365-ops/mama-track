import { calendarDate, parseCalendarDate } from "@/lib/family-journey";
import { saveMutation } from "@/lib/enfant/mutations";
import Link from "next/link";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { ModuleShell } from "@/components/enfant/ModuleShell";
import { requireUserAndBaby, getUserRole } from "@/lib/enfant/baby";
import {
  HAS_VISITS,
  scheduledVisitDate,
  visitStatus,
  type HASVisitStatus,
} from "@/lib/enfant/checklist-data";
import { AddAppointmentForm } from "./AddAppointmentForm";

export const metadata = { title: "Agenda — MamaTrack" };

type Appointment = {
  id: string;
  occurred_at: string;
  title: string | null;
  description: string | null;
  checklist_code: string | null;
};

const VALID_VIEWS = new Set(["calendar", "list", "checklist"]);
const VALID_VISIT_CODES = new Set(HAS_VISITS.map((v) => v.code));

async function writableContext(expectedBabyId: string) {
  const context = await requireUserAndBaby();
  if (!context.user) redirect("/auth/login");
  if (!context.baby) redirect("/enfant/naissance");
  if (context.baby.id !== expectedBabyId)
    throw new Error(
      "L’enfant sélectionné a changé. Revenez à son carnet avant d’enregistrer.",
    );
  const role = await getUserRole(context.user, context.baby);
  if (role !== "owner" && role !== "caregiver")
    throw new Error("Ce carnet est en lecture seule.");
  return { ...context, user: context.user, baby: context.baby };
}

async function addAppointment(expectedBabyId: string, formData: FormData) {
  "use server";
  const { user, baby, supabase } = await writableContext(expectedBabyId);

  const occurredRaw = String(formData.get("occurred_at") ?? "");
  let occurred_at: string;
  if (occurredRaw) {
    const d = new Date(occurredRaw);
    if (Number.isNaN(d.getTime())) return;
    occurred_at = d.toISOString();
  } else {
    occurred_at = new Date().toISOString();
  }

  const titleRaw = String(formData.get("title") ?? "").trim();
  const title = titleRaw ? titleRaw.slice(0, 120) : null;
  const descRaw = String(formData.get("description") ?? "").trim();
  const description = descRaw ? descRaw.slice(0, 500) : null;

  await saveMutation(
    supabase.from("health_events").insert({
      baby_id: baby.id,
      user_id: user.id,
      kind: "appointment",
      occurred_at,
      title,
      description,
    }),
  );
  revalidatePath("/enfant/agenda");
}

async function deleteAppointment(expectedBabyId: string, formData: FormData) {
  "use server";
  const { baby, supabase } = await writableContext(expectedBabyId);
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await saveMutation(
    supabase.from("health_events").delete().eq("id", id).eq("baby_id", baby.id),
  );
  revalidatePath("/enfant/agenda");
}

async function markVisitDone(expectedBabyId: string, formData: FormData) {
  "use server";
  const { user, baby, supabase } = await writableContext(expectedBabyId);

  const code = String(formData.get("code") ?? "");
  if (!VALID_VISIT_CODES.has(code)) return;

  const visit = HAS_VISITS.find((v) => v.code === code)!;
  const dateRaw = String(formData.get("date") ?? calendarDate());
  const date = parseCalendarDate(dateRaw);
  if (!date || dateRaw > calendarDate() || dateRaw < baby.birth_date)
    throw new Error("Vérifiez la date réelle de l’examen.");
  const existing = await supabase
    .from("health_events")
    .select("id")
    .eq("baby_id", baby.id)
    .eq("checklist_code", code)
    .maybeSingle();
  if (existing.error) throw existing.error;
  if (existing.data)
    await saveMutation(
      supabase
        .from("health_events")
        .update({ occurred_at: date.toISOString(), title: visit.label })
        .eq("id", existing.data.id)
        .eq("baby_id", baby.id),
    );
  else
    await saveMutation(
      supabase.from("health_events").insert({
        baby_id: baby.id,
        user_id: user.id,
        kind: "appointment",
        occurred_at: date.toISOString(),
        title: visit.label,
        checklist_code: code,
      }),
    );
  revalidatePath("/enfant/agenda");
}

async function unmarkVisit(expectedBabyId: string, formData: FormData) {
  "use server";
  const { baby, supabase } = await writableContext(expectedBabyId);

  const code = String(formData.get("code") ?? "");
  if (!VALID_VISIT_CODES.has(code)) return;

  await saveMutation(
    supabase
      .from("health_events")
      .delete()
      .eq("baby_id", baby.id)
      .eq("checklist_code", code),
  );
  revalidatePath("/enfant/agenda");
}

type SearchParams = Promise<{ view?: string; month?: string }>;

export default async function AgendaPage({
  searchParams,
}: {
  searchParams?: SearchParams;
}) {
  const sp = searchParams ? await searchParams : {};
  const { user, baby, supabase } = await requireUserAndBaby();
  if (!user) redirect("/auth/login");
  if (!baby) redirect("/enfant/onboarding");
  const requestNow = new Date().getTime();

  const role = await getUserRole(user, baby);
  const canWrite = role === "owner" || role === "caregiver";

  const view = VALID_VIEWS.has(sp.view ?? "")
    ? (sp.view as "calendar" | "list" | "checklist")
    : "calendar";

  // Month nav (?month=YYYY-MM) — defaults to current month.
  // Compute time once per request so render stays deterministic.
  const nowMs = requestNow;
  const now = new Date(nowMs);
  let monthDate = new Date(now.getFullYear(), now.getMonth(), 1);
  if (sp.month && /^\d{4}-\d{2}$/.test(sp.month)) {
    const [y, m] = sp.month.split("-").map(Number);
    monthDate = new Date(y, m - 1, 1);
  }

  const { data: apptsRaw, error: appointmentsError } = await supabase
    .from("health_events")
    .select("id, occurred_at, title, description, checklist_code")
    .eq("baby_id", baby.id)
    .eq("kind", "appointment")
    .order("occurred_at", { ascending: true })
    .limit(500);

  if (appointmentsError)
    throw new Error("Votre agenda est momentanément indisponible.");
  const appts = (apptsRaw as Appointment[] | null) ?? [];
  const doneCodes = new Set(
    appts.map((a) => a.checklist_code).filter(Boolean) as string[],
  );

  const checklist = HAS_VISITS.map((v) => ({
    visit: v,
    done: doneCodes.has(v.code),
    dueDate: scheduledVisitDate(baby.birth_date, v),
    status: visitStatus(baby.birth_date, v, doneCodes.has(v.code), now),
  }));

  return (
    <ModuleShell
      slug="agenda"
      title="Agenda"
      subtitle={`${baby.name} — Rendez-vous et examens de suivi · 0–6 ans`}
      viewerBadge={role === "viewer"}
    >
      <p className="mt-note mb-5">
        Les dates sont des repères pour organiser les examens. Un examen non
        renseigné ne signifie pas qu’il n’a pas été réalisé.{" "}
        <a
          href="https://www.service-public.gouv.fr/particuliers/vosdroits/F967"
          target="_blank"
          rel="noopener noreferrer"
          className="underline"
        >
          Calendrier officiel
        </a>{" "}
        ·{" "}
        <a
          href="https://www.ameli.fr/assure/sante/themes/suivi-medical-de-l-enfant-et-de-l-adolescent/suivi-medical-entre-4-et-10-ans"
          target="_blank"
          rel="noopener noreferrer"
          className="underline"
        >
          Suivi de 4 à 6 ans
        </a>
        .
      </p>
      <ViewTabs current={view} month={monthYearStr(monthDate)} />

      {view === "calendar" && (
        <CalendarView
          monthDate={monthDate}
          now={now}
          appts={appts}
          checklist={checklist}
          onDelete={
            canWrite ? deleteAppointment.bind(null, baby.id) : undefined
          }
        />
      )}

      {view === "list" && (
        <ListView
          appts={appts}
          now={nowMs}
          onDelete={
            canWrite ? deleteAppointment.bind(null, baby.id) : undefined
          }
        />
      )}

      {view === "checklist" && (
        <ChecklistView
          checklist={checklist}
          onMark={canWrite ? markVisitDone.bind(null, baby.id) : undefined}
          onUnmark={canWrite ? unmarkVisit.bind(null, baby.id) : undefined}
        />
      )}

      {canWrite && (
        <div className="mt-8">
          <AddAppointmentForm action={addAppointment.bind(null, baby.id)} />
        </div>
      )}

      <p className="mt-10 text-center text-xs text-foreground-muted">
        Les examens du calendrier français sont calculées à partir de la date de
        naissance. Le calendrier reste indicatif — réfère-toi à ton pédiatre.
      </p>
    </ModuleShell>
  );
}

// =============================================================
// View tabs
// =============================================================
function ViewTabs({ current, month }: { current: string; month: string }) {
  const tabs = [
    { key: "calendar", label: "Calendrier", emoji: "🗓️" },
    { key: "list", label: "Liste", emoji: "📋" },
    { key: "checklist", label: "Examens de suivi", emoji: "✅" },
  ];
  return (
    <nav className="mb-6 flex gap-2">
      {tabs.map((t) => {
        const active = t.key === current;
        const params = new URLSearchParams();
        params.set("view", t.key);
        if (t.key === "calendar") params.set("month", month);
        return (
          <Link
            key={t.key}
            href={`/enfant/agenda?${params.toString()}`}
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition ${
              active
                ? "border-brand bg-brand text-white"
                : "border-border bg-surface text-foreground-muted hover:border-border-strong hover:text-foreground"
            }`}
          >
            <span aria-hidden>{t.emoji}</span>
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}

// =============================================================
// Calendar (month grid)
// =============================================================
type ChecklistEntry = {
  visit: (typeof HAS_VISITS)[number];
  done: boolean;
  dueDate: Date;
  status: HASVisitStatus;
};

function CalendarView({
  monthDate,
  now,
  appts,
  checklist,
  onDelete,
}: {
  monthDate: Date;
  now: Date;
  appts: Appointment[];
  checklist: ChecklistEntry[];
  onDelete?: (formData: FormData) => void;
}) {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();

  // First Monday displayed (grid starts Monday)
  const first = new Date(year, month, 1);
  // 0 = Sunday in JS, we want 0 = Monday
  const offset = (first.getDay() + 6) % 7;
  const gridStart = new Date(year, month, 1 - offset);

  const days: Date[] = [];
  for (let i = 0; i < 42; i++) {
    days.push(
      new Date(
        gridStart.getFullYear(),
        gridStart.getMonth(),
        gridStart.getDate() + i,
      ),
    );
  }

  // Group events by YYYY-MM-DD
  type DayEvent = {
    type: "appt" | "visit";
    label: string;
    appt?: Appointment;
    entry?: ChecklistEntry;
  };
  const byDate = new Map<string, DayEvent[]>();
  for (const a of appts) {
    const k = a.occurred_at.slice(0, 10);
    if (!byDate.has(k)) byDate.set(k, []);
    byDate.get(k)!.push({
      type: "appt",
      label: a.title ?? "RDV",
      appt: a,
    });
  }
  // Add HAS visits (only those NOT done) on their due date
  for (const e of checklist) {
    if (e.done) continue;
    const k = isoDate(e.dueDate);
    if (!byDate.has(k)) byDate.set(k, []);
    byDate.get(k)!.push({
      type: "visit",
      label: `${e.visit.emoji} ${e.visit.label}`,
      entry: e,
    });
  }

  const prev = new Date(year, month - 1, 1);
  const next = new Date(year, month + 1, 1);

  const dayLabels = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
  const todayKey = isoDate(now);

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <Link
          href={`/enfant/agenda?view=calendar&month=${monthYearStr(prev)}`}
          aria-label="Mois précédent"
          className="rounded-full border border-border bg-surface px-3 py-1.5 text-sm text-foreground-muted transition hover:text-foreground"
        >
          ← {monthLabel(prev)}
        </Link>
        <h2 className="text-lg font-semibold text-foreground capitalize">
          {monthLabel(monthDate)}
        </h2>
        <Link
          href={`/enfant/agenda?view=calendar&month=${monthYearStr(next)}`}
          aria-label="Mois suivant"
          className="rounded-full border border-border bg-surface px-3 py-1.5 text-sm text-foreground-muted transition hover:text-foreground"
        >
          {monthLabel(next)} →
        </Link>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-surface">
        <div className="grid grid-cols-7 border-b border-border bg-background">
          {dayLabels.map((d) => (
            <div
              key={d}
              className="px-2 py-2 text-center text-[11px] font-semibold uppercase tracking-wide text-foreground-muted"
            >
              {d}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7">
          {days.map((d, i) => {
            const k = isoDate(d);
            const events = byDate.get(k) ?? [];
            const isCurrentMonth = d.getMonth() === month;
            const isToday = k === todayKey;
            return (
              <div
                key={i}
                className={`min-h-[64px] min-w-0 border-b border-r border-border p-1 last-of-type:border-r-0 sm:min-h-[88px] sm:p-1.5 ${
                  i % 7 === 6 ? "border-r-0" : ""
                } ${isCurrentMonth ? "" : "bg-background/40"}`}
              >
                <div
                  className={`mb-1 inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium ${
                    isToday
                      ? "bg-brand text-white"
                      : isCurrentMonth
                        ? "text-foreground"
                        : "text-foreground-muted"
                  }`}
                >
                  {d.getDate()}
                </div>
                <ul className="space-y-1">
                  {events.slice(0, 3).map((e, idx) => (
                    <li key={idx}>
                      <span
                        className={`block truncate rounded-md px-1.5 py-0.5 text-[10px] font-medium ${
                          e.type === "visit"
                            ? "bg-warning-soft text-warning-text"
                            : "bg-brand-soft text-brand"
                        }`}
                        title={e.label}
                      >
                        {e.label}
                      </span>
                    </li>
                  ))}
                  {events.length > 3 && (
                    <li className="text-[10px] text-foreground-muted">
                      +{events.length - 3}
                    </li>
                  )}
                </ul>
              </div>
            );
          })}
        </div>
      </div>

      {/* Show appointments of current month with delete buttons */}
      <CurrentMonthAppts
        monthDate={monthDate}
        appts={appts}
        onDelete={onDelete}
      />
    </div>
  );
}

function CurrentMonthAppts({
  monthDate,
  appts,
  onDelete,
}: {
  monthDate: Date;
  appts: Appointment[];
  onDelete?: (formData: FormData) => void;
}) {
  const y = monthDate.getFullYear();
  const m = monthDate.getMonth();
  const monthAppts = appts.filter((a) => {
    const d = new Date(a.occurred_at);
    return d.getFullYear() === y && d.getMonth() === m;
  });
  if (monthAppts.length === 0) return null;
  return (
    <div className="mt-6">
      <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-foreground-muted">
        RDV du mois
      </h3>
      <ul className="space-y-2">
        {monthAppts.map((a) => (
          <ApptRow key={a.id} a={a} onDelete={onDelete} />
        ))}
      </ul>
    </div>
  );
}

// =============================================================
// List view
// =============================================================
function ListView({
  appts,
  now,
  onDelete,
}: {
  appts: Appointment[];
  now: number;
  onDelete?: (formData: FormData) => void;
}) {
  const upcoming = appts.filter(
    (a) => new Date(a.occurred_at).getTime() >= now,
  );
  const past = appts
    .filter((a) => new Date(a.occurred_at).getTime() < now)
    .reverse();

  return (
    <div className="space-y-8">
      <section>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-foreground-muted">
          À venir ({upcoming.length})
        </h3>
        {upcoming.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-border bg-surface p-6 text-center text-sm text-foreground-muted">
            Aucun RDV planifié. Ajoutes-en un ci-dessous.
          </p>
        ) : (
          <ul className="space-y-2">
            {upcoming.map((a) => (
              <ApptRow key={a.id} a={a} onDelete={onDelete} />
            ))}
          </ul>
        )}
      </section>

      <section>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-foreground-muted">
          Passés ({past.length})
        </h3>
        {past.length === 0 ? (
          <p className="text-sm text-foreground-muted">
            Pas encore d&apos;historique.
          </p>
        ) : (
          <ul className="space-y-2">
            {past.slice(0, 30).map((a) => (
              <ApptRow key={a.id} a={a} onDelete={onDelete} />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function ApptRow({
  a,
  onDelete,
}: {
  a: Appointment;
  onDelete?: (formData: FormData) => void;
}) {
  const isHAS = !!a.checklist_code;
  return (
    <li
      className={`flex items-start gap-3 rounded-xl border bg-surface px-4 py-3 shadow-sm ${
        isHAS ? "border-warning/30" : "border-border"
      }`}
    >
      <div className="text-2xl" aria-hidden>
        {isHAS ? "📋" : "👩‍⚕️"}
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-sm font-medium text-foreground">
          {a.title ?? "RDV"}
        </div>
        <div className="text-xs text-foreground-muted">
          {new Date(a.occurred_at).toLocaleString("fr-FR", {
            weekday: "short",
            day: "numeric",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>
        {a.description && (
          <p className="mt-1 text-xs text-foreground-muted">{a.description}</p>
        )}
      </div>
      {onDelete && (
        <form action={onDelete}>
          <input type="hidden" name="id" value={a.id} />
          <button
            type="submit"
            aria-label="Supprimer le RDV"
            className="text-xs text-foreground-muted hover:text-danger"
          >
            ✕
          </button>
        </form>
      )}
    </li>
  );
}

// =============================================================
// Checklist view
// =============================================================
function ChecklistView({
  checklist,
  onMark,
  onUnmark,
}: {
  checklist: ChecklistEntry[];
  onMark?: (formData: FormData) => void;
  onUnmark?: (formData: FormData) => void;
}) {
  const doneCount = checklist.filter((e) => e.done).length;
  const overdueCount = checklist.filter((e) => e.status === "overdue").length;

  const STATUS_META: Record<HASVisitStatus, { label: string; cls: string }> = {
    done: {
      label: "Fait",
      cls: "border-success/40 bg-success-soft",
    },
    overdue: {
      label: "Non renseigné",
      cls: "border-danger/40 bg-danger-soft",
    },
    due: {
      label: "À programmer",
      cls: "border-warning/40 bg-warning-soft",
    },
    upcoming: {
      label: "Plus tard",
      cls: "border-border bg-surface",
    },
  };

  return (
    <div>
      <div className="mb-6 grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3">
        <Stat label="Fait" value={`${doneCount} / ${checklist.length}`} />
        <Stat
          label="À vérifier"
          value={overdueCount.toString()}
          alert={overdueCount > 0}
        />
        <Stat
          label="À venir"
          value={checklist
            .filter((e) => !e.done && e.status !== "overdue")
            .length.toString()}
        />
      </div>

      <ul className="space-y-3">
        {checklist.map((e) => {
          const meta = STATUS_META[e.status];
          return (
            <li
              key={e.visit.code}
              className={`rounded-2xl border p-4 transition ${meta.cls}`}
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl" aria-hidden>
                  {e.visit.emoji}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline gap-2">
                    <h3 className="font-semibold text-foreground">
                      {e.visit.label}
                    </h3>
                    <span className="text-[11px] font-medium uppercase tracking-wide text-foreground-muted">
                      {meta.label}
                    </span>
                  </div>
                  <div className="mt-0.5 text-xs text-foreground-muted">
                    Prévu vers le{" "}
                    {e.dueDate.toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </div>
                  <p className="mt-2 text-sm text-foreground-muted">
                    {e.visit.exam}
                  </p>
                </div>
                <div className="shrink-0">
                  {e.done && onUnmark ? (
                    <form action={onUnmark}>
                      <input type="hidden" name="code" value={e.visit.code} />
                      <button
                        type="submit"
                        className="rounded-full border border-border bg-surface px-3 py-1.5 text-xs text-foreground-muted hover:text-foreground"
                      >
                        Annuler
                      </button>
                    </form>
                  ) : !e.done && onMark ? (
                    <form action={onMark} className="flex flex-col gap-2">
                      <input type="hidden" name="code" value={e.visit.code} />
                      <input
                        type="date"
                        name="date"
                        defaultValue={isoDate(new Date())}
                        className="rounded-md border border-border bg-surface px-2 py-1 text-xs text-foreground"
                      />
                      <button
                        type="submit"
                        className="rounded-full bg-brand px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-strong"
                      >
                        Marquer fait
                      </button>
                    </form>
                  ) : null}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function Stat({
  label,
  value,
  alert,
}: {
  label: string;
  value: string;
  alert?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border bg-surface p-4 shadow-sm ${
        alert ? "border-danger/40" : "border-border"
      }`}
    >
      <div className="text-xs font-medium uppercase tracking-wide text-foreground-muted">
        {label}
      </div>
      <div
        className={`mt-1 text-xl font-bold ${
          alert ? "text-danger" : "text-foreground"
        }`}
      >
        {value}
      </div>
    </div>
  );
}

// =============================================================
// helpers
// =============================================================
function isoDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function monthYearStr(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

function monthLabel(d: Date): string {
  return d.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
}
