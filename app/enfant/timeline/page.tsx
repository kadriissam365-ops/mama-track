import Link from "next/link";
import { redirect } from "next/navigation";
import { ModuleShell } from "@/components/enfant/ModuleShell";
import { requireUserAndBaby } from "@/lib/enfant/baby";
import { requirePremium } from "@/lib/enfant/subscription";

export const metadata = { title: "Frise chronologique — MamaTrack" };

type TimelineCategory =
  | "feed"
  | "sleep"
  | "diaper"
  | "growth"
  | "milestone"
  | "diary"
  | "health";

type TimelineItem = {
  id: string;
  cat: TimelineCategory;
  at: string; // ISO
  title: string;
  detail?: string;
  emoji: string;
  href?: string;
};

const VALID_CATS = new Set<TimelineCategory>([
  "feed",
  "sleep",
  "diaper",
  "growth",
  "milestone",
  "diary",
  "health",
]);

const RANGE_DAYS: Record<string, number> = {
  "30": 30,
  "90": 90,
  "180": 180,
  "365": 365,
};

const CAT_META: Record<TimelineCategory, { label: string; emoji: string; href: string }> = {
  feed: { label: "Alim", emoji: "🍼", href: "/enfant/feed" },
  sleep: { label: "Sommeil", emoji: "😴", href: "/enfant/sleep" },
  diaper: { label: "Couches", emoji: "💩", href: "/enfant/diapers" },
  growth: { label: "Croissance", emoji: "📏", href: "/enfant/growth" },
  milestone: { label: "Étapes", emoji: "🏆", href: "/enfant/milestones" },
  diary: { label: "Journal", emoji: "📸", href: "/enfant/diary" },
  health: { label: "Santé", emoji: "🌡️", href: "/enfant/health" },
};

type SearchParams = Promise<{ cat?: string; range?: string }>;

export default async function TimelinePage({
  searchParams,
}: {
  searchParams?: SearchParams;
}) {
  const sp = searchParams ? await searchParams : {};
  const { user, baby, supabase } = await requireUserAndBaby();
  if (!user) redirect("/auth/login");
  if (!baby) redirect("/enfant/onboarding");
  await requirePremium("timeline");

  const range = RANGE_DAYS[sp.range ?? "90"] ?? 90;
  const activeCats: TimelineCategory[] = (() => {
    if (!sp.cat || sp.cat === "all") return Array.from(VALID_CATS);
    const requested = sp.cat
      .split(",")
      .map((c) => c.trim())
      .filter((c): c is TimelineCategory => VALID_CATS.has(c as TimelineCategory));
    return requested.length ? requested : Array.from(VALID_CATS);
  })();

  const now = new Date();
  const sinceMs = now.getTime() - range * 24 * 60 * 60 * 1000;
  const sinceIso = new Date(sinceMs).toISOString();
  const sinceDate = new Date(sinceMs).toISOString().slice(0, 10);
  const todayDate = now.toISOString().slice(0, 10);
  const yesterdayDate = new Date(now.getTime() - 86400_000)
    .toISOString()
    .slice(0, 10);

  const items: TimelineItem[] = [];
  const queries: PromiseLike<unknown>[] = [];

  if (activeCats.includes("feed")) {
    queries.push(
      supabase
        .from("feedings")
        .select("id, kind, started_at, amount_ml, food, side")
        .eq("baby_id", baby.id)
        .gte("started_at", sinceIso)
        .order("started_at", { ascending: false })
        .limit(150)
        .then(({ data }) => {
          for (const f of (data ?? []) as {
            id: string;
            kind: string;
            started_at: string;
            amount_ml: number | null;
            food: string | null;
            side: string | null;
          }[]) {
            const title =
              f.kind === "bottle"
                ? `Biberon ${f.amount_ml ? `${f.amount_ml} ml` : ""}`.trim()
                : f.kind === "breast"
                  ? `Tétée${f.side ? ` (${f.side === "left" ? "G" : f.side === "right" ? "D" : "G+D"})` : ""}`
                  : f.kind === "solid"
                    ? `Solide${f.food ? ` — ${f.food}` : ""}`
                    : "Eau";
            items.push({
              id: f.id,
              cat: "feed",
              at: f.started_at,
              title,
              emoji: "🍼",
              href: "/enfant/feed",
            });
          }
        }),
    );
  }

  if (activeCats.includes("sleep")) {
    queries.push(
      supabase
        .from("sleeps")
        .select("id, kind, started_at, ended_at")
        .eq("baby_id", baby.id)
        .gte("started_at", sinceIso)
        .order("started_at", { ascending: false })
        .limit(150)
        .then(({ data }) => {
          for (const s of (data ?? []) as {
            id: string;
            kind: string | null;
            started_at: string;
            ended_at: string | null;
          }[]) {
            const min = s.ended_at
              ? Math.round(
                  (new Date(s.ended_at).getTime() -
                    new Date(s.started_at).getTime()) /
                    60000,
                )
              : null;
            items.push({
              id: s.id,
              cat: "sleep",
              at: s.started_at,
              title: `${s.kind === "night" ? "Nuit" : "Sieste"}${min !== null ? ` — ${formatMin(min)}` : " (en cours)"}`,
              emoji: "😴",
              href: "/enfant/sleep",
            });
          }
        }),
    );
  }

  if (activeCats.includes("diaper")) {
    queries.push(
      supabase
        .from("diapers")
        .select("id, kind, changed_at")
        .eq("baby_id", baby.id)
        .gte("changed_at", sinceIso)
        .order("changed_at", { ascending: false })
        .limit(150)
        .then(({ data }) => {
          const labels: Record<string, string> = {
            wet: "Mouillée",
            dirty: "Sale",
            mixed: "Mixte",
            dry: "Sèche",
          };
          for (const d of (data ?? []) as {
            id: string;
            kind: string;
            changed_at: string;
          }[]) {
            items.push({
              id: d.id,
              cat: "diaper",
              at: d.changed_at,
              title: labels[d.kind] ?? "Couche",
              emoji: "💩",
              href: "/enfant/diapers",
            });
          }
        }),
    );
  }

  if (activeCats.includes("growth")) {
    queries.push(
      supabase
        .from("measurements")
        .select("id, measured_at, weight_g, height_cm, head_cm")
        .eq("baby_id", baby.id)
        .gte("measured_at", sinceDate)
        .order("measured_at", { ascending: false })
        .limit(50)
        .then(({ data }) => {
          for (const m of (data ?? []) as {
            id: string;
            measured_at: string;
            weight_g: number | null;
            height_cm: number | null;
            head_cm: number | null;
          }[]) {
            const parts: string[] = [];
            if (m.weight_g) parts.push(`${(m.weight_g / 1000).toFixed(2)} kg`);
            if (m.height_cm) parts.push(`${m.height_cm} cm`);
            if (m.head_cm) parts.push(`PC ${m.head_cm} cm`);
            items.push({
              id: m.id,
              cat: "growth",
              at: `${m.measured_at}T12:00:00Z`,
              title: "Mesure",
              detail: parts.join(" · "),
              emoji: "📏",
              href: "/enfant/growth",
            });
          }
        }),
    );
  }

  if (activeCats.includes("milestone")) {
    queries.push(
      supabase
        .from("milestones")
        .select("id, label, code, achieved_at")
        .eq("baby_id", baby.id)
        .gte("achieved_at", sinceDate)
        .order("achieved_at", { ascending: false })
        .limit(50)
        .then(({ data }) => {
          for (const ms of (data ?? []) as {
            id: string;
            label: string | null;
            code: string;
            achieved_at: string;
          }[]) {
            items.push({
              id: ms.id,
              cat: "milestone",
              at: `${ms.achieved_at}T12:00:00Z`,
              title: ms.label ?? ms.code,
              emoji: "🏆",
              href: "/enfant/milestones",
            });
          }
        }),
    );
  }

  if (activeCats.includes("diary")) {
    queries.push(
      supabase
        .from("diary_entries")
        .select("id, title, body, photo_url, entry_date")
        .eq("baby_id", baby.id)
        .gte("entry_date", sinceDate)
        .order("entry_date", { ascending: false })
        .limit(50)
        .then(({ data }) => {
          for (const d of (data ?? []) as {
            id: string;
            title: string | null;
            body: string | null;
            photo_url: string | null;
            entry_date: string;
          }[]) {
            items.push({
              id: d.id,
              cat: "diary",
              at: `${d.entry_date}T12:00:00Z`,
              title: d.title ?? "Journal",
              detail:
                (d.body ?? "").slice(0, 120) + (d.photo_url ? " · 📷" : ""),
              emoji: "📸",
              href: "/enfant/diary",
            });
          }
        }),
    );
  }

  if (activeCats.includes("health")) {
    queries.push(
      supabase
        .from("health_events")
        .select("id, kind, occurred_at, title, temperature_c, medicine_name, dose")
        .eq("baby_id", baby.id)
        .gte("occurred_at", sinceIso)
        .order("occurred_at", { ascending: false })
        .limit(80)
        .then(({ data }) => {
          for (const h of (data ?? []) as {
            id: string;
            kind: string;
            occurred_at: string;
            title: string | null;
            temperature_c: number | null;
            medicine_name: string | null;
            dose: string | null;
          }[]) {
            const titles: Record<string, string> = {
              fever: `Fièvre${h.temperature_c ? ` ${h.temperature_c} °C` : ""}`,
              medicine: `Médicament${h.medicine_name ? ` — ${h.medicine_name}` : ""}${h.dose ? ` (${h.dose})` : ""}`,
              appointment: h.title ?? "RDV",
              symptom: h.title ?? "Symptôme",
              other: h.title ?? "Note santé",
            };
            items.push({
              id: h.id,
              cat: "health",
              at: h.occurred_at,
              title: titles[h.kind] ?? "Note santé",
              emoji: "🌡️",
              href: h.kind === "appointment" ? "/enfant/agenda" : "/enfant/health",
            });
          }
        }),
    );
  }

  await Promise.all(queries);
  items.sort((a, b) => (a.at < b.at ? 1 : -1));

  // Group by day (FR locale)
  const groups = new Map<string, TimelineItem[]>();
  for (const it of items) {
    const day = new Date(it.at).toISOString().slice(0, 10);
    if (!groups.has(day)) groups.set(day, []);
    groups.get(day)!.push(it);
  }
  const groupedDays = Array.from(groups.entries());

  return (
    <ModuleShell
      slug="timeline"
      title="Timeline"
      subtitle={`${baby.name} — historique combiné`}
    >
      <Filters activeCats={activeCats} range={range.toString()} />

      {items.length === 0 ? (
        <p className="mt-8 rounded-2xl border border-dashed border-border bg-surface p-8 text-center text-sm text-foreground-muted">
          Aucun événement sur cette période. Élargis la fenêtre ou
          décoche/coche d&apos;autres catégories.
        </p>
      ) : (
        <div className="mt-6 space-y-8">
          {groupedDays.map(([day, dayItems]) => (
            <DayBlock
              key={day}
              day={day}
              items={dayItems}
              todayDate={todayDate}
              yesterdayDate={yesterdayDate}
            />
          ))}
        </div>
      )}

      <p className="mt-10 text-center text-xs text-foreground-muted">
        {items.length} événement{items.length > 1 ? "s" : ""} sur les {range}{" "}
        derniers jours.
      </p>
    </ModuleShell>
  );
}

function Filters({
  activeCats,
  range,
}: {
  activeCats: TimelineCategory[];
  range: string;
}) {
  const allCats = Array.from(VALID_CATS);
  const allActive = activeCats.length === allCats.length;
  const buildCatHref = (cat: TimelineCategory | "all") => {
    if (cat === "all") return `/enfant/timeline?range=${range}`;
    const next = allActive
      ? [cat]
      : activeCats.includes(cat)
        ? activeCats.filter((c) => c !== cat)
        : [...activeCats, cat];
    if (next.length === 0 || next.length === allCats.length) {
      return `/enfant/timeline?range=${range}`;
    }
    return `/enfant/timeline?cat=${next.join(",")}&range=${range}`;
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        <Link
          href={buildCatHref("all")}
          className={`rounded-full border px-3 py-1 text-xs transition ${
            allActive
              ? "border-brand bg-brand text-white"
              : "border-border bg-surface text-foreground-muted hover:text-foreground"
          }`}
        >
          Tout
        </Link>
        {allCats.map((c) => {
          const active = !allActive && activeCats.includes(c);
          return (
            <Link
              key={c}
              href={buildCatHref(c)}
              className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs transition ${
                active
                  ? "border-brand bg-brand text-white"
                  : "border-border bg-surface text-foreground-muted hover:text-foreground"
              }`}
            >
              <span aria-hidden>{CAT_META[c].emoji}</span>
              {CAT_META[c].label}
            </Link>
          );
        })}
      </div>
      <div className="flex flex-wrap gap-2">
        {Object.entries(RANGE_DAYS).map(([key, days]) => {
          const active = key === range;
          const params = new URLSearchParams();
          if (!allActive) params.set("cat", activeCats.join(","));
          params.set("range", key);
          return (
            <Link
              key={key}
              href={`/enfant/timeline?${params.toString()}`}
              className={`rounded-full border px-3 py-1 text-xs transition ${
                active
                  ? "border-brand bg-brand text-white"
                  : "border-border bg-surface text-foreground-muted hover:text-foreground"
              }`}
            >
              {days < 365 ? `${days} jours` : "1 an"}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function DayBlock({
  day,
  items,
  todayDate,
  yesterdayDate,
}: {
  day: string;
  items: TimelineItem[];
  todayDate: string;
  yesterdayDate: string;
}) {
  const d = new Date(`${day}T12:00:00Z`);
  const today = todayDate === day;
  const yesterday = yesterdayDate === day;
  const label = today
    ? "Aujourd'hui"
    : yesterday
      ? "Hier"
      : d.toLocaleDateString("fr-FR", {
          weekday: "long",
          day: "numeric",
          month: "long",
        });

  return (
    <section>
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-foreground-muted">
        {label}{" "}
        <span className="ml-2 text-[11px] font-normal normal-case text-foreground-muted/70">
          {items.length} événement{items.length > 1 ? "s" : ""}
        </span>
      </h3>
      <ul className="space-y-2">
        {items.map((it) => (
          <li
            key={`${it.cat}-${it.id}`}
            className="flex items-start gap-3 rounded-xl border border-border bg-surface px-4 py-3"
          >
            <div className="text-xl" aria-hidden>
              {it.emoji}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-baseline gap-2">
                <Link
                  href={it.href ?? CAT_META[it.cat].href}
                  className="text-sm font-medium text-foreground hover:text-brand"
                >
                  {it.title}
                </Link>
                <span className="text-[11px] text-foreground-muted">
                  {new Date(it.at).toLocaleTimeString("fr-FR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
                <span className="rounded bg-background px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-foreground-muted">
                  {CAT_META[it.cat].label}
                </span>
              </div>
              {it.detail && (
                <p className="mt-0.5 truncate text-xs text-foreground-muted">
                  {it.detail}
                </p>
              )}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

function formatMin(min: number): string {
  if (min <= 0) return "0 min";
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h} h`;
  return `${h} h ${String(m).padStart(2, "0")}`;
}
