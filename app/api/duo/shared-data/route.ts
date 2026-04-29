import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClientFromCookies } from "@/lib/supabase";
import { createAdminClient, isAdminConfigured } from "@/lib/supabase-admin";
import { computeAlerts, loadContext, type ContextData } from "@/lib/health-alerts";
import { getWeekData } from "@/lib/pregnancy-data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Role = "papa" | "sagefemme" | "famille";

type SharedData = Partial<ContextData> & {
  alerts?: ReturnType<typeof computeAlerts>;
  babySize?: { fruit: string; fruitEmoji: string; sizeMm: number; weightG: number };
};

function filterPapa(ctx: ContextData): SharedData {
  return {
    profile: {
      dueDate: ctx.profile.dueDate,
      mamaName: ctx.profile.mamaName,
      babyName: ctx.profile.babyName,
      weekMode: ctx.profile.weekMode,
    },
    weekSA: ctx.weekSA,
    weekGA: ctx.weekGA,
    weekTip: ctx.weekTip,
    kicks: ctx.kicks.slice(0, 5),
    contractions: ctx.contractions.slice(0, 5),
    babySize: ctx.weekSA
      ? (() => {
          const w = getWeekData(ctx.weekSA);
          return { fruit: w.fruit, fruitEmoji: w.fruitEmoji, sizeMm: w.sizeMm, weightG: w.weightG };
        })()
      : undefined,
  };
}

function filterSagefemme(ctx: ContextData): SharedData {
  // Full medical context + computed alerts.
  return { ...ctx, alerts: computeAlerts(ctx) };
}

function filterFamille(ctx: ContextData): SharedData {
  return {
    profile: {
      dueDate: ctx.profile.dueDate,
      mamaName: ctx.profile.mamaName,
      babyName: ctx.profile.babyName,
      weekMode: ctx.profile.weekMode,
    },
    weekSA: ctx.weekSA,
    weekGA: ctx.weekGA,
    weekTip: ctx.weekTip,
    babySize: ctx.weekSA
      ? (() => {
          const w = getWeekData(ctx.weekSA);
          return { fruit: w.fruit, fruitEmoji: w.fruitEmoji, sizeMm: w.sizeMm, weightG: w.weightG };
        })()
      : undefined,
  };
}

export async function GET(req: Request) {
  if (!isAdminConfigured()) {
    return NextResponse.json(
      { error: "Service non configuré (SUPABASE_SERVICE_ROLE_KEY manquante)" },
      { status: 503 },
    );
  }

  const url = new URL(req.url);
  const mamaUserId = url.searchParams.get("mamaUserId");
  if (!mamaUserId) {
    return NextResponse.json({ error: "mamaUserId requis" }, { status: 400 });
  }

  const cookieStore = await cookies();
  const supabase = createServerClientFromCookies(cookieStore);
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  // Verify caller is registered as a partner of the requested mama.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: accessRow } = await (supabase.from as any)("duo_access")
    .select("role")
    .eq("partner_id", user.id)
    .eq("mama_id", mamaUserId)
    .maybeSingle();

  const role = (accessRow?.role ?? null) as Role | null;
  if (!role) {
    return NextResponse.json(
      { error: "Vous n'avez pas accès aux données de cette grossesse." },
      { status: 403 },
    );
  }

  const admin = createAdminClient();
  const ctx = await loadContext(mamaUserId, admin);

  let data: SharedData;
  if (role === "sagefemme") data = filterSagefemme(ctx);
  else if (role === "papa") data = filterPapa(ctx);
  else data = filterFamille(ctx);

  return NextResponse.json({ role, data });
}
