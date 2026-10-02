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

async function markMilestone(formData: FormData) {
  "use server";
  const { user, baby, supabase } = await requireUserAndBaby();
  if (!user) redirect("/auth/login");
  if (!baby) redirect("/enfant/onboarding");

  const code = String(formData.get("code") ?? "");
  if (!code || !VALID_MILESTONE_CODES.has(code)) return;

  const label = String(formData.get("label") ?? "").slice(0, 200) || null;

  const achieved_at_raw = String(formData.get("achieved_at") ?? "");
  let achieved_at = new Date().toISOString().slice(0, 10);
  if (achieved_at_raw) {
    const d = new Date(achieved_at_raw);
    if (
      !Number.isNaN(d.getTime()) &&
      d.getTime() <= new Date().getTime() + 24 * 60 * 60 * 1000
    ) {
      achieved_at = achieved_at_raw;
    }
  }

  const notesRaw = String(formData.get("notes") ?? "").trim();
  const notes = notesRaw ? notesRaw.slice(0, 500) : null;

  await saveMutation(supabase.from("milestones").insert({
    baby_id: baby.id,
    user_id: user.id,
    code,
    label,
    achieved_at,
    notes,
  }));
  revalidatePath("/enfant/milestones");
}

async function deleteMilestone(formData: FormData) {
  "use server";
  const { user, supabase } = await requireUserAndBaby();
  if (!user) redirect("/auth/login");
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await saveMutation(supabase
    .from("milestones")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id));
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

  const requestNow = new Date().getTime();
  const birth = new Date(baby.birth_date);
  const ageMonths =
    (requestNow - birth.getTime()) / (1000 * 60 * 60 * 24 * 30.44);

  const byCategory: Record<string, Milestone[]> = {
    motor: [],
    language: [],
    social: [],
    cognitive: [],
  };
  for (const m of MILESTONES) byCategory[m.category].push(m);

  const done = given.length;
  const total = MILESTONES.length;

  const todayStr = new Date().toISOString().slice(0, 10);

  return (
    <ModuleShell
      slug="milestones"
      title="Milestones"
      subtitle={`${baby.name} — étapes clés du développement`}
      viewerBadge={role === "viewer"}
    >
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard icon="🏆" label="Franchies" value={`${done}/${total}`} />
        <StatCard icon="📅" label="Âge" value={`${ageMonths.toFixed(1)}m`} />
        <StatCard
          icon="🤸"
          label="Moteur"
          value={`${given.filter((g) => MILESTONES.find((m) => m.slug === g.code)?.category === "motor").length}/${byCategory.motor.length}`}
        />
        <StatCard
          icon="🗣️"
          label="Langage"
          value={`${given.filter((g) => MILESTONES.find((m) => m.slug === g.code)?.category === "language").length}/${byCategory.language.length}`}
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
                        <span aria-hidden className="text-2xl">{m.emoji}</span>
                        <div>
                          <div className="text-sm font-semibold text-foreground">
                            {m.label}
                          </div>
                          <div className="text-xs text-foreground-muted">
                            Vers {m.typicalAgeMonths} mois
                          </div>
                        </div>
                      </div>
                      {achieved && <span aria-hidden className="text-lg">✅</span>}
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
                          <form action={deleteMilestone}>
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
                        action={markMilestone}
                        className="flex flex-wrap items-center gap-2"
                      >
                        <input type="hidden" name="code" value={m.slug} />
                        <input type="hidden" name="label" value={m.label} />
                        <input
                          type="date"
                          name="achieved_at"
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
        Chaque bébé évolue à son rythme. Ces repères sont indicatifs (HAS /
        CAMSP). Parles-en à ton pédiatre si tu as un doute.
      </Alert>
    </ModuleShell>
  );
}
