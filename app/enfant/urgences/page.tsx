import { ModuleShell } from "@/components/enfant/ModuleShell";
import {
  EMERGENCY_NUMBERS,
  EMERGENCY_FICHES,
  type EmergencyFiche,
} from "@/lib/enfant/urgences-data";

export const metadata = {
  title: "Urgences — MamaTrack",
  description:
    "Numéros d'urgence pédiatriques et conduite à tenir : étouffement, fièvre, brûlure, intoxication, noyade, chute…",
};

const SEVERITY_STYLES: Record<EmergencyFiche["severity"], string> = {
  vital: "border-danger/40 bg-danger-soft",
  urgent: "border-warning/40 bg-warning-soft",
  consultation: "border-info/30 bg-info-soft",
};

const SEVERITY_LABEL: Record<EmergencyFiche["severity"], string> = {
  vital: "Urgence vitale",
  urgent: "Urgent",
  consultation: "Consultation",
};

const PRIORITY_STYLES: Record<
  (typeof EMERGENCY_NUMBERS)[number]["priority"],
  string
> = {
  vital: "border-danger/40 bg-danger-soft",
  urgent: "border-warning/40 bg-warning-soft",
  info: "border-border bg-surface",
};

export default function UrgencesPage() {
  return (
    <ModuleShell
      slug="urgences"
      title="Urgences"
      subtitle="Numéros utiles + fiches premiers secours pour bébé. En cas de doute, appelle le 15."
    >
      <div className="mb-8 rounded-2xl border-2 border-danger/50 bg-danger-soft p-5 text-danger-text">
        <div className="mb-2 text-xs font-semibold uppercase tracking-wide">
          🆘 Urgence vitale
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <a
            href="tel:15"
            className="rounded-full bg-danger px-5 py-2.5 text-lg font-bold text-white shadow-md transition hover:opacity-90"
          >
            Appeler le 15 (SAMU)
          </a>
          <a
            href="tel:112"
            className="rounded-full border-2 border-danger px-5 py-2.5 text-lg font-bold text-danger transition hover:bg-danger-soft"
          >
            112 (Europe)
          </a>
        </div>
        <p className="mt-3 text-sm">
          Reste en ligne, parle calmement. Indique : âge de bébé, ce qui se
          passe, adresse précise, ton numéro de rappel.
        </p>
      </div>

      <section className="mb-10">
        <h2 className="mb-4 text-lg font-semibold text-foreground">
          Numéros d&apos;urgence
        </h2>
        <ul className="grid gap-3 sm:grid-cols-2">
          {EMERGENCY_NUMBERS.map((n) => (
            <li
              key={n.slug}
              className={`rounded-2xl border p-4 transition ${PRIORITY_STYLES[n.priority]}`}
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl" aria-hidden>
                  {n.emoji}
                </span>
                <div className="flex-1">
                  <div className="flex items-baseline gap-2">
                    <a
                      href={`tel:${n.number.replace(/\s+/g, "")}`}
                      className="text-xl font-bold text-foreground hover:underline"
                    >
                      {n.number}
                    </a>
                    <span className="text-sm font-medium text-foreground-muted">
                      {n.label}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-foreground-muted">
                    {n.description}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="mb-2 text-lg font-semibold text-foreground">
          Que faire si…
        </h2>
        <p className="mb-6 text-sm text-foreground-muted">
          Fiches premiers secours pédiatriques. Pour mémoire — n&apos;attends
          pas une urgence pour les lire.
        </p>

        <ul className="space-y-4">
          {EMERGENCY_FICHES.map((f) => (
            <li
              key={f.slug}
              className={`overflow-hidden rounded-2xl border ${SEVERITY_STYLES[f.severity]}`}
            >
              <details className="group">
                <summary className="flex cursor-pointer items-center justify-between gap-3 p-5 transition hover:bg-black/[0.02] dark:hover:bg-white/[0.02]">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl" aria-hidden>
                      {f.emoji}
                    </span>
                    <div>
                      <h3 className="font-semibold text-foreground">
                        {f.title}
                      </h3>
                      <span className="text-[11px] font-medium uppercase tracking-wide text-foreground-muted">
                        {SEVERITY_LABEL[f.severity]}
                      </span>
                    </div>
                  </div>
                  <span
                    className="text-foreground-muted transition group-open:rotate-180"
                    aria-hidden
                  >
                    ▾
                  </span>
                </summary>

                <div className="border-t border-border/60 px-5 pb-5 pt-4">
                  <div className="mb-4 rounded-xl border border-danger/30 bg-danger-soft p-3 text-sm text-danger-text">
                    <strong>Quand appeler le 15 :</strong> {f.whenToCall}
                  </div>

                  <div className="mb-4">
                    <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-foreground-muted">
                      Conduite à tenir
                    </div>
                    <ol className="space-y-2 text-sm text-foreground">
                      {f.steps.map((s, i) => (
                        <li key={i} className="flex gap-2">
                          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand text-[11px] font-bold text-white">
                            {i + 1}
                          </span>
                          <span>{s}</span>
                        </li>
                      ))}
                    </ol>
                  </div>

                  {f.doNot && f.doNot.length > 0 && (
                    <div>
                      <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-foreground-muted">
                        À NE PAS faire
                      </div>
                      <ul className="space-y-1.5 text-sm text-foreground">
                        {f.doNot.map((d, i) => (
                          <li key={i} className="flex gap-2">
                            <span aria-hidden className="text-danger">
                              ✗
                            </span>
                            <span>{d}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </details>
            </li>
          ))}
        </ul>
      </section>

      <p className="mt-10 text-center text-xs text-foreground-muted">
        Sources : SAMU, Centre antipoison, Société française de pédiatrie. Ces
        fiches sont indicatives — elles ne remplacent pas un appel au 15 ni un
        avis médical.
      </p>
    </ModuleShell>
  );
}
