import {
  calendarDate,
  childAgeMonths,
  childAgeLabel,
  parseCalendarDate,
} from "@/lib/family-journey";
import { saveMutation } from "@/lib/enfant/mutations";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { ModuleShell } from "@/components/enfant/ModuleShell";
import { requireUserAndBaby, getUserRole } from "@/lib/enfant/baby";
import { MILESTONES, type Milestone } from "@/lib/enfant/milestones-data";
import { Alert, StatCard } from "@/components/enfant/ui";

export const metadata = { title: "Étapes clés — MamaTrack" };

type MilestoneGiven = {
  id: string;
  code: string;
  label: string | null;
  achieved_at: string;
  notes: string | null;
  photo_url: string | null;
};

const VALID_MILESTONE_CODES = new Set<string>(MILESTONES.map((m) => m.slug));

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

async function markMilestone(expectedBabyId: string, formData: FormData) {
  "use server";
  const { user, baby, supabase } = await writableContext(expectedBabyId);

  const code = String(formData.get("code") ?? "");
  if (!code || !VALID_MILESTONE_CODES.has(code)) return;

  const label = MILESTONES.find((m) => m.slug === code)!.label;
  const achieved_at = String(formData.get("achieved_at") ?? "");
  if (
    !parseCalendarDate(achieved_at) ||
    achieved_at > calendarDate() ||
    achieved_at < baby.birth_date
  )
    throw new Error(
      "Renseignez la date réelle, entre sa naissance et aujourd’hui.",
    );

  const notesRaw = String(formData.get("notes") ?? "").trim();
  const notes = notesRaw ? notesRaw.slice(0, 500) : null;

  await saveMutation(
    supabase.from("milestones").insert({
      baby_id: baby.id,
      user_id: user.id,
      code,
      label,
      achieved_at,
      notes,
    }),
  );
  revalidatePath("/enfant/milestones");
}

async function deleteMilestone(expectedBabyId: string, formData: FormData) {
  "use server";
  const { baby, supabase } = await writableContext(expectedBabyId);
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await saveMutation(
    supabase.from("milestones").delete().eq("id", id).eq("baby_id", baby.id),
  );
  revalidatePath("/enfant/milestones");
}

export default async function MilestonesPage() {
  const { user, baby, supabase } = await requireUserAndBaby();
  if (!user) redirect("/auth/login");
  if (!baby) redirect("/enfant/onboarding");

  const role = await getUserRole(user, baby);
  const canWrite = role === "owner" || role === "caregiver";

  const { data: givenRaw } = await supabase
    .from("milestones")
    .select("id, code, label, achieved_at, notes, photo_url")
    .eq("baby_id", baby.id)
    .order("achieved_at", { ascending: false });

  const given = (givenRaw as MilestoneGiven[] | null) ?? [];
  const doneCodes = new Map(given.map((g) => [g.code, g]));

  const ageMonths = childAgeMonths(baby.birth_date);

  const byCategory: Record<string, Milestone[]> = {
    motor: [],
    language: [],
    social: [],
    cognitive: [],
  };
  for (const m of MILESTONES.filter((m) =>
    ageMonths >= 36
      ? m.typicalAgeMonths >= 36 || doneCodes.has(m.slug)
      : m.typicalAgeMonths < 36,
  ))
    byCategory[m.category].push(m);

  const done = given.length;

  const todayStr = calendarDate();

  return (
    <ModuleShell
      slug="milestones"
      title="Ses petites fiertés"
      subtitle={`${baby.name} — étapes clés du développement`}
      viewerBadge={role === "viewer"}
    >
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard icon="🏆" label="Franchies" value={String(done)} />
        <StatCard
          icon="📅"
          label="Âge"
          value={childAgeLabel(baby.birth_date)}
        />
        <StatCard
          icon="🤸"
          label="Moteur"
          value={`${given.filter((g) => MILESTONES.find((m) => m.slug === g.code)?.category === "motor").length}`}
        />
        <StatCard
          icon="🗣️"
          label="Langage"
          value={`${given.filter((g) => MILESTONES.find((m) => m.slug === g.code)?.category === "language").length}`}
        />
      </div>

      <div className="space-y-6">
        {(
          [
            { key: "motor", label: "🤸 Motricité" },
            { key: "language", label: "🗣️ Langage" },
            { key: "social", label: "😊 Social" },
            { key: "cognitive", label: "💡 Cognitif" },
          ] as const
        ).map((cat) => (
          <div key={cat.key}>
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-foreground-muted">
              {cat.label}
            </h2>
            <ul className="bt-stagger grid gap-3 sm:grid-cols-2">
              {byCategory[cat.key].map((m) => {
                const achieved = doneCodes.get(m.slug);
                const upcoming =
                  !achieved &&
                  ageMonths >= m.typicalAgeMonths - 1 &&
                  ageMonths <= m.typicalAgeMonths + 2;
                return (
                  <li
                    key={m.slug}
                    className={`rounded-2xl border p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
                      achieved
                        ? "border-success/40 bg-success-soft"
                        : upcoming
                          ? "border-brand/50 bg-surface"
                          : "border-border bg-surface"
                    }`}
                  >
                    <div className="mb-2 flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <span aria-hidden className="text-2xl">
                          {m.emoji}
                        </span>
                        <div>
                          <div className="text-sm font-semibold text-foreground">
                            {m.label}
                          </div>
                          <div className="text-xs text-foreground-muted">
                            {m.memoryOnly
                              ? "Un souvenir, à votre rythme"
                              : `Repère autour de ${m.typicalAgeMonths < 36 ? `${m.typicalAgeMonths} mois` : `${m.typicalAgeMonths / 12} ans`}`}
                          </div>
                        </div>
                      </div>
                      {achieved && (
                        <span aria-hidden className="text-lg">
                          ✅
                        </span>
                      )}
                    </div>

                    {achieved ? (
                      <div className="flex items-center justify-between gap-2 text-xs">
                        <div className="text-success-text">
                          Fait le{" "}
                          {new Date(achieved.achieved_at).toLocaleDateString(
                            "fr-FR",
                          )}
                          {achieved.notes && ` · ${achieved.notes}`}
                        </div>
                        {canWrite && (
                          <form action={deleteMilestone.bind(null, baby.id)}>
                            <input
                              type="hidden"
                              name="id"
                              value={achieved.id}
                            />
                            <button
                              type="submit"
                              className="rounded-lg px-2 py-1 text-foreground-subtle transition hover:bg-danger-soft hover:text-danger focus-visible:outline-2 focus-visible:outline-brand focus-visible:outline-offset-2"
                            >
                              Défaire
                            </button>
                          </form>
                        )}
                      </div>
                    ) : canWrite ? (
                      <form
                        action={markMilestone.bind(null, baby.id)}
                        className="flex flex-wrap items-center gap-2"
                      >
                        <input type="hidden" name="code" value={m.slug} />
                        <input type="hidden" name="label" value={m.label} />
                        <input
                          type="date"
                          name="achieved_at"
                          aria-label={`Date de ${m.label}`}
                          min={baby.birth_date}
                          max={todayStr}
                          required
                          defaultValue={todayStr}
                          className="rounded-lg border border-border bg-surface px-2 py-1.5 text-xs text-foreground focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/15"
                        />
                        <button
                          type="submit"
                          className="rounded-lg bg-brand px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-brand-strong focus-visible:outline-2 focus-visible:outline-brand focus-visible:outline-offset-2"
                        >
                          🎉 Marquer
                        </button>
                      </form>
                    ) : (
                      <div className="text-xs text-foreground-muted">
                        Pas encore franchie
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      <Alert tone="warning" icon="💡" className="mt-10">
        Chaque enfant avance à son rythme. Ces souvenirs ne constituent pas un
        test de développement. Les repères de 3 à 5 ans s’appuient sur les{" "}
        <a
          href="https://www.cdc.gov/act-early/milestones/index.html"
          className="underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          ressources du CDC
        </a>
        . Si une compétence se perd ou qu’un point vous inquiète, parlez-en à
        son médecin.
      </Alert>
    </ModuleShell>
  );
}
