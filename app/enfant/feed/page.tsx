import { saveMutation } from "@/lib/enfant/mutations";
import { redirect } from "next/navigation";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import { ModuleShell } from "@/components/enfant/ModuleShell";
import { requireUserAndBaby, getUserRole } from "@/lib/enfant/baby";
import { FeedForm } from "./FeedForm";

export const metadata = { title: "Repas — MamaTrack" };

type Feeding = {
  id: string;
  kind: "bottle" | "breast" | "solid" | "water";
  started_at: string;
  ended_at: string | null;
  amount_ml: number | null;
  side: "left" | "right" | "both" | null;
  food: string | null;
  notes: string | null;
};

const VALID_KINDS = new Set<Feeding["kind"]>(["bottle", "breast", "solid", "water"]);
const VALID_SIDES = new Set(["left", "right", "both"]);

function parseDateISO(raw: string): string | null {
  const d = new Date(raw);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

async function addFeeding(formData: FormData) {
  "use server";
  const { user, baby, supabase } = await requireUserAndBaby();
  if (!user) redirect("/auth/login");
  if (!baby) redirect("/enfant/onboarding");

  const kindRaw = String(formData.get("kind") ?? "bottle");
  const kind = (VALID_KINDS.has(kindRaw as Feeding["kind"])
    ? kindRaw
    : "bottle") as Feeding["kind"];

  const started_at_raw = String(formData.get("started_at") ?? "");
  const started_at =
    (started_at_raw && parseDateISO(started_at_raw)) ??
    new Date().toISOString();

  const amountRaw = formData.get("amount_ml");
  const amountParsed = amountRaw ? Number(amountRaw) : NaN;
  const amount_ml =
    Number.isFinite(amountParsed) && amountParsed >= 0 && amountParsed <= 2000
      ? Math.round(amountParsed)
      : null;

  const sideRaw = String(formData.get("side") ?? "").trim();
  const side = (VALID_SIDES.has(sideRaw)
    ? sideRaw
    : null) as Feeding["side"];

  const food = String(formData.get("food") ?? "").trim().slice(0, 120) || null;
  const notes = String(formData.get("notes") ?? "").trim().slice(0, 500) || null;

  await saveMutation(supabase.from("feedings").insert({
    baby_id: baby.id,
    user_id: user.id,
    kind,
    started_at,
    amount_ml,
    side,
    food,
    notes,
  }));
  revalidatePath("/enfant/feed");
}

async function deleteFeeding(formData: FormData) {
  "use server";
  const { user, supabase } = await requireUserAndBaby();
  if (!user) redirect("/auth/login");
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await saveMutation(supabase.from("feedings").delete().eq("id", id).eq("user_id", user.id));
  revalidatePath("/enfant/feed");
}

export default async function FeedPage() {
  const { user, baby, supabase } = await requireUserAndBaby();
  if (!user) redirect("/auth/login");
  if (!baby) redirect("/enfant/onboarding");

  const role = await getUserRole(user, baby);
  const canWrite = role === "owner" || role === "caregiver";

  const since = new Date();
  since.setHours(0, 0, 0, 0);
  since.setDate(since.getDate() - 2);

  const { data: feedings } = await supabase
    .from("feedings")
    .select("id, kind, started_at, ended_at, amount_ml, side, food, notes")
    .eq("baby_id", baby.id)
    .gte("started_at", since.toISOString())
    .order("started_at", { ascending: false })
    .limit(60);

  const list = (feedings as Feeding[] | null) ?? [];

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const today = list.filter((f) => new Date(f.started_at) >= todayStart);

  const bottlesToday = today.filter((f) => f.kind === "bottle");
  const totalMlToday = bottlesToday.reduce(
    (s, f) => s + (f.amount_ml ?? 0),
    0,
  );
  const breastsToday = today.filter((f) => f.kind === "breast").length;
  const solidsToday = today.filter((f) => f.kind === "solid").length;

  return (
    <ModuleShell
      slug="feed"
      title="Alim & biberons"
      subtitle={`${baby.name} — journal des 48 dernières heures`}
      viewerBadge={role === "viewer"}
    >
      <div className="mb-6 grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3">
        <StatCard
          label="Biberons"
          value={bottlesToday.length.toString()}
          sub={totalMlToday > 0 ? `${totalMlToday} ml` : "aujourd'hui"}
        />
        <StatCard
          label="Tétées"
          value={breastsToday.toString()}
          sub="aujourd'hui"
        />
        <StatCard
          label="Solides"
          value={solidsToday.toString()}
          sub="aujourd'hui"
        />
      </div>

      {canWrite && <FeedForm action={addFeeding} />}

      <div className="mt-8">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-foreground-muted">
          Journal récent
        </h2>
        {list.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border-strong bg-surface p-8 text-center text-sm text-foreground-muted">
            {canWrite
              ? "Aucun repas enregistré. Ajoute ton premier ci-dessus ⬆️"
              : "Aucun repas enregistré pour le moment."}
          </div>
        ) : (
          <ul className="space-y-2 bt-stagger">
            {list.map((f) => (
              <FeedingRow
                key={f.id}
                feeding={f}
                onDelete={canWrite ? deleteFeeding : undefined}
              />
            ))}
          </ul>
        )}
      </div>

      <div className="mt-8 text-center">
        <Link
          href="/enfant/dashboard"
          className="text-sm text-foreground-muted transition hover:text-foreground"
        >
          ← Retour au dashboard
        </Link>
      </div>
    </ModuleShell>
  );
}

function StatCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-4 shadow-sm">
      <div className="text-xs font-medium uppercase tracking-wide text-foreground-muted">
        {label}
      </div>
      <div className="mt-1 text-2xl font-bold text-foreground">{value}</div>
      {sub && <div className="text-xs text-foreground-muted">{sub}</div>}
    </div>
  );
}

function FeedingRow({
  feeding,
  onDelete,
}: {
  feeding: Feeding;
  onDelete?: (formData: FormData) => void;
}) {
  const date = new Date(feeding.started_at);
  const timeStr = date.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const dayStr = isToday(date)
    ? "Aujourd'hui"
    : isYesterday(date)
      ? "Hier"
      : date.toLocaleDateString("fr-FR", {
          weekday: "short",
          day: "numeric",
          month: "short",
        });

  const icon =
    feeding.kind === "bottle"
      ? "🍼"
      : feeding.kind === "breast"
        ? "🤱"
        : feeding.kind === "solid"
          ? "🥣"
          : "💧";

  const title =
    feeding.kind === "bottle"
      ? `Biberon${feeding.amount_ml ? ` — ${feeding.amount_ml} ml` : ""}`
      : feeding.kind === "breast"
        ? `Tétée${feeding.side ? ` — ${sideLabel(feeding.side)}` : ""}`
        : feeding.kind === "solid"
          ? `Repas${feeding.food ? ` — ${feeding.food}` : ""}`
          : "Eau";

  return (
    <li className="flex items-center gap-3 rounded-2xl border border-border bg-surface px-4 py-3 shadow-sm transition hover:border-border-strong">
      <div className="text-2xl">{icon}</div>
      <div className="flex-1">
        <div className="text-sm font-medium text-foreground">{title}</div>
        <div className="text-xs text-foreground-muted">
          {dayStr} · {timeStr}
          {feeding.notes && ` · ${feeding.notes}`}
        </div>
      </div>
      {onDelete && (
        <form action={onDelete}>
          <input type="hidden" name="id" value={feeding.id} />
          <button
            type="submit"
            className="text-xs text-foreground-muted opacity-70 transition hover:text-danger hover:opacity-100"
            aria-label="Supprimer"
          >
            ✕
          </button>
        </form>
      )}
    </li>
  );
}

function isToday(d: Date) {
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

function isYesterday(d: Date) {
  const now = new Date();
  now.setDate(now.getDate() - 1);
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

function sideLabel(side: "left" | "right" | "both") {
  return side === "left" ? "sein gauche" : side === "right" ? "sein droit" : "deux seins";
}
