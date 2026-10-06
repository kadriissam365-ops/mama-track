"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import {
  ArrowRight,
  Baby,
  BookHeart,
  CalendarDays,
  Check,
  ChevronDown,
  Heart,
  Leaf,
  Milk,
  Moon,
  ShieldCheck,
  Sparkles,
  Sprout,
  Users,
  Clock,
  Ruler,
} from "lucide-react";
import BrandMark from "@/components/BrandMark";
import JourneyArtwork from "@/components/JourneyArtwork";
import JourneyRail from "@/components/JourneyRail";
import type { JourneyPhase } from "@/lib/family-journey";

const chapters = [
  {
    phase: "pregnancy" as const,
    number: "01",
    title: "Avant la rencontre.",
    range: "La grossesse",
    description:
      "Un peu de douceur dans le grand compte à rebours. Vos repères, votre bien-être et vos préparatifs, semaine après semaine.",
    tags: ["Semaine de grossesse", "Bien-être", "Projet de naissance"],
    Icon: Heart,
  },
  {
    phase: "baby" as const,
    number: "02",
    title: "Les premières fois.",
    range: "De la naissance à 3 ans",
    description:
      "Une tétée, une sieste, un premier sourire. Gardez le fil du quotidien et partagez ces petits moments qui changent tout.",
    tags: ["Repas & sommeil", "Croissance", "Carnet de santé"],
    Icon: Baby,
  },
  {
    phase: "child" as const,
    number: "03",
    title: "Les grandes aventures.",
    range: "De 3 à 6 ans",
    description:
      "Des histoires à inventer, des habitudes à apprivoiser, un monde à découvrir. Votre carnet grandit avec votre enfant.",
    tags: ["Routines", "Éveil", "Vaccins & rendez-vous"],
    Icon: Sprout,
  },
];
const preview = {
  pregnancy: {
    name: "Un peu plus près de la rencontre",
    caption: "Chapitre 01 · Grossesse",
    stats: [
      { label: "Semaine", value: "24 SA", Icon: Heart },
      { label: "Prochain RDV", value: "Mardi", Icon: CalendarDays },
      { label: "Souvenirs", value: "12", Icon: BookHeart },
    ],
    note: "Votre prochain chapitre est déjà prêt. À la naissance, le carnet continue avec vous.",
  },
  baby: {
    name: "Une douce journée pour Lou",
    caption: "Chapitre 02 · 4 mois",
    stats: [
      { label: "Dernier repas", value: "14:10", Icon: Milk },
      { label: "Sommeil", value: "3 h 20", Icon: Moon },
      { label: "Dernier poids", value: "6,2 kg", Icon: Ruler },
    ],
    note: "La prochaine personne qui prend le relais retrouve le même carnet, au même endroit.",
  },
  child: {
    name: "Le petit monde de Noé",
    caption: "Chapitre 03 · 4 ans",
    stats: [
      { label: "Routines", value: "3 / 5", Icon: Check },
      { label: "Idée du jour", value: "Créer", Icon: Sparkles },
      { label: "Souvenirs", value: "48", Icon: BookHeart },
    ],
    note: "Une routine du soir, une nouvelle découverte. Des repères doux pour grandir à son rythme.",
  },
};

export default function LandingPage() {
  const [phase, setPhase] = useState<JourneyPhase>("baby");
  const demo = preview[phase];
  return (
    <div className="mt-landing">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "MamaTrack",
            url: "https://mamatrack.fr",
            description:
              "Carnet familial de la grossesse aux 6 ans : repas, sommeil, croissance, santé, routines et souvenirs.",
            applicationCategory: "HealthApplication",
            operatingSystem: "Web",
            inLanguage: "fr",
            offers: {
              "@type": "Offer",
              price: "0",
              priceCurrency: "EUR",
              description:
                "Suivi essentiel gratuit ; options Premium disponibles.",
            },
          }),
        }}
      />
      <header className="mt-landing-nav">
        <BrandMark />
        <nav className="mt-landing-links" aria-label="Découvrir MamaTrack">
          <a href="#parcours">Votre parcours</a>
          <a href="#quotidien">Le quotidien</a>
          <a href="#questions">Vos questions</a>
        </nav>
        <Link href="/auth/login" className="mt-button mt-button-secondary">
          Se connecter <ArrowRight size={14} />
        </Link>
      </header>
      <section className="mt-landing-hero">
        <div>
          <span className="mt-pill">
            <span
              className="size-1.5 rounded-full bg-forest"
              style={{ background: "var(--forest)" }}
            />{" "}
            De la grossesse aux 6 ans
          </span>
          <h1 className="mt-display">
            Leur petite vie.
            <br />
            Votre{" "}
            <em>
              grande
              <br className="hidden sm:block" /> aventure.
            </em>
          </h1>
          <p className="mt-intro">
            Le carnet qui grandit avec votre famille. Moins de choses à retenir,
            plus de moments à vivre. Ensemble.
          </p>
          <div className="mt-landing-cta">
            <Link href="/auth/signup" className="mt-button">
              Commencer notre histoire <ArrowRight size={16} />
            </Link>
            <a href="#quotidien" className="mt-link">
              Explorer l’application <ArrowRight size={14} />
            </a>
          </div>
          <div className="mt-landing-proof">
            <span>
              <Check size={13} /> L’essentiel gratuit
            </span>
            <span>
              <ShieldCheck size={13} /> Sans publicité
            </span>
            <span>
              <Users size={13} /> Pour toute la famille
            </span>
          </div>
        </div>
        <div className="mt-world">
          <Image
            src="/art/family-world.webp"
            alt=""
            width={1122}
            height={1402}
            priority
            sizes="(max-width:639px) 85vw, 45vw"
            className="mt-world-photo"
          />
          <div className="mt-world-orbit">
            <strong>0 → 6</strong>
            <span>ans de découvertes</span>
          </div>
          <div className="mt-world-caption">
            <div className="flex items-center gap-2.5">
              <span className="mt-icon-soft !size-9">
                <BookHeart size={18} />
              </span>
              <strong>Une histoire qui continue.</strong>
            </div>
            <p>
              Un seul carnet. Tous vos chapitres.
              <br />
              Et vos souvenirs, toujours avec vous.
            </p>
            <JourneyRail phase="baby" compact />
          </div>
        </div>
      </section>
      <div className="mt-landing-strip">
        <span>
          <Heart size={18} /> Vous, à chaque étape
        </span>
        <span>
          <Users size={18} /> Des proches qui prennent le relais
        </span>
        <span>
          <Leaf size={18} /> À votre rythme, sans pression
        </span>
      </div>
      <section id="parcours" className="mt-landing-section">
        <p className="mt-eyebrow">Trois chapitres. Une même histoire.</p>
        <h2 className="mt-display">
          Ils grandissent.
          <br />
          Votre carnet aussi.
        </h2>
        <p>
          Plus besoin de changer d’application quand la vie change. MamaTrack
          s’adapte à l’étape de chaque enfant.
        </p>
        <div className="mt-chapters">
          {chapters.map(
            ({ phase: key, number, title, range, description, tags, Icon }) => (
              <article key={key} className="mt-chapter">
                <div className="flex justify-between items-center">
                  <span className="mt-pill">
                    <Icon size={12} />
                    {range}
                  </span>
                  <span className="mt-eyebrow">{number}</span>
                </div>
                <JourneyArtwork phase={key} className="mt-chapter-art" />
                <h3>{title}</h3>
                <p>{description}</p>
                <ul>
                  {tags.map((tag) => (
                    <li key={tag}>{tag}</li>
                  ))}
                </ul>
              </article>
            ),
          )}
        </div>
      </section>
      <section id="quotidien" className="mt-product-section">
        <div>
          <div>
            <p className="mt-eyebrow">
              Moins de charge mentale. Plus de présence.
            </p>
            <h2 className="mt-display">
              Tout leur quotidien.
              <br />
              Un regard suffit.
            </h2>
            <p>
              Les bonnes informations au bon moment. Retrouvez le dernier repas,
              la prochaine visite ou une nouvelle idée à partager, puis
              retournez profiter de votre famille.
            </p>
            <div className="mt-6 space-y-4">
              {[
                {
                  Icon: Clock,
                  text: "Des actions courtes, même au milieu de la nuit.",
                },
                {
                  Icon: Users,
                  text: "Le même carnet pour les proches que vous invitez.",
                },
                {
                  Icon: Sprout,
                  text: "Un accueil qui évolue à son troisième anniversaire.",
                },
              ].map(({ Icon, text }) => (
                <div key={text} className="flex items-center gap-3">
                  <span className="mt-icon-soft !size-8">
                    <Icon size={15} />
                  </span>
                  <span className="text-xs leading-6">{text}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-demo-card">
            <div
              className="mt-demo-tabs"
              role="tablist"
              aria-label="Aperçu des trois parcours"
            >
              {chapters.map(({ phase: key, range }) => (
                <button
                  id={`demo-tab-${key}`}
                  key={key}
                  role="tab"
                  aria-controls="demo-panel"
                  aria-selected={phase === key}
                  tabIndex={phase === key ? 0 : -1}
                  onKeyDown={(event) => {
                    const keys = chapters.map((chapter) => chapter.phase);
                    const index = keys.indexOf(key);
                    const next =
                      event.key === "ArrowRight"
                        ? (index + 1) % keys.length
                        : event.key === "ArrowLeft"
                          ? (index + keys.length - 1) % keys.length
                          : event.key === "Home"
                            ? 0
                            : event.key === "End"
                              ? keys.length - 1
                              : null;
                    if (next !== null) {
                      event.preventDefault();
                      setPhase(keys[next]);
                      document
                        .getElementById(`demo-tab-${keys[next]}`)
                        ?.focus();
                    }
                  }}
                  onClick={() => setPhase(key)}
                >
                  {key === "pregnancy"
                    ? "Grossesse"
                    : key === "baby"
                      ? "0–3 ans"
                      : "3–6 ans"}
                  <span className="sr-only"> · {range}</span>
                </button>
              ))}
            </div>
            <div
              id="demo-panel"
              role="tabpanel"
              aria-labelledby={`demo-tab-${phase}`}
            >
              <div className="mt-demo-title">
                <div>
                  <p className="mt-eyebrow">{demo.caption}</p>
                  <h3 className="mt-2">{demo.name}</h3>
                </div>
                <span className="mt-icon-soft !size-11">
                  <Heart size={19} />
                </span>
              </div>
              <div className="mt-demo-metrics">
                {demo.stats.map(({ label, value, Icon }) => (
                  <div className="mt-demo-metric" key={label}>
                    <Icon size={17} style={{ color: "var(--forest)" }} />
                    <strong>{value}</strong>
                    <span>{label}</span>
                  </div>
                ))}
              </div>
              <div className="mt-note mt-4">{demo.note}</div>
              <JourneyRail phase={phase} />
            </div>
            <small className="mt-demo-example">
              Aperçu de l’interface avec des données fictives.
            </small>
          </div>
        </div>
      </section>
      <section className="mt-landing-section">
        <p className="mt-eyebrow">Pensée pour la vraie vie</p>
        <h2 className="mt-display">
          De petits détails.
          <br />
          Une vraie différence.
        </h2>
        <div className="mt-features">
          {[
            {
              Icon: ShieldCheck,
              title: "Votre cercle, vos choix.",
              description:
                "Invitez les personnes qui comptent. Choisissez si elles peuvent contribuer au carnet ou simplement le consulter.",
            },
            {
              Icon: CalendarDays,
              title: "Un fil pour la santé.",
              description:
                "Rendez-vous, mesures et vaccins réunis. Un calendrier français actualisé et des repères à valider avec votre professionnel de santé.",
            },
            {
              Icon: BookHeart,
              title: "Les moments qui restent.",
              description:
                "Une photo, un premier mot, une grande fierté. Retrouvez votre histoire dans un journal privé, même quand le quotidien change.",
            },
          ].map(({ Icon, title, description }) => (
            <article key={title}>
              <span className="mt-icon-soft !size-12">
                <Icon size={23} />
              </span>
              <h3>{title}</h3>
              <p>{description}</p>
            </article>
          ))}
        </div>
      </section>
      <section id="questions" className="mt-landing-section mt-landing-faq">
        <div>
          <p className="mt-eyebrow">On vous accompagne</p>
          <h2 className="mt-display">
            Quelques questions
            <br />
            avant de commencer ?
          </h2>
        </div>
        <div>
          {[
            {
              q: "La grossesse et le carnet bébé sont-ils vraiment réunis ?",
              a: "Oui. Votre compte MamaTrack donne accès aux trois chapitres. Quand vous confirmez la naissance, son carnet s’ouvre automatiquement et vos données de grossesse restent accessibles. À 3 ans, l’accueil évolue vers les routines et les découvertes de l’enfance.",
            },
            {
              q: "Que se passe-t-il à la date du terme ?",
              a: "MamaTrack vous propose de confirmer l’arrivée de votre bébé. La date prévue ne signifie pas que la naissance a eu lieu : vous gardez votre espace grossesse tant que vous n’avez pas confirmé.",
            },
            {
              q: "J’utilisais BabyTrack. Est-ce que je perds mon carnet ?",
              a: "Non. Connectez-vous à MamaTrack, puis utilisez « Récupérer mon carnet BabyTrack » avec votre connexion BabyTrack. Vos enfants, leurs suivis et leurs photos sont copiés ; votre ancien carnet reste disponible.",
            },
            {
              q: "Peut-on suivre plusieurs enfants et partager avec les proches ?",
              a: "Oui. Chaque enfant possède son carnet et son étape. Invitez un coparent ou une autre personne de confiance en choisissant son droit d’accès. Une nouvelle grossesse peut être suivie en parallèle.",
            },
            {
              q: "Est-ce gratuit et faut-il installer une application ?",
              a: "Le suivi essentiel est gratuit et sans publicité. Des outils Premium, dont l’assistant IA, sont proposés en option. MamaTrack s’ouvre dans votre navigateur et peut être ajouté à l’écran d’accueil de votre téléphone. Une connexion est nécessaire pour enregistrer et partager les données du carnet.",
            },
          ].map(({ q, a }) => (
            <details key={q}>
              <summary>
                {q}
                <ChevronDown size={16} className="shrink-0" />
              </summary>
              <p>{a}</p>
            </details>
          ))}
        </div>
      </section>
      <section className="mt-landing-end">
        <p className="mt-eyebrow !text-current mb-4">
          Les jours passent. Les souvenirs restent.
        </p>
        <h2 className="mt-display">
          Une belle histoire
          <br />
          commence par un petit pas.
        </h2>
        <p>Le vôtre, c’est ici.</p>
        <Link href="/auth/signup" className="mt-button">
          Créer mon carnet de famille <ArrowRight size={16} />
        </Link>
      </section>
      <footer className="mt-footer">
        <BrandMark />
        <div className="mt-footer-links">
          <Link href="/mentions-legales">Mentions légales</Link>
          <Link href="/confidentialite">Confidentialité</Link>
          <Link href="/cgu">Conditions d’utilisation</Link>
          <span>© {new Date().getFullYear()} MamaTrack</span>
        </div>
      </footer>
    </div>
  );
}
