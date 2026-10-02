import { saveMutation } from "@/lib/enfant/mutations";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { ModuleShell } from "@/components/enfant/ModuleShell";
import { requireUserAndBaby, getUserRole } from "@/lib/enfant/baby";
import { DiaperForm } from "./DiaperForm";
import { Alert, StatCard } from "@/components/enfant/ui";

export const metadata = { title: "Couches — MamaTrack" };

type DiaperKind = "wet" | "dirty" | "mixed" | "dry";
const DIAPER_KINDS: readonly DiaperKind[] = ["wet", "dirty", "mixed", "dry"];
const DIAPER_CONSISTENCIES = ["soft", "liquid", "hard", "seedy"] as const;
const DIAPER_COLORS = [
  "yellow",
  "brown",
  "green",
  "black",
  "red",
  "white",
] as const;

type Diaper = {
  id: string;
  kind: DiaperKind;
  changed_at: string;
  consistency: string | null;
  color: string | null;
  notes: string | null;
};

async function addDiaper(formData: FormData) {
  "use server";
  const { user, baby, supabase } = await requireUserAndBaby();
  if (!user) redirect("/auth/login");
  if (!baby) redirect("/enfant/onboarding");

  const kindRaw = String(formData.get("kind") ?? "wet");
  const kind: DiaperKind = (DIAPER_KINDS as readonly string[]).includes(kindRaw)
    ? (kindRaw as DiaperKind)
    : "wet";

  const changed_at_raw = String(formData.get("changed_at") ?? "");
  let changed_at = new Date().toISOString();
  if (changed_at_raw) {
    const d = new Date(changed_at_raw);
    if (!Number.isNaN(d.getTime())) changed_at = d.toISOString();
  }

  const consistencyRaw = String(formData.get("consistency") ?? "").trim();
  const consistency = (DIAPER_CONSISTENCIES as readonly string[]).includes(
    consistencyRaw,
  )
    ? consistencyRaw
    : null;

  const colorRaw = String(formData.get("color") ?? "").trim();
  const color = (DIAPER_COLORS as readonly string[]).includes(colorRaw)
    ? colorRaw
    : null;

  const notesRaw = String(formData.get("notes") ?? "").trim();
  const notes = notesRaw ? notesRaw.slice(0, 300) : null;

  await saveMutation(supabase.from("diapers").insert({
    baby_id: baby.id,
    user_id: user.id,
    kind,
    changed_at,
    consistency,
    color,
    notes,
  }));
  revalidatePath("/enfant/diapers");
}

async function deleteDiaper(formData: FormData) {
  "use server";
  const { user, supabase } = await requireUserAndBaby();
  if (!user) redirect("/auth/login");
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await saveMutation(supabase.from("diapers").delete().eq("id", id).eq("user_id", user.id));
  revalidatePath("/enfant/diapers");
}

export default async function DiapersPage() {
  const { user, baby, supabase } = await requireUserAndBaby();
  if (!user) redirect("/auth/login");
  if (!baby) redirect("/enfant/onboarding");

  const role = await getUserRole(user, baby);
  const canWrite = role === "owner" || role === "caregiver";

  const since = new Date();
  since.setHours(0, 0, 0, 0);
  since.setDate(since.getDate() - 2);

  const { data: diapersRaw } = await supabase
    .from("diapers")
    .select("id, kind, changed_at, consistency, color, notes")
    .eq("baby_id", baby.id)
    .gte("changed_at", since.toISOString())
    .order("changed_at", { ascending: false })
    .limit(60);

  const list = (diapersRaw as Diaper[] | null) ?? [];

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const today = list.filter((d) => new Date(d.changed_at) >= todayStart);
  const wetToday = today.filter(
    (d) => d.kind === "wet" || d.kind === "mixed",
  ).length;
  const dirtyToday = today.filter(
    (d) => d.kind === "dirty" || d.kind === "mixed",
  ).length;

  const hasAlert = list.some(
    (d) => d.color === "black" || d.color === "red" || d.color === "white",
  );

  return (
    <ModuleShell
      slug="diapers"
      title="Couches"
      subtitle={`${baby.name} — 48h d'historique`}
      viewerBadge={role === "viewer"}
    >
      <div className="mb-6 grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3">
        <StatCard icon="👶" label="Total" value={today.length} hint="aujourd'hui" />
        <StatCard icon="💧" label="Pipi" value={wetToday} hint="aujourd'hui" />
        <StatCard icon="💩" label="Caca" value={dirtyToday} hint="aujourd'hui" />
      </div>

      {hasAlert && (
        <Alert tone="warning" className="mb-6" title="Couleur inhabituelle détectée">
          (noir / rouge / blanc). Consulte ton pédiatre si ça persiste plus de
          24 h.
        </Alert>
      )}

      {canWrite && <DiaperForm action={addDiaper} />}

      <div className="mt-8">
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-foreground-muted">
          Journal récent
        </h2>
        {list.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-surface p-8 text-center text-sm text-foreground-muted">
            {canWrite
              ? "Aucun change enregistré sur les dernières 48 h. Ajoute le premier ci-dessus ⬆️"
              : "Aucun change enregistré sur les dernières 48 h."}
          </div>
        ) : (
          <ul className="bt-stagger space-y-2">
            {list.map((d) => (
              <DiaperRow
                key={d.id}
                diaper={d}
                onDelete={canWrite ? deleteDiaper : undefined}
              />
            ))}
          </ul>
        )}
      </div>
    </ModuleShell>
  );
}

function DiaperRow({
  diaper,
  onDelete,
}: {
  diaper: Diaper;
  onDelete?: (formData: FormData) => void;
}) {
  const date = new Date(diaper.changed_at);
  const kindEmoji =
    diaper.kind === "wet"
      ? "💧"
      : diaper.kind === "dirty"
        ? "💩"
        : diaper.kind === "mixed"
          ? "🔀"
          : "🌬️";
  const kindLabel =
    diaper.kind === "wet"
      ? "Pipi"
      : diaper.kind === "dirty"
        ? "Caca"
        : diaper.kind === "mixed"
          ? "Pipi + caca"
          : "Sèche";

  return (
    <li className="flex items-center gap-3 rounded-xl border border-border bg-surface px-4 py-3 shadow-sm transition hover:border-border-strong">
      <div aria-hidden className="text-2xl">{kindEmoji}</div>
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-medium text-foreground">
          {kindLabel}
          {diaper.color && ` · ${colorLabel(diaper.color)}`}
        </div>
        <div className="truncate text-xs text-foreground-muted">
          {formatDayTime(date)}
          {diaper.consistency && ` · ${consistencyLabel(diaper.consistency)}`}
          {diaper.notes && ` · ${diaper.notes}`}
        </div>
      </div>
      {onDelete && (
        <form action={onDelete}>
          <input type="hidden" name="id" value={diaper.id} />
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

function colorLabel(c: string) {
  const map: Record<string, string> = {
    yellow: "jaune",
    brown: "marron",
    green: "vert",
    black: "noir ⚠️",
    red: "rouge ⚠️",
    white: "blanc ⚠️",
  };
  return map[c] ?? c;
}

function consistencyLabel(c: string) {
  const map: Record<string, string> = {
    soft: "mou",
    liquid: "liquide",
    hard: "dur",
    seedy: "grainueux",
  };
  return map[c] ?? c;
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
  const prefix = isToday
    ? "Aujourd'hui"
    : isYesterday
      ? "Hier"
      : d.toLocaleDateString("fr-FR", {
          weekday: "short",
          day: "numeric",
          month: "short",
        });
  return `${prefix} · ${d.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  })}`;
}
