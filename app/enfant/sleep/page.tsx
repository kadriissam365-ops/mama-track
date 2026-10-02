import { saveMutation } from "@/lib/enfant/mutations";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { ModuleShell } from "@/components/enfant/ModuleShell";
import { requireUserAndBaby, getUserRole } from "@/lib/enfant/baby";
import { SleepForm } from "./SleepForm";
import { StatCard } from "@/components/enfant/ui";

export const metadata = { title: "Sommeil — MamaTrack" };

type Sleep = {
  id: string;
  kind: "nap" | "night" | null;
  started_at: string;
  ended_at: string | null;
  quality: number | null;
  notes: string | null;
};

const VALID_SLEEP_KINDS = new Set(["nap", "night"]);

function parseDateOrNow(raw: string): string {
  if (!raw) return new Date().toISOString();
  const d = new Date(raw);
  return Number.isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
}

function parseOptionalDate(raw: string): string | null {
  if (!raw) return null;
  const d = new Date(raw);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

async function addSleep(formData: FormData) {
  "use server";
  const { user, baby, supabase } = await requireUserAndBaby();
  if (!user) redirect("/auth/login");
  if (!baby) redirect("/enfant/onboarding");

  const kindRaw = String(formData.get("kind") ?? "nap");
  const kind = (VALID_SLEEP_KINDS.has(kindRaw) ? kindRaw : "nap") as
    | "nap"
    | "night";

  const started_at = parseDateOrNow(String(formData.get("started_at") ?? ""));
  const ended_at = parseOptionalDate(String(formData.get("ended_at") ?? ""));

  if (ended_at && new Date(ended_at) < new Date(started_at)) throw new Error("La fin du sommeil doit être après son début.");

  const qualityRaw = formData.get("quality");
  const qualityParsed = qualityRaw ? Number(qualityRaw) : NaN;
  const quality =
    Number.isFinite(qualityParsed) && qualityParsed >= 1 && qualityParsed <= 5
      ? Math.round(qualityParsed)
      : null;

  const notes = String(formData.get("notes") ?? "").trim().slice(0, 500) || null;

  await saveMutation(supabase.from("sleeps").insert({
    baby_id: baby.id,
    user_id: user.id,
    kind,
    started_at,
    ended_at,
    quality,
    notes,
  }));
  revalidatePath("/enfant/sleep");
}

async function deleteSleep(formData: FormData) {
  "use server";
  const { user, supabase } = await requireUserAndBaby();
  if (!user) redirect("/auth/login");
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await saveMutation(supabase.from("sleeps").delete().eq("id", id).eq("user_id", user.id));
  revalidatePath("/enfant/sleep");
}

export default async function SleepPage() {
  const { user, baby, supabase } = await requireUserAndBaby();
  if (!user) redirect("/auth/login");
  if (!baby) redirect("/enfant/onboarding");

  const role = await getUserRole(user, baby);
  const canWrite = role === "owner" || role === "caregiver";

  const since = new Date();
  since.setHours(0, 0, 0, 0);
  since.setDate(since.getDate() - 2);

  const { data: sleepsRaw } = await supabase
    .from("sleeps")
    .select("id, kind, started_at, ended_at, quality, notes")
    .eq("baby_id", baby.id)
    .gte("started_at", since.toISOString())
    .order("started_at", { ascending: false })
    .limit(40);

  const list = (sleepsRaw as Sleep[] | null) ?? [];

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const today = list.filter((s) => new Date(s.started_at) >= todayStart);
  const totalMinToday = today.reduce((acc, s) => {
    if (!s.ended_at) return acc;
    return (
      acc +
      Math.max(
        0,
        Math.round(
          (new Date(s.ended_at).getTime() -
            new Date(s.started_at).getTime()) /
            60000,
        ),
      )
    );
  }, 0);

  return (
    <ModuleShell
      slug="sleep"
      title="Sommeil"
      subtitle={`${baby.name} — 48h d'historique`}
      viewerBadge={role === "viewer"}
    >
      <div className="mb-6 grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3">
        <StatCard
          icon="☀️"
          label="Siestes"
          value={today.filter((s) => s.kind === "nap").length}
          hint="aujourd'hui"
        />
        <StatCard
          icon="🌙"
          label="Nuits"
          value={today.filter((s) => s.kind === "night").length}
          hint="aujourd'hui"
        />
        <StatCard
          icon="⏱️"
          label="Total sommeil"
          value={formatDuration(totalMinToday)}
          hint="aujourd'hui"
        />
      </div>

      {canWrite && <SleepForm action={addSleep} />}

      <div className="mt-8">
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-foreground-muted">
          Journal récent
        </h2>
        {list.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-surface p-8 text-center text-sm text-foreground-muted">
            {canWrite
              ? "Aucune période de sommeil enregistrée. Ajoute ta première ci-dessus ⬆️"
              : "Aucune période de sommeil enregistrée pour le moment."}
          </div>
        ) : (
          <ul className="bt-stagger space-y-2">
            {list.map((s) => (
              <SleepRow
                key={s.id}
                sleep={s}
                onDelete={canWrite ? deleteSleep : undefined}
              />
            ))}
          </ul>
        )}
      </div>
    </ModuleShell>
  );
}

function SleepRow({
  sleep,
  onDelete,
}: {
  sleep: Sleep;
  onDelete?: (formData: FormData) => void;
}) {
  const start = new Date(sleep.started_at);
  const end = sleep.ended_at ? new Date(sleep.ended_at) : null;
  const durationMin = end
    ? Math.max(0, Math.round((end.getTime() - start.getTime()) / 60000))
    : null;

  const icon = sleep.kind === "night" ? "🌙" : "☀️";
  const kindLabel = sleep.kind === "night" ? "Nuit" : "Sieste";

  return (
    <li className="flex items-center gap-3 rounded-xl border border-border bg-surface px-4 py-3 shadow-sm transition hover:border-border-strong">
      <div aria-hidden className="text-2xl">{icon}</div>
      <div className="min-w-0 flex-1">
        <div className="text-sm font-medium text-foreground">
          {kindLabel}
          {durationMin !== null && ` — ${formatDuration(durationMin)}`}
          {sleep.quality && <span className="ml-2 text-warning" aria-label={`Qualité ${sleep.quality} sur 5`}>{"⭐".repeat(sleep.quality)}</span>}
        </div>
        <div className="truncate text-xs text-foreground-muted">
          {formatDayTime(start)}
          {end && ` → ${end.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}`}
          {sleep.notes && ` · ${sleep.notes}`}
        </div>
      </div>
      {onDelete && (
        <form action={onDelete}>
          <input type="hidden" name="id" value={sleep.id} />
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

function formatDuration(min: number): string {
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m === 0 ? `${h}h` : `${h}h${String(m).padStart(2, "0")}`;
}

function formatDayTime(d: Date): string {
  const now = new Date();
  const isToday =
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday =
    d.getFullYear() === yesterday.getFullYear() &&
    d.getMonth() === yesterday.getMonth() &&
    d.getDate() === yesterday.getDate();
  const prefix = isToday ? "Aujourd'hui" : isYesterday ? "Hier" : d.toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short" });
  return `${prefix} · ${d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}`;
}
