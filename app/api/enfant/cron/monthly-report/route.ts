import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/enfant/supabase/service";
import { sendMail } from "@/lib/enfant/mailer";
import { buildMonthlyReport, monthRange } from "@/lib/enfant/report-data";
import { buildMonthlyReportPdf } from "@/lib/enfant/report-pdf";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ?? "https://mamatrack.fr";

export async function GET(request: Request) {
  const auth = request.headers.get("authorization");
  const expected = `Bearer ${process.env.CRON_SECRET ?? ""}`;
  if (!process.env.CRON_SECRET || auth !== expected) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const supabase = createServiceClient();

  // Période = mois précédent
  const now = new Date();
  const prev = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1));
  const year = prev.getUTCFullYear();
  const month = prev.getUTCMonth() + 1;
  const range = monthRange(year, month);

  const { data: babies, error: babiesErr } = await supabase
    .from("babies")
    .select("id, name, birth_date, user_id");
  if (babiesErr) {
    return NextResponse.json({ error: babiesErr.message }, { status: 500 });
  }

  let processed = 0;
  let sent = 0;
  let skippedNoEmail = 0;
  let skippedOptOut = 0;
  let skippedAlreadySent = 0;
  let skippedEmpty = 0;
  const failures: string[] = [];

  for (const baby of babies ?? []) {
    processed += 1;

    const [profileRes, sentRes] = await Promise.all([
      supabase
        .from("baby_preferences")
        .select("email, full_name, monthly_report_email")
        .eq("id", baby.user_id)
        .maybeSingle(),
      supabase
        .from("monthly_reports_sent")
        .select("id")
        .eq("baby_id", baby.id)
        .eq("year", year)
        .eq("month", month)
        .maybeSingle(),
    ]);

    const profile = profileRes.data;
    if (!profile?.email) {
      skippedNoEmail += 1;
      continue;
    }
    if (profile.monthly_report_email !== true) {
      skippedOptOut += 1;
      continue;
    }
    if (sentRes.data) {
      skippedAlreadySent += 1;
      continue;
    }

    try {
      const report = await buildMonthlyReport(supabase, baby, range);
      const isEmpty =
        report.feedings.total === 0 &&
        report.sleeps.total === 0 &&
        report.diapers.total === 0 &&
        report.growth.measurements === 0 &&
        report.vaccines.length === 0 &&
        report.milestones.length === 0;
      if (isEmpty) {
        skippedEmpty += 1;
        continue;
      }

      const pdf = buildMonthlyReportPdf(report);
      const filename = `babytrack-${slug(baby.name)}-${year}-${String(month).padStart(2, "0")}.pdf`;

      await sendMail({
        to: profile.email,
        subject: `Le rapport ${range.label} de ${baby.name}`,
        html: htmlFor({
          babyName: baby.name,
          parentName: profile.full_name ?? null,
          monthLabel: range.label,
        }),
        attachments: [
          {
            filename,
            content: pdf,
            contentType: "application/pdf",
          },
        ],
      });

      await supabase.from("monthly_reports_sent").insert({
        user_id: baby.user_id,
        baby_id: baby.id,
        year,
        month,
      });
      sent += 1;
    } catch (e) {
      failures.push(`${baby.id}: ${(e as Error).message}`);
    }
  }

  return NextResponse.json({
    ok: true,
    range: { year, month, label: range.label },
    processed,
    sent,
    skippedNoEmail,
    skippedOptOut,
    skippedAlreadySent,
    skippedEmpty,
    failures,
  });
}

function htmlFor(ctx: {
  babyName: string;
  parentName: string | null;
  monthLabel: string;
}): string {
  const greeting = ctx.parentName ? `Bonjour ${ctx.parentName}` : "Bonjour";
  const cap = capitalize(ctx.monthLabel);
  return `<!doctype html>
<html><body style="font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;background:#fafafa;padding:24px">
  <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:16px;padding:32px;box-shadow:0 2px 12px rgba(0,0,0,.06)">
    <h1 style="margin:0 0 8px;font-size:22px;color:#111">${greeting},</h1>
    <p style="margin:0 0 16px;color:#444;line-height:1.5">
      Voici le rapport <strong>${escapeHtml(cap)}</strong> de
      <strong>${escapeHtml(ctx.babyName)}</strong>. Le PDF en pièce jointe résume
      alimentation, sommeil, couches, croissance, vaccins et étapes franchies.
    </p>
    <p style="margin:0 0 24px;color:#444;line-height:1.5">
      Imprime-le ou partage-le avec ton pédiatre — il est prêt à l&apos;emploi.
    </p>
    <p style="margin:24px 0 0;text-align:center">
      <a href="${APP_URL}/enfant/reports" style="display:inline-block;background:#ec4899;color:#fff;padding:12px 24px;border-radius:999px;text-decoration:none;font-weight:600">
        Voir tous les rapports
      </a>
    </p>
    <p style="margin:24px 0 0;font-size:12px;color:#999;text-align:center">
      Tu reçois cet email parce que le rapport mensuel est activé sur ton compte MamaTrack.<br/>
      <a href="${APP_URL}/enfant/settings" style="color:#999">Gérer mes notifications</a>
    </p>
  </div>
</body></html>`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function slug(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
