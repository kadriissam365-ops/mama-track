import Link from "next/link";
import { ArrowLeft, Heart } from "lucide-react";
import { HeaderThemeToggle } from "./HeaderThemeToggle";
import { ModuleIconCircle } from "@/lib/enfant/module-icons";

export function ModuleShell({
  icon,
  slug,
  title,
  subtitle,
  viewerBadge,
  children,
}: {
  icon?: string;
  slug?: string;
  title: string;
  subtitle?: string;
  /** Affiche un badge "Lecture seule" dans le header pour les viewers. */
  viewerBadge?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="bt-bg-mesh min-h-full bg-background">
      <header className="border-b border-border/60 glass">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-2 px-4 py-3 sm:px-6">
          <Link
            href="/enfant/dashboard"
            aria-label="Retour au dashboard"
            className="inline-flex h-10 items-center gap-1.5 rounded-full border border-border bg-surface/80 px-3 text-sm text-foreground-muted shadow-[var(--shadow-xs)] transition hover:border-border-strong hover:bg-surface hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Retour</span>
          </Link>
          <div className="flex min-w-0 flex-1 items-center justify-center gap-2.5">
            {slug ? (
              <ModuleIconCircle slug={slug} size="sm" />
            ) : icon ? (
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-soft text-lg" aria-hidden>
                {icon}
              </span>
            ) : (
              <span className="bt-bg-gradient flex h-8 w-8 items-center justify-center rounded-xl shadow-[var(--shadow-glow)]">
                <Heart className="h-3.5 w-3.5 fill-white text-white" />
              </span>
            )}
            <h1 className="font-display truncate text-lg font-medium tracking-[-0.015em] text-foreground sm:text-xl">
              {title}
            </h1>
          </div>
          <HeaderThemeToggle />
        </div>
      </header>

      <section id="main-content" className="mx-auto max-w-4xl px-4 py-5 sm:px-5 sm:py-7 bt-fade-up">
        {viewerBadge && (
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-info/30 bg-info-soft px-3 py-1 text-xs font-medium text-info-text">
            <span aria-hidden>👀</span>
            Lecture seule — accès partagé par le/la propriétaire
          </div>
        )}
        {subtitle && (
          <p className="mb-5 text-sm text-foreground-muted sm:mb-6 sm:text-base">{subtitle}</p>
        )}
        {children}
      </section>

    </div>
  );
}

export function ComingSoonCard({ items }: { items: string[] }) {
  return (
    <div className="rounded-2xl border border-dashed border-border-strong bg-surface p-8">
      <div className="mb-4 text-sm font-medium uppercase tracking-wide text-brand">
        En cours de développement
      </div>
      <ul className="space-y-2 text-sm text-foreground">
        {items.map((it) => (
          <li key={it} className="flex items-start gap-2">
            <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-brand" />
            <span>{it}</span>
          </li>
        ))}
      </ul>
      <p className="mt-6 text-xs text-foreground-muted">
        Connecte ton compte Supabase pour débloquer l&apos;enregistrement des
        données.
      </p>
    </div>
  );
}
