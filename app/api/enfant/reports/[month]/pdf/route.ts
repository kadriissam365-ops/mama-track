import { NextResponse } from "next/server";
import { createClient } from "@/lib/enfant/supabase/server";
import {
  buildMonthlyReport,
  monthRange,
} from "@/lib/enfant/report-data";
import { buildMonthlyReportPdf } from "@/lib/enfant/report-pdf";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

type Ctx = { params: Promise<{ month: string }> };

export async function GET(_req: Request, ctx: Ctx) {
  const { month } = await ctx.params;
  if (!/^\d{4}-\d{2}$/.test(month)) {
    return NextResponse.json({ error: "invalid_month" }, { status: 400 });
  }
  const [yStr, mStr] = month.split("-");
  const year = Number(yStr);
  const m = Number(mStr);
  if (m < 1 || m > 12) {
    return NextResponse.json({ error: "invalid_month" }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { data: babyRow } = await supabase
    .from("babies")
    .select("id, name, birth_date")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (!babyRow) {
    return NextResponse.json({ error: "no_baby" }, { status: 404 });
  }

  const baby = babyRow as { id: string; name: string; birth_date: string };
  const range = monthRange(year, m);
  const report = await buildMonthlyReport(supabase, baby, range);
  const pdf = buildMonthlyReportPdf(report);

  return new NextResponse(new Uint8Array(pdf), {
    status: 200,
    headers: {
      "content-type": "application/pdf",
      "content-disposition": `inline; filename="babytrack-${baby.name}-${month}.pdf"`,
      "cache-control": "private, no-cache",
    },
  });
}
