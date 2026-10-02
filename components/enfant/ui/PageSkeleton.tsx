import { Heart } from "lucide-react";
import Link from "next/link";
import { BottomNav } from "@/components/enfant/BottomNav";

type Variant = "dashboard" | "module" | "list";

export function PageSkeleton({ variant = "module" }: { variant?: Variant }) {
  return (
    <div className="bt-bg-mesh min-h-screen bg-background with-bottom-nav">
      <header className="sticky top-0 z-30 border-b border-border/60 glass safe-pt">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
          <Link
            href="/enfant/dashboard"
            className="flex items-center gap-2.5 pointer-events-none"
            tabIndex={-1}
          >
            <span className="bt-bg-gradient flex h-9 w-9 items-center justify-center rounded-2xl shadow-[var(--shadow-glow)]">
              <Heart className="h-4 w-4 fill-white text-white" />
            </span>
            <span className="font-display text-lg font-medium tracking-[-0.015em] text-foreground">MamaTrack</span>
          </Link>
          <div className="h-10 w-10 rounded-full bt-skeleton" />
        </div>
      </header>

      <section className="mx-auto max-w-5xl space-y-5 px-4 py-5 sm:space-y-6 sm:px-5 sm:py-8">
        {variant === "dashboard" ? (
          <>
            <SkBlock className="h-28 rounded-3xl" />
            <div className="grid grid-cols-4 gap-2.5">
              {Array.from({ length: 4 }).map((_, i) => (
                <SkBlock key={i} className="h-20 rounded-2xl" />
              ))}
            </div>
            <div className="grid grid-cols-2 gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <SkBlock key={i} className="h-32 rounded-2xl" />
              ))}
            </div>
            <SkBlock className="h-24 rounded-3xl" />
          </>
        ) : variant === "list" ? (
          <>
            <SkBlock className="h-10 w-44 rounded-xl" />
            <div className="space-y-2.5">
              {Array.from({ length: 6 }).map((_, i) => (
                <SkBlock key={i} className="h-16 rounded-2xl" />
              ))}
            </div>
          </>
        ) : (
          <>
            <SkBlock className="h-10 w-48 rounded-xl" />
            <div className="grid grid-cols-3 gap-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <SkBlock key={i} className="h-20 rounded-2xl" />
              ))}
            </div>
            <SkBlock className="h-44 rounded-3xl" />
            <div className="space-y-2.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <SkBlock key={i} className="h-14 rounded-2xl" />
              ))}
            </div>
          </>
        )}
      </section>

      <BottomNav />
    </div>
  );
}

function SkBlock({ className = "" }: { className?: string }) {
  return <div className={`bt-skeleton bg-surface-muted ${className}`} />;
}
