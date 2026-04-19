import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClientFromCookies } from "@/lib/supabase";
import { composeWeeklyReport } from "@/lib/weekly-report-data";
import { renderWeeklyReportEmail } from "@/lib/email-templates/weekly-report";
import { sendReportEmail } from "@/lib/email-send";
import { fetchUserReportInputs } from "@/lib/weekly-report-fetch";

export const runtime = "nodejs";

export async function POST() {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClientFromCookies(cookieStore);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }
    if (!user.email) {
      return NextResponse.json({ error: "Pas d'email associé au compte" }, { status: 400 });
    }

    const input = await fetchUserReportInputs(supabase, user.id);
    if (!input.dueDate) {
      return NextResponse.json({ error: "Date d'accouchement non définie" }, { status: 400 });
    }

    const report = composeWeeklyReport(input);
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://mamatrack.fr";
    const { subject, html, text } = renderWeeklyReportEmail(report, appUrl);

    const result = await sendReportEmail({
      to: user.email,
      subject,
      html,
      text,
    });

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 502 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("weekly email error:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
