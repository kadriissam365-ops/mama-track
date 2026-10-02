import Link from "next/link";

const LEGAL_LINKS = [
  { href: "/mentions-legales", label: "Mentions légales" },
  { href: "/cgu", label: "CGU" },
  { href: "/confidentialite", label: "Confidentialité" },
  { href: "/cookies", label: "Cookies" },
];

export function LegalShell({
  title,
  updatedAt,
  children,
}: {
  title: string;
  updatedAt: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <nav className="sticky top-0 z-30 border-b border-border bg-surface/80 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-5 py-3">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl" aria-hidden>
              🍼
            </span>
            <span className="font-semibold text-foreground">MamaTrack</span>
          </Link>
          <Link
            href="/"
            className="text-sm text-foreground-muted hover:text-foreground"
          >
            ← Accueil
          </Link>
        </div>
      </nav>

      <article className="mx-auto max-w-3xl px-5 py-10">
        <h1 className="mb-2 text-3xl font-bold text-foreground">{title}</h1>
        <p className="mb-8 text-sm text-foreground-muted">
          Dernière mise à jour : {updatedAt}
        </p>
        <div className="space-y-6 text-sm leading-relaxed text-foreground [&_h2]:mt-8 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-foreground [&_h3]:mt-6 [&_h3]:font-semibold [&_h3]:text-foreground [&_a]:text-brand [&_a]:underline hover:[&_a]:text-brand-strong [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1 [&_p]:text-foreground-muted">
          {children}
        </div>
      </article>

      <footer className="border-t border-border px-5 py-8 text-center text-sm text-foreground-muted">
        <div className="mx-auto max-w-3xl space-y-3">
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-2">
            {LEGAL_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="hover:text-foreground"
              >
                {l.label}
              </Link>
            ))}
          </div>
          <p>
            © {new Date().getFullYear()} MamaTrack · Édité par Issam Kadri
          </p>
        </div>
      </footer>
    </div>
  );
}
