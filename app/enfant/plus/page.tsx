
import { redirect } from "next/navigation";
import { requireUserAndBaby, getCachedUser } from "@/lib/enfant/baby";
import { BABY_MODULES } from "@/lib/enfant/constants";
import { ModuleGroup } from "@/components/enfant/plus/ModuleGroup";

export const metadata = { title: "Plus — MamaTrack" };

const MODULE_GROUPS: { title: string; slugs: readonly string[] }[] = [
  { title: "Quotidien", slugs: ["feed", "sleep", "diapers", "diversification"] },
  { title: "Santé & croissance", slugs: ["growth", "vaccines", "health", "agenda"] },
  { title: "Souvenirs & repères", slugs: ["diary", "milestones", "conseils", "urgences"] },
  { title: "Outils", slugs: ["timeline", "reports", "coach", "pediatrician", "duo", "settings"] },
];

export default async function PlusPage() {
  const user = await getCachedUser();
  if (!user) redirect("/auth/login");

  const { baby } = await requireUserAndBaby(user);
  if (!baby) redirect("/enfant/onboarding");

  type Entry = { slug: string; title: string; desc: string };
  const groups: { title: string; modules: Entry[] }[] = MODULE_GROUPS.map((g) => ({
    title: g.title,
    modules: g.slugs.flatMap((slug) => {
      const m = BABY_MODULES.find((x) => x.slug === slug);
      return m ? [{ slug: m.slug, title: m.title, desc: m.desc } as Entry] : [];
    }),
  }));

  return (
    <div className="min-h-full bg-gradient-to-b from-brand-soft/20 via-background to-background">


      <section
        id="main-content"
        className="mx-auto max-w-3xl px-4 py-5 sm:px-5 sm:py-8"
      >
        <div className="mb-6 sm:mb-7">
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
            Plus
          </h1>
          <p className="mt-1 text-sm text-foreground-muted">
            Tous les modules de suivi pour {baby.name}.
          </p>
        </div>

        <div className="space-y-6 sm:space-y-7">
          {groups.map((g) => (
            <ModuleGroup key={g.title} title={g.title} modules={g.modules} />
          ))}
        </div>
      </section>

    </div>
  );
}
