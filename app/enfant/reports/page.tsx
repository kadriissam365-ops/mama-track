import { redirect } from "next/navigation";
import { ModuleShell } from "@/components/enfant/ModuleShell";
import { requireUserAndBaby } from "@/lib/enfant/baby";
import { requirePremium } from "@/lib/enfant/subscription";
import {
  buildMonthlyReport,
  lastNMonths,
  formatMinutes,
  type MonthlyReport,
} from "@/lib/enfant/report-data";

export const metadata = { title: "Rapports — MamaTrack" };

export const dynamic = "force-dynamic";

export default async function ReportsPage() {
  const { user, baby, supabase } = await requireUserAndBaby();
  if (!user) redirect("/auth/login");
  if (!baby) redirect("/enfant/onboarding");
  await requirePremium("reports");

  const months = lastNMonths(6);
  const reports = await Promise.all(
    months.map((r) => buildMonthlyReport(supabase, baby, r)),
  );

  return (
    <ModuleShell
      slug="reports"
      title="Rapports"
      subtitle={`${baby.name} — récap mensuel téléchargeable`}
    >
      <p className="mb-6 text-sm text-foreground-muted">
        Un PDF prêt à imprimer ou à partager avec ton pédiatre. Inclut
        alimentation, sommeil, couches, croissance, vaccins, étapes franchies
        et journal du mois.
      </p>

      <ul className="space-y-3">
        {reports.map((r) => (
          <ReportCard key={`${r.range.year}-${r.range.month}`} report={r} />
        ))}
      </ul>

      <p className="mt-10 text-center text-xs text-foreground-muted">
        Les rapports sont générés à la demande. Active l&apos;envoi automatique
        par email dans Réglages → Notifications.
      </p>
    </ModuleShell>
  );
}

function ReportCard({ report }: { report: MonthlyReport }) {
  const monthSlug = `${report.range.year}-${String(report.range.month).padStart(2, "0")}`;
  const empty =
    report.feedings.total === 0 &&
    report.sleeps.total === 0 &&
    report.diapers.total === 0 &&
    report.growth.measurements === 0 &&
    report.vaccines.length === 0 &&
    report.milestones.length === 0;

  return (
    <li className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-3">
        <h3 className="text-base font-semibold capitalize text-foreground">
          {report.range.label}
        </h3>
        {empty ? (
          <span className="rounded-full bg-background px-3 py-1 text-xs text-foreground-muted">
            Pas encore de données
          </span>
        ) : (
          <a
            href={`/api/enfant/reports/${monthSlug}/pdf`}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full bg-brand px-4 py-1.5 text-sm font-semibold text-white transition hover:bg-brand-strong"
          >
            Télécharger le PDF
          </a>
        )}
      </div>

      {!empty && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="Repas" value={report.feedings.total.toString()} />
          <Stat
            label="Sommeil"
            value={formatMinutes(report.sleeps.totalMinutes)}
          />
          <Stat label="Couches" value={report.diapers.total.toString()} />
          <Stat
            label="Étapes"
            value={report.milestones.length.toString()}
          />
        </div>
      )}
    </li>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-background p-3">
      <div className="text-[11px] font-medium uppercase tracking-wide text-foreground-muted">
        {label}
      </div>
      <div className="mt-0.5 text-base font-semibold text-foreground">
        {value}
      </div>
    </div>
  );
}
