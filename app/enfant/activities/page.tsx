import Link from "next/link";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { BookHeart, Clock, ArrowRight, Palette } from "lucide-react";
import { requireUserAndBaby, getUserRole } from "@/lib/enfant/baby";
import { calendarDate } from "@/lib/family-journey";
import { CHILD_ACTIVITIES } from "@/lib/enfant/child-activities";
import { ModuleShell } from "@/components/enfant/ModuleShell";
import ActionButton from "@/components/enfant/ActionButton";
export const metadata = { title: "Éveil & jeux · 3–6 ans" };
async function rememberActivity(form: FormData) {
  "use server";
  const { user, baby, supabase } = await requireUserAndBaby();
  if (!user) redirect("/auth/login");
  if (!baby) redirect("/enfant/naissance");
  const role = await getUserRole(user, baby);
  if (
    (role !== "owner" && role !== "caregiver") ||
    form.get("baby_id") !== baby.id
  )
    redirect("/enfant/activities?error=access");
  const activity = CHILD_ACTIVITIES.find(
    (a) => a.id === form.get("activity_id"),
  );
  if (!activity) redirect("/enfant/activities?error=save");
  const note = String(form.get("note") ?? "")
    .trim()
    .slice(0, 500);
  const { error } = await supabase.from("diary_entries").insert({
    baby_id: baby.id,
    user_id: user.id,
    entry_date: calendarDate(),
    title: activity.title,
    body: note || "Un moment partagé en famille.",
    mood: "happy",
  });
  if (error) redirect("/enfant/activities?error=save");
  revalidatePath("/enfant/diary");
  revalidatePath("/enfant/dashboard");
  redirect("/enfant/activities?saved=1");
}
export default async function ActivitiesPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; saved?: string }>;
}) {
  const { user, baby } = await requireUserAndBaby();
  if (!user) redirect("/auth/login");
  if (!baby) redirect("/enfant/naissance");
  const [role, params] = await Promise.all([
    getUserRole(user, baby),
    searchParams,
  ]);
  const writable = role === "owner" || role === "caregiver";
  return (
    <ModuleShell
      slug="activities"
      title="Un monde à découvrir"
      subtitle={`Des idées pour partager un moment avec ${baby.name} · 3–6 ans`}
      viewerBadge={role === "viewer"}
    >
      {params.error && (
        <p role="alert" className="mt-note mb-4">
          {params.error === "access"
            ? "Ce carnet est en lecture seule, ou l’enfant sélectionné a changé."
            : "Ce souvenir n’a pas pu être enregistré. Réessayez."}
        </p>
      )}
      {params.saved && (
        <p role="status" className="mt-note mb-4">
          Ce moment est conservé dans votre journal.{" "}
          <Link className="underline" href="/enfant/diary">
            Voir nos souvenirs →
          </Link>
        </p>
      )}
      <section className="mt-care-card mb-6">
        <Palette size={23} />
        <h2 className="mt-3">
          Un peu de jeu.
          <br />
          Beaucoup de complicité.
        </h2>
        <p>
          Des idées souples, à adapter à ses envies et à son âge. Avec un
          adulte, sans objectif de performance.
        </p>
      </section>
      <div className="grid gap-5 sm:grid-cols-2">
        {CHILD_ACTIVITIES.map((a, i) => (
          <article className="mt-card" key={a.id}>
            <div className="flex items-center justify-between mb-5">
              <span className="mt-pill">{a.category}</span>
              <span className="flex items-center gap-1 text-[11px] text-foreground-muted">
                <Clock size={12} />
                {a.minutes}
              </span>
            </div>
            <p className="mt-eyebrow">Idée {String(i + 1).padStart(2, "0")}</p>
            <h2 className="!mt-2 !text-xl">{a.title}</h2>
            <p className="mt-4 text-sm leading-7 text-foreground-muted">
              {a.idea}
            </p>
            <p className="mt-3 text-xs text-foreground-muted">
              <strong>À prévoir :</strong> {a.material}
            </p>
            {writable && (
              <details className="mt-5 border-t border-border pt-4">
                <summary className="cursor-pointer text-xs font-semibold text-brand">
                  On l’a fait ! Garder ce souvenir
                </summary>
                <form action={rememberActivity} className="mt-4 space-y-3">
                  <input type="hidden" name="baby_id" value={baby.id} />
                  <input type="hidden" name="activity_id" value={a.id} />
                  <label className="block text-xs">
                    Un petit mot · facultatif
                    <textarea
                      name="note"
                      maxLength={500}
                      rows={2}
                      className="mt-2 block w-full rounded-xl border border-border bg-surface p-3 text-sm"
                      placeholder="La phrase drôle, son idée, votre moment préféré…"
                    />
                  </label>
                  <ActionButton>
                    <BookHeart size={15} />
                    Ajouter au journal
                  </ActionButton>
                </form>
              </details>
            )}
          </article>
        ))}
      </div>
      <p className="mt-note mt-6">
        Ces activités sont des idées de jeu, sans évaluation du développement.
        Inspiration :{" "}
        <a
          href="https://www.cdc.gov/child-development/positive-parenting-tips/preschooler-3-5-years.html"
          target="_blank"
          rel="noopener noreferrer"
          className="underline"
        >
          CDC · Accompagner les enfants de 3 à 5 ans
        </a>
        .
      </p>
      <Link href="/enfant/milestones" className="mt-link mt-5">
        Retrouver ses petites fiertés <ArrowRight size={13} />
      </Link>
    </ModuleShell>
  );
}
