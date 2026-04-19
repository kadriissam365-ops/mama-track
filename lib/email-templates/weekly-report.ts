import type { WeeklyReportData } from "../weekly-report-data";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function renderWeeklyReportEmail(data: WeeklyReportData, appUrl: string): { subject: string; html: string; text: string } {
  const greetingName = data.mamaName ? `, ${escapeHtml(data.mamaName)}` : "";
  const babyLabel = data.babyName ? escapeHtml(data.babyName) : "bébé";

  const subject = `🤰 Semaine ${data.week} — Ton bilan MamaTrack ${data.weekData.fruitEmoji}`;

  const deltaHtml = data.weight.delta !== null
    ? `<span style="color:${data.weight.delta > 0 ? "#f97316" : data.weight.delta < 0 ? "#10b981" : "#6b7280"};font-weight:700;">${data.weight.delta > 0 ? "+" : ""}${data.weight.delta} kg</span>`
    : `<span style="color:#9ca3af;">—</span>`;

  const nextApptHtml = data.nextAppointment
    ? `<div style="background:#eff6ff;border:1px solid #dbeafe;border-radius:16px;padding:16px;margin:12px 0;">
        <div style="font-size:12px;color:#1e40af;font-weight:600;text-transform:uppercase;letter-spacing:.05em;">📅 Prochain RDV</div>
        <div style="font-size:16px;color:#1e3a8a;font-weight:600;margin-top:4px;">${escapeHtml(data.nextAppointment.title)}</div>
        <div style="font-size:14px;color:#3730a3;margin-top:2px;">${format(new Date(data.nextAppointment.date), "EEEE d MMMM", { locale: fr })} à ${escapeHtml(data.nextAppointment.time)}</div>
      </div>`
    : "";

  const symptomsHtml = data.symptoms.length
    ? `<div style="background:#f0fdf4;border:1px solid #dcfce7;border-radius:16px;padding:16px;margin:12px 0;">
        <div style="font-size:12px;color:#166534;font-weight:600;text-transform:uppercase;letter-spacing:.05em;">😣 Symptômes ressentis</div>
        <div style="margin-top:8px;">
          ${data.symptoms
            .map(
              (s) =>
                `<span style="display:inline-block;background:#dcfce7;color:#166534;font-size:12px;padding:4px 10px;border-radius:999px;margin:2px 4px 2px 0;">${escapeHtml(s)}</span>`,
            )
            .join("")}
        </div>
      </div>`
    : "";

  const kicksHtml = data.kicks.sessions > 0
    ? `<div style="background:#fff7ed;border:1px solid #ffedd5;border-radius:16px;padding:16px;margin:12px 0;">
        <div style="font-size:12px;color:#9a3412;font-weight:600;text-transform:uppercase;letter-spacing:.05em;">👶 Mouvements de ${babyLabel}</div>
        <div style="font-size:22px;color:#7c2d12;font-weight:700;margin-top:4px;">${data.kicks.sessions} <span style="font-size:14px;font-weight:400;color:#9a3412;">session${data.kicks.sessions > 1 ? "s" : ""} — ${data.kicks.totalMinutes} min</span></div>
      </div>`
    : "";

  const daysLeftHtml = data.daysRemaining !== null
    ? `<div style="font-size:14px;color:#6b7280;margin-top:4px;">Plus que <strong>${data.daysRemaining} jours</strong> avant la rencontre 💕</div>`
    : "";

  const html = `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>${escapeHtml(subject)}</title>
</head>
<body style="margin:0;padding:0;background:#fdf2f8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#3d2b2b;">
  <div style="max-width:600px;margin:0 auto;padding:24px 16px;">

    <!-- Header -->
    <div style="background:linear-gradient(135deg,#ec4899 0%,#a855f7 100%);border-radius:24px;padding:28px 24px;color:white;text-align:center;">
      <div style="font-size:13px;font-weight:600;letter-spacing:.1em;text-transform:uppercase;opacity:.9;">MamaTrack · Bilan hebdo</div>
      <div style="font-size:32px;font-weight:800;margin-top:8px;">Semaine ${data.week} ${data.weekData.fruitEmoji}</div>
      <div style="font-size:15px;opacity:.95;margin-top:4px;">${escapeHtml(data.periodStart)} → ${escapeHtml(data.periodEnd)}</div>
      ${daysLeftHtml.replace("color:#6b7280", "color:rgba(255,255,255,.9)")}
    </div>

    <!-- Greeting -->
    <p style="font-size:16px;line-height:1.6;margin:24px 4px 16px;">
      Hello${greetingName} 🌸<br>
      Voilà ce qu'il s'est passé pour toi et ${babyLabel} cette semaine :
    </p>

    <!-- Baby development card -->
    <div style="background:linear-gradient(135deg,#fdf2f8 0%,#faf5ff 100%);border:1px solid #fce7f3;border-radius:20px;padding:20px;margin:16px 0;">
      <div style="font-size:12px;color:#be185d;font-weight:600;text-transform:uppercase;letter-spacing:.05em;">✨ Cette semaine pour ${babyLabel}</div>
      <div style="font-size:16px;font-weight:600;color:#831843;margin-top:6px;">${escapeHtml(data.weekData.fruit)} ${data.weekData.fruitEmoji} · ${data.weekData.sizeMm > 0 ? `${(data.weekData.sizeMm / 10).toFixed(1)} cm` : "—"}${data.weekData.weightG > 0 ? ` · ${data.weekData.weightG}g` : ""}</div>
      <div style="font-size:14px;line-height:1.6;color:#6b4a4a;margin-top:8px;">${escapeHtml(data.weekData.babyDevelopment)}</div>
    </div>

    <!-- Weight + Water -->
    <table width="100%" cellpadding="0" cellspacing="0" style="margin:12px 0;">
      <tr>
        <td width="50%" style="padding-right:6px;vertical-align:top;">
          <div style="background:#fdf2f8;border:1px solid #fce7f3;border-radius:16px;padding:16px;">
            <div style="font-size:12px;color:#9d174d;font-weight:600;text-transform:uppercase;letter-spacing:.05em;">⚖️ Poids</div>
            <div style="font-size:24px;color:#831843;font-weight:700;margin-top:4px;">${data.weight.current !== null ? `${data.weight.current} kg` : "—"}</div>
            <div style="font-size:12px;margin-top:2px;">${deltaHtml} <span style="color:#9ca3af;">vs semaine -1</span></div>
          </div>
        </td>
        <td width="50%" style="padding-left:6px;vertical-align:top;">
          <div style="background:#faf5ff;border:1px solid #ede9fe;border-radius:16px;padding:16px;">
            <div style="font-size:12px;color:#6b21a8;font-weight:600;text-transform:uppercase;letter-spacing:.05em;">💧 Hydratation</div>
            <div style="font-size:24px;color:#581c87;font-weight:700;margin-top:4px;">${data.water.avgMl} <span style="font-size:12px;font-weight:400;color:#9333ea;">ml/j</span></div>
            <div style="font-size:12px;color:#a855f7;margin-top:2px;">${data.water.percent}% de l'objectif</div>
          </div>
        </td>
      </tr>
    </table>

    ${symptomsHtml}
    ${kicksHtml}
    ${nextApptHtml}

    <!-- Weekly tip -->
    <div style="background:#fef3c7;border:1px solid #fde68a;border-radius:16px;padding:16px;margin:16px 0;">
      <div style="font-size:12px;color:#92400e;font-weight:600;text-transform:uppercase;letter-spacing:.05em;">💡 Conseil de la semaine</div>
      <div style="font-size:14px;line-height:1.6;color:#78350f;margin-top:6px;">${escapeHtml(data.weeklyTip)}</div>
    </div>

    <!-- CTA -->
    <div style="text-align:center;margin:28px 0 12px;">
      <a href="${appUrl}/reports/weekly" style="display:inline-block;background:linear-gradient(135deg,#ec4899 0%,#a855f7 100%);color:white;font-weight:600;padding:14px 28px;border-radius:999px;text-decoration:none;font-size:15px;">Voir le bilan complet →</a>
    </div>

    <!-- Footer -->
    <div style="text-align:center;margin-top:32px;padding:16px 8px;border-top:1px solid #fce7f3;">
      <div style="font-size:12px;color:#9ca3af;">Tu reçois ce mail car tu utilises MamaTrack.</div>
      <div style="font-size:12px;color:#9ca3af;margin-top:4px;"><a href="${appUrl}/settings" style="color:#ec4899;text-decoration:none;">Gérer mes préférences</a></div>
      <div style="font-size:11px;color:#d1d5db;margin-top:12px;">MamaTrack · Ton compagnon de grossesse</div>
    </div>

  </div>
</body>
</html>`;

  const text = `MamaTrack — Semaine ${data.week} ${data.weekData.fruitEmoji}
${data.periodStart} → ${data.periodEnd}
${data.daysRemaining !== null ? `Plus que ${data.daysRemaining} jours avant la rencontre.` : ""}

Cette semaine pour ${babyLabel} :
${data.weekData.fruit} ${data.weekData.fruitEmoji}${data.weekData.sizeMm > 0 ? ` · ${(data.weekData.sizeMm / 10).toFixed(1)} cm` : ""}${data.weekData.weightG > 0 ? ` · ${data.weekData.weightG}g` : ""}
${data.weekData.babyDevelopment}

⚖️ Poids : ${data.weight.current !== null ? `${data.weight.current} kg` : "—"}${data.weight.delta !== null ? ` (${data.weight.delta > 0 ? "+" : ""}${data.weight.delta} kg vs semaine -1)` : ""}
💧 Hydratation moyenne : ${data.water.avgMl} ml/jour (${data.water.percent}% de l'objectif)
${data.symptoms.length ? `😣 Symptômes : ${data.symptoms.join(", ")}\n` : ""}${data.kicks.sessions > 0 ? `👶 Mouvements : ${data.kicks.sessions} sessions (${data.kicks.totalMinutes} min)\n` : ""}${data.nextAppointment ? `📅 Prochain RDV : ${data.nextAppointment.title} — ${format(new Date(data.nextAppointment.date), "EEEE d MMMM", { locale: fr })} à ${data.nextAppointment.time}\n` : ""}
💡 Conseil : ${data.weeklyTip}

Voir le bilan complet : ${appUrl}/reports/weekly
Gérer mes préférences : ${appUrl}/settings
`;

  return { subject, html, text };
}
