"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { getModuleIcon } from "@/lib/enfant/module-icons";
import { RevealStagger, RevealItem } from "@/components/enfant/ui";

type ModuleEntry = {
  slug: string;
  title: string;
  desc: string;
};

export function ModuleGroup({
  title,
  modules,
}: {
  title: string;
  modules: ModuleEntry[];
}) {
  return (
    <section>
      <h2 className="mb-3 px-1 text-[10.5px] font-semibold uppercase tracking-[0.12em] text-foreground-subtle">
        {title}
      </h2>
      <RevealStagger
        className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 sm:gap-3 lg:grid-cols-3"
        stagger={0.035}
        delayChildren={0.04}
      >
        {modules.map((m) => {
          const { Icon } = getModuleIcon(m.slug);
          return (
            <RevealItem key={m.slug}>
              <Link
                href={`/enfant/${m.slug}`}
                className="group flex items-center gap-3.5 rounded-2xl border border-border bg-surface px-4 py-3.5 shadow-[var(--shadow-xs)] transition hover:-translate-y-0.5 hover:border-border-brand hover:shadow-[var(--shadow-card)] focus-visible:outline-2 focus-visible:outline-brand focus-visible:outline-offset-2"
              >
                <span
                  aria-hidden
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-surface-muted text-foreground-muted transition group-hover:bg-brand-soft group-hover:text-brand-strong"
                >
                  <Icon className="h-[19px] w-[19px]" strokeWidth={1.9} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold leading-tight tracking-[-0.005em] text-foreground">
                    {m.title}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-foreground-muted">
                    {m.desc}
                  </p>
                </div>
                <ChevronRight
                  aria-hidden
                  className="h-4 w-4 shrink-0 text-foreground-subtle transition group-hover:translate-x-0.5 group-hover:text-foreground-muted"
                />
              </Link>
            </RevealItem>
          );
        })}
      </RevealStagger>
    </section>
  );
}
