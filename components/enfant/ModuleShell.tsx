import Link from "next/link";
import { ArrowLeft } from "lucide-react";
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
  viewerBadge?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-shell">
      <div className="mb-7">
        <Link href="/enfant/dashboard" className="mt-link !text-[11px] mb-5">
          <ArrowLeft size={14} />
          Notre quotidien
        </Link>
        <div className="flex items-center gap-4">
          {slug ? (
            <ModuleIconCircle slug={slug} size="md" />
          ) : icon ? (
            <span aria-hidden className="mt-icon-soft text-xl">
              {icon}
            </span>
          ) : null}
          <div>
            <h1 className="mt-module-heading">{title}</h1>
            {subtitle && (
              <p className="mt-2 text-xs leading-6 text-foreground-muted">
                {subtitle}
              </p>
            )}
          </div>
        </div>
        {viewerBadge && (
          <span className="mt-pill mt-4">Lecture seule · carnet partagé</span>
        )}
      </div>
      {children}
    </section>
  );
}
