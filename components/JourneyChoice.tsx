"use client";
import Link from "next/link";
import { Baby, Heart, ArrowRight, BookHeart, Sprout } from "lucide-react";
import BrandMark from "@/components/BrandMark";
export default function JourneyChoice({
  onPregnancy,
}: {
  onPregnancy: () => void;
}) {
  const card =
    "mt-card flex w-full items-center gap-4 text-left transition hover:border-brand";
  return (
    <section className="mx-auto max-w-xl px-5 py-10">
      <BrandMark />
      <div className="my-8">
        <p className="mt-eyebrow">Bienvenue dans votre petit monde</p>
        <h1 className="mt-display mt-3">
          Chaque famille
          <br />a son point de départ.
        </h1>
        <p className="mt-4 text-sm leading-7 text-foreground-muted">
          Choisissez votre chapitre. Votre espace évoluera avec votre famille ;
          vous pourrez toujours retrouver les précédents.
        </p>
      </div>
      <div className="space-y-4">
        <button className={card} onClick={onPregnancy}>
          <span className="mt-icon-soft">
            <Heart size={24} />
          </span>
          <span className="flex-1">
            <strong className="block">Je prépare une naissance</strong>
            <span className="text-xs text-foreground-muted">
              Mon suivi de grossesse, semaine après semaine
            </span>
          </span>
          <ArrowRight size={17} />
        </button>
        <Link href="/enfant/naissance" className={card}>
          <span className="mt-icon-soft">
            <Baby size={24} />
          </span>
          <span className="flex-1">
            <strong className="block">Mon bébé est déjà né</strong>
            <span className="text-xs text-foreground-muted">
              Son carnet, de la naissance à 3 ans
            </span>
          </span>
          <ArrowRight size={17} />
        </Link>
        <Link href="/enfant/naissance?parcours=enfant" className={card}>
          <span className="mt-icon-soft">
            <Sprout size={24} />
          </span>
          <span className="flex-1">
            <strong className="block">Mon enfant a 3 à 6 ans</strong>
            <span className="text-xs text-foreground-muted">
              Rituels, découvertes, souvenirs et santé
            </span>
          </span>
          <ArrowRight size={17} />
        </Link>
        <Link href="/enfant/import" className={card}>
          <span className="mt-icon-soft">
            <BookHeart size={24} />
          </span>
          <span className="flex-1">
            <strong className="block">J’utilise déjà BabyTrack</strong>
            <span className="text-xs text-foreground-muted">
              Retrouver mes enfants et mes suivis
            </span>
          </span>
          <ArrowRight size={17} />
        </Link>
      </div>
    </section>
  );
}
