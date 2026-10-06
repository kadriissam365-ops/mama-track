import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowRight,
  BookHeart,
  CalendarDays,
  Check,
  Droplets,
  Heart,
  ListChecks,
  Milk,
  Moon,
  Plus,
  Ruler,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import { requireUserAndBaby, getUserRole } from "@/lib/enfant/baby";
import {
  childAgeLabel,
  childPhase,
  calendarDate,
  parseCalendarDate,
} from "@/lib/family-journey";
import JourneyArtwork from "@/components/JourneyArtwork";
import JourneyRail from "@/components/JourneyRail";
import BabyPicker from "@/components/BabyPicker";
import { ModuleIconCircle } from "@/lib/enfant/module-icons";
export const metadata = { title: "Notre petit monde" };
export default async function BabyDashboard({
  searchParams,
}: {
  searchParams: Promise<{ bienvenue?: string }>;
}) {
  const { user, baby, supabase } = await requireUserAndBaby();
  if (!user) redirect("/auth/login");
  if (!baby)
    return (
      <section className="mt-shell">
        <div className="mt-hero">
          <div className="mt-hero-copy">
            <span className="mt-pill">Un carnet pour toute son enfance</span>
            <h1 className="mt-display mt-5">
              Son petit monde
              <br />
              commence avec vous.
            </h1>
            <p>
              Repas, sommeil, premières découvertes et grandes aventures. Votre
              histoire de famille, réunie jusqu’à 6 ans.
            </p>
            <Link href="/enfant/naissance" className="mt-button mt-5">
              <Plus size={16} />
              Créer le carnet de mon enfant
            </Link>
          </div>
          <JourneyArtwork phase="baby" className="mt-artwork" />
          <div className="mt-hero-footer">
            <JourneyRail phase="baby" />
          </div>
        </div>
        <div className="mt-card mt-6">
          <h2>Vous utilisiez BabyTrack ?</h2>
          <p className="mt-3 text-sm text-foreground-muted">
            Vos enfants, leurs photos et leurs relevés peuvent rejoindre votre
            espace MamaTrack.
          </p>
          <Link href="/enfant/import" className="mt-link mt-4">
            Récupérer mon suivi <ArrowRight size={14} />
          </Link>
        </div>
      </section>
    );
  const requestTime = new Date().getTime();
  const phase = childPhase(baby.birth_date),
    older = phase === "child",
    today = calendarDate(),
    cutoff = new Date(requestTime - 86400000).toISOString();
  const [
    feeds,
    sleeps,
    diapers,
    measure,
    diary,
    appointments,
    routines,
    checks,
    role,
    params,
  ] = await Promise.all([
    supabase
      .from("feedings")
      .select("id,kind,amount_ml,started_at")
      .eq("baby_id", baby.id)
      .gte("started_at", cutoff)
      .order("started_at", { ascending: false }),
    supabase
      .from("sleeps")
      .select("id,started_at,ended_at")
      .eq("baby_id", baby.id)
      .or(`ended_at.gte.${cutoff},ended_at.is.null`),
    supabase
      .from("diapers")
      .select("id", { head: true, count: "exact" })
      .eq("baby_id", baby.id)
      .gte("changed_at", cutoff),
    supabase
      .from("measurements")
      .select("weight_g,height_cm,measured_at")
      .eq("baby_id", baby.id)
      .order("measured_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("diary_entries")
      .select("id,title,body,entry_date")
      .eq("baby_id", baby.id)
      .order("entry_date", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(3),
    supabase
      .from("health_events")
      .select("id,title,occurred_at")
      .eq("baby_id", baby.id)
      .eq("kind", "appointment")
      .gte("occurred_at", new Date().toISOString())
      .order("occurred_at")
      .limit(3),
    supabase
      .from("child_routines")
      .select("id,title,period")
      .eq("baby_id", baby.id)
      .eq("active", true)
      .order("sort_order")
      .order("created_at"),
    supabase
      .from("routine_completions")
      .select("routine_id")
      .eq("baby_id", baby.id)
      .eq("completed_on", today),
    getUserRole(user, baby),
    searchParams,
  ]);
  if (
    [
      feeds,
      sleeps,
      diapers,
      measure,
      diary,
      appointments,
      routines,
      checks,
    ].some((r) => r.error)
  )
    throw new Error("Votre carnet est momentanément indisponible.");
  const now = requestTime,
    sleepMinutes = Math.round(
      (sleeps.data ?? []).reduce(
        (total, row) =>
          total +
          Math.max(
            0,
            Math.min(
              row.ended_at ? new Date(row.ended_at).getTime() : now,
              now,
            ) -
              Math.max(
                new Date(row.started_at).getTime(),
                new Date(cutoff).getTime(),
              ),
          ),
        0,
      ) / 60000,
    );
  const done = new Set((checks.data ?? []).map((r) => r.routine_id)),
    routineRows = routines.data ?? [],
    completed = routineRows.filter((r) => done.has(r.id)).length;
  const writable = role === "owner" || role === "caregiver";
  const metrics = [
    older
      ? {
          slug: "routines",
          Icon: ListChecks,
          label: "Nos rituels aujourd’hui",
          value: routineRows.length
            ? `${completed} / ${routineRows.length}`
            : "À inventer",
          detail: routineRows.length
            ? "Petits gestes accomplis ensemble"
            : "Créer les habitudes de votre famille",
        }
      : {
          slug: "feed",
          Icon: Milk,
          label: "Repas enregistrés",
          value: String(feeds.data?.length ?? 0),
          detail: "Sur les dernières 24 heures",
        },
    {
      slug: "sleep",
      Icon: Moon,
      label: "Sommeil enregistré",
      value: sleepMinutes
        ? `${Math.floor(sleepMinutes / 60)} h ${String(sleepMinutes % 60).padStart(2, "0")}`
        : "—",
      detail: sleeps.data?.some((s) => !s.ended_at)
        ? "Un sommeil est en cours"
        : "Sur les dernières 24 heures",
    },
    older
      ? {
          slug: "growth",
          Icon: Ruler,
          label: "Dernière taille",
          value: measure.data?.height_cm ? `${measure.data.height_cm} cm` : "—",
          detail: measure.data?.measured_at
            ? `Mesure du ${parseCalendarDate(measure.data.measured_at)?.toLocaleDateString("fr-FR")}`
            : "Quand vous le souhaitez",
        }
      : {
          slug: "diapers",
          Icon: Droplets,
          label: "Changes enregistrés",
          value: String(diapers.count ?? 0),
          detail: "Sur les dernières 24 heures",
        },
    {
      slug: "growth",
      Icon: Ruler,
      label: "Dernier poids",
      value: measure.data?.weight_g
        ? `${(measure.data.weight_g / 1000).toLocaleString("fr-FR")} kg`
        : "—",
      detail: "Vos mesures, conservées au fil du temps",
    },
  ];
  const quick = older
    ? [
        { slug: "routines", label: "Un rituel" },
        { slug: "activities", label: "Un moment de jeu" },
        { slug: "health", label: "Sa santé" },
        { slug: "diary", label: "Un souvenir" },
      ]
    : [
        { slug: "feed", label: "Un repas" },
        { slug: "sleep", label: "Un sommeil" },
        { slug: "diapers", label: "Une couche" },
        { slug: "diary", label: "Un souvenir" },
      ];
  return (
    <div className="mt-shell">
      <BabyPicker />
      <div className="mt-welcome">
        <div>
          <p className="mt-eyebrow">
            Notre aventure · {older ? "3–6 ans" : "Les premières années"}
          </p>
          <h1 className="mt-display">
            Le petit monde de {baby.name}
            <span className="text-brand">.</span>
          </h1>
          <p>
            {older
              ? "Grandir, découvrir, inventer. Et garder les plus beaux moments."
              : "Les petits gestes d’aujourd’hui. Les souvenirs de demain."}
          </p>
        </div>
      </div>
      {params.bienvenue && (
        <p role="status" className="mt-note mb-5 flex items-center gap-3">
          <Sparkles size={20} className="shrink-0 text-brand" />
          Bienvenue dans son carnet. Votre espace s’est adapté à son âge ;
          l’histoire de grossesse reste accessible.
        </p>
      )}
      {role === "viewer" && (
        <p className="mt-note mb-5">
          Ce carnet est partagé avec vous en lecture seule.
        </p>
      )}
      <div className="mt-dashboard-grid">
        <div className="mt-stack">
          <section className="mt-hero">
            <div className="mt-hero-copy">
              <span className="mt-pill">
                <Heart size={12} />
                {older ? "Chapitre 03 · 3–6 ans" : "Chapitre 02 · 0–3 ans"}
              </span>
              <p className="mt-eyebrow mt-5">Son âge aujourd’hui</p>
              <h2 className="mt-display mt-2">
                {childAgeLabel(baby.birth_date)}
              </h2>
              <p>
                {older
                  ? "Des rituels, des jeux et des souvenirs pour ses grandes aventures."
                  : "Chaque jour, une petite première. Son carnet grandit à votre rythme."}
              </p>
              <Link href="/enfant/milestones" className="mt-link mt-5">
                Célébrer ses petites fiertés <ArrowRight size={14} />
              </Link>
            </div>
            <JourneyArtwork phase={phase} className="mt-artwork" />
            <div className="mt-hero-footer">
              <JourneyRail phase={phase} />
            </div>
          </section>
          {writable && (
            <div>
              <div className="mt-section-title">
                <h2>Un petit geste, et c’est noté</h2>
                <span>Vos essentiels</span>
              </div>
              <div className="mt-quick-grid">
                {quick.map((item) => (
                  <Link
                    key={item.slug}
                    href={`/enfant/${item.slug}`}
                    className="mt-quick-action"
                  >
                    <ModuleIconCircle slug={item.slug} size="sm" />
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          )}
          <div>
            <div className="mt-section-title">
              <h2>Le quotidien, simplement</h2>
              <Link href="/enfant/timeline" className="mt-link">
                Notre histoire <ArrowRight size={12} />
              </Link>
            </div>
            <div className="mt-metrics">
              {metrics.map(({ slug, Icon, label, value, detail }) => (
                <Link
                  href={`/enfant/${slug}`}
                  key={label}
                  className="mt-metric"
                >
                  <Icon size={19} className="text-foreground-muted" />
                  <p className="mt-metric-label">{label}</p>
                  <p className="mt-metric-value">{value}</p>
                  <p className="mt-metric-detail">{detail}</p>
                </Link>
              ))}
            </div>
          </div>
          {older && (
            <section className="mt-card">
              <div className="mt-card-header">
                <h2>Nos rituels du jour</h2>
                <ListChecks size={18} />
              </div>
              {routineRows.length ? (
                <div className="mt-timeline">
                  {routineRows.slice(0, 4).map((r) => (
                    <Link
                      className="mt-timeline-item"
                      href="/enfant/routines"
                      key={r.id}
                    >
                      <span className="mt-icon-soft">
                        {done.has(r.id) ? (
                          <Check size={17} />
                        ) : (
                          <ListChecks size={17} />
                        )}
                      </span>
                      <div>
                        <p>{r.title}</p>
                        <small>
                          {done.has(r.id)
                            ? "Un petit geste accompli"
                            : "Quand vous êtes prêts"}
                        </small>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="mt-empty">
                  Un brossage de dents, une histoire, un moment ensemble…
                  Inventez les rituels qui vous ressemblent.
                </p>
              )}
              <Link href="/enfant/routines" className="mt-link mt-4">
                Ouvrir nos rituels <ArrowRight size={13} />
              </Link>
            </section>
          )}
          <section className="mt-card">
            <div className="mt-card-header">
              <h2>Les moments à garder</h2>
              <BookHeart size={19} />
            </div>
            {diary.data?.length ? (
              <div className="mt-timeline">
                {diary.data.map((entry) => (
                  <Link
                    href="/enfant/diary"
                    className="mt-timeline-item"
                    key={entry.id}
                  >
                    <span className="mt-icon-soft">
                      <BookHeart size={17} />
                    </span>
                    <div>
                      <p>{entry.title || "Un moment en famille"}</p>
                      <small>
                        {parseCalendarDate(
                          entry.entry_date,
                        )?.toLocaleDateString("fr-FR", {
                          day: "numeric",
                          month: "long",
                        })}
                      </small>
                      {entry.body && (
                        <small className="mt-1 line-clamp-2">
                          {entry.body}
                        </small>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="mt-empty">
                Sa première grimace, une phrase drôle, un câlin… Votre première
                page vous attend.
              </p>
            )}
            <Link href="/enfant/diary" className="mt-link mt-4">
              Ouvrir notre journal <ArrowRight size={13} />
            </Link>
          </section>
        </div>
        <aside className="mt-stack mt-stack-secondary">
          <section className="mt-card">
            <div className="mt-card-header">
              <h2>À venir dans son agenda</h2>
              <CalendarDays size={18} />
            </div>
            {appointments.data?.length ? (
              <div className="mt-timeline">
                {appointments.data.map((a) => (
                  <Link
                    href="/enfant/agenda"
                    key={a.id}
                    className="mt-timeline-item"
                  >
                    <span className="mt-icon-soft">
                      <CalendarDays size={16} />
                    </span>
                    <div>
                      <p>{a.title || "Rendez-vous"}</p>
                      <small>
                        {new Date(a.occurred_at).toLocaleDateString("fr-FR", {
                          day: "numeric",
                          month: "long",
                          timeZone: "Europe/Paris",
                        })}
                      </small>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="mt-empty">
                Vos prochains rendez-vous apparaîtront ici. Retrouvez aussi les
                visites de suivi jusqu’à 6 ans.
              </p>
            )}
            <Link href="/enfant/agenda" className="mt-link mt-4">
              Ouvrir l’agenda <ArrowRight size={13} />
            </Link>
          </section>
          <section className="mt-care-card">
            <Sparkles size={22} />
            <h2 className="mt-4">
              {older
                ? "Le meilleur jeu ?\nCelui qu’on partage."
                : "Un peu de douceur.\nUn peu de soutien."}
            </h2>
            <p>
              {older
                ? "Une histoire inventée, une danse, une promenade des couleurs. Des idées simples pour se retrouver."
                : "Les premiers mois apportent beaucoup de questions. Retrouvez vos ressources et votre assistant parental."}
            </p>
            <Link
              href={older ? "/enfant/activities" : "/enfant/coach"}
              className="mt-link"
            >
              {older ? "Trouver une idée de jeu" : "Un peu d’aide"}{" "}
              <ArrowRight size={14} />
            </Link>
          </section>
          <section className="mt-card">
            <div className="mt-card-header">
              <h2>Ses repères de santé</h2>
              <ShieldCheck size={19} />
            </div>
            <p className="text-xs leading-6 text-foreground-muted">
              Le calendrier français 2026, ses doses enregistrées et le rappel
              des 6 ans, au même endroit.
            </p>
            <Link href="/enfant/vaccines" className="mt-link mt-4">
              Son carnet vaccinal <ArrowRight size={13} />
            </Link>
            <Link href="/enfant/pediatrician" className="mt-link mt-4">
              Partager avec un professionnel <ArrowRight size={13} />
            </Link>
          </section>
          <section className="mt-card">
            <div className="mt-card-header">
              <h2>Ensemble, c’est plus doux</h2>
              <Users size={19} />
            </div>
            <p className="text-xs leading-6 text-foreground-muted">
              Invitez votre coparent ou un proche. Choisissez qui peut consulter
              et qui peut participer.
            </p>
            <Link href="/enfant/duo" className="mt-link mt-4">
              Notre cercle de confiance <ArrowRight size={13} />
            </Link>
          </section>
          <Link href="/enfant/plus" className="mt-note">
            <strong>Votre boîte à outils</strong>
            <span className="block mt-1">
              Tous les suivis, les souvenirs et les réglages de la famille. →
            </span>
          </Link>
        </aside>
      </div>
    </div>
  );
}
