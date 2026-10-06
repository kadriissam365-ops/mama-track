import { childAgeMonths } from "@/lib/family-journey";
import { ModuleShell } from "@/components/enfant/ModuleShell";
import { requireUserAndBaby } from "@/lib/enfant/baby";
import {
  AGE_RANGES,
  ageRangeForMonths,
  CATEGORY_META,
  type ConseilCategory,
} from "@/lib/enfant/conseils-data";

export const metadata = { title: "Conseils — MamaTrack" };

type SearchParams = Promise<{ age?: string; cat?: string }>;

export default async function ConseilsPage({
  searchParams,
}: {
  searchParams?: SearchParams;
}) {
  const sp = searchParams ? await searchParams : {};
  const { baby } = await requireUserAndBaby();

  // Default age range : prefer baby's range, else first
  const babyMonths = baby ? childAgeMonths(baby.birth_date) : null;
  const defaultRange =
    (babyMonths !== null ? ageRangeForMonths(babyMonths) : null) ??
    AGE_RANGES[0];

  const selectedAge = AGE_RANGES.find((r) => r.slug === sp.age) ?? defaultRange;
  const selectedCat = (sp.cat as ConseilCategory | undefined) ?? null;

  const conseils = selectedCat
    ? selectedAge.conseils.filter((c) => c.category === selectedCat)
    : selectedAge.conseils;

  const cats = Array.from(
    new Set(selectedAge.conseils.map((c) => c.category)),
  ) as ConseilCategory[];

  const buildHref = (age: string, cat: ConseilCategory | null) => {
    const params = new URLSearchParams();
    params.set("age", age);
    if (cat) params.set("cat", cat);
    return `/enfant/conseils?${params.toString()}`;
  };

  return (
    <ModuleShell
      slug="conseils"
      title="Conseils"
      subtitle={
        baby
          ? `Repères pour accompagner ${baby.name} au quotidien.`
          : "Repères de 0 à 6 ans — par tranche d'âge."
      }
    >
      <nav aria-label="Tranche d'âge" className="mb-6">
        <div className="mb-2 text-xs font-medium uppercase tracking-wide text-foreground-muted">
          Tranche d&apos;âge
        </div>
        <ul className="flex flex-wrap gap-2">
          {AGE_RANGES.map((r) => {
            const active = r.slug === selectedAge.slug;
            return (
              <li key={r.slug}>
                <a
                  href={buildHref(r.slug, selectedCat)}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition ${
                    active
                      ? "border-brand bg-brand text-white"
                      : "border-border bg-surface text-foreground-muted hover:border-border-strong hover:text-foreground"
                  }`}
                >
                  <span aria-hidden>{r.emoji}</span>
                  {r.label}
                </a>
              </li>
            );
          })}
        </ul>
      </nav>

      <nav aria-label="Catégorie" className="mb-8">
        <div className="mb-2 text-xs font-medium uppercase tracking-wide text-foreground-muted">
          Catégorie
        </div>
        <ul className="flex flex-wrap gap-2">
          <li>
            <a
              href={buildHref(selectedAge.slug, null)}
              className={`rounded-full border px-3 py-1.5 text-sm transition ${
                selectedCat === null
                  ? "border-brand bg-brand-soft text-brand"
                  : "border-border bg-surface text-foreground-muted hover:text-foreground"
              }`}
            >
              Tout
            </a>
          </li>
          {cats.map((c) => {
            const meta = CATEGORY_META[c];
            const active = c === selectedCat;
            return (
              <li key={c}>
                <a
                  href={buildHref(selectedAge.slug, c)}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition ${
                    active
                      ? "border-brand bg-brand-soft text-brand"
                      : "border-border bg-surface text-foreground-muted hover:text-foreground"
                  }`}
                >
                  <span aria-hidden>{meta.emoji}</span>
                  {meta.label}
                </a>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="mb-6 rounded-2xl border border-border bg-brand-soft/40 p-5">
        <p className="text-sm text-foreground">
          <span aria-hidden>{selectedAge.emoji}</span> {selectedAge.intro}
        </p>
      </div>

      <ul className="grid gap-4 bt-stagger sm:grid-cols-2">
        {conseils.map((c) => {
          const meta = CATEGORY_META[c.category];
          return (
            <li
              key={c.slug}
              className="rounded-2xl border border-border bg-surface p-5 shadow-sm transition hover:border-border-strong"
            >
              <div className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-wide text-foreground-muted">
                <span aria-hidden>{meta.emoji}</span>
                {meta.label}
              </div>
              <h3 className="mb-2 font-semibold text-foreground">{c.title}</h3>
              <p className="text-sm leading-relaxed text-foreground-muted">
                {c.body}
              </p>
            </li>
          );
        })}
      </ul>

      <p className="mt-10 text-center text-xs text-foreground-muted">
        Sources :{" "}
        <a
          href="https://www.cdc.gov/child-development/positive-parenting-tips/preschooler-3-5-years.html"
          target="_blank"
          rel="noopener noreferrer"
          className="underline"
        >
          CDC · Accompagner les 3–5 ans
        </a>
        ,{" "}
        <a
          href="https://www.ameli.fr/assure/sante/themes/suivi-medical-de-l-enfant-et-de-l-adolescent"
          target="_blank"
          rel="noopener noreferrer"
          className="underline"
        >
          Assurance Maladie
        </a>
        , Santé publique France, OMS et mpedia.fr. Contenu indicatif — ne
        remplace jamais l&apos;avis d&apos;un professionnel de santé.
      </p>
    </ModuleShell>
  );
}
