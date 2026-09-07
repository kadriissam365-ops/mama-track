import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClientFromCookies } from "@/lib/supabase";
import { streamChat, isAiConfigured, type ChatMessage } from "@/lib/ai-providers";
import { computeAlerts, loadContext } from "@/lib/health-alerts";
import { SYSTEM_PERSONA, buildContextBlock } from "@/lib/coach-prompts";
import { RATE_LIMITS, consumeRateLimit, rateLimitedResponse } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ChatRole = "user" | "assistant";
interface IncomingMessage {
  role: ChatRole;
  content: string;
}

interface RequestBody {
  messages?: IncomingMessage[];
  action?: "weekly_tip" | "signal_check";
}

export async function POST(req: Request) {
  if (!isAiConfigured()) {
    return NextResponse.json({ error: "Service IA non configuré" }, { status: 503 });
  }

  let body: RequestBody = {};
  try {
    body = (await req.json()) as RequestBody;
  } catch {
    return NextResponse.json({ error: "Body invalide" }, { status: 400 });
  }

  const cookieStore = await cookies();
  const supabase = createServerClientFromCookies(cookieStore);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const ctx = await loadContext(user.id, supabase);

  if (body.action === "signal_check") {
    const alerts = computeAlerts(ctx);
    return NextResponse.json({ alerts });
  }

  // Limitation de débit : chaque appel ci-dessous déclenche une génération IA payante.
  const rule = body.action === "weekly_tip" ? RATE_LIMITS.coachTip : RATE_LIMITS.coachChat;
  if (!(await consumeRateLimit(supabase, rule))) {
    return rateLimitedResponse(rule);
  }

  const contextText = buildContextBlock(ctx);
  const systemBlocks = [
    { text: SYSTEM_PERSONA, cache: true },
    { text: `Contexte personnel actuel :\n\n${contextText}` },
  ];

  const headers = {
    "Content-Type": "text/plain; charset=utf-8",
    "Cache-Control": "no-store, no-transform",
    "X-Accel-Buffering": "no",
  };

  if (body.action === "weekly_tip") {
    const weekLabel = ctx.weekSA !== null ? `${ctx.weekSA} SA` : "ce stade de grossesse";
    const userPayload = `Donne-moi le tip de la semaine pour ${weekLabel}, en exploitant si possible mes derniers relevés ci-dessus. Format : 1 phrase d'accroche chaleureuse, puis 2 ou 3 conseils concrets pour cette semaine. Reste sur le registre bien-être, confort et organisation — aucun conseil médical.`;
    return new Response(streamChat({ systemBlocks, history: [], userMessage: userPayload }), { headers });
  }

  const history: ChatMessage[] = (Array.isArray(body.messages) ? body.messages : []).map((m) => ({
    role: m.role,
    content: m.content,
  }));
  return new Response(streamChat({ systemBlocks, history }), { headers });
}
