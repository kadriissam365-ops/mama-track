import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/enfant/supabase/service";
import {
  computeUpcomingVaccines,
  formatDueDateFR,
  type DueVaccine,
} from "@/lib/enfant/vaccines-due";
import { sendMail } from "@/lib/enfant/mailer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const REMINDER_WINDOW_DAYS = 14;
const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ?? "https://mamatrack.fr";

export async function GET(request: Request) {
  const auth = request.headers.get("authorization");
  const expected = `Bearer ${process.env.CRON_SECRET ?? ""}`;
  if (!process.env.CRON_SECRET || auth !== expected) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const supabase = createServiceClient();

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
  let skippedNoneDue = 0;
  const failures: string[] = [];

  for (const baby of babies ?? []) {
    processed += 1;

    const [givenRes, sentRes, profileRes] = await Promise.all([
      supabase
        .from("vaccines_given")
        .select("vaccine_code")
        .eq("baby_id", baby.id),
      supabase
        .from("vaccine_reminders_sent")
        .select("vaccine_code")
        .eq("baby_id", baby.id),
      supabase
        .from("baby_preferences")
        .select("email, full_name, vaccine_email_reminders")
        .eq("id", baby.user_id)
        .maybeSingle(),
    ]);

    const profile = profileRes.data;
    if (!profile?.email) {
      skippedNoEmail += 1;
      continue;
    }
    if (profile.vaccine_email_reminders === false) {
      skippedOptOut += 1;
      continue;
    }

    const givenCodes = new Set(
      (givenRes.data ?? []).map((g) => g.vaccine_code),
    );
    const alreadySent = new Set(
      (sentRes.data ?? []).map((g) => g.vaccine_code),
    );

    const due = computeUpcomingVaccines({
      birthDate: new Date(baby.birth_date),
      givenCodes,
      windowDays: REMINDER_WINDOW_DAYS,
    });
    const toSend = due.filter((d) => !alreadySent.has(d.code));
    if (toSend.length === 0) {
      if (due.length === 0) skippedNoneDue += 1;
      else skippedAlreadySent += 1;
      continue;
    }

    try {
      await sendMail({
        to: profile.email,
        subject: subjectFor(toSend, baby.name),
        html: htmlFor(toSend, {
          babyName: baby.name,
          parentName: profile.full_name ?? null,
        }),
      });

      await supabase.from("vaccine_reminders_sent").insert(
        toSend.map((d) => ({
          baby_id: baby.id,
          vaccine_code: d.code,
        })),
      );
      sent += 1;
    } catch (e) {
      failures.push(`${baby.id}: ${(e as Error).message}`);
    }
  }

  return NextResponse.json({
    ok: true,
    processed,
    sent,
    skippedNoEmail,
    skippedOptOut,
    skippedAlreadySent,
    skippedNoneDue,
    failures,
  });
}

function subjectFor(due: DueVaccine[], babyName: string): string {
  if (due.length === 1) {
    const d = due[0];
    if (d.daysUntil <= 0) return `Vaccin de ${babyName} à faire`;
    return `Vaccin de ${babyName} dans ${d.daysUntil} j`;
  }
  return `${due.length} vaccins à venir pour ${babyName}`;
}

function htmlFor(
  due: DueVaccine[],
  ctx: { babyName: string; parentName: string | null },
): string {
  const greeting = ctx.parentName ? `Bonjour ${ctx.parentName}` : "Bonjour";
  const list = due
    .map((d) => {
      const when =
        d.daysUntil <= 0
          ? `<strong>aujourd'hui</strong>`
          : d.daysUntil === 1
            ? `<strong>demain</strong>`
            : `dans <strong>${d.daysUntil} jours</strong>`;
      return `<li style="margin:8px 0">
        <strong>${escapeHtml(d.label)}</strong><br/>
        <span style="color:#666">Prévu ${when} (${formatDueDateFR(d.dueDate)})</span>
      </li>`;
    })
    .join("");

  return `<!doctype html>
<html><body style="font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;background:#fafafa;padding:24px">
  <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:16px;padding:32px;box-shadow:0 2px 12px rgba(0,0,0,.06)">
    <h1 style="margin:0 0 8px;font-size:22px;color:#111">${greeting},</h1>
    <p style="margin:0 0 24px;color:#444;line-height:1.5">
      Voici un rappel pour les prochains vaccins de <strong>${escapeHtml(ctx.babyName)}</strong>&nbsp;:
    </p>
    <ul style="padding-left:20px;color:#222;line-height:1.5">
      ${list}
    </ul>
    <div style="margin:32px 0 0;padding:16px;background:#fdf2f8;border-radius:12px;color:#831843;font-size:14px;line-height:1.5">
      💡 Pense à prendre rendez-vous avec ton médecin ou en PMI. Ce rappel ne remplace pas un avis médical.
    </div>
    <p style="margin:24px 0 0;text-align:center">
      <a href="${APP_URL}/enfant/vaccines" style="display:inline-block;background:#ec4899;color:#fff;padding:12px 24px;border-radius:999px;text-decoration:none;font-weight:600">
        Voir le calendrier
      </a>
    </p>
    <p style="margin:24px 0 0;font-size:12px;color:#999;text-align:center">
      Tu reçois cet email parce que les rappels vaccins sont activés sur ton compte MamaTrack.<br/>
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
