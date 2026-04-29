import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClientFromCookies } from "@/lib/supabase";
import { streamChat, isAiConfigured } from "@/lib/ai-providers";
import { loadContext } from "@/lib/health-alerts";
import { SYSTEM_PERSONA, buildContextBlock } from "@/lib/coach-prompts";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function todayInParis(): string {
  // Format YYYY-MM-DD en Europe/Paris.
  const fmt = new Intl.DateTimeFormat("fr-CA", {
    timeZone: "Europe/Paris",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return fmt.format(new Date());
}

async function streamToText(stream: ReadableStream<Uint8Array>): Promise<string> {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let out = "";
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    if (value) out += decoder.decode(value, { stream: true });
  }
  out += decoder.decode();
  return out.trim();
}

async function generateAndCacheStory(args: {
  supabase: ReturnType<typeof createServerClientFromCookies>;
  userId: string;
  date: string;
}): Promise<{ story: string; week_sa: number | null }> {
  const { supabase, userId, date } = args;
  const ctx = await loadContext(userId, supabase);
  const contextText = buildContextBlock(ctx);

  const systemBlocks = [
    { text: SYSTEM_PERSONA, cache: true },
    { text: `Contexte personnel actuel :\n\n${contextText}` },
  ];
  const userMessage = `Donne-moi ma story du jour. Format strict : 1 phrase d'accroche chaleureuse (max 15 mots), puis 2-3 conseils concrets pour aujourd'hui en lien avec mes derniers relevés et ma semaine actuelle. Pas plus de 80 mots au total. Pas d'emojis sauf 1 max en accroche.`;

  const stream = streamChat({ systemBlocks, history: [], userMessage, maxTokens: 400 });
  const story = await streamToText(stream);

  if (!story) {
    throw new Error("Story vide générée par l'IA");
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = supabase as any;
  await sb
    .from("daily_stories")
    .upsert(
      { user_id: userId, date, story_text: story, week_sa: ctx.weekSA },
      { onConflict: "user_id,date" },
    );

  return { story, week_sa: ctx.weekSA };
}

async function handle(req: Request): Promise<Response> {
  if (!isAiConfigured()) {
    return NextResponse.json({ error: "Service IA non configuré" }, { status: 503 });
  }

  const cookieStore = await cookies();
  const supabase = createServerClientFromCookies(cookieStore);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = supabase as any;

  const { data: profileRaw } = await sb
    .from("profiles")
    .select("is_premium, premium_until")
    .eq("id", user.id)
    .maybeSingle();
  const profile = profileRaw as { is_premium?: boolean; premium_until?: string | null } | null;
  const premium = Boolean(profile?.is_premium) && (!profile?.premium_until || new Date(profile.premium_until) > new Date());
  if (!premium) {
    return NextResponse.json({ error: "Fonctionnalité Premium" }, { status: 402 });
  }

  const url = new URL(req.url);
  let force = url.searchParams.get("force") === "1";
  if (req.method === "POST") {
    try {
      const body = (await req.json().catch(() => ({}))) as { regenerate?: boolean };
      if (body && typeof body === "object" && body.regenerate === true) force = true;
    } catch {
      // body optionnel
    }
  }

  const date = todayInParis();

  if (!force) {
    const { data: cachedRaw } = await sb
      .from("daily_stories")
      .select("story_text, week_sa")
      .eq("user_id", user.id)
      .eq("date", date)
      .maybeSingle();
    const cached = cachedRaw as { story_text: string; week_sa: number | null } | null;
    if (cached?.story_text) {
      return NextResponse.json({ story: cached.story_text, cached: true, week_sa: cached.week_sa });
    }
  }

  try {
    const { story, week_sa } = await generateAndCacheStory({ supabase, userId: user.id, date });
    return NextResponse.json({ story, cached: false, week_sa });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur de génération";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}

export async function POST(req: Request) {
  return handle(req);
}

export async function GET(req: Request) {
  return handle(req);
}
