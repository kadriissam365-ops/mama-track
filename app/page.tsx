"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import {
  Activity,
  ArrowRight,
  Baby,
  BookHeart,
  CalendarDays,
  Check,
  Droplets,
  Heart,
  Loader2,
  Scale,
  Share2,
  Sparkles,
  Timer,
  Users,
} from "lucide-react";
import { useStore } from "@/lib/store";
import { useAuth } from "@/lib/auth";
import { useFamily } from "@/lib/family";
import { useToast } from "@/lib/toast";
import {
  getCurrentWeek,
  getCurrentWeekAndDays,
  getProgressPercent,
  getWeekData,
} from "@/lib/pregnancy-data";
import {
  calendarDate,
  parseCalendarDate,
  pregnancyMoment,
} from "@/lib/family-journey";
import { getPartnerAccess } from "@/lib/duo-api";
import { WATER_GOAL_ML } from "@/lib/constants";
import { MedicalSources } from "@/components/MedicalSources";
import { DashboardSkeleton } from "@/components/Skeleton";
import DpaCalculator from "@/components/DpaCalculator";
import JourneyArtwork from "@/components/JourneyArtwork";
import JourneyRail from "@/components/JourneyRail";
import ReminderBanner from "@/components/ReminderBanner";

const LandingPage = dynamic(() => import("@/components/LandingPage"), {
  loading: () => <DashboardSkeleton />,
});
const WeeklyReport = dynamic(() => import("@/components/WeeklyReport"), {
  ssr: false,
});
const ShareCard = dynamic(() => import("@/components/ShareCard"), {
  ssr: false,
});

export default function DashboardPage() {
  const store = useStore(),
    family = useFamily(),
    toast = useToast(),
    router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [showSetup, setShowSetup] = useState(false),
    [showCalculator, setShowCalculator] = useState(false);
  const [dateDraft, setDateDraft] = useState<string | null>(null),
    [saving, setSaving] = useState(false);
  const [showShare, setShowShare] = useState(false),
    [showReport, setShowReport] = useState(false);
  const draft = dateDraft ?? store.dueDate ?? "";
  useEffect(() => {
    if (isAuthenticated && !family.loading && family.activeStage === "baby")
      router.replace("/enfant/dashboard");
  }, [isAuthenticated, family.loading, family.activeStage, router]);
  useEffect(() => {
    if (
      !user ||
      store.loading ||
      family.loading ||
      family.activeStage !== "pregnancy" ||
      store.dueDate
    )
      return;
    let cancelled = false;
    getPartnerAccess(user.id)
      .then((linked) => {
        if (
          cancelled ||
          linked.length === 0 ||
          sessionStorage.getItem(`partner-redirected-${user.id}`)
        )
          return;
        sessionStorage.setItem(`partner-redirected-${user.id}`, "1");
        router.replace(`/partner/${linked[0].mamaId}`);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [
    user,
    store.loading,
    store.dueDate,
    family.loading,
    family.activeStage,
    router,
  ]);
  if (authLoading) return <DashboardSkeleton />;
  if (!isAuthenticated) return <LandingPage />;
  if (store.loading || family.loading || family.activeStage === "baby")
    return <DashboardSkeleton />;

  const date = store.dueDate ? parseCalendarDate(store.dueDate) : null;
  const weekSA = date ? getCurrentWeek(date) : null;
  const week =
    weekSA === null
      ? null
      : store.weekMode === "GA"
        ? Math.max(1, weekSA - 2)
        : weekSA;
  const detail = date ? getCurrentWeekAndDays(date) : null;
  const remaining = date
    ? Math.max(
        0,
        Math.round(
          (date.getTime() - parseCalendarDate(calendarDate())!.getTime()) /
            86400000,
        ),
      )
    : null;
  const progress = date ? getProgressPercent(date) : 0;
  const weekData = weekSA === null ? null : getWeekData(weekSA);
  const moment = pregnancyMoment(store.dueDate);
  const today = calendarDate();
  const water = store.waterIntake[today] ?? 0;
  const weight = [...store.weightEntries]
    .sort((a, b) => a.date.localeCompare(b.date))
    .at(-1);
  const appointments = store.appointments
    .filter((item) => !item.done && item.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 3);
  const symptoms = [...store.symptomEntries]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 2);
  const greeting = store.mamaName?.trim().split(/\s+/)[0];
  const saveDate = async () => {
    if (!parseCalendarDate(draft)) {
      toast.error("Choisissez une date valide.");
      return;
    }
    setSaving(true);
    try {
      await store.setDueDate(draft);
      setShowSetup(false);
      toast.success("Votre date prévue est enregistrée.");
    } catch {
      toast.error("La date n’a pas pu être enregistrée. Réessayez.");
    } finally {
      setSaving(false);
    }
  };
  return (
    <div className="mt-shell">
      <div className="mt-welcome">
        <div>
          <p className="mt-eyebrow">Notre aventure · Grossesse</p>
          <h1 className="mt-display">
            Bonjour{greeting ? ` ${greeting}` : ""}
            <span className="text-brand">.</span>
          </h1>
          <p>Un jour de plus. Un peu plus près de la rencontre.</p>
        </div>
        <button
          className="mt-button mt-button-secondary"
          onClick={() => setShowShare(true)}
          aria-label="Partager ma semaine de grossesse"
        >
          <Share2 size={15} />
          <span className="hidden sm:inline">Partager</span>
        </button>
      </div>
      {family.error && (
        <div role="alert" className="mt-note mb-5">
          Le carnet familial est momentanément indisponible.{" "}
          <button
            className="underline"
            onClick={() =>
              family
                .refresh()
                .catch(() => toast.error("Réessayez dans un instant."))
            }
          >
            Réessayer
          </button>
        </div>
      )}
      <div className="mt-dashboard-grid">
        <div className="mt-stack">
          <section className="mt-hero">
            <div className="mt-hero-copy">
              <span className="mt-pill">
                <Heart size={12} />
                {moment === "term"
                  ? "La rencontre approche"
                  : "Chapitre 01 · Grossesse"}
              </span>
              <p className="mt-eyebrow !mt-5">
                {week === null
                  ? "Votre point de départ"
                  : "Semaine de grossesse"}
              </p>
              {week === null ? (
                <h2 className="mt-display">
                  Une belle histoire
                  <br />
                  commence ici.
                </h2>
              ) : (
                <>
                  <div className="mt-hero-number">
                    {week}
                    <span>{store.weekMode}</span>
                  </div>
                  <p>
                    + {detail?.days ?? 0} jour
                    {(detail?.days ?? 0) > 1 ? "s" : ""} ·{" "}
                    {remaining === 0
                      ? "Date du terme atteinte"
                      : `${remaining} jours avant le terme`}
                  </p>
                </>
              )}
              {date ? (
                <p className="mt-3">
                  Rencontre prévue le{" "}
                  {date.toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                    timeZone: "Europe/Paris",
                  })}
                </p>
              ) : (
                <p>
                  Renseignez votre date prévue pour retrouver les bons repères,
                  semaine après semaine.
                </p>
              )}
              <button
                className="mt-link mt-4"
                onClick={() => setShowSetup((value) => !value)}
              >
                {date ? "Ajuster ma date" : "Renseigner ma date"}
                <ArrowRight size={13} />
              </button>
            </div>
            <JourneyArtwork phase="pregnancy" className="mt-artwork" />
            <div className="mt-hero-footer">
              <JourneyRail phase="pregnancy" />
            </div>
          </section>
          {(showSetup || !date) && (
            <section className="mt-card">
              <div className="mt-card-header">
                <h2>Votre date prévue de rencontre</h2>
                <CalendarDays size={18} className="text-brand" />
              </div>
              <label
                htmlFor="due-date"
                className="block text-xs text-foreground-muted mb-2"
              >
                Date prévue d’accouchement
              </label>
              <div className="flex gap-2">
                <input
                  id="due-date"
                  type="date"
                  value={draft}
                  onChange={(event) => setDateDraft(event.target.value)}
                  className="min-w-0 flex-1 rounded-xl border border-border bg-surface px-3 py-3 text-sm"
                />
                <button
                  disabled={saving}
                  onClick={saveDate}
                  className="mt-button"
                >
                  {saving ? (
                    <Loader2 size={15} className="animate-spin" />
                  ) : (
                    <Check size={15} />
                  )}
                  Enregistrer
                </button>
              </div>
              <button
                className="mt-link mt-4"
                onClick={() => setShowCalculator((value) => !value)}
              >
                Calculer ma date · cycle, PMA ou FIV
                <ArrowRight size={13} />
              </button>
              {showCalculator && (
                <div className="mt-5">
                  <DpaCalculator
                    defaultOpen
                    onSaved={() => {
                      setShowCalculator(false);
                      setShowSetup(false);
                    }}
                  />
                </div>
              )}
            </section>
          )}
          {(moment === "approaching" || moment === "term") && (
            <section className="mt-card !bg-[var(--peach)]">
              <div className="flex items-start gap-3">
                <span className="mt-icon-soft">
                  <Baby size={21} />
                </span>
                <div>
                  <h2>
                    {moment === "term"
                      ? "Et si le prochain chapitre commençait ?"
                      : "Tout est prêt pour la suite."}
                  </h2>
                  <p className="mt-2 text-xs leading-6 text-foreground-muted">
                    {moment === "term"
                      ? "Bébé est arrivé ? Confirmez sa naissance : son carnet s’ouvre automatiquement. Vous attendez encore ? Votre suivi grossesse continue."
                      : "À la naissance, votre espace évolue vers les repas, le sommeil et ses premières découvertes. Vos souvenirs de grossesse restent avec vous."}
                  </p>
                  <Link href="/enfant/naissance" className="mt-button mt-4">
                    Bébé est né <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            </section>
          )}
          <div>
            <div className="mt-section-title">
              <h2>Un petit geste pour vous</h2>
              <span>Vos essentiels</span>
            </div>
            <div className="mt-quick-grid">
              {[
                {
                  href: "/tracking?tab=water",
                  Icon: Droplets,
                  label: "Hydratation",
                },
                { href: "/contractions", Icon: Timer, label: "Contractions" },
                { href: "/journal", Icon: BookHeart, label: "Un souvenir" },
                { href: "/checklist", Icon: Check, label: "Préparatifs" },
              ].map(({ href, Icon, label }) => (
                <Link key={href} href={href} className="mt-quick-action">
                  <span className="mt-icon-soft">
                    <Icon size={19} />
                  </span>
                  {label}
                </Link>
              ))}
            </div>
          </div>
          <div>
            <div className="mt-section-title">
              <h2>Votre bien-être, simplement</h2>
              <Link href="/tracking" className="mt-link">
                Tout voir <ArrowRight size={12} />
              </Link>
            </div>
            <div className="mt-metrics">
              {[
                {
                  href: "/tracking",
                  Icon: Scale,
                  label: "Dernier poids",
                  value: weight ? `${weight.weight} kg` : "—",
                  detail: weight
                    ? "Votre dernière mesure"
                    : "À renseigner quand vous le souhaitez",
                },
                {
                  href: "/tracking",
                  Icon: Droplets,
                  label: "Hydratation aujourd’hui",
                  value: `${water} ml`,
                  detail: `Repère personnel : ${WATER_GOAL_ML} ml`,
                },
                {
                  href: "/tracking",
                  Icon: Activity,
                  label: "Derniers ressentis",
                  value: symptoms.length
                    ? `${symptoms.length} notés`
                    : "À votre rythme",
                  detail: "Écouter votre corps, sans pression",
                },
                {
                  href: "/agenda",
                  Icon: CalendarDays,
                  label: "Prochain rendez-vous",
                  value: appointments[0]
                    ? (parseCalendarDate(
                        appointments[0].date,
                      )?.toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "short",
                      }) ?? "—")
                    : "—",
                  detail: appointments[0]?.title ?? "Votre agenda est à vous",
                },
              ].map(({ href, Icon, label, value, detail }) => (
                <Link href={href} key={label} className="mt-metric">
                  <Icon size={19} className="text-foreground-muted" />
                  <p className="mt-metric-label">{label}</p>
                  <p className="mt-metric-value">{value}</p>
                  <p className="mt-metric-detail">{detail}</p>
                </Link>
              ))}
            </div>
          </div>
          {weekData && (
            <section className="mt-card">
              <div className="mt-card-header">
                <div>
                  <p className="mt-eyebrow">Cette semaine</p>
                  <h2 className="!mt-2">Une nouvelle petite découverte</h2>
                </div>
                <span className="mt-icon-soft">
                  <SproutIcon />
                </span>
              </div>
              <p className="text-sm leading-7 text-foreground-muted">
                {weekData.babyDevelopment}
              </p>
              <div className="mt-progress">
                <div style={{ width: `${Math.min(100, progress)}%` }} />
              </div>
              <div className="flex items-center justify-between text-[10px] text-foreground-muted">
                <span>Votre parcours de grossesse</span>
                <span>{Math.round(progress)} %</span>
              </div>
              <Link href="/baby" className="mt-link mt-5">
                Découvrir cette semaine <ArrowRight size={13} />
              </Link>
            </section>
          )}
          <MedicalSources
            sources={[
              {
                label: "Assurance Maladie · Suivi de grossesse",
                url: "https://www.ameli.fr/assure/sante/themes/grossesse",
              },
            ]}
          />
        </div>
        <aside className="mt-stack mt-stack-secondary">
          <section className="mt-card">
            <div className="mt-card-header">
              <h2>À venir dans votre agenda</h2>
              <CalendarDays size={18} className="text-foreground-muted" />
            </div>
            {appointments.length ? (
              <div className="mt-timeline">
                {appointments.map((item) => (
                  <Link
                    href="/agenda"
                    className="mt-timeline-item"
                    key={item.id}
                  >
                    <span className="mt-icon-soft !size-9">
                      <CalendarDays size={15} />
                    </span>
                    <div>
                      <p>{item.title}</p>
                      <small>
                        {parseCalendarDate(item.date)?.toLocaleDateString(
                          "fr-FR",
                          { day: "numeric", month: "long" },
                        )}
                      </small>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="mt-empty">
                Une visite, une échographie, un cours de préparation… Vos
                prochains rendez-vous se retrouveront ici.
              </p>
            )}
            <Link href="/agenda" className="mt-link mt-4">
              Ouvrir l’agenda <ArrowRight size={13} />
            </Link>
          </section>
          <section className="mt-care-card">
            <Sparkles size={20} className="mb-4" />
            <h2>
              Vous n’avez pas à<br />
              tout porter seul·e.
            </h2>
            <p>
              Une question, un besoin d’organisation ou un moment de doute ?
              Retrouvez votre assistant et vos ressources.
            </p>
            <Link href="/coach" className="mt-link">
              Un peu d’aide <ArrowRight size={14} />
            </Link>
          </section>
          <section className="mt-card">
            <div className="mt-card-header">
              <h2>Votre cercle de confiance</h2>
              <Users size={19} className="text-foreground-muted" />
            </div>
            <p className="text-xs leading-6 text-foreground-muted">
              Partagez les repères et les rendez-vous avec votre coparent. Les
              petits moments sont encore plus beaux ensemble.
            </p>
            <Link href="/duo" className="mt-link mt-4">
              Inviter un proche <ArrowRight size={13} />
            </Link>
          </section>
          <section className="mt-card">
            <div className="mt-card-header">
              <h2>À garder pour plus tard</h2>
              <BookHeart size={19} className="text-foreground-muted" />
            </div>
            <div className="space-y-4">
              <Link href="/bump" className="mt-link w-full">
                Le journal photo de votre ventre <ArrowRight size={12} />
              </Link>
              <Link href="/prenoms" className="mt-link w-full">
                Le prénom qui vous ressemble <ArrowRight size={12} />
              </Link>
              <Link href="/naissance" className="mt-link w-full">
                Votre projet de naissance <ArrowRight size={12} />
              </Link>
              <button
                onClick={() => setShowReport(true)}
                className="mt-link w-full"
              >
                Votre bilan de la semaine <ArrowRight size={12} />
              </button>
            </div>
          </section>
          {moment === "expecting" && (
            <Link href="/enfant/naissance" className="mt-note">
              <strong>Bébé est déjà arrivé ?</strong>
              <span className="block mt-1">
                Son carnet vous attend, de la naissance aux 6 ans. →
              </span>
            </Link>
          )}
        </aside>
      </div>
      <ReminderBanner />
      {showShare && <ShareCard onClose={() => setShowShare(false)} />}
      {showReport && <WeeklyReport onClose={() => setShowReport(false)} />}
    </div>
  );
}
function SproutIcon() {
  return <Heart size={19} />;
}
